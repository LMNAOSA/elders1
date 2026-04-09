import { create } from 'zustand';

export type SceneState = 
  | 'LAND' 
  | 'IDENTITY' 
  | 'AIRCRAFT' 
  | 'FLIGHT' 
  | 'IMPACT' 
  | 'CONTRIBUTION' 
  | 'HUMAN' 
  | 'OWNERSHIP' 
  | 'CTA';

export const SCENE_BREAKPOINTS: Record<SceneState, number> = {
  LAND: 0.0,
  IDENTITY: 0.1,
  AIRCRAFT: 0.25,
  FLIGHT: 0.4,
  IMPACT: 0.6,
  CONTRIBUTION: 0.7,
  HUMAN: 0.8,
  OWNERSHIP: 0.9,
  CTA: 1.0,
};

export const STATE_ORDER: SceneState[] = [
  'LAND',
  'IDENTITY',
  'AIRCRAFT',
  'FLIGHT',
  'IMPACT',
  'CONTRIBUTION',
  'HUMAN',
  'OWNERSHIP',
  'CTA',
];

interface AppState {
  progress: number;
  currentScene: SceneState;
  nextScene: SceneState;
  transitionProgress: number;
  mousePosition: { x: number; y: number };
  isCohesionActive: boolean;
  
  setProgress: (progress: number) => void;
  setMousePosition: (x: number, y: number) => void;
  setCohesionActive: (active: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  progress: 0,
  currentScene: 'LAND',
  nextScene: 'IDENTITY',
  transitionProgress: 0,
  mousePosition: { x: 0, y: 0 },
  isCohesionActive: false,

  setProgress: (progress) => {
    // Find current and next scene based on progress
    let current: SceneState = 'LAND';
    let next: SceneState = 'IDENTITY';
    
    for (let i = 0; i < STATE_ORDER.length; i++) {
      const state = STATE_ORDER[i];
      const breakpoint = SCENE_BREAKPOINTS[state];
      
      if (progress >= breakpoint) {
        current = state;
        next = STATE_ORDER[i + 1] || state;
      } else {
        break;
      }
    }

    // Calculate transition progress between current and next
    const start = SCENE_BREAKPOINTS[current];
    const end = SCENE_BREAKPOINTS[next];
    const tProgress = start === end ? 0 : (progress - start) / (end - start);

    set({ 
      progress, 
      currentScene: current, 
      nextScene: next, 
      transitionProgress: Math.min(Math.max(tProgress, 0), 1) 
    });
  },
  
  setMousePosition: (x, y) => set({ mousePosition: { x, y } }),
  setCohesionActive: (active) => set({ isCohesionActive: active }),
}));
