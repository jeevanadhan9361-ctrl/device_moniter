/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Clock,
  GitFork,
  AlertOctagon,
  Camera,
  Cpu,
  Network,
  Activity,
  Settings,
  BookOpen,
  Shield,
} from 'lucide-react';
import { IncidentAlert } from '../../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  alerts: IncidentAlert[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  alerts,
}) => {
  const unacknowledgedCount = alerts.filter((a) => !a.is_acknowledged).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'correlation',
      label: 'Activity Correlation',
      icon: GitFork,
      badge: unacknowledgedCount > 0 ? `${unacknowledgedCount}` : undefined,
      badgeColor: 'bg-rose-600 text-white',
    },
    { id: 'events', label: 'Events / Timeline', icon: Clock },
    {
      id: 'incidents',
      label: 'Incident Details',
      icon: AlertOctagon,
      badge: unacknowledgedCount > 0 ? 'ALERT' : undefined,
      badgeColor: 'bg-rose-950 text-rose-300 border border-rose-700',
    },
    { id: 'devices', label: 'Devices & Sensors', icon: Camera },
    { id: 'sigma', label: 'Sigma Rules', icon: Shield },
    { id: 'processes', label: 'Processes', icon: Cpu },
    { id: 'network', label: 'Network Sockets', icon: Network },
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About & Native Code', icon: BookOpen },
  ];

  return (
    <aside className="w-60 bg-slate-950/80 border-r border-slate-800 flex flex-col shrink-0 select-none py-3">
      <div className="px-4 mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
          Windows Endpoint Console
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800/90 text-white border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collector Status Badge at Bottom */}
      <div className="px-4 pt-3 border-t border-slate-900 mt-auto">
        <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Collectors:</span>
            <span className="text-emerald-400 font-mono font-semibold">6 / 6 ONLINE</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-full rounded-full" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
            <span>DirectShow · MFT · ETW</span>
            <span>Local-First</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
