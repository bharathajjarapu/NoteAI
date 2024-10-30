'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import {
  ChevronLeft, ChevronRight, Trash2, Plus, Wand2, Sun, Moon,
  LogOut, User, Bold, Italic, Underline, List, ListOrdered, Quote,
  Link, Sparkles, Save
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

type Note = {
  id: number
  title: string
  content: string
  created_at?: string
  updated_at?: string
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showAIMenu, setShowAIMenu] = useState(false)
  const [aiMenuPosition, setAiMenuPosition] = useState({ x: 0, y: 0 })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const { theme, setTheme } = useTheme()

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/notes')
      const data = await response.json()
      setNotes(data)
      if (data.length > 0 && !activeNote) setActiveNote(data[0])
    } catch (err) {
      console.error('Failed to load notes:', err)
    }
  }, [activeNote])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const addNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Note', content: '' })
      })
      const newNote = await response.json()
      setNotes(prevNotes => [newNote, ...prevNotes])
      setActiveNote(newNote)
    } catch (err) {
      console.error('Failed to add note:', err)
    }
  }

  const updateNote = async (id: number, title: string, content: string) => {
    if (!id) return
    try {
      const response = await fetch(`/api/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, content })
      })
      const updatedNote = await response.json()
      setNotes(prevNotes => prevNotes.map(note =>
        note.id === id ? updatedNote : note
      ))
      setActiveNote(updatedNote)
    } catch (err) {
      console.error('Failed to update note:', err)
    }
  }

  const deleteNote = async (id: number) => {
    try {
      await fetch(`/api/notes?id=${id}`, { method: 'DELETE' })
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
      if (activeNote?.id === id) {
        setActiveNote(notes[0] || null)
      }
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowAIMenu(true)
    setAiMenuPosition({ x: e.clientX, y: e.clientY })
  }

  const handleAIOption = async (option: string) => {
    if (!activeNote) return

    const selectedText = window.getSelection()?.toString() || activeNote.content

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: option.toLowerCase(),
          content: selectedText
        })
      })

      const result = await response.json()
      if (result.content) {
        const newContent = window.getSelection()?.toString()
          ? activeNote.content.replace(selectedText, result.content)
          : result.content

        await updateNote(activeNote.id, activeNote.title, newContent)
      }
    } catch (err) {
      console.error('AI processing failed:', err)
    }

    setShowAIMenu(false)
  }

  const applyTextFormat = (format: string) => {
    if (!activeNote) return

    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    const formatMap: { [key: string]: [string, string] } = {
      bold: ['**', '**'],
      italic: ['*', '*'],
      underline: ['__', '__'],
      bulletList: ['\n- ', ''],
      numberedList: ['\n1. ', ''],
      quote: ['\n> ', ''],
      link: ['[', '](url)'],
    }

    const [prefix, suffix] = formatMap[format] || ['', '']
    const newText = textarea.value.substring(0, start) +
                   prefix + selectedText + suffix +
                   textarea.value.substring(end)

    updateNote(activeNote.id, activeNote.title, newText)
    textarea.focus()
  }

  const TextEditingTools = () => (
    <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
      {[
        { icon: Bold, format: 'bold', tooltip: 'Bold' },
        { icon: Italic, format: 'italic', tooltip: 'Italic' },
        { icon: Underline, format: 'underline', tooltip: 'Underline' },
        { icon: List, format: 'bulletList', tooltip: 'Bullet List' },
        { icon: ListOrdered, format: 'numberedList', tooltip: 'Numbered List' },
        { icon: Quote, format: 'quote', tooltip: 'Quote' },
        { icon: Link, format: 'link', tooltip: 'Insert Link' },
      ].map(({ icon: Icon, format, tooltip }) => (
        <Tooltip key={format}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => applyTextFormat(format)}>
              <Icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )

  const AIOptions = [
    { label: 'Generate', icon: Wand2 },
    { label: 'Paraphrase', icon: ChevronRight },
    { label: 'Summarize', icon: ChevronLeft },
    { label: 'Elaborate', icon: ChevronRight },
  ]

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background text-foreground">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-r"
            >
              <ScrollArea className="h-screen">
                <div className="p-4">
                  <div className="flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 mr-2" />
                    <h2 className="text-xl font-bold">NoteAI</h2>
                  </div>
                  <Button onClick={addNote} className="w-full mb-4">
                    <Plus className="mr-2 h-4 w-4" /> New Note
                  </Button>
                  {notes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center justify-between p-2 mb-2 rounded-lg cursor-pointer ${
                        activeNote?.id === note.id ? 'bg-accent' : 'hover:bg-muted'
                      }`}
                      onClick={() => setActiveNote(note)}
                    >
                      <span className="truncate">{note.title}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setNoteToDelete(note.id)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b p-2 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
                    {showSidebar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}</TooltipContent>
              </Tooltip>
              <Input
                value={activeNote?.title || ''}
                onChange={(e) => activeNote && setActiveNote({...activeNote, title: e.target.value})}
                className="border-none bg-transparent font-semibold"
                placeholder="Note Title"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (activeNote) {
                        setShowSaveDialog(true)
                      }
                    }}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save Note</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Theme</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit"   className="p-4">
              <TextEditingTools />
              <Textarea
                value={activeNote?.content || ''}
                onChange={(e) => activeNote && setActiveNote({...activeNote, content: e.target.value})}
                className="w-full h-[calc(100vh-200px)] resize-none border-none bg-transparent mt-4"
                placeholder="Start typing your note here..."
                onContextMenu={handleContextMenu}
              />
            </TabsContent>
            <TabsContent value="preview" className="p-4">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{activeNote?.content || ''}</ReactMarkdown>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Context Menu */}
        <AnimatePresence>
          {showAIMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'fixed',
                top: aiMenuPosition.y,
                left: aiMenuPosition.x,
                zIndex: 1000,
              }}
              className="bg-popover text-popover-foreground rounded-lg shadow-lg p-2 grid grid-cols-2 gap-2 ai-menu"
            >
              {AIOptions.map((option) => (
                <Tooltip key={option.label}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAIOption(option.label)}
                      className="w-full justify-start"
                    >
                      <option.icon className="h-4 w-4 mr-2" />
                      {option.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{option.label}</TooltipContent>
                </Tooltip>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Note</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this note? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (noteToDelete) {
                    deleteNote(noteToDelete)
                    setShowDeleteDialog(false)
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save Confirmation Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Note</DialogTitle>
              <DialogDescription>
                Do you want to save the changes to this note?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (activeNote) {
                    updateNote(activeNote.id, activeNote.title, activeNote.content)
                    setShowSaveDialog(false)
                  }
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}