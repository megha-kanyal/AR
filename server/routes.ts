import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { defaultModels } from "../shared/models";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to get available models
  app.get("/api/models", (req, res) => {
    try {
      // Return default models
      // In a real application, this could fetch from a database
      res.json(defaultModels);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  // API route to get a specific model by ID
  app.get("/api/models/:id", (req, res) => {
    try {
      const model = defaultModels.find((m) => m.id === req.params.id);
      
      if (!model) {
        return res.status(404).json({ message: "Model not found" });
      }
      
      res.json(model);
    } catch (error) {
      console.error("Error fetching model:", error);
      res.status(500).json({ message: "Failed to fetch model" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
