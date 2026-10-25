import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide prompt
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          aria-label="Install Literary Clock PWA"
          className="group relative flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border border-[#c49a45]/60 bg-gradient-to-b from-[#4a2e16] to-[#2c190a] text-[#f7e8aa] shadow-md hover:border-[#ffd978] hover:from-[#5c391c] hover:to-[#381f0d] transition-all cursor-pointer active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-[#e5be62] group-hover:scale-110 transition-transform" />
          <span>Install App</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            aria-label="Install on iPhone / iPad"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-[#c49a45]/60 bg-gradient-to-b from-[#4a2e16] to-[#2c190a] text-[#f7e8aa] shadow-md hover:border-[#ffd978] transition-all cursor-pointer active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#e5be62]" />
            <span>Install App</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
              <div className="w-full max-w-sm rounded-xl border-2 border-[#b88628] bg-[#22140a] p-6 text-[#f5ebd7] shadow-2xl relative">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="absolute top-4 right-4 text-[#cfb68d] hover:text-[#fff] p-1"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3b2110] border border-[#d4af37] flex items-center justify-center">
                    <img src="/icon.svg" alt="Clock" className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#ffd978]">Install Literary Clock</h3>
                    <p className="text-xs text-[#b89f81]">Add to iPhone or iPad Home Screen</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-[#e6d8c4] border-t border-[#4a2e17] pt-3">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#ffd978]">1.</span>
                    <span>Tap the Safari <strong>Share</strong> icon (the square with arrow) at the bottom or top of your browser.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#ffd978]">2.</span>
                    <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#ffd978]">3.</span>
                    <span>Tap <strong>Add</strong> in the top-right corner to enjoy offline reading with no browser bars.</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-5 w-full rounded-md border border-[#c49a45] bg-[#3a2211] py-2 text-sm font-semibold text-[#f5ebd7] hover:bg-[#4d2d17] transition-colors"
                >
                  Got It
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
