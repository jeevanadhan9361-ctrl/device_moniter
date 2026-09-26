/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WatchedFileRecord {
  name: string;
  relativePath: string;
  sizeBytes: number;
  lastModified: number;
  sha256Hash: string;
  status: 'CLEAN' | 'MODIFIED' | 'TAMPERED' | 'NEW';
}

type FileChangeListener = (
  event: 'FILE_MODIFIED' | 'FILE_CREATED' | 'FILE_DELETED',
  file: WatchedFileRecord,
  diffSummary: string
) => void;

class RealDirectoryWatcherService {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private watchedFiles: Map<string, WatchedFileRecord> = new Map();
  private pollIntervalId: number | null = null;
  private changeListeners: Set<FileChangeListener> = new Set();
  private isWatching: boolean = false;
  private rootDirectoryName: string = '';

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }

  public getRootDirectoryName(): string {
    return this.rootDirectoryName;
  }

  public getWatchedFiles(): WatchedFileRecord[] {
    return Array.from(this.watchedFiles.values());
  }

  public async pickAndWatchDirectory(): Promise<{
    success: boolean;
    folderName?: string;
    fileCount?: number;
    error?: string;
  }> {
    if (!this.isSupported()) {
      return { success: false, error: 'File System Access API is not supported in this browser (Chrome/Edge on Windows recommended).' };
    }

    try {
      // Prompt user to select directory
      const handle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
      this.directoryHandle = handle;
      this.rootDirectoryName = handle.name;
      this.isWatching = true;

      // Initial scan
      await this.scanDirectory(handle);

      // Start periodic differential poll every 2 seconds
      if (this.pollIntervalId) clearInterval(this.pollIntervalId);
      this.pollIntervalId = window.setInterval(() => {
        if (this.directoryHandle && this.isWatching) {
          this.pollChanges(this.directoryHandle).catch((err) => {
            console.warn('Directory polling error', err);
          });
        }
      }, 2000);

      return {
        success: true,
        folderName: handle.name,
        fileCount: this.watchedFiles.size,
      };
    } catch (e: unknown) {
      if ((e as { name?: string }).name === 'AbortError') {
        return { success: false, error: 'Directory selection was cancelled by user.' };
      }
      return { success: false, error: String(e) };
    }
  }

  private async calculateFileSHA256(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'HASH_FAILED';
    }
  }

  private async scanDirectory(
    dirHandle: FileSystemDirectoryHandle,
    pathPrefix = ''
  ): Promise<void> {
    for await (const entry of (dirHandle as unknown as AsyncIterable<FileSystemHandle>)) {
      if (entry.kind === 'file') {
        try {
          const fileHandle = entry as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const relPath = pathPrefix ? `${pathPrefix}\\${entry.name}` : entry.name;
          const hash = await this.calculateFileSHA256(file);

          this.watchedFiles.set(relPath, {
            name: entry.name,
            relativePath: relPath,
            sizeBytes: file.size,
            lastModified: file.lastModified,
            sha256Hash: hash,
            status: 'CLEAN',
          });
        } catch {
          // File may be locked by another process
        }
      } else if (entry.kind === 'directory') {
        // Recursive subfolder scan (up to 3 levels)
        if (pathPrefix.split('\\').length < 3) {
          const subDirHandle = entry as FileSystemDirectoryHandle;
          const nextPrefix = pathPrefix ? `${pathPrefix}\\${entry.name}` : entry.name;
          await this.scanDirectory(subDirHandle, nextPrefix);
        }
      }
    }
  }

  private async pollChanges(dirHandle: FileSystemDirectoryHandle): Promise<void> {
    const currentPaths = new Set<string>();

    const checkDir = async (handle: FileSystemDirectoryHandle, pathPrefix = '') => {
      for await (const entry of (handle as unknown as AsyncIterable<FileSystemHandle>)) {
        if (entry.kind === 'file') {
          const fileHandle = entry as FileSystemFileHandle;
          const relPath = pathPrefix ? `${pathPrefix}\\${entry.name}` : entry.name;
          currentPaths.add(relPath);

          try {
            const file = await fileHandle.getFile();
            const existing = this.watchedFiles.get(relPath);

            if (!existing) {
              // New file detected
              const hash = await this.calculateFileSHA256(file);
              const newRec: WatchedFileRecord = {
                name: entry.name,
                relativePath: relPath,
                sizeBytes: file.size,
                lastModified: file.lastModified,
                sha256Hash: hash,
                status: 'NEW',
              };
              this.watchedFiles.set(relPath, newRec);
              this.notifyChange('FILE_CREATED', newRec, `New file created: ${relPath}`);
            } else if (existing.lastModified !== file.lastModified || existing.sizeBytes !== file.size) {
              // Modification detected! Calculate new SHA256
              const newHash = await this.calculateFileSHA256(file);
              if (newHash !== existing.sha256Hash) {
                const updatedRec: WatchedFileRecord = {
                  ...existing,
                  sizeBytes: file.size,
                  lastModified: file.lastModified,
                  sha256Hash: newHash,
                  status: 'MODIFIED',
                };
                this.watchedFiles.set(relPath, updatedRec);
                this.notifyChange(
                  'FILE_MODIFIED',
                  updatedRec,
                  `SHA-256 hash changed from ${existing.sha256Hash.substring(0, 10)}... to ${newHash.substring(0, 10)}...`
                );
              }
            }
          } catch {
            // File in use
          }
        } else if (entry.kind === 'directory' && pathPrefix.split('\\').length < 3) {
          const subDirHandle = entry as FileSystemDirectoryHandle;
          const nextPrefix = pathPrefix ? `${pathPrefix}\\${entry.name}` : entry.name;
          await checkDir(subDirHandle, nextPrefix);
        }
      }
    };

    await checkDir(dirHandle);

    // Detect deleted files
    for (const [path, record] of this.watchedFiles.entries()) {
      if (!currentPaths.has(path) && record.status !== 'TAMPERED') {
        this.watchedFiles.delete(path);
        this.notifyChange('FILE_DELETED', record, `File was deleted or moved: ${path}`);
      }
    }
  }

  private notifyChange(
    event: 'FILE_MODIFIED' | 'FILE_CREATED' | 'FILE_DELETED',
    file: WatchedFileRecord,
    diffSummary: string
  ) {
    this.changeListeners.forEach((l) => l(event, file, diffSummary));
  }

  public subscribe(listener: FileChangeListener): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  public stopWatching(): void {
    this.isWatching = false;
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
    this.directoryHandle = null;
  }
}

export const realDirectoryWatcherService = new RealDirectoryWatcherService();
