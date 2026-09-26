/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, Mic, Wifi, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';
import { EndpointDeviceHardware } from '../../types';

interface DevicesViewProps {
  hardwareDevices: EndpointDeviceHardware[];
}

export const DevicesView: React.FC<DevicesViewProps> = ({ hardwareDevices }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Camera className="w-5 h-5 text-cyan-400" />
          Hardware Devices & Privacy Sensors
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Module 1: DirectShow COM filter enumerator, Media Foundation transform streams, and audio capture endpoints
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hardwareDevices.map((dev) => {
          const isLive = dev.current_state === 'ACTIVE_STREAMING';
          return (
            <div
              key={dev.device_id}
              className={`rounded-xl p-5 border transition-all ${
                isLive
                  ? 'bg-rose-950/20 border-rose-800/80'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg border ${
                      isLive
                        ? 'bg-rose-900/40 border-rose-600 text-rose-300 animate-pulse'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {dev.type === 'WEBCAM' ? (
                      <Camera className="w-5 h-5" />
                    ) : dev.type === 'MICROPHONE' ? (
                      <Mic className="w-5 h-5" />
                    ) : (
                      <Wifi className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight">
                      {dev.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {dev.hardware_id}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                    isLive
                      ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {dev.current_state}
                </span>
              </div>

              {/* Hardware Attributes */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                <div className="text-slate-400">
                  <span>Driver Version: </span>
                  <span className="text-slate-200">{dev.driver_version}</span>
                </div>
                <div className="text-slate-400">
                  <span>Subsystem: </span>
                  <span className="text-slate-200">
                    {dev.type === 'WEBCAM' ? 'DirectShow / MF' : 'CoreAudio'}
                  </span>
                </div>
              </div>

              {/* Active Process Attachment */}
              {dev.associated_process && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-700/60 text-xs font-mono text-rose-200 flex items-center justify-between">
                  <span>Active Capture Client:</span>
                  <span className="font-bold text-white">
                    {dev.associated_process} (PID {dev.associated_pid})
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DirectShow vs Media Foundation Architecture Notice */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-4 space-y-2 text-xs">
        <h4 className="font-semibold text-slate-300 font-mono text-[11px] uppercase">
          Camera Telemetry Architecture & Investigation Findings
        </h4>
        <p className="text-slate-400 leading-relaxed">
          <strong>DirectShow COM Camera Enumeration:</strong> Validated on Windows endpoints. Successfully enumerates physical cameras via <code className="text-cyan-400">CLSID_VideoInputDeviceCategory</code>. Device enumeration alone proves device presence, but does not reliably prove active capture by another process.
        </p>
        <p className="text-slate-400 leading-relaxed">
          <strong>Media Foundation (MFEnumDeviceSources):</strong> Directly tracks active stream attributes, sample request callbacks, and frame presentation timestamps. Process attribution is completed via Windows Capability Registry (<code className="text-cyan-400">ConsentStore\webcam</code>) and socket traffic correlation.
        </p>
      </div>
    </div>
  );
};
