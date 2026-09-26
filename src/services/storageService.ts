/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NormalizedEvent, CorrelatedActivityChain, IncidentAlert, CollectorHealth } from '../types';

export const SQLITE_SCHEMA_DDL = `
-- ==========================================================
-- VigilanceEye Windows Endpoint Security & Privacy Database
-- Module 6 - SQLite Evidence Storage Schema
-- ==========================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS endpoints (
    endpoint_id TEXT PRIMARY KEY,
    hostname TEXT NOT NULL,
    os_build TEXT NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS normalized_events (
    event_id TEXT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    event_type TEXT CHECK(event_type IN ('CAMERA','PROCESS','NETWORK','FILE','SYSTEM')),
    source TEXT NOT NULL,
    process_id INTEGER NOT NULL,
    process_name TEXT NOT NULL,
    user_session TEXT NOT NULL,
    device TEXT,
    evidence_summary TEXT NOT NULL,
    raw_payload_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS camera_events (
    event_id TEXT PRIMARY KEY,
    camera_device_name TEXT NOT NULL,
    driver_source TEXT NOT NULL,
    capture_state TEXT NOT NULL,
    resolution TEXT,
    fps INTEGER,
    FOREIGN KEY(event_id) REFERENCES normalized_events(event_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS network_events (
    event_id TEXT PRIMARY KEY,
    protocol TEXT NOT NULL,
    local_ip TEXT NOT NULL,
    local_port INTEGER NOT NULL,
    remote_ip TEXT NOT NULL,
    remote_port INTEGER NOT NULL,
    state TEXT NOT NULL,
    classification TEXT NOT NULL,
    peer_device_hint TEXT,
    FOREIGN KEY(event_id) REFERENCES normalized_events(event_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS file_events (
    event_id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_extension TEXT,
    is_sensitive_dir BOOLEAN,
    sha256_hash TEXT,
    FOREIGN KEY(event_id) REFERENCES normalized_events(event_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS correlated_chains (
    chain_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    last_updated DATETIME NOT NULL,
    primary_pid INTEGER NOT NULL,
    primary_process_name TEXT NOT NULL,
    remote_ip TEXT,
    remote_port INTEGER,
    camera_device TEXT,
    evidence_strength TEXT CHECK(evidence_strength IN ('DIRECT','STRONG','MODERATE','WEAK','UNKNOWN')),
    interpretation TEXT NOT NULL,
    risk_level TEXT CHECK(risk_level IN ('INFO','LOW','MEDIUM','HIGH','CRITICAL')),
    mitre_attack_json TEXT,
    limitations_json TEXT
);

CREATE TABLE IF NOT EXISTS alerts (
    alert_id TEXT PRIMARY KEY,
    chain_id TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    warning_message TEXT NOT NULL,
    remote_device_info TEXT NOT NULL,
    remote_ip TEXT NOT NULL,
    affected_resource TEXT NOT NULL,
    process_name TEXT NOT NULL,
    process_id INTEGER NOT NULL,
    evidence_strength TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT 0,
    remediation_taken TEXT,
    FOREIGN KEY(chain_id) REFERENCES correlated_chains(chain_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS collector_health (
    collector_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subsystem TEXT NOT NULL,
    status TEXT NOT NULL,
    events_collected_count INTEGER DEFAULT 0,
    last_poll_ms INTEGER,
    error_message TEXT,
    notes TEXT
);

-- Indices for rapid correlation queries
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON normalized_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_pid ON normalized_events(process_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON normalized_events(event_type);
CREATE INDEX IF NOT EXISTS idx_network_remote_ip ON network_events(remote_ip);
`;

const STORAGE_KEYS = {
  EVENTS: 'vigilance_events_v1',
  CHAINS: 'vigilance_chains_v1',
  ALERTS: 'vigilance_alerts_v1',
  COLLECTORS: 'vigilance_collectors_v1',
  SETTINGS: 'vigilance_settings_v1',
};

export const storageService = {
  loadEvents: (): NormalizedEvent[] | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveEvents: (events: NormalizedEvent[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.warn('Storage quota exceeded, preserving memory', e);
    }
  },

  loadChains: (): CorrelatedActivityChain[] | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAINS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveChains: (chains: CorrelatedActivityChain[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAINS, JSON.stringify(chains));
    } catch (e) {
      console.warn(e);
    }
  },

  loadAlerts: (): IncidentAlert[] | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveAlerts: (alerts: IncidentAlert[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.warn(e);
    }
  },

  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },

  exportDatabaseDump: (
    events: NormalizedEvent[],
    chains: CorrelatedActivityChain[],
    alerts: IncidentAlert[]
  ): string => {
    let sql = SQLITE_SCHEMA_DDL + '\n\n-- SEED DATA EXPORT --\n';

    events.forEach((ev) => {
      const escapedPayload = JSON.stringify(ev.raw_payload).replace(/'/g, "''");
      const escapedSummary = ev.evidence_summary.replace(/'/g, "''");
      sql += `INSERT INTO normalized_events (event_id, timestamp, event_type, source, process_id, process_name, user_session, device, evidence_summary, raw_payload_json) VALUES ('${ev.event_id}', '${ev.timestamp}', '${ev.event_type}', '${ev.source}', ${ev.process_id}, '${ev.process_name}', '${ev.user_session}', '${ev.device || 'N/A'}', '${escapedSummary}', '${escapedPayload}');\n`;
    });

    chains.forEach((ch) => {
      const mitre = JSON.stringify(ch.mitre_attack).replace(/'/g, "''");
      const limits = JSON.stringify(ch.limitations).replace(/'/g, "''");
      sql += `INSERT INTO correlated_chains (chain_id, title, start_time, last_updated, primary_pid, primary_process_name, remote_ip, remote_port, camera_device, evidence_strength, interpretation, risk_level, mitre_attack_json, limitations_json) VALUES ('${ch.chain_id}', '${ch.title.replace(/'/g, "''")}', '${ch.start_time}', '${ch.last_updated}', ${ch.primary_process.pid}, '${ch.primary_process.name}', '${ch.remote_peer?.ip || ''}', ${ch.remote_peer?.port || 0}, '${ch.camera_accessed?.device_name || ''}', '${ch.evidence_strength}', '${ch.interpretation.replace(/'/g, "''")}', '${ch.risk_level}', '${mitre}', '${limits}');\n`;
    });

    alerts.forEach((al) => {
      sql += `INSERT INTO alerts (alert_id, chain_id, timestamp, severity, title, warning_message, remote_device_info, remote_ip, affected_resource, process_name, process_id, evidence_strength, is_acknowledged, remediation_taken) VALUES ('${al.alert_id}', '${al.chain_id}', '${al.timestamp}', '${al.severity}', '${al.title.replace(/'/g, "''")}', '${al.warning_message.replace(/'/g, "''")}', '${al.remote_device_info.replace(/'/g, "''")}', '${al.remote_ip}', '${al.affected_resource}', '${al.process_name}', ${al.process_id}, '${al.evidence_strength}', ${al.is_acknowledged ? 1 : 0}, '${al.remediation_taken || 'NONE'}');\n`;
    });

    return sql;
  },
};
