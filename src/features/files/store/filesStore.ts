import { create } from 'zustand';
import { FilesState, ScannedFile, Folder } from '../types';
import { Images } from '@/constants/images';

const INITIAL_FOLDERS: Folder[] = [];
const INITIAL_FILES: ScannedFile[] = [];
const INITIAL_SEARCHES: string[] = [];

export const useFilesStore = create<FilesState>((set) => ({
  files: INITIAL_FILES,
  folders: INITIAL_FOLDERS,
  previousSearches: INITIAL_SEARCHES,
  currentTabIndex: 0,
  previousTabIndex: 0,

  setTabIndex: (index) =>
    set((state) => ({
      previousTabIndex: state.currentTabIndex,
      currentTabIndex: index,
    })),

  addFile: (file) =>
    set((state) => {
      const newFile: ScannedFile = {
        ...file,
        id: Math.random().toString(36).substring(7),
      };
      return { files: [newFile, ...state.files] };
    }),

  addFolder: (title) =>
    set((state) => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formattedDate = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()}`;
      const formattedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      
      const newFolder: Folder = {
        id: Math.random().toString(36).substring(7),
        title,
        date: formattedDate,
        time: formattedTime,
        fileCount: 0,
      };
      return { folders: [newFolder, ...state.folders] };
    }),

  deleteFolder: (folderId) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== folderId),
      // Optionally clean up files inside this folder, or set folderId to null
      files: state.files.map((file) =>
        file.folderId === folderId ? { ...file, folderId: null } : file
      ),
    })),

  deleteFile: (fileId) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== fileId),
    })),

  addSearchKeyword: (keyword) =>
    set((state) => {
      const filtered = state.previousSearches.filter(
        (kw) => kw.toLowerCase() !== keyword.toLowerCase()
      );
      return { previousSearches: [keyword, ...filtered] };
    }),

  removeSearchKeyword: (keyword) =>
    set((state) => ({
      previousSearches: state.previousSearches.filter((kw) => kw !== keyword),
    })),

  clearSearchKeywords: () =>
    set(() => ({
      previousSearches: [],
    })),
}));
