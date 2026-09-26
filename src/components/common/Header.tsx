/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Volume2,
  VolumeX,
  Database,
  Shield,
  Circle,
  Camera,
  Bell,
  BellRing,
  Mic,
  MicOff,
  FileSpreadsheet,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { EndpointDeviceHardware } from '../../types';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  desktopNotifStatus: NotificationPermission | 'unsupported';
  onRequestDesktopNotifs: () => void;
  onExportDb: () => void;
  onExportAuditReport: () => void;
  hardwareDevices: EndpointDeviceHardware[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  desktopNotifStatus,
  onRequestDesktopNotifs,
  onExportDb,
  onExportAuditReport,
  hardwareDevices,
  activeTab,
  onSelectTab,
}) => {
  const webcam = hardwareDevices.find((d) => d.type === 'WEBCAM');
  const isCameraLive = webcam?.current_state === 'ACTIVE_STREAMING';

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('dashboard');
          }}
          className="text-base font-bold tracking-tight text-white flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <span>VigilanceEye</span>
        </a>

        {/* Live Hardware Camera Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
            isCameraLive
              ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
          title={isCameraLive ? `Camera IN USE by PID ${webcam?.associated_pid || 'Unknown'}` : 'Camera sensor idle'}
        >
          <Camera className={`w-3.5 h-3.5 ${isCameraLive ? 'text-rose-400' : 'text-slate-500'}`} />
          <span>CAM:</span>
          <span className="font-semibold">{isCameraLive ? 'STREAMING' : 'IDLE'}</span>
          <Circle className={`w-2 h-2 fill-current ${isCameraLive ? 'text-rose-500' : 'text-slate-600'}`} />
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`hover:text-slate-100 transition-colors ${activeTab === 'dashboard' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('correlation')}
          className={`hover:text-slate-100 transition-colors ${activeTab === 'correlation' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Correlation
        </button>
        <button
          onClick={() => onSelectTab('events')}
          className={`hover:text-slate-100 transition-colors ${activeTab === 'events' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Events
        </button>
        <button
          onClick={() => onSelectTab('devices')}
          className={`hover:text-slate-100 transition-colors ${activeTab === 'devices' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Sensors
        </button>
        <button
          onClick={() => onSelectTab('sigma')}
          className={`hover:text-slate-100 transition-colors ${activeTab === 'sigma' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Sigma Rules
        </button>
        <button
          onClick={() => onSelectTab('diagnostics')}
          className={`hover:text-slate-100 transition-colors ${activeTab === 'diagnostics' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Diagnostics
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        {/* Real OS Desktop Notification Prompt */}
        {desktopNotifStatus !== 'granted' && desktopNotifStatus !== 'unsupported' && (
          <button
            onClick={onRequestDesktopNotifs}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-medium transition-colors"
            title="Enable native Windows Desktop Toast Notifications for camera and file alerts"
          >
            <BellRing className="w-3.5 h-3.5 animate-bounce" />
            <span className="hidden lg:inline">Enable Windows Toasts</span>
          </button>
        )}

        {/* Audio Klaxon Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-1.5 rounded-lg border transition-colors ${
            soundEnabled
              ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:text-cyan-300'
              : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
          title={soundEnabled ? 'Security Chime: Enabled' : 'Security Chime: Muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Speech Voice Alert Toggle */}
        <button
          onClick={onToggleVoice}
          className={`p-1.5 rounded-lg border transition-colors ${
            voiceEnabled
              ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:text-emerald-300'
              : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
          title={voiceEnabled ? 'Voice Alerts: Synthesizer Speaking Active' : 'Voice Alerts: Muted'}
        >
          {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Export Forensic Audit Report */}
        <button
          onClick={onExportAuditReport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-colors"
          title="Download Forensic Audit Compliance Report (.md)"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Audit Report</span>
        </button>

        {/* Export SQLite Database */}
        <button
          onClick={onExportDb}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-colors"
          title="Export SQLite Evidence Database (.sql dump)"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">SQLite</span>
        </button>

        <PWAInstallButton />
      </div>
    </header>
  );
};
