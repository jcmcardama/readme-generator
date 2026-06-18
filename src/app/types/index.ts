export interface RepoData {
  name: string;
  description: string;
  language: string;
  html_url: string;
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
  onComplete?: () => void;
}

export interface GitHubRepoMeta {
  name: string;
  description: string | null;
  language: string;
  default_branch: string;
  [key: string]: unknown; 
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

export interface ExtendedRepoData {
  meta: GitHubRepoMeta;
  fileTree: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface TypewriterLineProps {
  text: string;
  onCharacterTyped: () => void;
  onComplete?: () => void;
}

export interface LandingProps {
  onGenerate: () => Promise<void> | void;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}