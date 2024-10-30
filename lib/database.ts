import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

let db: any = null;

async function openDb() {
  if (!db) {
    db = await open({
      filename: './notes.db',
      driver: sqlite3.Database
    })

    await db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }
  return db
}

export async function getAllNotes() {
  const db = await openDb()
  return db.all('SELECT * FROM notes ORDER BY updated_at DESC')
}

export async function getNoteById(id: number) {
  const db = await openDb()
  return db.get('SELECT * FROM notes WHERE id = ?', id)
}

export async function createNote(title: string, content: string) {
  const db = await openDb()
  const result = await db.run(
    'INSERT INTO notes (title, content) VALUES (?, ?)',
    title,
    content
  )
  return getNoteById(result.lastID)
}

export async function updateNote(id: number, title: string, content: string) {
  const db = await openDb()
  await db.run(
    'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    title,
    content,
    id
  )
  return getNoteById(id)
}

export async function deleteNote(id: number) {
  const db = await openDb()
  await db.run('DELETE FROM notes WHERE id = ?', id)
}