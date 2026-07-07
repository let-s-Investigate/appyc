import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FilesState, ScannedFile, Folder } from '../types';

const INITIAL_FOLDERS: Folder[] = [];
const INITIAL_FILES: ScannedFile[] = [];
const INITIAL_SEARCHES: string[] = [];

const generateId = () => Math.random().toString(36).substring(7);

export const useFilesStore = create<FilesState>()(
  persist(
    (set) => ({
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

      addFile: (file) => {
        const id = generateId();
        set((state) => {
          const newFile: ScannedFile = { ...file, id };
          return { files: [newFile, ...state.files] };
        });
        return id;
      },

      renameFile: (fileId, title) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === fileId ? { ...f, title } : f)),
        })),

      moveFile: (fileId, folderId) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === fileId ? { ...f, folderId } : f)),
        })),

      updateFile: (fileId, updates) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === fileId ? { ...f, ...updates } : f)),
        })),

      addFolder: (title) =>
        set((state) => {
          const now = new Date();
          const pad = (n: number) => n.toString().padStart(2, '0');
          const formattedDate = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()}`;
          const formattedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

          const newFolder: Folder = {
            id: generateId(),
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
    }),
    {
      name: 'proscan-files',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Persist library data only — tab indices are session state
      partialize: (state) => ({
        files: state.files,
        folders: state.folders,
        previousSearches: state.previousSearches,
      }),
      migrate: (persisted: any) => {
        // Drop legacy require()-number thumbnails that cannot survive JSON round-trips
        if (persisted?.files) {
          persisted.files = persisted.files.map((f: any) => ({
            ...f,
            thumbnail: f.thumbnail && typeof f.thumbnail === 'object' && f.thumbnail.uri ? f.thumbnail : null,
          }));
        }
        return persisted;
      },
    }
  )
);
