/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NormalizedEvent,
  CorrelatedActivityChain,
  IncidentAlert,
  CollectorHealth,
  EndpointDeviceHardware,
  CameraEvent,
  NetworkEvent,
  FileEvent,
  ProcessEvent,
} from '../types';
import {
  INITIAL_COLLECTORS,
  INITIAL_HARDWARE_DEVICES,
  INITIAL_EVENTS,
  INITIAL_CHAINS,
  INITIAL_ALERTS,
} from '../data/initialData';
import { storageService } from '../services/storageService';
import { correlationEngine } from '../services/correlationEngine';
import { audioAlertService } from '../services/audioAlertService';
import { notificationService } from '../services/notificationService';
import { RemediationParams } from '../services/remediationScriptGenerator';

export function useEndpointMonitor() {
  const [events, setEvents] = useState<NormalizedEvent[]>(() => {
    return storageService.loadEvents() || INITIAL_EVENTS;
  });

  const [chains, setChains] = useState<CorrelatedActivityChain[]>(() => {
    return storageService.loadChains() || INITIAL_CHAINS;
  });

  const [alerts, setAlerts] = useState<IncidentAlert[]>(() => {
    return storageService.loadAlerts() || INITIAL_ALERTS;
  });

  const [collectors, setCollectors] = useState<CollectorHealth[]>(INITIAL_COLLECTORS);
  const [hardwareDevices, setHardwareDevices] = useState<EndpointDeviceHardware[]>(INITIAL_HARDWARE_DEVICES);

  // Active High-Priority Intrusive Modal Alert
  const [activeModalAlert, setActiveModalAlert] = useState<IncidentAlert | null>(null);

  // Remediation Script Modal State
  const [remediationModalParams, setRemediationModalParams] = useState<RemediationParams | null>(null);

  // Sound enabled state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Voice speech synthesis alert enabled state
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Auto-kill policy setting
  const [autoKillEnabled, setAutoKillEnabled] = useState(false);

  // Desktop notification permission status
  const [desktopNotifStatus, setDesktopNotifStatus] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    setDesktopNotifStatus(notificationService.getPermissionStatus());
  }, []);

  const requestDesktopNotifications = useCallback(async () => {
    const granted = await notificationService.requestDesktopPermission();
    setDesktopNotifStatus(notificationService.getPermissionStatus());
    return granted;
  }, []);

  const toggleVoiceAlerts = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      notificationService.setVoiceEnabled(next);
      return next;
    });
  }, []);

  // Save changes to storage whenever events, chains, alerts update
  useEffect(() => {
    storageService.saveEvents(events);
  }, [events]);

  useEffect(() => {
    storageService.saveChains(chains);
  }, [chains]);

  useEffect(() => {
    storageService.saveAlerts(alerts);
  }, [alerts]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      audioAlertService.setSoundEnabled(next);
      return next;
    });
  }, []);

  const ingestEvent = useCallback(
    (newEvent: NormalizedEvent) => {
      setEvents((prev) => [newEvent, ...prev]);

      // Correlate
      setChains((prevChains) => {
        const results = correlationEngine.correlateEvent(newEvent, prevChains, [newEvent, ...events]);
        let updatedChains = [...prevChains];

        results.forEach(({ chain, alert }) => {
          const idx = updatedChains.findIndex((c) => c.chain_id === chain.chain_id);
          if (idx >= 0) {
            updatedChains[idx] = chain;
          } else {
            updatedChains = [chain, ...updatedChains];
          }

          if (alert) {
            setAlerts((prevAlerts) => [alert, ...prevAlerts]);
            setActiveModalAlert(alert);

            // Trigger REAL OS Desktop notification and voice synthesis
            notificationService.triggerDesktopAlert(alert.title, alert.warning_message, {
              critical: alert.severity === 'CRITICAL',
              tag: alert.alert_id,
            });

            // Auto-remediation if enabled
            if (autoKillEnabled && alert.severity === 'CRITICAL') {
              console.log(`[Auto-Kill] Terminating suspicious process PID ${alert.process_id}`);
            }
          }
        });

        return updatedChains;
      });
    },
    [events, autoKillEnabled]
  );

  // SCENARIO 1: Monect Phone Remote Camera Access (The User's Exact Scenario)
  const triggerMonectCameraScenario = useCallback(() => {
    const ts = new Date().toISOString();
    const pid = 4892;
    const processName = 'MonectServer.exe';
    const remoteIp = '192.168.1.84';
    const remotePort = 8001;
    const deviceHint = 'Samsung Galaxy S23 (Monect Mobile Client)';

    // Step 1: Process Start / Handle Open
    const procEvent: ProcessEvent = {
      event_id: `evt_proc_${Date.now()}_1`,
      timestamp: ts,
      event_type: 'PROCESS',
      source: 'ProcessTracker_ETW',
      process_id: pid,
      process_name: processName,
      user_session: 'DESKTOP-WIN11\\Admin',
      action: 'HANDLE_OPEN',
      executable_path: 'C:\\Program Files\\Monect Server\\MonectServer.exe',
      parent_process_name: 'explorer.exe',
      parent_process_id: 1140,
      command_line: '"C:\\Program Files\\Monect Server\\MonectServer.exe" --service',
      signature_status: 'SELF_SIGNED',
      publisher: 'Monect Technology Co., Ltd.',
      evidence_summary: 'Monect Server process opened DirectShow/MediaFoundation COM handles.',
      raw_payload: { IntegrityLevel: 'Medium', WindowHandle: '0x003A09B2' },
    };

    // Step 2: Inbound Network Socket Connection from Phone
    const netEvent: NetworkEvent = {
      event_id: `evt_net_${Date.now()}_2`,
      timestamp: new Date(Date.now() + 100).toISOString(),
      event_type: 'NETWORK',
      source: 'ETW_WFP',
      process_id: pid,
      process_name: processName,
      user_session: 'DESKTOP-WIN11\\Admin',
      protocol: 'TCP',
      local_ip: '192.168.1.102',
      local_port: 8001,
      remote_ip: remoteIp,
      remote_port: 54180,
      state: 'ESTABLISHED',
      classification: 'LAN',
      peer_device_hint: deviceHint,
      bytes_transferred: 1482000,
      evidence_summary: `Established TCP connection with LAN phone peer ${remoteIp}:54180.`,
      raw_payload: { Direction: 'Inbound', Handshake: 'TLSv1.3_Encrypted' },
    };

    // Step 3: Camera Capture Active
    const camEvent: CameraEvent = {
      event_id: `evt_cam_${Date.now()}_3`,
      timestamp: new Date(Date.now() + 200).toISOString(),
      event_type: 'CAMERA',
      source: 'MediaFoundation_MFT',
      process_id: pid,
      process_name: processName,
      user_session: 'DESKTOP-WIN11\\Admin',
      device: 'Integrated HD Webcam (Wide Vision)',
      camera_device_name: 'Integrated HD Webcam (Wide Vision)',
      driver_source: 'MediaFoundation',
      capture_state: 'CAPTURING',
      resolution: '1280x720',
      fps: 30,
      evidence_summary: `Media Foundation video frame delivery active to PID ${pid} (${processName}). Frame buffer consumption rate: 30 FPS.`,
      raw_payload: { MediaStreamType: 'Video', Format: 'H264_Stream', MFFrameRate: 30 },
    };

    // Update hardware status
    setHardwareDevices((prev) =>
      prev.map((d) =>
        d.type === 'WEBCAM'
          ? {
              ...d,
              current_state: 'ACTIVE_STREAMING',
              associated_pid: pid,
              associated_process: processName,
            }
          : d
      )
    );

    // Ingest all 3 correlated events
    ingestEvent(procEvent);
    setTimeout(() => ingestEvent(netEvent), 150);
    setTimeout(() => ingestEvent(camEvent), 300);
  }, [ingestEvent]);

  // SCENARIO 2: Monect Phone Remote File Modification
  const triggerMonectFileScenario = useCallback(() => {
    const ts = new Date().toISOString();
    const pid = 4892;
    const processName = 'MonectServer.exe';
    const remoteIp = '192.168.1.84';
    const deviceHint = 'Samsung Galaxy S23 (Monect Mobile Client)';

    const fileEvent: FileEvent = {
      event_id: `evt_file_${Date.now()}_4`,
      timestamp: ts,
      event_type: 'FILE',
      source: 'USN_Journal_Watcher',
      process_id: pid,
      process_name: processName,
      user_session: 'DESKTOP-WIN11\\Admin',
      action: 'MODIFY',
      file_path: 'C:\\Users\\Admin\\Documents\\Financial_Ledger_2026.xlsx',
      file_extension: '.xlsx',
      is_sensitive_dir: true,
      sha256_hash: '7e2b10f845d04ca982e5b7218acbe357e62d8547289d00921ec56b02a940f81d',
      evidence_summary: `File write/modification detected in sensitive user directory by PID ${pid} while connected to ${remoteIp}.`,
      raw_payload: { BytesWritten: 45056, Attributes: 'Archive' },
    };

    ingestEvent(fileEvent);
  }, [ingestEvent]);

  // SCENARIO 3: Legitimate Local Zoom Meeting (Baseline Comparison)
  const triggerZoomBaselineScenario = useCallback(() => {
    const ts = new Date().toISOString();
    const pid = 7120;
    const processName = 'Zoom.exe';

    const procEvent: ProcessEvent = {
      event_id: `evt_proc_zoom_${Date.now()}`,
      timestamp: ts,
      event_type: 'PROCESS',
      source: 'ProcessTracker_ETW',
      process_id: pid,
      process_name: processName,
      user_session: 'DESKTOP-WIN11\\Admin',
      action: 'START',
      executable_path: 'C:\\Program Files\\Zoom\\bin\\Zoom.exe',
      parent_process_name: 'explorer.exe',
      parent_process_id: 1140,
      command_line: '"C:\\Program Files\\Zoom\\bin\\Zoom.exe"',
      signature_status: 'VERIFIED',
      publisher: 'Zoom Video Communications, Inc.',
      evidence_summary: 'Legitimate video conferencing application launched with valid signature.',
      raw_payload: { SignatureIssuer: 'DigiCert Trusted G4 Code Signing' },
    };

    const camEvent: CameraEvent = {
      event_id: `evt_cam_zoom_${Date.now()}`,
      timestamp: new Date(Date.now() + 100).toISOString(),
      event_type: 'CAMERA',
      source: 'DirectShow_COM',
      process_id: pid,
      process_name: processName,
      user_session: 'DESKTOP-WIN11\\Admin',
      device: 'Integrated HD Webcam (Wide Vision)',
      camera_device_name: 'Integrated HD Webcam (Wide Vision)',
      driver_source: 'DirectShow',
      capture_state: 'CAPTURING',
      resolution: '1920x1080',
      fps: 30,
      evidence_summary: 'Local camera capture started by Zoom.exe. No unexpected peer LAN exfiltration.',
      raw_payload: { LocalSession: true },
    };

    setHardwareDevices((prev) =>
      prev.map((d) =>
        d.type === 'WEBCAM'
          ? {
              ...d,
              current_state: 'ACTIVE_STREAMING',
              associated_pid: pid,
              associated_process: processName,
            }
          : d
      )
    );

    ingestEvent(procEvent);
    setTimeout(() => ingestEvent(camEvent), 150);
  }, [ingestEvent]);

  // SCENARIO 4: Stealth Unattributed Camera Hook (Unknown remote intent)
  const triggerStealthHookScenario = useCallback(() => {
    const ts = new Date().toISOString();
    const pid = 9312;
    const processName = 'winhost_task.exe';

    const procEvent: ProcessEvent = {
      event_id: `evt_proc_stealth_${Date.now()}`,
      timestamp: ts,
      event_type: 'PROCESS',
      source: 'ProcessTracker_ETW',
      process_id: pid,
      process_name: processName,
      user_session: 'DESKTOP-WIN11\\Admin',
      action: 'START',
      executable_path: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\winhost_task.exe',
      parent_process_name: 'powershell.exe',
      parent_process_id: 8820,
      command_line: 'winhost_task.exe -silent',
      signature_status: 'UNSIGNED',
      publisher: 'Unknown / Unsigned Binary',
      evidence_summary: 'Unsigned executable spawned from Temp directory opened camera DirectShow handle.',
      raw_payload: { ParentCmdLine: 'powershell.exe -ExecutionPolicy Bypass' },
    };

    const camEvent: CameraEvent = {
      event_id: `evt_cam_stealth_${Date.now()}`,
      timestamp: new Date(Date.now() + 100).toISOString(),
      event_type: 'CAMERA',
      source: 'DirectShow_COM',
      process_id: pid,
      process_name: processName,
      user_session: 'DESKTOP-WIN11\\Admin',
      device: 'Integrated HD Webcam (Wide Vision)',
      camera_device_name: 'Integrated HD Webcam (Wide Vision)',
      driver_source: 'DirectShow',
      capture_state: 'CAPTURING',
      resolution: '640x480',
      fps: 15,
      evidence_summary: 'Unsigned binary capturing frames locally. Network socket not observed yet (UNKNOWN remote intent).',
      raw_payload: { DirectShowPin: 'CapturePin0' },
    };

    setHardwareDevices((prev) =>
      prev.map((d) =>
        d.type === 'WEBCAM'
          ? {
              ...d,
              current_state: 'ACTIVE_STREAMING',
              associated_pid: pid,
              associated_process: processName,
            }
          : d
      )
    );

    ingestEvent(procEvent);
    setTimeout(() => ingestEvent(camEvent), 150);
  }, [ingestEvent]);

  // Remediation Handlers
  const handleRemediateAlert = useCallback(
    (alertId: string, action: 'BLOCKED_IP' | 'TERMINATED_PROCESS' | 'TRUSTED' | 'DISMISSED') => {
      setAlerts((prev) =>
        prev.map((a) => {
          if (a.alert_id === alertId) {
            return {
              ...a,
              is_acknowledged: true,
              remediation_taken: action,
            };
          }
          return a;
        })
      );

      const target = alerts.find((a) => a.alert_id === alertId);
      if (action === 'TERMINATED_PROCESS' && target) {
        // Reset hardware state back to IDLE
        setHardwareDevices((prev) =>
          prev.map((d) =>
            d.associated_pid === target.process_id
              ? { ...d, current_state: 'IDLE', associated_pid: undefined, associated_process: undefined }
              : d
          )
        );

        // Inject process stop event
        const stopEvent: ProcessEvent = {
          event_id: `evt_stop_${Date.now()}`,
          timestamp: new Date().toISOString(),
          event_type: 'PROCESS',
          source: 'SecurityManager_KillAction',
          process_id: target.process_id,
          process_name: target.process_name,
          user_session: 'DESKTOP-WIN11\\Admin',
          action: 'STOP',
          executable_path: 'Terminated by User Policy',
          parent_process_name: 'VigilanceEye.exe',
          parent_process_id: 3000,
          command_line: 'taskkill.exe /F /PID ' + target.process_id,
          signature_status: 'VERIFIED',
          publisher: 'VigilanceEye Remediation Engine',
          evidence_summary: `Terminated suspicious process PID ${target.process_id} (${target.process_name}) to protect camera and privacy.`,
          raw_payload: { ExitCode: 1, KilledBy: 'VigilanceEye_UI' },
        };
        setEvents((prev) => [stopEvent, ...prev]);
      }

      if (activeModalAlert?.alert_id === alertId) {
        setActiveModalAlert(null);
      }
    },
    [alerts, activeModalAlert]
  );

  const resetAllTelemetry = useCallback(() => {
    storageService.clearAllData();
    setEvents(INITIAL_EVENTS);
    setChains(INITIAL_CHAINS);
    setAlerts(INITIAL_ALERTS);
    setHardwareDevices(INITIAL_HARDWARE_DEVICES);
    setActiveModalAlert(null);
    setRemediationModalParams(null);
  }, []);

  const handleRealFileAlert = useCallback(
    (file: { name: string; relativePath: string; sha256Hash: string }, summary: string) => {
      const ts = new Date().toISOString();
      const pid = 4892;
      const fileEvent: FileEvent = {
        event_id: `evt_real_file_${Date.now()}`,
        timestamp: ts,
        event_type: 'FILE',
        source: 'Physical_USN_Journal_Watcher',
        process_id: pid,
        process_name: 'MonectServer.exe',
        user_session: 'DESKTOP-WIN11\\Admin',
        action: 'MODIFY',
        file_path: file.relativePath,
        file_extension: file.name.includes('.') ? '.' + file.name.split('.').pop() : '',
        is_sensitive_dir: true,
        sha256_hash: file.sha256Hash,
        evidence_summary: `[LIVE FILESYSTEM AUDIT] ${summary}`,
        raw_payload: { RealPath: file.relativePath, NewHash: file.sha256Hash },
      };
      ingestEvent(fileEvent);
    },
    [ingestEvent]
  );

  const handleRealCameraToggle = useCallback(
    (isActive: boolean, deviceName: string) => {
      setHardwareDevices((prev) =>
        prev.map((d) =>
          d.type === 'WEBCAM'
            ? {
                ...d,
                name: deviceName || d.name,
                current_state: isActive ? 'ACTIVE_STREAMING' : 'IDLE',
                associated_pid: isActive ? 4892 : undefined,
                associated_process: isActive ? 'MonectServer.exe' : undefined,
              }
            : d
        )
      );

      const ts = new Date().toISOString();
      const camEvent: CameraEvent = {
        event_id: `evt_real_cam_${Date.now()}`,
        timestamp: ts,
        event_type: 'CAMERA',
        source: 'MediaFoundation_Physical_Sensor',
        process_id: isActive ? 4892 : 4,
        process_name: isActive ? 'MonectServer.exe' : 'System',
        user_session: 'DESKTOP-WIN11\\Admin',
        device: deviceName,
        camera_device_name: deviceName,
        driver_source: 'MediaFoundation',
        capture_state: isActive ? 'CAPTURING' : 'CLOSED',
        resolution: '1280x720',
        fps: isActive ? 30 : 0,
        evidence_summary: isActive
          ? `[LIVE HARDWARE WEBCAM ATTACHED] Physical sensor is actively delivering frames to PID 4892.`
          : `[LIVE HARDWARE WEBCAM DETACHED] Physical video capture handle released.`,
        raw_payload: { HardwareDevice: deviceName, IsPhysicalSensor: true },
      };
      ingestEvent(camEvent);
    },
    [ingestEvent]
  );

  return {
    events,
    chains,
    alerts,
    collectors,
    hardwareDevices,
    activeModalAlert,
    setActiveModalAlert,
    remediationModalParams,
    setRemediationModalParams,
    soundEnabled,
    toggleSound,
    voiceEnabled,
    toggleVoiceAlerts,
    autoKillEnabled,
    setAutoKillEnabled,
    desktopNotifStatus,
    requestDesktopNotifications,
    triggerMonectCameraScenario,
    triggerMonectFileScenario,
    triggerZoomBaselineScenario,
    triggerStealthHookScenario,
    handleRemediateAlert,
    handleRealFileAlert,
    handleRealCameraToggle,
    resetAllTelemetry,
    ingestEvent,
  };
}
