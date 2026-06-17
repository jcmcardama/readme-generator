import type { LogEntry } from '../types';

export const Terminal = ({ logs }: { logs: LogEntry[] }) => (
  <div className="terminal-container">
    {logs.map((log, index) => (
      <p key={`${log.id}-${index}`}>[{log.timestamp.toLocaleTimeString()}] {log.message}</p>
    ))}
  </div>
);