import { NextResponse } from 'next/server'
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote } from '@/lib/database'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    const note = await getNoteById(Number(id))
    return NextResponse.json(note)
  } else {
    const notes = await getAllNotes()
    return NextResponse.json(notes)
  }
}

export async function POST(request: Request) {
  const { title, content } = await request.json()
  const note = await createNote(title, content)
  return NextResponse.json(note)
}

export async function PUT(request: Request) {
  const { id, title, content } = await request.json()
  const note = await updateNote(Number(id), title, content)
  return NextResponse.json(note)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    await deleteNote(Number(id))
    return NextResponse.json({ message: 'Note deleted successfully' })
  } else {
    return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
  }
}