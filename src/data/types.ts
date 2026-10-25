export interface LiteraryQuote {
  id: string;
  time: string; // "HH:MM" (24-hour format, e.g. "13:12")
  displayTime?: string; // e.g. "1:12 PM"
  timePhrase: string; // The exact phrase in the quote to highlight, e.g. "twelve minutes past one"
  quote: string; // The complete passage
  author: string; // e.g. "Charles Dickens"
  title: string; // e.g. "Great Expectations"
  year?: number; // e.g. 1861
  chapter?: string; // e.g. "Chapter 39"
  context?: string; // Optional context note
}

export type ClockTheme = 'parchment' | 'eink' | 'mahogany' | 'dark-leather';

export type TimeFormat = '12h' | '24h';
