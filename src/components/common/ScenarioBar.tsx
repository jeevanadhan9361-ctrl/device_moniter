/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Smartphone,
  Video,
  FileEdit,
  ShieldCheck,
  EyeOff,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface ScenarioBarProps {
  onTriggerMonectCamera: () => void;
  onTriggerMonectFile: () => void;
  onTriggerZoomBaseline: () => void;
  onTriggerStealthHook: () => void;
  onReset: () => void;
  onCustomInject: (customData: {
    processName: string;
    pid: number;
    remoteIp: string;
    action: 'CAMERA' | 'FILE';
    deviceHint: string;
  }) => void;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  onTriggerMonectCamera,
  onTriggerMonectFile,
  onTriggerZoomBaseline,
  onTriggerStealthHook,
  onReset,
  onCustomInject,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [procName, setProcName] = useState('MonectServer.exe');
  const [pidVal, setPidVal] = useState('4892');
  const [ipVal, setIpVal] = useState('192.168.1.84');
  const [deviceHintVal, setDeviceHintVal] = useState('Android Phone (Monect Remote)');
  const [actionType, setActionType] = useState<'CAMERA' | 'FILE'>('CAMERA');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCustomInject({
      processName: procName.trim() || 'MonectServer.exe',
      pid: parseInt(pidVal, 10) || 5000,
      remoteIp: ipVal.trim() || '192.168.1.84',
      action: actionType,
      deviceHint: deviceHintVal.trim() || 'Remote Mobile Controller',
    });
    setShowCustomModal(false);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-mono">
          <Play className="w-3.5 h-3.5 text-cyan-400" />
          Live Endpoint Scenarios:
        </span>

        {/* Primary Monect Camera Trigger */}
        <button
          onClick={onTriggerMonectCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-sm shadow-rose-950/40 transition-colors"
          title="Simulate connecting phone via Monect and streaming webcam remotely"
        >
          <Smartphone className="w-3.5 h-3.5 text-white" />
          <Video className="w-3.5 h-3.5 text-rose-200" />
          <span>Simulate Monect Camera Access</span>
        </button>

        {/* Monect File Edit Trigger */}
        <button
          onClick={onTriggerMonectFile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-sm transition-colors"
          title="Simulate remote phone modifying local sensitive files"
        >
          <FileEdit className="w-3.5 h-3.5 text-amber-200" />
          <span>Simulate Monect File Edit</span>
        </button>

        {/* Zoom Baseline Comparison */}
        <button
          onClick={onTriggerZoomBaseline}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          title="Baseline comparison: Legitimate Zoom video call with no exfiltration"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Legitimate Zoom Baseline</span>
        </button>

        {/* Stealth Hook */}
        <button
          onClick={onTriggerStealthHook}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          title="Unsigned local capture without socket (Tests UNKNOWN evidence rule)"
        >
          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Stealth Camera Hook</span>
        </button>

        {/* Custom Injection */}
        <button
          onClick={() => setShowCustomModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700"
          title="Customize PID, Remote IP, and process"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Custom Injection...</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Reset database and initial baseline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Telemetry</span>
        </button>
      </div>

      {/* Custom injection modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            onSubmit={handleCustomSubmit}
            className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Custom Endpoint Injection
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Process Executable</label>
                <input
                  type="text"
                  value={procName}
                  onChange={(e) => setProcName(e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. MonectServer.exe"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Process PID</label>
                  <input
                    type="number"
                    value={pidVal}
                    onChange={(e) => setPidVal(e.target.value)}
                    className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Action Type</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as 'CAMERA' | 'FILE')}
                    className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CAMERA">Camera Streaming</option>
                    <option value="FILE">File Modification</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Remote Device IP (Phone / Peer)</label>
                <input
                  type="text"
                  value={ipVal}
                  onChange={(e) => setIpVal(e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. 192.168.1.84"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Device Name / Hint</label>
                <input
                  type="text"
                  value={deviceHintVal}
                  onChange={(e) => setDeviceHintVal(e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. OnePlus 11 (Monect Client)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Inject Telemetry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
