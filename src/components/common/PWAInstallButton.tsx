/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installed as Desktop App</span>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-xs font-medium transition-colors shadow-sm"
        title="Install as native Windows/macOS Desktop Progressive Web App"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="whitespace-nowrap">Install Desktop App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded border border-slate-700 hover:bg-slate-800 text-slate-300 px-2.5 py-1 text-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm rounded-lg bg-slate-900 border border-slate-800 p-5 shadow-xl text-slate-200">
              <h3 className="text-base font-semibold text-white">Install to Desktop / Home Screen</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                1. Tap the <strong>Share</strong> button in browser toolbar.<br />
                2. Select <strong>Add to Home Screen</strong> or <strong>Install App</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded bg-slate-800 hover:bg-slate-700 py-1.5 text-xs font-medium text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
