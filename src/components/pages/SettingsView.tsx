/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Shield, Volume2, Bell, Cpu, Trash2, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  autoKillEnabled: boolean;
  onToggleAutoKill: () => void;
  onResetAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  soundEnabled,
  onToggleSound,
  autoKillEnabled,
  onToggleAutoKill,
  onResetAll,
}) => {
  const [lanSubnet, setLanSubnet] = useState('192.168.1.0/24, 10.0.0.0/8');
  const [cameraPolicy, setCameraPolicy] = useState<'WARN_ONLY' | 'AUTO_BLOCK'>('WARN_ONLY');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Endpoint Security & Privacy Policies
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure response thresholds, automated process remediation, audio klaxon warnings, and network subnets
        </p>
      </div>

      <div className="space-y-4">
        {/* Policy 1: Auto-Kill Rogue Camera Processes */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-rose-400" />
              Automated Process Termination (Auto-Kill)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Immediately terminate any process attempting to transmit camera video frames to an unauthorized remote peer (e.g. phone via Monect) without waiting for user confirmation.
            </p>
          </div>
          <button
            onClick={onToggleAutoKill}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              autoKillEnabled ? 'bg-rose-600' : 'bg-slate-800'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                autoKillEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Policy 2: Audio Warnings */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              Intrusive Security Klaxon & Chime
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Play high-priority dual-tone synthesized audio alerts whenever a remote surveillance session or file tampering event is detected.
            </p>
          </div>
          <button
            onClick={onToggleSound}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              soundEnabled ? 'bg-cyan-600' : 'bg-slate-800'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Policy 3: LAN CIDR Subnets */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">
            Trusted Local Area Network (LAN) Subnet Mask
          </h3>
          <p className="text-xs text-slate-400">
            Define local network ranges used to distinguish peer mobile devices (phones, tablets) from external WAN traffic:
          </p>
          <input
            type="text"
            value={lanSubnet}
            onChange={(e) => setLanSubnet(e.target.value)}
            className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Database Clean up */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Reset Local Forensic Evidence Cache
            </h3>
            <p className="text-xs text-slate-400">
              Clear all simulated events, active chains, and historical threat logs from local storage.
            </p>
          </div>
          <button
            onClick={onResetAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Cache</span>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
          >
            {savedNotice ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Policies Applied!</span>
              </>
            ) : (
              <span>Save Policy Settings</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
