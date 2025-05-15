import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";
import ARScene from "./components/ARScene";
import Controls from "./components/Controls";
import ObjectSelector from "./components/ObjectSelector";
import { useAR } from "./lib/stores/useAR";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";

// Main application component
function App() {
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "pending"
  >("pending");
  const { loadAudio } = useAR();
  const [screenOrientation, setScreenOrientation] = useState<
    "portrait" | "landscape"
  >(window.innerHeight > window.innerWidth ? "portrait" : "landscape");

  // Set up audio
  useEffect(() => {
    // Background music setup
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    // Hit sound for object placement
    const hitSound = new Audio("/sounds/hit.mp3");
    
    // Success sound for operations
    const successSound = new Audio("/sounds/success.mp3");
    
    // Store audio in global state
    const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio.getState();
    setBackgroundMusic(bgMusic);
    setHitSound(hitSound);
    setSuccessSound(successSound);
    
    // Setup orientation change detection
    const handleOrientationChange = () => {
      setScreenOrientation(
        window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      );
    };
    
    window.addEventListener("resize", handleOrientationChange);
    return () => {
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission("granted");
      loadAudio();
      console.log("Camera permission granted");
    } catch (error) {
      console.error("Error getting camera permission:", error);
      setCameraPermission("denied");
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen w-screen overflow-hidden bg-background">
        {cameraPermission === "pending" && (
          <div className="flex h-full w-full flex-col items-center justify-center p-4">
            <h1 className="mb-8 text-3xl font-bold">AR Object Placement</h1>
            <p className="mb-6 text-center">
              Place virtual 3D objects in your real environment using your camera.
            </p>
            <button
              onClick={requestCameraPermission}
              className="rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
            >
              Start AR Experience
            </button>
          </div>
        )}

        {cameraPermission === "denied" && (
          <div className="flex h-full w-full flex-col items-center justify-center p-4">
            <h1 className="mb-6 text-2xl font-bold text-destructive">
              Camera Permission Required
            </h1>
            <p className="mb-6 text-center">
              This AR application needs access to your camera. Please enable camera
              permissions and refresh the page.
            </p>
            <button
              onClick={requestCameraPermission}
              className="rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        )}

        {cameraPermission === "granted" && (
          <div className="relative h-full w-full">
            {/* AR Scene (camera and 3D objects) */}
            <ARScene />
            
            {/* UI Controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <div className="mx-auto max-w-screen-lg">
                <div className="flex flex-col p-4">
                  <ObjectSelector />
                  <Controls />
                </div>
              </div>
            </div>
          </div>
        )}

        <Toaster position="top-center" />
      </div>
    </QueryClientProvider>
  );
}

export default App;
