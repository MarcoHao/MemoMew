# MemoMew 🐱

> AI驱动的轻量级个人知识库桌面应用 —— 带宠物管家的智能便笺

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![License](https://img.shields.io/badge/license-MIT-green)
![Electron](https://img.shields.io/badge/Electron-36-blue)
![React](https://img.shields.io/badge/React-19-blue)

## 核心功能

- 🐱 **宠物形象化** — Canvas绘制的2D小橘猫，5种状态动画（待机/聆听/思考/说话/开心）
- 🎙️ **语音交互** — Web Speech API语音输入/播报，完全免费
- 🧠 **AI整理** — Kimi API自动摘要、标签提取、实体关系抽取
- 🕸️ **知识图谱** — D3.js力导向图可视化实体关系网络
- 💬 **智能问答** — 基于笔记内容的RAG问答，宠物语音播报回答
- 📋 **粘贴板捕获** — 快速记录粘贴板内容

## 界面预览

```
┌──────────┬──────────────────────┬────────────────┐
│ 📝 笔记   │  笔记编辑器           │   🤖 AI 助手   │
│ 列表      │  ┌────────────────┐  │  ┌──────────┐  │
│          │  │ 标题            │  │  │ 🐱 宠物   │  │
│ + 新建   │  ├────────────────┤  │  │ 对话记录  │  │
│          │  │  Markdown     │  │  │          │  │
│ 笔记1    │  │  内容区域      │  │  │ 你好!    │  │
│ 标签     │  │                │  │  ├──────────┤  │
│ 笔记2    │  └────────────────┘  │  │ 输入框...│  │
│          │  [💾] [🎤] [✨]      │  └──────────┘  │
│          │                      │               │
│ 🕸️ 图谱  │                      │               │
│ ⚙️ 设置  │                      │               │
└──────────┴──────────────────────┴────────────────┘
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Electron + Vite |
| 前端 | React 19 + TypeScript + Tailwind CSS v4 |
| 数据库 | better-sqlite3 |
| AI引擎 | Kimi API (Moonshot) |
| 语音 | Web Speech API |
| 图谱可视化 | D3.js |
| 打包 | electron-builder |

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 打包
npm run dist
```

## 配置

首次使用需要在设置中配置 **Kimi API Key**：

1. 访问 [platform.moonshot.cn](https://platform.moonshot.cn)
2. 注册账号并创建 API Key
3. 在 MemoMew 设置中粘贴 Key

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + Shift + O` | 快速唤起/隐藏窗口 |
| `Cmd/Ctrl + S` | 保存笔记 |

## 文档

- [使用说明书](docs/使用说明书.md)
- [技术实现说明书](docs/技术实现说明书.md)
- [架构设计](ARCHITECTURE.md)

## 开源许可

MIT License
