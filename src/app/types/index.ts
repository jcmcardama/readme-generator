export interface RepoData {
  name: string;
  description: string;
  language: string;
  html_url: string;
}

export interface GitHubRepoMeta {
  name: string;
  description: string | null;
  language: string | null;
  default_branch: string;
  owner?: {
    login: string;
    [key: string]: unknown;
  };
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

export interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
  onComplete?: () => void;
}

export interface TerminalProps {
  logs: LogEntry[];
}

export interface TypewriterLineProps {
  text: string;
  onCharacterTyped: () => void;
  onComplete?: () => void;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface LandingProps {
  onGenerate: () => Promise<void> | void;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export interface MarkDownEditorProps {
  state: string;
  onCopy: () => Promise<void> | void;
  onPreview: () => Promise<void> | void;
  onEdit: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  markdown: string;
}
