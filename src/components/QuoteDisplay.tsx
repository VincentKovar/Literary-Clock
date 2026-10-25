import React from 'react';
import { LiteraryQuote, ClockTheme } from '../data/types';
import { Bookmark, Copy, Check, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface QuoteDisplayProps {
  quote: LiteraryQuote;
  currentIndex: number;
  totalQuotes: number;
  onNextQuote: () => void;
  onPrevQuote: () => void;
  theme: ClockTheme;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({
  quote,
  currentIndex,
  totalQuotes,
  onNextQuote,
  onPrevQuote,
  theme,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      const textToCopy = `"${quote.quote}"\n— ${quote.author}, ${quote.title} (${quote.year || 'Classic'}${quote.chapter ? `, ${quote.chapter}` : ''})`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Helper to highlight the exact timePhrase inside the quote text
  const renderHighlightedQuote = () => {
    if (!quote.timePhrase) {
      return quote.quote;
    }

    const text = quote.quote;
    const phrase = quote.timePhrase;
    const regex = new RegExp(`(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === phrase.toLowerCase()) {
        return (
          <mark
            key={index}
            className="quote-time-highlight not-italic text-inherit px-1 rounded-sm"
          >
            {part}
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Dynamic theme wrapper classes
  const themeClass = {
    parchment: 'parchment-sheet text-[#26170c]',
    eink: 'parchment-eink text-[#0f0f0f]',
    mahogany: 'parchment-mahogany text-[#f5ebd7]',
    'dark-leather': 'parchment-dark-leather text-[#e8dfd3]',
  }[theme];

  return (
    <article
      aria-label="Current Literary Quote"
      className={`relative w-full rounded-lg p-6 sm:p-10 transition-colors duration-500 flex flex-col justify-between min-h-[340px] sm:min-h-[400px] border border-[#d6b05e]/30 shadow-2xl ${themeClass}`}
    >
      {/* Decorative Antique Corner Vignettes */}
      <div className="absolute top-3 left-3 text-xs opacity-40 select-none font-serif">❦</div>
      <div className="absolute top-3 right-3 text-xs opacity-40 select-none font-serif">❧</div>
      <div className="absolute bottom-3 left-3 text-xs opacity-40 select-none font-serif">❧</div>
      <div className="absolute bottom-3 right-3 text-xs opacity-40 select-none font-serif">❦</div>

      {/* Top Header: Passage Index Counter & Actions */}
      <header className="flex items-center justify-between border-b border-current/15 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 opacity-75" />
          <span className="font-serif italic text-xs tracking-wider opacity-85">
            Passage {currentIndex + 1} of {totalQuotes}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {totalQuotes > 1 && (
            <div className="flex items-center gap-1 mr-2 bg-black/5 dark:bg-white/5 rounded-md p-0.5 border border-current/20">
              <button
                onClick={onPrevQuote}
                title="Previous Quote for this minute"
                aria-label="Previous quote"
                className="p-1 rounded hover:bg-black/10 active:scale-95 transition-all cursor-pointer opacity-80 hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-1 font-bold">
                {currentIndex + 1}/{totalQuotes}
              </span>
              <button
                onClick={onNextQuote}
                title="Next Quote for this minute"
                aria-label="Next quote"
                className="p-1 rounded hover:bg-black/10 active:scale-95 transition-all cursor-pointer opacity-80 hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={onToggleBookmark}
            title={isBookmarked ? 'Remove from Saved Passages' : 'Save to Favorites'}
            aria-label="Bookmark quote"
            className={`p-1.5 rounded-md border border-current/20 hover:bg-black/10 active:scale-95 transition-all cursor-pointer ${
              isBookmarked ? 'text-amber-500 bg-amber-500/10' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleCopy}
            title="Copy Excerpt"
            aria-label="Copy quote to clipboard"
            className="p-1.5 rounded-md border border-current/20 hover:bg-black/10 active:scale-95 transition-all cursor-pointer opacity-70 hover:opacity-100"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Literary Passage */}
      <blockquote className="my-auto py-2">
        <p className="font-serif text-lg sm:text-2xl md:text-[1.7rem] leading-relaxed sm:leading-[1.8] tracking-wide text-pretty select-text">
          &ldquo;{renderHighlightedQuote()}&rdquo;
        </p>
      </blockquote>

      {/* Decorative Book Flourish Divider */}
      <div className="flex items-center justify-center my-4 opacity-50 select-none">
        <span className="h-px bg-current w-16" />
        <span className="mx-3 text-sm font-serif">✦ ⚜ ✦</span>
        <span className="h-px bg-current w-16" />
      </div>

      {/* Book & Author Citation Footer */}
      <footer className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm border-t border-current/15">
        <div className="font-serif">
          <cite className="font-semibold text-base not-italic tracking-wide">
            {quote.author}
          </cite>
          <span className="mx-2 opacity-50">·</span>
          <span className="italic opacity-90">{quote.title}</span>
          {quote.year && <span className="opacity-70 text-xs ml-1.5">({quote.year})</span>}
        </div>

        {quote.chapter && (
          <div className="text-xs font-serif italic opacity-75 sm:text-right">
            {quote.chapter}
          </div>
        )}
      </footer>
    </article>
  );
};
