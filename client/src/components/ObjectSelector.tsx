import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAR } from "../lib/stores/useAR";
import { useAudio } from "../lib/stores/useAudio";
import { Card } from "./ui/card";
import { defaultModels, type Model } from "@shared/models";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

const ObjectSelector = () => {
  const { addObject, objects } = useAR();
  const { playSuccess } = useAudio();
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  
  // Fetch models from API
  const { data: models, isLoading, error } = useQuery({
    queryKey: ["/api/models"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/models");
        if (!res.ok) throw new Error("Failed to fetch models");
        return await res.json();
      } catch (error) {
        console.error("Error fetching models:", error);
        // Fallback to default models if API fails
        return defaultModels;
      }
    },
  });
  
  // Handle adding a new object
  const handleAddObject = (model: Model) => {
    // Position in front of camera
    const position = [0, 0, -3];
    
    // Use model's default rotation
    const rotation = model.defaultRotation || [0, 0, 0];
    
    // Add object to scene
    addObject({
      id: `${model.id}-${Date.now()}`,
      model,
      position,
      rotation,
      scale: model.scale || 1,
    });
    
    // Play success sound and show toast
    playSuccess();
    toast.success(`Added ${model.name}`);
    
    // Deselect after adding
    setSelectedModelId(null);
  };
  
  // Calculate current object counts
  const getObjectCounts = () => {
    const counts: Record<string, number> = {};
    
    objects.forEach(obj => {
      const modelId = obj.model.id;
      counts[modelId] = (counts[modelId] || 0) + 1;
    });
    
    return counts;
  };
  
  const objectCounts = getObjectCounts();
  
  return (
    <Card className="p-4 mb-4 bg-background/80 backdrop-blur-sm border-none shadow-lg">
      <h3 className="font-medium mb-3">Place Objects</h3>
      
      {isLoading && <p className="text-sm text-muted-foreground">Loading objects...</p>}
      
      {error && (
        <p className="text-sm text-destructive">
          Error loading objects: {error.toString()}
        </p>
      )}
      
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {models?.map((model: Model) => (
          <div 
            key={model.id}
            className={`
              relative p-2 rounded-md border border-border 
              flex flex-col items-center justify-center
              cursor-pointer transition-all
              ${selectedModelId === model.id ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-background/90'}
            `}
            onClick={() => setSelectedModelId(model.id)}
            onDoubleClick={() => handleAddObject(model)}
          >
            <div className="w-12 h-12 flex items-center justify-center mb-1">
              {/* Display model icon based on type */}
              {model.path === 'cube' && <div className="w-8 h-8 bg-primary/30 rounded-sm" />}
              {model.path === 'sphere' && <div className="w-8 h-8 bg-primary/30 rounded-full" />}
              {model.path === 'cylinder' && <div className="w-6 h-8 bg-primary/30 rounded-md" />}
              {model.path === 'cone' && <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-transparent border-b-primary/30" />}
              
              {model.path === 'custom_table' && (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-2 bg-[#cd8c52] rounded-sm" />
                  <div className="flex w-full justify-between mt-1">
                    <div className="w-1 h-5 bg-[#8b5a2b]" />
                    <div className="w-1 h-5 bg-[#8b5a2b]" />
                    <div className="w-1 h-5 bg-[#8b5a2b]" />
                    <div className="w-1 h-5 bg-[#8b5a2b]" />
                  </div>
                </div>
              )}
              
              {model.path === 'custom_chair' && (
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-[#cd8c52] rounded-sm" />
                  <div className="w-6 h-1 bg-[#8b5a2b] mt-1" />
                </div>
              )}
              
              {model.path.endsWith('.gltf') && (
                <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-accent-foreground text-xs">
                  3D
                </div>
              )}
            </div>
            
            <span className="text-xs font-medium">{model.name}</span>
            
            {/* Count badge */}
            {objectCounts[model.id] && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {objectCounts[model.id]}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Add button */}
      {selectedModelId && (
        <div className="mt-3 flex justify-center">
          <button
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => {
              const model = models?.find((m: Model) => m.id === selectedModelId);
              if (model) handleAddObject(model);
            }}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add {models?.find((m: Model) => m.id === selectedModelId)?.name}</span>
          </button>
        </div>
      )}
    </Card>
  );
};

export default ObjectSelector;
