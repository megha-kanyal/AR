import * as THREE from "three";

// Function to setup video texture for AR background
export const createVideoTexture = async (): Promise<THREE.VideoTexture | null> => {
  try {
    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: window.innerWidth },
        height: { ideal: window.innerHeight },
      },
    });
    
    // Create video element
    const video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    
    // Wait for video to be ready
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play().then(resolve);
      };
    });
    
    // Create THREE.js video texture
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    
    return texture;
  } catch (error) {
    console.error("Error creating video texture:", error);
    return null;
  }
};

// Function to setup camera for AR
export const setupARCamera = (camera: THREE.Camera): void => {
  // AR camera position is usually at origin
  camera.position.set(0, 0, 0);
  
  // Update camera aspect ratio based on window size
  const updateCameraAspect = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
  };
  
  // Set initial aspect
  updateCameraAspect();
  
  // Update on resize
  window.addEventListener("resize", updateCameraAspect);
};

// Function to create a ray from camera to place objects
export const createPlacementRay = (
  camera: THREE.Camera,
  mouse: THREE.Vector2
): THREE.Raycaster => {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  return raycaster;
};

// Convert screen coordinates to THREE.js normalized coordinates
export const screenToNormalizedCoordinates = (
  x: number,
  y: number
): THREE.Vector2 => {
  return new THREE.Vector2(
    (x / window.innerWidth) * 2 - 1,
    -(y / window.innerHeight) * 2 + 1
  );
};

// Calculate position in front of camera at specific distance
export const getPositionInFrontOfCamera = (
  camera: THREE.Camera,
  distance: number = 3
): THREE.Vector3 => {
  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  return new THREE.Vector3().addVectors(
    camera.position,
    direction.multiplyScalar(distance)
  );
};

// Check if device supports AR capabilities
export const checkARSupport = async (): Promise<boolean> => {
  // Check if navigator.mediaDevices exists
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false;
  }
  
  try {
    // Try to get camera stream
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    
    // Stop all tracks to release camera
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.error("AR not supported:", error);
    return false;
  }
};

// Create a hit test function to find intersection with AR plane
export const createHitTest = (
  camera: THREE.Camera,
  scene: THREE.Scene
): ((x: number, y: number) => THREE.Vector3 | null) => {
  const raycaster = new THREE.Raycaster();
  
  return (x: number, y: number) => {
    // Convert screen coordinates to normalized device coordinates
    const mouse = screenToNormalizedCoordinates(x, y);
    
    // Set raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Find intersections with ALL objects in the scene
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Return the first intersection point or null
    if (intersects.length > 0) {
      return intersects[0].point;
    }
    
    // If no intersection found, return a point at fixed distance in front of camera
    return getPositionInFrontOfCamera(camera);
  };
};
