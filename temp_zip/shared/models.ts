// Model types for shared use between client and server
import { z } from "zod";

// Schema for model data validation
export const modelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  path: z.string(),
  scale: z.number().default(1),
  defaultRotation: z.array(z.number()).length(3).default([0, 0, 0]),
});

export type Model = z.infer<typeof modelSchema>;

// Default models available in the application
export const defaultModels: Model[] = [
  {
    id: "cube",
    name: "Cube",
    description: "A simple cube object",
    path: "cube", // Special case for primitive shapes
    scale: 0.5,
    defaultRotation: [0, 0, 0],
  },
  {
    id: "sphere",
    name: "Sphere",
    description: "A simple sphere object",
    path: "sphere", // Special case for primitive shapes
    scale: 0.5,
    defaultRotation: [0, 0, 0],
  },
  {
    id: "cylinder",
    name: "Cylinder",
    description: "A simple cylinder object",
    path: "cylinder", // Special case for primitive shapes
    scale: 0.5,
    defaultRotation: [0, 0, 0],
  },
  {
    id: "cone",
    name: "Cone",
    description: "A simple cone object",
    path: "cone", // Special case for primitive shapes
    scale: 0.5,
    defaultRotation: [0, 0, 0],
  },
  {
    id: "heart",
    name: "Heart",
    description: "A heart shape",
    path: "/geometries/heart.gltf",
    scale: 0.5,
    defaultRotation: [0, 0, 0],
  },
  {
    id: "table",
    name: "Table",
    description: "A wooden table",
    path: "custom_table", // Will be constructed using primitives
    scale: 0.8,
    defaultRotation: [0, 0, 0],
  },
  {
    id: "chair",
    name: "Chair",
    description: "A simple chair",
    path: "custom_chair", // Will be constructed using primitives
    scale: 0.7, 
    defaultRotation: [0, 0, 0],
  }
];
