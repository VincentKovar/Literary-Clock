import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  Volume2,
  VolumeX,
  Compass,
  Maximize2,
  Minimize2,
  BookOpen,
  RotateCcw,
  Sparkles,
  Palette,
  Bell,
  BellOff,
} from 'lucide-react';
import { LiteraryQuote, ClockTheme, TimeFormat } from './data/types';
import { getQuotesForTime, formatTime24, formatTimeDisplay } from './data/quotesEngine';
import { BrassDial } from './components/BrassDial';
import { QuoteDisplay } from './components/QuoteDisplay';
import { TTVControls } from './components/TTVControls';
import { LibraryModal } from './components/LibraryModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ttv, TTVConfig, DEFAULT_TTV_CONFIG } from './utils/ttvEngine';
import { playClockTick, playMinuteChime, playDialClick, unlockAudio } from './utils/audioSynth';

export default function App() {
  // Clock state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [timeStr, setTimeStr] = useState<string>(() => formatTime24(new Date()));
  const [quotes, setQuotes] = useState<LiteraryQuote[]>(() => getQuotesForTime(formatTime24(new Date())));
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // Settings & Preferences
  const [theme, setTheme] = useState<ClockTheme>(() => {
    return (localStorage.getItem('litclock_theme') as ClockTheme) || 'parchment';
  });
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('litclock_sound') === 'true';
  });
  const [chimeEnabled, setChimeEnabled] = useState<boolean>(() => {
    return localStorage.getItem('litclock_chime') === 'true';
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // TTV Configuration
  const [ttvConfig, setTtvConfig] = useState<TTVConfig>(() => {
    try {
      const saved = localStorage.getItem('litclock_ttv');
      return saved ? JSON.parse(saved) : DEFAULT_TTV_CONFIG;
    } catch {
      return DEFAULT_TTV_CONFIG;
    }
  });

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<LiteraryQuote[]>(() => {
    try {
      const saved = localStorage.getItem('litclock_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Catalog Modal
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const prevMinuteRef = useRef<string>(formatTime24(new Date()));

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('litclock_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('litclock_ttv', JSON.stringify(ttvConfig));
  }, [ttvConfig]);

  useEffect(() => {
    localStorage.setItem('litclock_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('litclock_sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('litclock_chime', String(chimeEnabled));
  }, [chimeEnabled]);

  // Clock Ticking Loop
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);

      if (isLiveMode) {
        const formatted = formatTime24(now);
        // Play subtle second tick if sound is enabled
        if (soundEnabled) {
          playClockTick(true);
        }

        if (formatted !== prevMinuteRef.current) {
          prevMinuteRef.current = formatted;
          setTimeStr(formatted);
          const newQuotes = getQuotesForTime(formatted);
          setQuotes(newQuotes);
          setQuoteIndex(0);

          // Hourly / Minute chime
          if (chimeEnabled) {
            playMinuteChime();
          }

          // Auto narration if enabled in TTV config
          if (ttvConfig.autoReadOnMinute && newQuotes[0]) {
            ttv.speak(newQuotes[0].quote, newQuotes[0].title, newQuotes[0].author, ttvConfig);
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLiveMode, soundEnabled, chimeEnabled, ttvConfig]);

  // Update quotes when timeStr changes (manual dial or live)
  const updateTimeTo = useCallback((newTime: string) => {
    setTimeStr(newTime);
    const newQuotes = getQuotesForTime(newTime);
    setQuotes(newQuotes);
    setQuoteIndex(0);
  }, []);

  // Rotary Dial Handlers
  const currentHours = parseInt(timeStr.split(':')[0], 10) || 0;
  const currentMinutes = parseInt(timeStr.split(':')[1], 10) || 0;

  const handleMinuteDialChange = (newMinute: number) => {
    setIsLiveMode(false);
    const h = currentHours.toString().padStart(2, '0');
    const m = newMinute.toString().padStart(2, '0');
    updateTimeTo(`${h}:${m}`);
  };

  const handleHourDialChange = (newHour: number) => {
    setIsLiveMode(false);
    const h = newHour.toString().padStart(2, '0');
    const m = currentMinutes.toString().padStart(2, '0');
    updateTimeTo(`${h}:${m}`);
  };

  const handleReturnToLive = () => {
    playDialClick();
    setIsLiveMode(true);
    const now = new Date();
    const liveTime = formatTime24(now);
    prevMinuteRef.current = liveTime;
    updateTimeTo(liveTime);
  };

  // Quote cycling
  const currentQuote = quotes[quoteIndex] || quotes[0];

  const handleNextQuote = () => {
    if (soundEnabled) playDialClick();
    setQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  const handlePrevQuote = () => {
    if (soundEnabled) playDialClick();
    setQuoteIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  // Bookmark Toggle
  const isCurrentBookmarked = bookmarks.some((b) => b.id === currentQuote?.id);

  const handleToggleBookmark = () => {
    if (!currentQuote) return;
    if (isCurrentBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.id !== currentQuote.id));
    } else {
      setBookmarks((prev) => [...prev, currentQuote]);
    }
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleToggleSound = () => {
    unlockAudio();
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playClockTick(false);
    }
  };

  const handleToggleChime = () => {
    unlockAudio();
    const next = !chimeEnabled;
    setChimeEnabled(next);
    if (next) {
      playMinuteChime();
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 theme-${theme}`}>
      {/* Outer Oak Mantel Clock Structure */}
      <main className="w-full max-w-4xl relative rounded-2xl p-4 sm:p-7 md:p-9 oak-casing-wood border-4 border-[#120702] shadow-2xl transition-all">
        {/* Realistic Antique Brass Corner Plates with Screws */}
        <div className="absolute top-3 left-3 w-8 h-8 pointer-events-none">
          <div className="w-full h-full border-t-2 border-l-2 border-[#d4af37]/80 rounded-tl-lg" />
          <div className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full brass-screws flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-[#311c03]" />
          </div>
        </div>
        <div className="absolute top-3 right-3 w-8 h-8 pointer-events-none">
          <div className="w-full h-full border-t-2 border-r-2 border-[#d4af37]/80 rounded-tr-lg" />
          <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full brass-screws flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-[#311c03]" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 w-8 h-8 pointer-events-none">
          <div className="w-full h-full border-b-2 border-l-2 border-[#d4af37]/80 rounded-bl-lg" />
          <div className="absolute bottom-1 left-1 w-2.5 h-2.5 rounded-full brass-screws flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-[#311c03]" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 w-8 h-8 pointer-events-none">
          <div className="w-full h-full border-b-2 border-r-2 border-[#d4af37]/80 rounded-br-lg" />
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full brass-screws flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-[#311c03]" />
          </div>
        </div>

        {/* Top Mantel Bar: Clock Brand, Live Chronometer Badge, Utilities */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#5a3311]">
          {/* Engraved Oak Plaque */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-[#d4af37] bg-gradient-to-br from-[#d4af37] via-[#8c6314] to-[#473007] flex items-center justify-center shadow-md">
              <Clock className="w-4 h-4 text-[#1a0f04]" />
            </div>
            <div>
              <h1 className="font-serif tracking-widest text-sm sm:text-base font-extrabold uppercase text-[#ffd978] drop-shadow-xs">
                The Literary Clock
              </h1>
              <p className="font-serif italic text-[11px] text-[#cca766]">
                1,440 Minutes in Beloved Literature
              </p>
            </div>
          </div>

          {/* Center Digital / Chronometer Readout Window */}
          <div className="flex items-center gap-2 bg-[#100702] px-3 py-1.5 rounded-lg border-2 border-[#6d4617] shadow-inner">
            <div className="flex flex-col items-end">
              <span className="font-mono text-sm sm:text-base font-bold text-[#fce899] tracking-wider">
                {isLiveMode ? formatTimeDisplay(currentDate, timeFormat) : `${timeStr} (Manual)`}
              </span>
              <span className="text-[9px] font-serif uppercase tracking-widest text-[#9d7845]">
                {isLiveMode ? 'Synchronized' : 'Time Travel'}
              </span>
            </div>

            {!isLiveMode && (
              <button
                onClick={handleReturnToLive}
                title="Return to Live Time"
                aria-label="Return to live clock"
                className="ml-1 p-1 rounded bg-[#3b200b] hover:bg-[#522d10] border border-[#d4af37] text-[#ffd978] text-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-sm"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[10px] font-serif hidden sm:inline">Live</span>
              </button>
            )}
          </div>

          {/* Top Actions: Install PWA, Fullscreen, Catalog */}
          <div className="flex items-center gap-2">
            <PWAInstallButton />

            <button
              onClick={() => setIsLibraryOpen(true)}
              title="Open Passage Archive"
              aria-label="Browse literature archive"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#8a5f22] bg-[#2d180a] hover:bg-[#42240f] text-[#f2dfb1] text-xs font-serif font-bold transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Archive</span>
            </button>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mantel Mode'}
              aria-label="Toggle fullscreen"
              className="p-1.5 rounded-md border border-[#8a5f22] bg-[#2d180a] hover:bg-[#42240f] text-[#f2dfb1] text-xs transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Display Bezel & Center Quote Paper Display */}
        <section className="relative rounded-xl p-2 sm:p-3 oak-bezel-inner border-2 border-[#47270d] shadow-2xl mb-6">
          {currentQuote ? (
            <QuoteDisplay
              quote={currentQuote}
              currentIndex={quoteIndex}
              totalQuotes={quotes.length}
              onNextQuote={handleNextQuote}
              onPrevQuote={handlePrevQuote}
              theme={theme}
              isBookmarked={isCurrentBookmarked}
              onToggleBookmark={handleToggleBookmark}
            />
          ) : (
            <div className="py-20 text-center text-[#cca766] font-serif">
              Winding the clock mechanism...
            </div>
          )}
        </section>

        {/* Text-To-Voice Narration Audio Deck */}
        {currentQuote && (
          <section className="mb-6">
            <TTVControls
              quote={currentQuote}
              config={ttvConfig}
              onUpdateConfig={setTtvConfig}
            />
          </section>
        )}

        {/* Lower Control Deck: Solid Oak Panel with Brass Dials & Switches */}
        <section className="rounded-xl p-4 sm:p-5 bg-gradient-to-b from-[#180a03] to-[#251206] border border-[#523010] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Dual Rotary Brass Dials */}
          <div className="flex items-center gap-6 sm:gap-10">
            {/* Hour Rotary Dial */}
            <BrassDial
              value={currentHours}
              max={24}
              label="Hour Dial"
              onChange={handleHourDialChange}
              soundEnabled={soundEnabled}
              size={96}
            />

            {/* Minute Rotary Dial */}
            <BrassDial
              value={currentMinutes}
              max={60}
              label="Minute Dial"
              onChange={handleMinuteDialChange}
              soundEnabled={soundEnabled}
              size={110}
            />
          </div>

          {/* Quote Selector Brass Dial / Knob */}
          {quotes.length > 1 && (
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest font-serif text-[#d6b05e] mb-1 font-bold">
                Passage Selector
              </span>
              <div className="flex items-center gap-1.5 bg-[#120702] p-1.5 rounded-lg border border-[#6b4715]">
                {quotes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (soundEnabled) playDialClick();
                      setQuoteIndex(idx);
                    }}
                    className={`w-7 h-7 rounded-md font-serif text-xs font-bold transition-all cursor-pointer ${
                      quoteIndex === idx
                        ? 'border border-[#ffd978] bg-gradient-to-b from-[#d4af37] to-[#8c6314] text-[#1c0f05] shadow-md scale-105'
                        : 'border border-[#543410] bg-[#221308] text-[#caa766] hover:bg-[#341d0c]'
                    }`}
                  >
                    {['I', 'II', 'III', 'IV', 'V'][idx] || idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brass Mechanical Toggle Switches & Style Options */}
          <div className="flex flex-col gap-2.5 w-full md:w-auto">
            <div className="text-[10px] uppercase tracking-widest font-serif text-[#d6b05e] font-bold text-center md:text-left">
              Chamber Controls
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {/* Sound Tick Toggle */}
              <button
                onClick={handleToggleSound}
                title={soundEnabled ? 'Disable Mechanical Ticking' : 'Enable Mechanical Ticking Sound'}
                aria-label="Toggle mechanical tick"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-serif transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'border-[#d4af37] bg-[#3a200a] text-[#ffd978] shadow-sm'
                    : 'border-[#4a2b10] bg-[#1a0e05] text-[#937552]'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#e5be62]" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>Tick: {soundEnabled ? 'ON' : 'OFF'}</span>
              </button>

              {/* Chime Toggle */}
              <button
                onClick={handleToggleChime}
                title={chimeEnabled ? 'Disable Minute Chime' : 'Enable Minute Chime'}
                aria-label="Toggle chime"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-serif transition-colors cursor-pointer ${
                  chimeEnabled
                    ? 'border-[#d4af37] bg-[#3a200a] text-[#ffd978] shadow-sm'
                    : 'border-[#4a2b10] bg-[#1a0e05] text-[#937552]'
                }`}
              >
                {chimeEnabled ? <Bell className="w-3.5 h-3.5 text-[#e5be62]" /> : <BellOff className="w-3.5 h-3.5" />}
                <span>Chime: {chimeEnabled ? 'ON' : 'OFF'}</span>
              </button>

              {/* 12h / 24h Toggle */}
              <button
                onClick={() => setTimeFormat((prev) => (prev === '12h' ? '24h' : '12h'))}
                title="Toggle 12h / 24h time display"
                aria-label="Toggle time format"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#4a2b10] bg-[#1a0e05] hover:bg-[#2b1709] text-xs font-mono text-[#e4cfb4] transition-colors cursor-pointer"
              >
                <span>{timeFormat}</span>
              </button>
            </div>

            {/* Paper Theme Segmented Selector */}
            <div className="flex items-center justify-center md:justify-start gap-1 p-1 bg-[#120702] rounded-lg border border-[#523314]">
              {(
                [
                  { id: 'parchment', name: 'Parchment' },
                  { id: 'eink', name: 'E-Ink' },
                  { id: 'mahogany', name: 'Mahogany' },
                  { id: 'dark-leather', name: 'Leather' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`px-2 py-1 text-[11px] font-serif rounded-md transition-all cursor-pointer ${
                    theme === t.id
                      ? 'bg-[#3d230d] border border-[#d4af37] text-[#ffd978] font-bold shadow-xs'
                      : 'text-[#9e805f] hover:text-[#e4cfb4]'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Antique Engraved Plaque */}
        <div className="mt-5 pt-3 border-t border-[#4d2c12] text-center">
          <p className="font-serif tracking-widest text-[11px] uppercase text-[#a88242] select-none">
            ⚜ &nbsp; Tempus In Litteris &nbsp; · &nbsp; Public Domain Literary Passages &nbsp; · &nbsp; 1,440 Minutes of Day &nbsp; ⚜
          </p>
        </div>
      </main>

      {/* Library & Catalog Modal */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectTime={(time) => {
          setIsLiveMode(false);
          updateTimeTo(time);
        }}
        bookmarkedQuotes={bookmarks}
        onRemoveBookmark={(id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
      />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
