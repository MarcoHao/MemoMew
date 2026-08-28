// 本地存储数据库操作封装
// 在 Electron 环境中通过 IPC 调用主进程，在开发环境使用 localStorage 模拟

export interface Note {
  id: number;
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Entity {
  id: number;
  name: string;
  type?: string;
  description?: string;
  note_ids?: number[];
}

export interface Relation {
  id: number;
  source_entity: string;
  target_entity: string;
  relation_type?: string;
}

export interface ChatMessage {
  id: number;
  role: string;
  content: string;
  note_refs?: number[];
  created_at: string;
}

// 内存数据库（用于开发和测试）
let memoryDB: {
  notes: Note[];
  entities: Entity[];
  relations: Relation[];
  chats: ChatMessage[];
} = { notes: [], entities: [], relations: [], chats: [] };

let nextId = 1;

function getNextId(): number {
  return nextId++;
}

// 检查是否在 Electron 环境
function isElectron(): boolean {
  return !!(window as any).electronAPI;
}

export const db = {
  // Notes
  async createNote(title: string, content: string, summary?: string, tags?: string[]): Promise<Note> {
    if (isElectron()) {
      // TODO: 实现 IPC 调用
    }
    const note: Note = {
      id: getNextId(),
      title,
      content,
      summary,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryDB.notes.unshift(note);
    return note;
  },

  async getNotes(): Promise<Note[]> {
    return [...memoryDB.notes];
  },

  async getNoteById(id: number): Promise<Note | undefined> {
    return memoryDB.notes.find(n => n.id === id);
  },

  async updateNote(id: number, updates: Partial<Note>): Promise<Note | undefined> {
    const idx = memoryDB.notes.findIndex(n => n.id === id);
    if (idx === -1) return undefined;
    memoryDB.notes[idx] = { ...memoryDB.notes[idx], ...updates, updated_at: new Date().toISOString() };
    return memoryDB.notes[idx];
  },

  async deleteNote(id: number): Promise<void> {
    memoryDB.notes = memoryDB.notes.filter(n => n.id !== id);
  },

  // Entities
  async createEntity(name: string, type?: string, description?: string, noteIds?: number[]): Promise<Entity> {
    const existing = memoryDB.entities.find(e => e.name === name);
    if (existing) {
      existing.note_ids = [...new Set([...(existing.note_ids || []), ...(noteIds || [])])];
      return existing;
    }
    const entity: Entity = {
      id: getNextId(),
      name,
      type,
      description,
      note_ids: noteIds,
    };
    memoryDB.entities.push(entity);
    return entity;
  },

  async getEntities(): Promise<Entity[]> {
    return [...memoryDB.entities];
  },

  // Relations
  async createRelation(source: string, target: string, type?: string, noteIds?: number[]): Promise<Relation> {
    const existing = memoryDB.relations.find(
      r => r.source_entity === source && r.target_entity === target && r.relation_type === type
    );
    if (existing) return existing;
    const relation: Relation = {
      id: getNextId(),
      source_entity: source,
      target_entity: target,
      relation_type: type,
    };
    memoryDB.relations.push(relation);
    return relation;
  },

  async getRelations(): Promise<Relation[]> {
    return [...memoryDB.relations];
  },

  // Chats
  async addChat(role: string, content: string, noteRefs?: number[]): Promise<ChatMessage> {
    const chat: ChatMessage = {
      id: getNextId(),
      role,
      content,
      note_refs: noteRefs,
      created_at: new Date().toISOString(),
    };
    memoryDB.chats.push(chat);
    return chat;
  },

  async getChats(): Promise<ChatMessage[]> {
    return [...memoryDB.chats];
  },

  async clearChats(): Promise<void> {
    memoryDB.chats = [];
  },

  // 搜索笔记
  async searchNotes(query: string): Promise<Note[]> {
    const q = query.toLowerCase();
    return memoryDB.notes.filter(
      n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  },

  // 获取知识图谱数据
  async getGraphData(): Promise<{ nodes: any[]; links: any[] }> {
    const nodes = memoryDB.entities.map(e => ({
      id: e.name,
      name: e.name,
      type: e.type || '概念',
      description: e.description,
    }));

    const links = memoryDB.relations.map(r => ({
      source: r.source_entity,
      target: r.target_entity,
      type: r.relation_type || '关联',
    }));

    return { nodes, links };
  },

  // 清空所有数据（测试用）
  async clearAll(): Promise<void> {
    memoryDB = { notes: [], entities: [], relations: [], chats: [] };
    nextId = 1;
  },
};
