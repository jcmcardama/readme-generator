export interface RepoData {
  name: string;
  description: string;
  language: string;
  html_url: string;
}

export type LogEntry = {
  id: string;
  message: string;
  timestamp: Date;
};