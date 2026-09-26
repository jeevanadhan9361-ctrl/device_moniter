/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Activity,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Video,
} from 'lucide-react';
import {
  hardwareSensorService,
  FrameStats,
  AudioStats,
} from '../../services/hardwareSensorService';

interface RealHardwareSensorMonitorProps {
  onCameraStateChange?: (isActive: boolean, deviceName: string) => void;
}

export const RealHardwareSensorMonitor: React.FC<RealHardwareSensorMonitorProps> = ({
  onCameraStateChange,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [privacyBlur, setPrivacyBlur] = useState(true);
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [frameStats, setFrameStats] = useState<FrameStats | null>(null);
  const [audioStats, setAudioStats] = useState<AudioStats | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    hardwareSensorService.enumeratePhysicalDevices().then(setDeviceList);

    const unsubFrame = hardwareSensorService.subscribeFrame((stats) => {
      setFrameStats(stats);
    });

    const unsubAudio = hardwareSensorService.subscribeAudio((stats) => {
      setAudioStats(stats);
    });

    return () => {
      unsubFrame();
      unsubAudio();
      hardwareSensorService.stopHardwareMonitoring();
    };
  }, []);

  const handleStartRealHardware = async () => {
    setErrorMsg(null);
    const result = await hardwareSensorService.requestCameraAndMic();
    if (result.success && result.stream) {
      setIsActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = result.stream;
      }
      const label = result.stream.getVideoTracks()[0]?.label || 'Physical Camera Sensor';
      onCameraStateChange?.(true, label);
      // Refresh device list with permissions granted
      hardwareSensorService.enumeratePhysicalDevices().then(setDeviceList);
    } else {
      setErrorMsg(result.error || 'Failed to acquire camera/microphone stream');
    }
  };

  const handleStopRealHardware = () => {
    hardwareSensorService.stopHardwareMonitoring();
    setIsActive(false);
    setFrameStats(null);
    setAudioStats(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    onCameraStateChange?.(false, 'Integrated Webcam');
  };

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-cyan-400" />
            Live Physical Hardware Sensor Telemetry
          </h3>
          <p className="text-xs text-slate-400">
            Real-time DirectShow / Media Foundation hardware stream analyzer with frame diff & audio decibel monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isActive ? (
            <button
              onClick={handleStartRealHardware}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Attach Physical Camera & Mic</span>
            </button>
          ) : (
            <button
              onClick={handleStopRealHardware}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span>Detach Physical Hardware</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Stream Monitor + Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Video Feed Preview with Privacy Shutter / Blur */}
        <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between relative overflow-hidden aspect-video">
          {isActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover rounded transition-all duration-300 ${
                  privacyBlur ? 'blur-md opacity-40 scale-105' : 'blur-none opacity-90'
                }`}
              />
              {/* Overlay controls */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-sm p-1 rounded-md border border-slate-800">
                <button
                  onClick={() => setPrivacyBlur(!privacyBlur)}
                  className="p-1 rounded text-slate-300 hover:text-white transition-colors"
                  title={privacyBlur ? 'Unblur preview' : 'Apply privacy blur'}
                >
                  {privacyBlur ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-emerald-400 border border-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>HARDWARE ACTIVE · {frameStats?.streamResolution || '720p'}</span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-500">
              <CameraOff className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-xs font-medium">Physical Camera Detached</span>
              <span className="text-[11px] text-slate-600 mt-1 max-w-xs">
                Click &quot;Attach Physical Camera &amp; Mic&quot; to test your actual laptop hardware in real time.
              </span>
            </div>
          )}
        </div>

        {/* Center: Live Frame Analysis Engine */}
        <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 space-y-3 text-xs font-mono">
          <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
            Frame Capture Metrics
          </span>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
              <span className="text-slate-400">Stream Rate:</span>
              <span className="text-cyan-300 font-bold tabular-nums">
                {isActive ? `${frameStats?.fps || 30} FPS` : '0 FPS'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
              <span className="text-slate-400">Frame Variance / Diff:</span>
              <span
                className={`font-bold tabular-nums ${
                  frameStats?.motionDetected ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {isActive ? `${frameStats?.frameDifferenceScore || 0} pts` : '0 pts'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
              <span className="text-slate-400">Luminance (ISO):</span>
              <span className="text-slate-200 tabular-nums">
                {isActive ? `${frameStats?.luminance || 0} / 255` : '0'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
              <span className="text-slate-400">Audio Spectrum:</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      (audioStats?.decibels || 0) > 30 ? 'bg-rose-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(100, (audioStats?.decibels || 0) * 1.5)}%` }}
                  />
                </div>
                <span className="text-slate-300 text-[10px]">
                  {isActive ? `${audioStats?.decibels || 0} dB` : 'Muted'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Enumerated Physical Endpoints */}
        <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider font-mono">
              Enumerated Devices ({deviceList.length})
            </span>
            <button
              onClick={() => hardwareSensorService.enumeratePhysicalDevices().then(setDeviceList)}
              className="text-slate-500 hover:text-slate-300"
              title="Rescan hardware"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {deviceList.length === 0 ? (
              <span className="text-slate-600 italic block py-2">
                No physical devices enumerated yet.
              </span>
            ) : (
              deviceList.map((dev, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="text-white block truncate">
                      {dev.label || `${dev.kind} (Hardware Endpoint ${idx + 1})`}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      Kind: {dev.kind}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                    AVAILABLE
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
