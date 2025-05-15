import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useRef, createRef } from "react";
import { defaultModels, type Model } from "@shared/models";
import { useAudio } from "./useAudio";

export interface ARObject {
  id: string;
  model: Model;
  position: [number, number, number]; // x, y, z
  rotation: [number, number, number]; // x, y, z in radians
  scale: number;
  ref: React.RefObject<THREE.Group>;
}

interface ARState {
  // AR objects management
  objects: ARObject[];
  selectedObject: string | null;
  
  // Camera and AR related
  cameraPermission: boolean;
  
  // Actions
  addObject: (obj: Omit<ARObject, "ref">) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  updateObjectPosition: (id: string, position: [number, number, number]) => void;
  updateObjectRotation: (id: string, rotation: [number, number, number]) => void;
  updateObjectScale: (id: string, scale: number) => void;
  duplicateObject: (id: string) => void;
  
  // Audio related
  loadAudio: () => void;
}

export const useAR = create<ARState>()(
  subscribeWithSelector((set, get) => ({
    objects: [],
    selectedObject: null,
    cameraPermission: false,
    
    // Add a new object to the scene
    addObject: (obj) => {
      set((state) => ({
        objects: [...state.objects, { ...obj, ref: createRef() }],
        selectedObject: obj.id, // Automatically select new object
      }));
    },
    
    // Remove an object by ID
    removeObject: (id) => {
      set((state) => {
        const objects = state.objects.filter((obj) => obj.id !== id);
        
        return {
          objects,
          selectedObject: state.selectedObject === id ? null : state.selectedObject,
        };
      });
    },
    
    // Select an object by ID (or deselect if null)
    selectObject: (id) => {
      set({ selectedObject: id });
    },
    
    // Update object position
    updateObjectPosition: (id, position) => {
      set((state) => ({
        objects: state.objects.map((obj) =>
          obj.id === id ? { ...obj, position } : obj
        ),
      }));
    },
    
    // Update object rotation
    updateObjectRotation: (id, rotation) => {
      set((state) => ({
        objects: state.objects.map((obj) =>
          obj.id === id ? { ...obj, rotation } : obj
        ),
      }));
    },
    
    // Update object scale
    updateObjectScale: (id, scale) => {
      set((state) => ({
        objects: state.objects.map((obj) =>
          obj.id === id ? { ...obj, scale } : obj
        ),
      }));
    },
    
    // Duplicate an object
    duplicateObject: (id) => {
      const { objects } = get();
      const originalObject = objects.find((obj) => obj.id === id);
      
      if (!originalObject) return;
      
      // Create slightly offset position
      const position: [number, number, number] = [
        originalObject.position[0] + 0.5,
        originalObject.position[1],
        originalObject.position[2],
      ];
      
      // Create a new object based on the original
      const newObject: Omit<ARObject, "ref"> = {
        id: `${originalObject.model.id}-${Date.now()}`,
        model: originalObject.model,
        position,
        rotation: [...originalObject.rotation] as [number, number, number],
        scale: originalObject.scale,
      };
      
      // Add the new object and select it
      get().addObject(newObject);
    },
    
    // Load and set up audio
    loadAudio: () => {
      // We'll use the useAudio store for actual audio handling
      const { toggleMute } = useAudio.getState();
      
      // Start with sound unmuted
      toggleMute();
    },
  }))
);
