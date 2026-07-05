import { create } from 'zustand';
import { ScannerState, ScannedPage } from '../types';

const generateId = () => Math.random().toString(36).substring(7);

const formatCurrentDateTime = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedDate = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()}`;
  const formattedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return `Scan - ${formattedDate} - ${formattedTime}`;
};

export const useScannerStore = create<ScannerState>((set) => ({
  pages: [],
  currentPageIndex: 0,
  title: formatCurrentDateTime(),

  setPages: (uris) => {
    const newPages: ScannedPage[] = uris.map((uri) => ({
      id: generateId(),
      uri,
      originalUri: uri,
      rotation: 0,
      filter: 'none',
      crop: null,
    }));
    set({
      pages: newPages,
      currentPageIndex: 0,
      title: formatCurrentDateTime(),
    });
  },

  appendPages: (uris) => {
    set((state) => {
      const newPages: ScannedPage[] = uris.map((uri) => ({
        id: generateId(),
        uri,
        originalUri: uri,
        rotation: 0,
        filter: 'none',
        crop: null,
      }));
      return {
        pages: [...state.pages, ...newPages],
      };
    });
  },

  updatePage: (index, updates) => {
    set((state) => {
      const updatedPages = [...state.pages];
      if (index >= 0 && index < updatedPages.length) {
        updatedPages[index] = {
          ...updatedPages[index],
          ...updates,
        };
      }
      return { pages: updatedPages };
    });
  },

  deletePage: (index) => {
    set((state) => {
      const updatedPages = state.pages.filter((_, i) => i !== index);
      let nextIndex = state.currentPageIndex;
      if (nextIndex >= updatedPages.length) {
        nextIndex = Math.max(0, updatedPages.length - 1);
      }
      return {
        pages: updatedPages,
        currentPageIndex: nextIndex,
      };
    });
  },

  setTitle: (title) => set({ title }),

  clear: () => set({
    pages: [],
    currentPageIndex: 0,
    title: formatCurrentDateTime(),
  }),
}));
