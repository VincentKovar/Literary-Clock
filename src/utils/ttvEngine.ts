// Text-To-Voice (TTV) Engine supporting Web Speech API & Custom/Cloud TTV API

export interface TTVConfig {
  provider: 'browser' | 'custom_api';
  voiceURI?: string;
  rate: number;
  pitch: number;
  volume: number;
  autoReadOnMinute: boolean;
  apiEndpoint?: string;
  apiKey?: string;
}

export const DEFAULT_TTV_CONFIG: TTVConfig = {
  provider: 'browser',
  rate: 0.95, // Slightly stately, measured cadence for classic literature
  pitch: 1.0,
  volume: 1.0,
  autoReadOnMinute: false,
  apiEndpoint: '',
  apiKey: '',
};

class TTVEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState = false;
  private isPausedState = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private listeners: Set<(speaking: boolean, paused: boolean) => void> = new Set();

  public subscribe(callback: (speaking: boolean, paused: boolean) => void) {
    this.listeners.add(callback);
    callback(this.isSpeakingState, this.isPausedState);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isSpeakingState, this.isPausedState));
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    this.isSpeakingState = false;
    this.isPausedState = false;
    this.notify();
  }

  public pause(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.isPausedState = true;
      this.notify();
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      this.isPausedState = true;
      this.notify();
    }
  }

  public resume(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.play();
      this.isPausedState = false;
      this.notify();
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      this.isPausedState = false;
      this.notify();
    }
  }

  public async speak(text: string, title?: string, author?: string, config: TTVConfig = DEFAULT_TTV_CONFIG): Promise<void> {
    this.stop();

    const narrationText = `${text}. From ${title || 'Classic Literature'}, by ${author || 'Renowned Author'}.`;

    // Option 1: Custom / Cloud TTV API
    if (config.provider === 'custom_api' && config.apiEndpoint) {
      try {
        this.isSpeakingState = true;
        this.isPausedState = false;
        this.notify();

        const response = await fetch(config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          },
          body: JSON.stringify({
            text: narrationText,
            voice: config.voiceURI || 'default',
            speed: config.rate,
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.volume = config.volume;
        this.currentAudioElement = audio;

        audio.onended = () => {
          this.isSpeakingState = false;
          this.isPausedState = false;
          this.currentAudioElement = null;
          this.notify();
        };

        audio.onerror = () => {
          this.fallbackToBrowserSpeech(narrationText, config);
        };

        await audio.play();
        return;
      } catch (err) {
        console.warn('Custom TTV API failed, falling back to browser speech:', err);
        this.fallbackToBrowserSpeech(narrationText, config);
        return;
      }
    }

    // Option 2: Browser Web Speech API
    this.fallbackToBrowserSpeech(narrationText, config);
  }

  private fallbackToBrowserSpeech(text: string, config: TTVConfig): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported on this browser.');
      this.isSpeakingState = false;
      this.notify();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.5, Math.min(2.0, config.rate));
    utterance.pitch = Math.max(0.5, Math.min(1.5, config.pitch));
    utterance.volume = Math.max(0, Math.min(1, config.volume));

    if (config.voiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const selected = voices.find((v) => v.voiceURI === config.voiceURI);
      if (selected) {
        utterance.voice = selected;
      }
    }

    utterance.onstart = () => {
      this.isSpeakingState = true;
      this.isPausedState = false;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = () => {
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }
}

export const ttv = new TTVEngine();
