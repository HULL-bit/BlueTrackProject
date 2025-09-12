import { format } from 'date-fns';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'message' | 'alert';
  userId: string;
  content: Record<string, any>;
  metadata?: Record<string, any>;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly MAX_MEMORY_LOGS = 1000;
  private readonly LOG_RETENTION_DAYS = 30;

  constructor() {
    this.loadLogsFromStorage();
    this.setupCleanupInterval();
  }

  private loadLogsFromStorage() {
    try {
      const storedLogs = localStorage.getItem('pirogue_logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
        this.cleanOldLogs();
      }
    } catch (error) {
      console.error('Erreur chargement logs:', error);
      this.logs = [];
    }
  }

  private saveLogsToStorage() {
    try {
      // Garder seulement les logs récents en mémoire
      const recentLogs = this.logs.slice(-this.MAX_MEMORY_LOGS);
      localStorage.setItem('pirogue_logs', JSON.stringify(recentLogs));
      this.logs = recentLogs;
    } catch (error) {
      console.error('Erreur sauvegarde logs:', error);
    }
  }

  private cleanOldLogs() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.LOG_RETENTION_DAYS);
    
    const oldLogs = this.logs.filter(log => new Date(log.timestamp) < cutoffDate);
    this.logs = this.logs.filter(log => new Date(log.timestamp) >= cutoffDate);
    
    if (oldLogs.length > 0) {
      this.archiveOldLogs(oldLogs);
      this.saveLogsToStorage();
    }
  }

  private archiveOldLogs(oldLogs: LogEntry[]) {
    try {
      const archiveKey = `pirogue_archive_${format(new Date(), 'yyyy-MM')}`;
      const existingArchive = localStorage.getItem(archiveKey);
      const archive = existingArchive ? JSON.parse(existingArchive) : [];
      
      archive.push(...oldLogs);
      localStorage.setItem(archiveKey, JSON.stringify(archive));
      
      console.log(`📁 ${oldLogs.length} logs archivés dans ${archiveKey}`);
    } catch (error) {
      console.error('Erreur archivage logs:', error);
    }
  }

  private setupCleanupInterval() {
    // Nettoyer les logs tous les jours
    setInterval(() => {
      this.cleanOldLogs();
    }, 24 * 60 * 60 * 1000);
  }

  logMessage(userId: string, content: Record<string, any>, metadata?: Record<string, any>): string {
    const logEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type: 'message',
      userId,
      content,
      metadata
    };

    this.logs.push(logEntry);
    this.saveLogsToStorage();
    
    console.log('💬 Message loggé:', logEntry);
    return logEntry.id;
  }

  logAlert(userId: string, content: Record<string, any>, metadata?: Record<string, any>): string {
    const logEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type: 'alert',
      userId,
      content,
      metadata
    };

    this.logs.push(logEntry);
    this.saveLogsToStorage();
    
    console.log('🚨 Alerte loggée:', logEntry);
    return logEntry.id;
  }

  getRecentMessages(channelId: string, limit: number = 50): LogEntry[] {
    return this.logs
      .filter(log => 
        log.type === 'message' && 
        (log.content.channelId === channelId || log.metadata?.channelId === channelId)
      )
      .slice(-limit)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  getRecentAlerts(limit: number = 20): LogEntry[] {
    return this.logs
      .filter(log => log.type === 'alert')
      .slice(-limit)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  exportLogs(): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  downloadLogs() {
    const logData = this.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pirogue-logs-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const logger = new Logger();