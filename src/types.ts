export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  summary?: string;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
}


