import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Clock, 
  Pin, 
  StickyNote, 
  ChevronRight,
  Menu,
  X,
  Palette,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note } from './types';

type ThemeType = 'midnight' | 'snow' | 'ocean' | 'desert';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('midnight');
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Load data
  useEffect(() => {
    const savedNotes = localStorage.getItem('nexus_notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    
    const savedTheme = localStorage.getItem('nexus_theme') as ThemeType;
    if (savedTheme) setCurrentTheme(savedTheme);
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('nexus_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('nexus_theme', currentTheme);
    document.body.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  const selectedNote = useMemo(() => notes.find(n => n.id === selectedNoteId), [notes, selectedNoteId]);

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [notes]);

  const filteredNotes = sortedNotes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      tags: [],
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    if (!confirm('Delete this note?')) return;
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const themes: { id: ThemeType; name: string; color: string }[] = [
    { id: 'midnight', name: 'Midnight', color: '#0F0F10' },
    { id: 'snow', name: 'Snow', color: '#ffffff' },
    { id: 'ocean', name: 'Ocean', color: '#0c4a6e' },
    { id: 'desert', name: 'Desert', color: '#fffaf0' },
  ];

  return (
    <div className={`flex h-screen bg-app-bg text-app-text font-sans overflow-hidden transition-colors duration-300`}>
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className="w-full md:w-80 flex-shrink-0 bg-app-sidebar border-r border-app-border flex flex-col z-30 absolute md:relative h-full"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                <div className="w-8 h-8 bg-app-accent text-white rounded-lg flex items-center justify-center">
                  <StickyNote size={18} />
                </div>
                Nexus
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-app-border rounded-lg text-app-tertiary">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4 flex-grow overflow-hidden">
              <button
                onClick={createNote}
                className="w-full py-3 bg-app-accent text-white rounded-2xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-app-accent/20 active:scale-95"
              >
                <Plus size={20} /> New Note
              </button>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-tertiary" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-app-bg border border-app-border rounded-xl text-sm focus:border-app-accent/50 outline-none transition-all placeholder-app-tertiary"
                />
              </div>

              <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl transition-all border ${
                      selectedNoteId === note.id 
                        ? 'bg-app-accent/10 border-app-accent/30' 
                        : 'hover:bg-app-accent/5 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {note.isPinned && <Pin size={12} className="text-app-accent fill-current" />}
                      <h3 className="font-semibold truncate flex-grow">
                        {note.title || 'Untitled Note'}
                      </h3>
                    </div>
                    <p className="text-xs text-app-secondary line-clamp-2 leading-relaxed">
                      {note.content || 'Start typing...'}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-app-tertiary font-mono">
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-app-border">
              <div className="relative">
                <button 
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className="w-full p-3 bg-app-bg border border-app-border rounded-xl flex items-center justify-between hover:bg-app-accent/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Palette size={18} className="text-app-accent" />
                    <span className="text-sm font-medium">Themes</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border border-app-border" style={{ backgroundColor: themes.find(t => t.id === currentTheme)?.color }}></div>
                </button>
                
                <AnimatePresence>
                  {showThemePicker && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-app-sidebar border border-app-border rounded-2xl shadow-2xl z-40 grid grid-cols-2 gap-2"
                    >
                      {themes.map(t => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setCurrentTheme(t.id);
                            setShowThemePicker(false);
                          }}
                          className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                            currentTheme === t.id ? 'border-app-accent bg-app-accent/10' : 'border-app-border hover:bg-app-accent/5'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full border border-app-border shrink-0" style={{ backgroundColor: t.color }}></div>
                          <span className="text-xs font-medium">{t.name}</span>
                          {currentTheme === t.id && <Check size={12} className="ml-auto text-app-accent" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <main className="flex-grow flex flex-col relative min-w-0 bg-app-bg">
        <header className="h-16 border-b border-app-border px-6 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-app-tertiary">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            {selectedNote && (
              <>
                <button 
                  onClick={() => updateNote(selectedNote.id, { isPinned: !selectedNote.isPinned })}
                  className={`p-2 rounded-xl transition-all ${selectedNote.isPinned ? 'text-app-accent bg-app-accent/10' : 'text-app-tertiary'}`}
                >
                  <Pin size={20} className={selectedNote.isPinned ? 'fill-current' : ''} />
                </button>
                <button onClick={() => deleteNote(selectedNote.id)} className="p-2 text-app-tertiary hover:text-red-400">
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </div>
        </header>

        <div className="flex-grow overflow-hidden relative">
          <AnimatePresence mode="wait">
            {selectedNote ? (
              <motion.div 
                key={selectedNote.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col p-6 md:p-12 max-w-4xl mx-auto"
              >
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-app-tertiary mb-4">
                  <Clock size={12} />
                  Last updated {new Date(selectedNote.updatedAt).toLocaleTimeString()}
                </div>
                
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                  placeholder="Note Title"
                  className="text-4xl font-black tracking-tight outline-none mb-8 bg-transparent"
                />

                <textarea
                  value={selectedNote.content}
                  onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                  placeholder="Tell your thoughts..."
                  className="flex-grow resize-none outline-none text-lg leading-relaxed bg-transparent custom-scrollbar"
                />
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-20 select-none">
                <StickyNote size={80} strokeWidth={1} className="mb-6" />
                <h2 className="text-2xl font-bold">Pick Your Nexus</h2>
                <p className="mt-2 text-sm">Select a note from the sidebar or start a new one.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--secondary-text); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
