import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Clock, Bookmark, X, ArrowRight, User } from 'lucide-react';
import { CURATED_QUOTES } from '../data/curatedQuotes';
import { LiteraryQuote } from '../data/types';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTime: (time: string) => void;
  bookmarkedQuotes: LiteraryQuote[];
  onRemoveBookmark: (id: string) => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectTime,
  bookmarkedQuotes,
  onRemoveBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'bookmarks'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');

  const authors = useMemo(() => {
    const set = new Set(CURATED_QUOTES.map((q) => q.author));
    return Array.from(set).sort();
  }, []);

  const filteredQuotes = useMemo(() => {
    return CURATED_QUOTES.filter((q) => {
      const matchesSearch =
        q.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.time.includes(searchQuery);

      const matchesAuthor = selectedAuthor === 'all' || q.author === selectedAuthor;

      return matchesSearch && matchesAuthor;
    });
  }, [searchQuery, selectedAuthor]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-3xl rounded-xl border-2 border-[#b88628] bg-[#1d1007] text-[#f5ebd7] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <header className="p-4 sm:p-5 border-b border-[#4d2c12] flex items-center justify-between bg-[#150a03]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#ffd978]" />
            <div>
              <h2 className="font-serif text-lg font-bold text-[#ffd978]">Literary Catalog & Time Archive</h2>
              <p className="text-xs text-[#b89f81] font-serif">13,000+ passages from public domain masterworks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close catalog"
            className="text-[#caa766] hover:text-[#fff] p-1 font-mono rounded hover:bg-[#2c170b] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-[#4d2c12] bg-[#221207] px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 text-xs font-serif font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[#3b230d] text-[#ffd978] border border-[#d4af37]'
                  : 'text-[#a98f71] hover:text-[#e4cfb4]'
              }`}
            >
              Browse Catalog ({CURATED_QUOTES.length}+ Classic Passages)
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'bookmarks'
                  ? 'bg-[#3b230d] text-[#ffd978] border border-[#d4af37]'
                  : 'text-[#a98f71] hover:text-[#e4cfb4]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Passages ({bookmarkedQuotes.length})</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'catalog' ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search Filters */}
            <div className="p-4 border-b border-[#3b210d] bg-[#1a0e05] flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8f6d48]" />
                <input
                  type="text"
                  placeholder="Search by quote, author, book, or time (e.g., 'Sherlock', 'midnight', '13:12')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#110702] border border-[#523314] text-xs text-[#f5ebd7] placeholder-[#7d6044] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#8f6d48]" />
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="rounded-lg bg-[#110702] border border-[#523314] p-2 text-xs text-[#f5ebd7] focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="all">All Authors</option>
                  {authors.map((auth) => (
                    <option key={auth} value={auth}>
                      {auth}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredQuotes.length === 0 ? (
                <div className="text-center py-12 text-[#a88d6f] font-serif text-sm">
                  No passages found matching your search.
                </div>
              ) : (
                filteredQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-lg border border-[#4d2c12] bg-[#221307] hover:border-[#a87f2b] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-mono text-xs font-bold text-[#ffd978] bg-[#140b04] px-2 py-0.5 rounded border border-[#6b4715]">
                          <Clock className="w-3 h-3 text-[#d4af37]" />
                          {q.time}
                        </span>
                        <span className="font-serif text-xs font-semibold text-[#f5ebd7]">
                          {q.author}
                        </span>
                        <span className="text-[11px] font-serif italic text-[#a88f71]">
                          — {q.title} {q.year ? `(${q.year})` : ''}
                        </span>
                      </div>
                      <p className="font-serif text-sm italic text-[#e6d8c4] line-clamp-2">
                        &ldquo;{q.quote}&rdquo;
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTime(q.time);
                        onClose();
                      }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#8a5f22] bg-[#341b0b] hover:bg-[#4d2c14] text-xs font-serif font-bold text-[#ffd978] cursor-pointer active:scale-95 transition-all self-end sm:self-center"
                    >
                      <span>Jump to Time</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Bookmarks View */
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {bookmarkedQuotes.length === 0 ? (
              <div className="text-center py-16 text-[#a88d6f] font-serif space-y-2">
                <Bookmark className="w-8 h-8 mx-auto text-[#6a461e]" />
                <p className="text-sm">No saved passages yet.</p>
                <p className="text-xs text-[#806547]">Click the bookmark icon on any passage to save it to your library.</p>
              </div>
            ) : (
              bookmarkedQuotes.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-lg border border-[#68411b] bg-[#221307] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#ffd978] bg-[#140b04] px-2 py-0.5 rounded border border-[#6b4715]">
                        {q.time}
                      </span>
                      <span className="font-serif text-xs font-semibold text-[#f5ebd7]">{q.author}</span>
                      <span className="text-xs font-serif italic text-[#a88f71]">— {q.title}</span>
                    </div>
                    <p className="font-serif text-sm text-[#e6d8c4] italic">&ldquo;{q.quote}&rdquo;</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onRemoveBookmark(q.id)}
                      className="text-xs text-[#d38b8b] hover:text-[#ff9999] px-2 py-1"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => {
                        onSelectTime(q.time);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#8a5f22] bg-[#341b0b] text-xs font-serif font-bold text-[#ffd978] cursor-pointer"
                    >
                      <span>Jump</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="p-3 bg-[#150a03] border-t border-[#4d2c12] text-center text-[11px] font-serif text-[#a88d6f]">
          All literature sourced from public domain masters · 1,440 minutes of literature
        </footer>
      </div>
    </div>
  );
};
