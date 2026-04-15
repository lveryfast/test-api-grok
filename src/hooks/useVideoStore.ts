import { create } from 'zustand';
import {
  SceneCount,
  CHARACTER_LIMITS,
} from '@/types/constants';
import { Scene } from '@/types/scene';
import { VideoStyle, GeneratedVideo } from '@/types/video';
import { GrokApiLog } from '@/types/api';

interface VideoStore {
  // Script
  script: string;
  setScript: (script: string) => void;

  // Style
  selectedStyle: VideoStyle | null;
  customStyles: VideoStyle[];
  editedStyles: Record<string, VideoStyle>; // Edits to predefined styles
  setSelectedStyle: (style: VideoStyle | null) => void;
  addCustomStyle: (style: VideoStyle) => void;
  updateCustomStyle: (styleId: string, updates: Partial<VideoStyle>) => void;
  removeCustomStyle: (styleId: string) => void;
  updatePredefinedStyle: (originalId: string, updates: Partial<VideoStyle>) => void;

  // Character
  characterPrompt: string;
  setCharacterPrompt: (prompt: string) => void;

  // Voice
  voicePrompt: string;
  setVoicePrompt: (prompt: string) => void;

  // Scenes
  sceneCount: SceneCount;
  scenes: Scene[];
  setSceneCount: (count: SceneCount) => void;
  updateScene: (sceneId: number, updates: Partial<Scene>) => void;
  resetScenes: () => void;

  // Hook
  hook: string;
  setHook: (hook: string) => void;

  // Generation
  generatedVideos: GeneratedVideo[];
  addGeneratedVideo: (video: GeneratedVideo) => void;
  clearGeneratedVideos: () => void;

  // API Logs
  apiLogs: GrokApiLog[];
  addApiLog: (log: GrokApiLog) => void;
  clearApiLogs: () => void;

  // UI State
  isGenerating: boolean;
  currentSceneIndex: number;
  setIsGenerating: (generating: boolean) => void;
  setCurrentSceneIndex: (index: number) => void;

  // Reset all
  resetAll: () => void;
}

const createEmptyScenes = (count: SceneCount): Scene[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    dialogue: '',
    description: '',
  }));

export const useVideoStore = create<VideoStore>((set, get) => ({
  // Script
  script: '',
  setScript: (script) =>
    set({ script: script.slice(0, CHARACTER_LIMITS.SCRIPT) }),

  // Style
  selectedStyle: null,
  customStyles: [],
  editedStyles: {},
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  addCustomStyle: (style) =>
    set((state) => ({
      customStyles: [...state.customStyles, style],
    })),
  updateCustomStyle: (styleId, updates) =>
    set((state) => ({
      customStyles: state.customStyles.map((s) =>
        s.id === styleId ? { ...s, ...updates } : s
      ),
    })),
  removeCustomStyle: (styleId) =>
    set((state) => ({
      customStyles: state.customStyles.filter((s) => s.id !== styleId),
    })),
  updatePredefinedStyle: (originalId, updates) =>
    set((state) => ({
      editedStyles: {
        ...state.editedStyles,
        [originalId]: {
          id: originalId,
          title: updates.title || originalId,
          description: updates.description || '',
          isCustom: false,
          ...updates,
        },
      },
    })),

  // Character
  characterPrompt: '',
  setCharacterPrompt: (prompt) =>
    set({ characterPrompt: prompt.slice(0, CHARACTER_LIMITS.CHARACTER_PROMPT) }),

  // Voice
  voicePrompt: '',
  setVoicePrompt: (prompt) =>
    set({ voicePrompt: prompt.slice(0, CHARACTER_LIMITS.VOICE_PROMPT) }),

  // Scenes
  sceneCount: 4,
  scenes: createEmptyScenes(4),
  setSceneCount: (count) =>
    set({
      sceneCount: count,
      scenes: createEmptyScenes(count),
    }),
  updateScene: (sceneId, updates) =>
    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              dialogue: updates.dialogue !== undefined
                ? updates.dialogue.slice(0, CHARACTER_LIMITS.SCENE_DIALOGUE)
                : scene.dialogue,
              description: updates.description !== undefined
                ? updates.description.slice(0, CHARACTER_LIMITS.SCENE_DESCRIPTION)
                : scene.description,
            }
          : scene
      ),
    })),
  resetScenes: () =>
    set((state) => ({
      scenes: createEmptyScenes(state.sceneCount),
    })),

  // Hook
  hook: '',
  setHook: (hook) => set({ hook }),

  // Generation
  generatedVideos: [],
  addGeneratedVideo: (video) =>
    set((state) => ({
      generatedVideos: [...state.generatedVideos, video],
    })),
  clearGeneratedVideos: () => set({ generatedVideos: [] }),

  // API Logs
  apiLogs: [],
  addApiLog: (log) =>
    set((state) => ({
      apiLogs: [...state.apiLogs, log],
    })),
  clearApiLogs: () => set({ apiLogs: [] }),

  // UI State
  isGenerating: false,
  currentSceneIndex: 1,
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setCurrentSceneIndex: (index) => set({ currentSceneIndex: Math.max(1, index) }),

  // Reset all
  resetAll: () =>
    set({
      script: '',
      selectedStyle: null,
      customStyles: [],
      editedStyles: {},
      characterPrompt: '',
      voicePrompt: '',
      sceneCount: 4,
      scenes: createEmptyScenes(4),
      hook: '',
      generatedVideos: [],
      apiLogs: [],
      isGenerating: false,
      currentSceneIndex: 1,
    }),
}));
