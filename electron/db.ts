import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

let db: any | null = null;

export function getDatabasePath(): string {
  const userData = app.getPath('userData');
  return path.join(userData, 'memomew.db');
}

export function initDatabase(): any {
  if (db) return db;
  
  const dbPath = getDatabasePath();
  db = new Database(dbPath);
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      summary TEXT,
      tags TEXT, -- JSON array
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS entities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT,
      description TEXT,
      note_ids TEXT, -- JSON array of related note IDs
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS relations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_entity TEXT NOT NULL,
      target_entity TEXT NOT NULL,
      relation_type TEXT,
      note_ids TEXT, -- JSON array
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(source_entity, target_entity, relation_type)
    );
    
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      note_refs TEXT, -- JSON array of referenced note IDs
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);
  `);
  
  return db;
}

export function getDB(): any {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Note operations
export function createNote(title: string, content: string, summary?: string, tags?: string[]): number {
  const db = getDB();
  const stmt = db.prepare(
    'INSERT INTO notes (title, content, summary, tags) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(title, content, summary || null, tags ? JSON.stringify(tags) : null);
  return Number(result.lastInsertRowid);
}

export function getNotes(): any[] {
  const db = getDB();
  return db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all();
}

export function getNoteById(id: number): any {
  const db = getDB();
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
}

export function updateNote(id: number, title: string, content: string, summary?: string, tags?: string[]): void {
  const db = getDB();
  db.prepare(
    'UPDATE notes SET title = ?, content = ?, summary = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(title, content, summary || null, tags ? JSON.stringify(tags) : null, id);
}

export function deleteNote(id: number): void {
  const db = getDB();
  db.prepare('DELETE FROM notes WHERE id = ?').run(id);
}

// Entity operations
export function createEntity(name: string, type?: string, description?: string, noteIds?: number[]): void {
  const db = getDB();
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO entities (name, type, description, note_ids) VALUES (?, ?, ?, ?)'
  );
  stmt.run(name, type || null, description || null, noteIds ? JSON.stringify(noteIds) : null);
}

export function getEntities(): any[] {
  const db = getDB();
  return db.prepare('SELECT * FROM entities').all();
}

export function createRelation(source: string, target: string, type?: string, noteIds?: number[]): void {
  const db = getDB();
  const stmt = db.prepare(
    'INSERT OR IGNORE INTO relations (source_entity, target_entity, relation_type, note_ids) VALUES (?, ?, ?, ?)'
  );
  stmt.run(source, target, type || null, noteIds ? JSON.stringify(noteIds) : null);
}

export function getRelations(): any[] {
  const db = getDB();
  return db.prepare('SELECT * FROM relations').all();
}

// Chat operations
export function addChat(role: string, content: string, noteRefs?: number[]): void {
  const db = getDB();
  db.prepare(
    'INSERT INTO chats (role, content, note_refs) VALUES (?, ?, ?)'
  ).run(role, content, noteRefs ? JSON.stringify(noteRefs) : null);
}

export function getChats(): any[] {
  const db = getDB();
  return db.prepare('SELECT * FROM chats ORDER BY created_at ASC').all();
}

export function clearChats(): void {
  const db = getDB();
  db.prepare('DELETE FROM chats').run();
}
