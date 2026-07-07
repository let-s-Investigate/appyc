export interface ScannedFile {
  id: string;
  title: string;
  date: string;
  time: string;
  thumbnail: { uri: string } | null;
  uri?: string;
  folderId: string | null;
  sizeBytes?: number;
  pageCount?: number;
}

export interface Folder {
  id: string;
  title: string;
  date: string;
  time: string;
  fileCount: number;
}

export interface FilesState {
  files: ScannedFile[];
  folders: Folder[];
  previousSearches: string[];
  currentTabIndex: number;
  previousTabIndex: number;
  setTabIndex: (index: number) => void;
  addFile: (file: Omit<ScannedFile, 'id'>) => string;
  renameFile: (fileId: string, title: string) => void;
  moveFile: (fileId: string, folderId: string | null) => void;
  updateFile: (fileId: string, updates: Partial<Omit<ScannedFile, 'id'>>) => void;
  addFolder: (title: string) => void;
  deleteFolder: (folderId: string) => void;
  deleteFile: (fileId: string) => void;
  addSearchKeyword: (keyword: string) => void;
  removeSearchKeyword: (keyword: string) => void;
  clearSearchKeywords: () => void;
}
