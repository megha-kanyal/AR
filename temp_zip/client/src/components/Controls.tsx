import { useState, useEffect } from "react";
import { useAR } from "../lib/stores/useAR";
import { useAudio } from "../lib/stores/useAudio";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Trash2, 
  Volume2, 
  VolumeX,
  Copy
} from "lucide-react";
import { toast } from "sonner";

type ControlMode = "rotate" | "scale" | "move";

const Controls = () => {
  const { 
    selectedObject, 
    objects, 
    updateObjectRotation, 
    updateObjectScale,
    removeObject,
    duplicateObject
  } = useAR();
  
  const { toggleMute, isMuted, playSuccess } = useAudio();
  
  const [mode, setMode] = useState<ControlMode>("rotate");
  const [value, setValue] = useState(0);
  
  // Get the selected object data
  const selectedObjectData = selectedObject 
    ? objects.find(obj => obj.id === selectedObject) 
    : null;
  
  // Reset value when mode or selected object changes
  useEffect(() => {
    if (selectedObjectData) {
      if (mode === "rotate") {
        setValue(selectedObjectData.rotation[1]); // Y-axis rotation
      } else if (mode === "scale") {
        setValue(selectedObjectData.scale);
      }
    } else {
      setValue(0);
    }
  }, [mode, selectedObject, selectedObjectData]);
  
  // Handle slider value change
  const handleValueChange = (newValue: number[]) => {
    if (!selectedObject || !selectedObjectData) return;
    
    const val = newValue[0];
    setValue(val);
    
    if (mode === "rotate") {
      const newRotation: [number, number, number] = [...selectedObjectData.rotation] as [number, number, number];
      newRotation[1] = val; // Update Y rotation
      updateObjectRotation(selectedObject, newRotation);
    } else if (mode === "scale") {
      updateObjectScale(selectedObject, val);
    }
  };
  
  // Rotate left/right by fixed amount
  const rotateObject = (direction: "left" | "right") => {
    if (!selectedObject || !selectedObjectData) return;
    
    const currentRotation: [number, number, number] = [...selectedObjectData.rotation] as [number, number, number];
    const rotationStep = Math.PI / 12; // 15 degrees
    
    currentRotation[1] += direction === "left" ? -rotationStep : rotationStep;
    updateObjectRotation(selectedObject, currentRotation);
    setValue(currentRotation[1]);
    playSuccess();
  };
  
  // Scale up/down by fixed amount
  const scaleObject = (direction: "up" | "down") => {
    if (!selectedObject || !selectedObjectData) return;
    
    const currentScale = selectedObjectData.scale;
    const scaleStep = 0.1;
    const newScale = direction === "up" 
      ? Math.min(currentScale + scaleStep, 2) 
      : Math.max(currentScale - scaleStep, 0.2);
    
    updateObjectScale(selectedObject, newScale);
    setValue(newScale);
    playSuccess();
  };
  
  // Delete the selected object
  const handleDelete = () => {
    if (!selectedObject) return;
    
    removeObject(selectedObject);
    toast.success("Object removed");
    playSuccess();
  };
  
  // Duplicate the selected object
  const handleDuplicate = () => {
    if (!selectedObject) return;
    
    duplicateObject(selectedObject);
    toast.success("Object duplicated");
    playSuccess();
  };
  
  return (
    <Card className="p-4 bg-background/80 backdrop-blur-sm border-none shadow-lg">
      <div className="space-y-4">
        {/* No object selected message */}
        {!selectedObject && (
          <div className="text-center py-2">
            <p className="text-muted-foreground">
              Place an object or tap an existing object to select it
            </p>
          </div>
        )}
        
        {/* Controls when object is selected */}
        {selectedObject && (
          <>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">
                Editing: {selectedObjectData?.model.name}
              </h3>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleDuplicate}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Duplicate object</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={handleDelete}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete object</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {/* Mode selection */}
            <div className="flex gap-2 mb-4">
              <Button 
                variant={mode === "rotate" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setMode("rotate")}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate
              </Button>
              <Button 
                variant={mode === "scale" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setMode("scale")}
              >
                <ZoomIn className="h-4 w-4 mr-2" />
                Scale
              </Button>
            </div>
            
            {/* Controls based on selected mode */}
            {mode === "rotate" && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => rotateObject("left")}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" /> Rotate Left
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => rotateObject("right")}
                  >
                    Rotate Right <RotateCw className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Rotation</p>
                  <Slider 
                    value={[value]} 
                    onValueChange={handleValueChange} 
                    min={0} 
                    max={Math.PI * 2} 
                    step={0.01} 
                  />
                </div>
              </div>
            )}
            
            {mode === "scale" && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => scaleObject("down")}
                  >
                    <ZoomOut className="h-4 w-4 mr-2" /> Scale Down
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => scaleObject("up")}
                  >
                    Scale Up <ZoomIn className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Scale: {value.toFixed(1)}x</p>
                  <Slider 
                    value={[value]} 
                    onValueChange={handleValueChange} 
                    min={0.2} 
                    max={2} 
                    step={0.1} 
                  />
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Sound toggle button - always visible */}
        <div className="flex justify-end mt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Controls;
