/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FolderCheck,
  FolderPlus,
  FileCheck,
  AlertTriangle,
  RotateCw,
  FolderX,
  FileCode,
  ShieldAlert,
} from 'lucide-react';
import {
  realDirectoryWatcherService,
  WatchedFileRecord,
} from '../../services/realDirectoryWatcherService';

interface RealDirectoryWatcherPanelProps {
  onFileModifiedAlert?: (file: WatchedFileRecord, summary: string) => void;
}

export const RealDirectoryWatcherPanel: React.FC<RealDirectoryWatcherPanelProps> = ({
  onFileModifiedAlert,
}) => {
  const [isWatching, setIsWatching] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [files, setFiles] = useState<WatchedFileRecord[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastEventMsg, setLastEventMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = realDirectoryWatcherService.subscribe((type, file, summary) => {
      setLastEventMsg(`[${new Date().toLocaleTimeString()}] ${summary}`);
      setFiles(realDirectoryWatcherService.getWatchedFiles());

      if (type === 'FILE_MODIFIED') {
        onFileModifiedAlert?.(file, summary);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onFileModifiedAlert]);

  const handlePickDirectory = async () => {
    setErrorMsg(null);
    const result = await realDirectoryWatcherService.pickAndWatchDirectory();
    if (result.success) {
      setIsWatching(true);
      setFolderName(result.folderName || 'Selected Folder');
      setFiles(realDirectoryWatcherService.getWatchedFiles());
    } else {
      setErrorMsg(result.error || 'Failed to open directory');
    }
  };

  const handleStopWatching = () => {
    realDirectoryWatcherService.stopWatching();
    setIsWatching(false);
    setFolderName('');
    setFiles([]);
    setLastEventMsg(null);
  };

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FolderCheck className="w-4 h-4 text-amber-400" />
            Real Physical Directory Integrity Watcher (File System Access API)
          </h3>
          <p className="text-xs text-slate-400">
            Select an actual folder on your laptop (e.g. Documents, Project folder) to continuously audit file modifications and SHA-256 hashes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isWatching ? (
            <button
              onClick={handlePickDirectory}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Select Real Folder to Monitor</span>
            </button>
          ) : (
            <button
              onClick={handleStopWatching}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <FolderX className="w-3.5 h-3.5" />
              <span>Stop Folder Watcher</span>
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

      {lastEventMsg && (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{lastEventMsg}</span>
        </div>
      )}

      {isWatching ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Active Watch Root:{' '}
              <strong className="text-white font-mono">{folderName}</strong> (
              {files.length} tracked files)
            </span>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              POLLING SHA-256 HASHES EVERY 2s
            </span>
          </div>

          <div className="rounded-lg bg-slate-950 border border-slate-800 overflow-hidden max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">File Path</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">SHA-256 Cryptographic Digest</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {files.map((f) => (
                  <tr key={f.relativePath} className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 text-white truncate max-w-xs">{f.relativePath}</td>
                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                      {(f.sizeBytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-2 px-3 text-cyan-300 truncate max-w-xs" title={f.sha256Hash}>
                      {f.sha256Hash.substring(0, 16)}...{f.sha256Hash.substring(48)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          f.status === 'MODIFIED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                            : f.status === 'NEW'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-slate-950 border border-dashed border-slate-800 p-6 text-center text-slate-500 text-xs">
          <FolderCheck className="w-6 h-6 mx-auto mb-2 opacity-40 text-amber-400" />
          <span>Real physical filesystem auditing is currently inactive.</span>
          <p className="text-[11px] text-slate-600 mt-1">
            Click &quot;Select Real Folder to Monitor&quot; above to grant secure read permissions to any local folder on your computer.
          </p>
        </div>
      )}
    </div>
  );
};
