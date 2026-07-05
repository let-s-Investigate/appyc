export interface ScannedPage {
  id: string;
  uri: string;
  originalUri: string;
  rotation: number;
  filter: 'none' | 'grayscale' | 'magic' | 'bw';
  crop: {
    x: number; // 0 to 1 percentage
    y: number;
    w: number;
    h: number;
  } | null;
  fitPage?: boolean;
}

export interface ScannerState {
  pages: ScannedPage[];
  currentPageIndex: number;
  title: string;
  setPages: (uris: string[]) => void;
  appendPages: (uris: string[]) => void;
  updatePage: (index: number, updates: Partial<ScannedPage>) => void;
  deletePage: (index: number) => void;
  setTitle: (title: string) => void;
  clear: () => void;
}
