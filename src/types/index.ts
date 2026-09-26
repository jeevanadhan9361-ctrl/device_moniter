/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EventType = 'CAMERA' | 'PROCESS' | 'NETWORK' | 'FILE' | 'SYSTEM';

export type EvidenceStrength = 'DIRECT' | 'STRONG' | 'MODERATE' | 'WEAK' | 'UNKNOWN';

export type SeverityLevel = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CollectorStatus = 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'STOPPED';

export type NetworkClassification = 'LAN' | 'INTERNET' | 'LOOPBACK';

export interface BaseEvent {
  event_id: string;
  timestamp: string; // ISO 8601
  event_type: EventType;
  source: string; // e.g. "DirectShow_COM", "MediaFoundation", "ETW_Net", "USN_Journal"
  process_id: number;
  process_name: string;
  user_session: string;
  device?: string;
  evidence_summary: string;
  raw_payload: Record<string, unknown>;
}

export interface CameraEvent extends BaseEvent {
  event_type: 'CAMERA';
  camera_device_name: string;
  driver_source: 'DirectShow' | 'MediaFoundation' | 'WindowsCapabilityRegistry';
  capture_state: 'AVAILABLE' | 'OPENED' | 'CAPTURING' | 'CLOSED';
  fps?: number;
  resolution?: string;
}

export interface ProcessEvent extends BaseEvent {
  event_type: 'PROCESS';
  action: 'START' | 'STOP' | 'INJECTION' | 'HANDLE_OPEN';
  executable_path: string;
  parent_process_name: string;
  parent_process_id: number;
  command_line: string;
  signature_status: 'VERIFIED' | 'SELF_SIGNED' | 'UNSIGNED' | 'UNKNOWN';
  publisher: string;
  service_name?: string;
}

export interface NetworkEvent extends BaseEvent {
  event_type: 'NETWORK';
  protocol: 'TCP' | 'UDP';
  local_ip: string;
  local_port: number;
  remote_ip: string;
  remote_port: number;
  state: 'ESTABLISHED' | 'LISTENING' | 'TIME_WAIT' | 'CLOSE_WAIT';
  classification: NetworkClassification;
  peer_device_hint?: string; // e.g. "Samsung Galaxy S23 (Monect App)"
  bytes_transferred?: number;
}

export interface FileEvent extends BaseEvent {
  event_type: 'FILE';
  action: 'CREATE' | 'MODIFY' | 'DELETE' | 'RENAME' | 'READ';
  file_path: string;
  file_extension: string;
  is_sensitive_dir: boolean;
  sha256_hash?: string;
}

export interface SystemEvent extends BaseEvent {
  event_type: 'SYSTEM';
  event_code: number; // e.g. 4688, 5156, 4624
  channel: 'Security' | 'System' | 'Application';
  description: string;
}

export type NormalizedEvent =
  | CameraEvent
  | ProcessEvent
  | NetworkEvent
  | FileEvent
  | SystemEvent;

export interface CorrelatedActivityChain {
  chain_id: string;
  title: string;
  start_time: string;
  last_updated: string;
  primary_process: {
    pid: number;
    name: string;
    path: string;
    signature: string;
  };
  remote_peer?: {
    ip: string;
    port: number;
    device_name?: string;
    classification: NetworkClassification;
  };
  camera_accessed?: {
    device_name: string;
    method: string;
    is_actively_streaming: boolean;
  };
  files_tampered?: Array<{
    path: string;
    action: string;
    timestamp: string;
  }>;
  related_event_ids: string[];
  anomalies_detected: string[];
  evidence_strength: EvidenceStrength;
  interpretation: string;
  risk_level: SeverityLevel;
  mitre_attack: Array<{
    id: string;
    tactic: string;
    technique: string;
  }>;
  limitations: string[];
}

export interface IncidentAlert {
  alert_id: string;
  chain_id: string;
  timestamp: string;
  severity: SeverityLevel;
  title: string;
  warning_message: string;
  remote_device_info: string;
  remote_ip: string;
  affected_resource: 'CAMERA' | 'FILES' | 'CAMERA_AND_FILES' | 'SYSTEM';
  process_name: string;
  process_id: number;
  evidence_strength: EvidenceStrength;
  is_acknowledged: boolean;
  remediation_taken?: 'BLOCKED_IP' | 'TERMINATED_PROCESS' | 'TRUSTED' | 'DISMISSED';
}

export interface CollectorHealth {
  collector_id: string;
  name: string;
  subsystem: string;
  status: CollectorStatus;
  events_collected_count: number;
  last_poll_ms: number;
  error_message?: string;
  notes: string;
}

export interface EndpointDeviceHardware {
  device_id: string;
  name: string;
  type: 'WEBCAM' | 'MICROPHONE' | 'NETWORK_INTERFACE';
  hardware_id: string;
  driver_version: string;
  current_state: 'IDLE' | 'ACTIVE_STREAMING' | 'LOCKED' | 'DISABLED';
  associated_pid?: number;
  associated_process?: string;
}
