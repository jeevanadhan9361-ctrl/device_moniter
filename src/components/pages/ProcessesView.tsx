/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, Search, ShieldCheck, AlertTriangle, ShieldX, Ban } from 'lucide-react';
import { NormalizedEvent } from '../../types';

interface ProcessesViewProps {
  events: NormalizedEvent[];
  onTerminateProcess?: (pid: number, name: string) => void;
}

export const ProcessesView: React.FC<ProcessesViewProps> = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique active processes from events
  const processesMap = new Map<number, {
    pid: number;
    name: string;
    path: string;
    publisher: string;
    signature: string;
    commandLine: string;
    parentPid?: number;
    hasCamera: boolean;
    hasNetwork: boolean;
  }>();

  events.forEach((ev) => {
    if (!processesMap.has(ev.process_id)) {
      processesMap.set(ev.process_id, {
        pid: ev.process_id,
        name: ev.process_name,
        path: (ev as { executable_path?: string }).executable_path || 'C:\\Windows\\System32\\' + ev.process_name,
        publisher: (ev as { publisher?: string }).publisher || 'Windows System Binary',
        signature: (ev as { signature_status?: string }).signature_status || 'VERIFIED',
        commandLine: (ev as { command_line?: string }).command_line || ev.process_name,
        parentPid: (ev as { parent_process_id?: number }).parent_process_id,
        hasCamera: ev.event_type === 'CAMERA',
        hasNetwork: ev.event_type === 'NETWORK',
      });
    } else {
      const p = processesMap.get(ev.process_id)!;
      if (ev.event_type === 'CAMERA') p.hasCamera = true;
      if (ev.event_type === 'NETWORK') p.hasNetwork = true;
    }
  });

  const processes = Array.from(processesMap.values()).filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.pid.toString().includes(term) || p.publisher.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Endpoint Processes & Token Auditing
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Module 1 & 3: Process hierarchy, command lines, code signatures, and active device handle bindings
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search processes..."
            className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-60"
          />
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">PID</th>
                <th className="py-3 px-4">Process Name</th>
                <th className="py-3 px-4">Publisher & Signature</th>
                <th className="py-3 px-4">Device Attachments</th>
                <th className="py-3 px-4">Command Line</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {processes.map((p) => {
                const isUnsigned = p.signature === 'UNSIGNED';
                const isSelfSigned = p.signature === 'SELF_SIGNED';

                return (
                  <tr key={p.pid} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-cyan-400 font-bold whitespace-nowrap">
                      {p.pid}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold whitespace-nowrap">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isUnsigned ? (
                          <ShieldX className="w-3.5 h-3.5 text-rose-400" />
                        ) : isSelfSigned ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span
                          className={
                            isUnsigned
                              ? 'text-rose-400 font-bold'
                              : isSelfSigned
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }
                        >
                          {p.publisher} ({p.signature})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {p.hasCamera && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-bold">
                            CAMERA
                          </span>
                        )}
                        {p.hasNetwork && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-bold">
                            SOCKET
                          </span>
                        )}
                        {!p.hasCamera && !p.hasNetwork && (
                          <span className="text-slate-500">None</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-sm truncate">
                      {p.commandLine}
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
