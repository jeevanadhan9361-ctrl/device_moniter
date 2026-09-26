/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Network, Radio, Smartphone, Globe, Shield, ArrowUpRight } from 'lucide-react';
import { NormalizedEvent } from '../../types';

interface NetworkViewProps {
  events: NormalizedEvent[];
}

export const NetworkView: React.FC<NetworkViewProps> = ({ events }) => {
  const netEvents = events.filter((e) => e.event_type === 'NETWORK');

  const remotePeers = netEvents.filter(
    (n) => (n as { classification?: string }).classification === 'LAN' && (n as { remote_ip?: string }).remote_ip !== '192.168.1.1'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          Network Sockets & Remote Mobile Peers
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Module 1 & 3: WFP / ETW Network telemetry, LAN vs Internet peer classification, and socket-to-process correlation
        </p>
      </div>

      {/* Remote Phone Peers Showcase */}
      {remotePeers.length > 0 && (
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-rose-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-rose-400" />
              Connected Remote LAN Devices (Phones / Tablets)
            </h3>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
              ACTIVE MONITORING SESSIONS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {remotePeers.map((p, idx) => {
              const netPayload = p as {
                remote_ip: string;
                remote_port: number;
                peer_device_hint?: string;
                bytes_transferred?: number;
                state: string;
              };
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-950 border border-rose-900/60 flex items-start justify-between gap-2"
                >
                  <div className="space-y-1">
                    <span className="font-semibold text-white block">
                      {netPayload.peer_device_hint || 'Remote LAN Peer'}
                    </span>
                    <span className="text-cyan-300 font-mono text-[11px] block">
                      Socket: {netPayload.remote_ip}:{netPayload.remote_port}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px] block">
                      Bound to: {p.process_name} (PID {p.process_id})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold uppercase shrink-0">
                    {netPayload.state}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sockets Table */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Protocol</th>
                <th className="py-3 px-4">Local Socket</th>
                <th className="py-3 px-4">Remote Socket</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Process / PID</th>
                <th className="py-3 px-4">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {netEvents.map((ev) => {
                const net = ev as {
                  protocol: string;
                  local_ip: string;
                  local_port: number;
                  remote_ip: string;
                  remote_port: number;
                  classification: string;
                  state: string;
                };
                const isLAN = net.classification === 'LAN';
                return (
                  <tr key={ev.event_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {net.protocol || 'TCP'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {net.local_ip}:{net.local_port}
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-semibold">
                      {net.remote_ip}:{net.remote_port}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${
                          isLAN
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {net.classification}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">
                      {ev.process_name} ({ev.process_id})
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">
                      {net.state || 'ESTABLISHED'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
