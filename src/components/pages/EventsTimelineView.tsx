/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Camera,
  Cpu,
  Network,
  FileText,
  Shield,
  ChevronDown,
  ChevronRight,
  Code,
} from 'lucide-react';
import { NormalizedEvent, EventType } from '../../types';

interface EventsTimelineViewProps {
  events: NormalizedEvent[];
}

export const EventsTimelineView: React.FC<EventsTimelineViewProps> = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'ALL'>('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const filteredEvents = events.filter((ev) => {
    if (selectedType !== 'ALL' && ev.event_type !== selectedType) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      ev.process_name.toLowerCase().includes(term) ||
      ev.event_id.toLowerCase().includes(term) ||
      ev.source.toLowerCase().includes(term) ||
      ev.evidence_summary.toLowerCase().includes(term) ||
      ev.process_id.toString().includes(term)
    );
  });

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'CAMERA':
        return <Camera className="w-4 h-4 text-rose-400" />;
      case 'PROCESS':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'NETWORK':
        return <Network className="w-4 h-4 text-purple-400" />;
      case 'FILE':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'SYSTEM':
        return <Shield className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Normalized Events Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Module 2: Standardized common event model across DirectShow, Media Foundation, ETW, and USN Journal
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search process, PID, IP, event..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52 sm:w-64"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            {(['ALL', 'CAMERA', 'NETWORK', 'FILE', 'PROCESS', 'SYSTEM'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Table Container */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Collector Source</th>
                <th className="py-3 px-4">Process / PID</th>
                <th className="py-3 px-4">User Session</th>
                <th className="py-3 px-4">Evidence Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No matching endpoint events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                  const isExpanded = expandedEventId === ev.event_id;
                  return (
                    <React.Fragment key={ev.event_id}>
                      <tr
                        onClick={() =>
                          setExpandedEventId(isExpanded ? null : ev.event_id)
                        }
                        className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                          isExpanded ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-slate-500">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap tabular-nums">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            {getEventIcon(ev.event_type)}
                            <span className="font-semibold text-white font-mono text-[11px]">
                              {ev.event_type}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                          {ev.source}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono">
                          <span className="text-white font-semibold">{ev.process_name}</span>
                          <span className="text-slate-500 ml-1.5">({ev.process_id})</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                          {ev.user_session}
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-md truncate">
                          {ev.evidence_summary}
                        </td>
                      </tr>

                      {/* Expandable JSON Payload Inspector */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90">
                          <td colSpan={7} className="p-4 border-y border-slate-800">
                            <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-2">
                              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                                  <Code className="w-4 h-4" />
                                  Raw Event Payload ({ev.event_id})
                                </span>
                                <span>Collector: {ev.source}</span>
                              </div>
                              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded border border-slate-800/80 leading-relaxed">
                                {JSON.stringify(
                                  {
                                    event_id: ev.event_id,
                                    timestamp: ev.timestamp,
                                    event_type: ev.event_type,
                                    source: ev.source,
                                    process_id: ev.process_id,
                                    process_name: ev.process_name,
                                    user_session: ev.user_session,
                                    device: ev.device,
                                    evidence_summary: ev.evidence_summary,
                                    ...ev.raw_payload,
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
