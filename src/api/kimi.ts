// Kimi API (Moonshot) 封装
const KIMI_BASE_URL = 'https://api.moonshot.cn/v1';
const KIMI_MODEL = 'moonshot-v1-8k';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class KimiAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = localStorage.getItem('kimi_api_key') || '';
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('kimi_api_key', key);
  }

  getApiKey(): string {
    return this.apiKey;
  }

  async chat(messages: ChatMessage[], temperature = 0.7): Promise<string> {
    if (!this.apiKey) {
      throw new Error('请先设置 Kimi API Key');
    }

    const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        messages,
        temperature,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Kimi API 错误: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // 生成笔记摘要和标签
  async summarizeNote(content: string): Promise<{ summary: string; tags: string[] }> {
    const prompt = `请为以下笔记内容生成一句话摘要和3-5个标签。
请以JSON格式返回：{"summary": "摘要", "tags": ["标签1", "标签2", ...]}

笔记内容：
${content.slice(0, 4000)}`;

    const result = await this.chat([
      { role: 'system', content: '你是一个专业的笔记整理助手，擅长提取关键信息和分类标签。请只返回JSON格式的结果。' },
      { role: 'user', content: prompt },
    ], 0.3);

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result);
      return {
        summary: parsed.summary || '暂无摘要',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      };
    } catch {
      return { summary: result.slice(0, 100), tags: [] };
    }
  }

  // 抽取实体和关系
  async extractEntities(content: string): Promise<{ entities: Array<{name: string; type: string; description: string}>; relations: Array<{source: string; target: string; type: string}> }> {
    const prompt = `请从以下文本中抽取知识图谱的实体和关系。
实体类型包括但不限于：人物、组织、地点、概念、技术、事件等。
请以JSON格式返回：
{
  "entities": [{"name": "实体名", "type": "实体类型", "description": "简要描述"}],
  "relations": [{"source": "源实体", "target": "目标实体", "type": "关系类型"}]
}

文本内容：
${content.slice(0, 4000)}`;

    const result = await this.chat([
      { role: 'system', content: '你是一个知识图谱构建专家，擅长从文本中抽取实体和关系。请只返回JSON格式的结果。' },
      { role: 'user', content: prompt },
    ], 0.3);

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result);
      return {
        entities: Array.isArray(parsed.entities) ? parsed.entities : [],
        relations: Array.isArray(parsed.relations) ? parsed.relations : [],
      };
    } catch {
      return { entities: [], relations: [] };
    }
  }

  // 基于知识库问答
  async askWithContext(question: string, context: string): Promise<string> {
    const prompt = `基于以下知识库内容回答问题。如果知识库中没有相关信息，请坦诚告知。

知识库内容：
${context.slice(0, 5000)}

用户问题：${question}`;

    return this.chat([
      { role: 'system', content: '你是一个基于个人知识库的AI助手。请基于提供的知识库内容回答问题，并在回答中引用相关知识。' },
      { role: 'user', content: prompt },
    ]);
  }
}

export const kimiAPI = new KimiAPI();
export type { ChatMessage };
