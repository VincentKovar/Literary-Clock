import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Settings, Radio, Sparkles } from 'lucide-react';
import { ttv, TTVConfig } from '../utils/ttvEngine';
import { LiteraryQuote } from '../data/types';

interface TTVControlsProps {
  quote: LiteraryQuote;
  config: TTVConfig;
  onUpdateConfig: (newConfig: TTVConfig) => void;
}

export const TTVControls: React.FC<TTVControlsProps> = ({
  quote,
  config,
  onUpdateConfig,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const unsubscribe = ttv.subscribe((speaking, paused) => {
      setIsSpeaking(speaking);
      setIsPaused(paused);
    });

    const updateVoices = () => {
      const voices = ttv.getAvailableVoices();
      setAvailableVoices(voices);
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePlayToggle = () => {
    if (isSpeaking && !isPaused) {
      ttv.pause();
    } else if (isSpeaking && isPaused) {
      ttv.resume();
    } else {
      ttv.speak(quote.quote, quote.title, quote.author, config);
    }
  };

  const handleStop = () => {
    ttv.stop();
  };

  const handleRateChange = (rate: number) => {
    onUpdateConfig({ ...config, rate });
  };

  return (
    <>
      {/* Tactile Brass TTV Audio Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1c0e05] via-[#2c1708] to-[#1c0e05] border border-[#7d5617]/70 shadow-lg">
        {/* Play / Pause / Stop Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayToggle}
            aria-label={isSpeaking && !isPaused ? 'Pause Narration' : 'Narrate Quote with Voice'}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#d4af37] bg-gradient-to-b from-[#e5be62] to-[#b88628] text-[#1c0f05] font-serif font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {isSpeaking && !isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPaused ? 'Resume' : 'Read Aloud'}</span>
              </>
            )}
          </button>

          {isSpeaking && (
            <button
              onClick={handleStop}
              aria-label="Stop Narration"
              className="p-1.5 rounded-md border border-[#8a5f22] bg-[#311a0b] text-[#ffd978] hover:bg-[#472710] active:scale-95 transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* Gramophone Acoustic Wave Indicator */}
          {isSpeaking && !isPaused && (
            <div className="flex items-center gap-0.5 ml-1 px-2 py-1 rounded bg-[#130a04] border border-[#6b4715]">
              <span className="w-1 h-3 bg-[#e5be62] animate-pulse rounded-full" />
              <span className="w-1 h-4 bg-[#e5be62] animate-pulse delay-75 rounded-full" />
              <span className="w-1 h-2 bg-[#e5be62] animate-pulse delay-150 rounded-full" />
              <span className="w-1 h-3.5 bg-[#e5be62] animate-pulse delay-100 rounded-full" />
            </div>
          )}
        </div>

        {/* Speed & Auto-Read & Settings */}
        <div className="flex items-center gap-2 text-xs">
          {/* Rate Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-[#130a04] p-1 rounded border border-[#6b4715]">
            <span className="text-[10px] uppercase font-serif text-[#caa766] px-1">Speed</span>
            {[0.85, 1.0, 1.15].map((r) => (
              <button
                key={r}
                onClick={() => handleRateChange(r)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  config.rate === r
                    ? 'bg-[#d4af37] text-[#1c0f05] font-bold'
                    : 'text-[#dfc38a] hover:text-[#fff]'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>

          {/* Auto Read Toggle */}
          <button
            onClick={() => onUpdateConfig({ ...config, autoReadOnMinute: !config.autoReadOnMinute })}
            title="Auto-read passage every minute"
            aria-label="Toggle auto-read on minute"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              config.autoReadOnMinute
                ? 'bg-[#3b230d] border-[#d4af37] text-[#ffd978]'
                : 'bg-[#180d05] border-[#5a3a14] text-[#aa8d68] hover:text-[#e4cfb4]'
            }`}
          >
            <Radio className={`w-3 h-3 ${config.autoReadOnMinute ? 'animate-pulse text-[#e5be62]' : ''}`} />
            <span className="text-[11px] font-serif">Auto-Narrate</span>
          </button>

          {/* TTV API Configuration Modal Trigger */}
          <button
            onClick={() => setShowSettings(true)}
            title="Voice & TTV API Settings"
            aria-label="Open voice settings"
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#251307] border border-[#7d5617] text-[#e0c48e] hover:text-[#fff] hover:border-[#ffd978] transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] font-serif">Voice / API</span>
          </button>
        </div>
      </div>

      {/* TTV Configuration & API Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border-2 border-[#b88628] bg-[#1d1007] p-6 text-[#f5ebd7] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#4d2c12] mb-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#ffd978]" />
                <h3 className="font-serif text-lg font-bold text-[#ffd978]">Text-To-Voice (TTV) Settings</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[#caa766] hover:text-[#fff] text-sm p-1 font-mono"
              >
                ✕
              </button>
            </div>

            {/* Provider Selection */}
            <div className="space-y-4 text-xs font-serif">
              <div>
                <label className="block text-[#caa766] font-bold uppercase tracking-wider mb-1.5">
                  Narration Engine
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateConfig({ ...config, provider: 'browser' })}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      config.provider === 'browser'
                        ? 'border-[#d4af37] bg-[#3b230f] text-[#ffd978]'
                        : 'border-[#4a2b13] bg-[#221308] text-[#a98f71]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <span>Native Web Speech</span>
                    </div>
                    <div className="text-[10px] opacity-80 mt-1">
                      Works offline in PWA, zero API keys required.
                    </div>
                  </button>

                  <button
                    onClick={() => onUpdateConfig({ ...config, provider: 'custom_api' })}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      config.provider === 'custom_api'
                        ? 'border-[#d4af37] bg-[#3b230f] text-[#ffd978]'
                        : 'border-[#4a2b13] bg-[#221308] text-[#a98f71]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#e5be62]" />
                      <span>Custom TTV API</span>
                    </div>
                    <div className="text-[10px] opacity-80 mt-1">
                      Connect external TTS service or Gemini API.
                    </div>
                  </button>
                </div>
              </div>

              {/* Browser Voice Options */}
              {config.provider === 'browser' && (
                <div className="space-y-3 bg-[#261408] p-3 rounded-lg border border-[#4d2c12]">
                  <div>
                    <label className="block text-[#caa766] mb-1">Narrator Voice</label>
                    <select
                      value={config.voiceURI || ''}
                      onChange={(e) => onUpdateConfig({ ...config, voiceURI: e.target.value })}
                      className="w-full rounded bg-[#160c04] border border-[#6b451a] p-2 text-xs text-[#f5ebd7] focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="">Default System Voice</option>
                      {availableVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#caa766] mb-1">
                      <span>Narration Speed</span>
                      <span className="font-mono">{config.rate}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={config.rate}
                      onChange={(e) => onUpdateConfig({ ...config, rate: parseFloat(e.target.value) })}
                      className="w-full accent-[#d4af37]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[#caa766] mb-1">
                      <span>Pitch</span>
                      <span className="font-mono">{config.pitch}</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.3"
                      step="0.05"
                      value={config.pitch}
                      onChange={(e) => onUpdateConfig({ ...config, pitch: parseFloat(e.target.value) })}
                      className="w-full accent-[#d4af37]"
                    />
                  </div>
                </div>
              )}

              {/* Custom API Configuration Options */}
              {config.provider === 'custom_api' && (
                <div className="space-y-3 bg-[#261408] p-3 rounded-lg border border-[#4d2c12]">
                  <div>
                    <label className="block text-[#caa766] mb-1">TTV API Endpoint URL</label>
                    <input
                      type="url"
                      placeholder="https://api.elevenlabs.io/v1/text-to-speech/... or /api/tts"
                      value={config.apiEndpoint || ''}
                      onChange={(e) => onUpdateConfig({ ...config, apiEndpoint: e.target.value })}
                      className="w-full rounded bg-[#160c04] border border-[#6b451a] p-2 text-xs text-[#f5ebd7] placeholder-[#7d6044] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#caa766] mb-1">API Key / Bearer Token (Optional)</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={config.apiKey || ''}
                      onChange={(e) => onUpdateConfig({ ...config, apiKey: e.target.value })}
                      className="w-full rounded bg-[#160c04] border border-[#6b451a] p-2 text-xs text-[#f5ebd7] placeholder-[#7d6044] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <p className="text-[11px] text-[#b89c7d] leading-normal italic">
                    The endpoint receives a JSON payload with <code>&#123; text, speed &#125;</code> and returns audio streaming bytes (WAV/MP3). If the API is unreachable, it automatically falls back to the native Web Speech API.
                  </p>
                </div>
              )}

              {/* Test Audio Button */}
              <button
                onClick={() => ttv.speak('The clock struck one o\'clock in the quiet library.', 'Literary Chronometer', 'Classic Voice', config)}
                className="w-full py-2.5 rounded-lg border border-[#d4af37] bg-gradient-to-r from-[#805917] via-[#b88628] to-[#805917] text-[#1c0f05] font-bold text-xs shadow-md hover:brightness-110 active:scale-98 transition-all cursor-pointer"
              >
                Test Voice Sample
              </button>
            </div>

            <div className="mt-5 pt-3 border-t border-[#4d2c12] flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-1.5 rounded-md border border-[#c49a45] bg-[#3a2211] text-xs font-semibold text-[#f5ebd7] hover:bg-[#4d2d17] cursor-pointer"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
