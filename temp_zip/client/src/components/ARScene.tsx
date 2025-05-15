import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useAR } from "../lib/stores/useAR";
import { useAudio } from "../lib/stores/useAudio";
import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { toast } from "sonner";
import { setupARCamera } from "../lib/ar-utils";

// Model loader component
const Model = ({ modelPath, position, rotation, scale, selected, onClick }) => {
  // Handle primitives vs. GLTF models
  if (modelPath === "cube") {
    return (
      <mesh
        position={position}
        rotation={new THREE.Euler(...rotation)}
        scale={[scale, scale, scale]}
        onClick={onClick}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={selected ? "#88ccff" : "#ffffff"} 
          opacity={0.8}
          transparent={true}
        />
      </mesh>
    );
  } else if (modelPath === "sphere") {
    return (
      <mesh
        position={position}
        rotation={new THREE.Euler(...rotation)}
        scale={[scale, scale, scale]}
        onClick={onClick}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color={selected ? "#88ccff" : "#ffffff"} 
          opacity={0.8}
          transparent={true}
        />
      </mesh>
    );
  } else if (modelPath === "cylinder") {
    return (
      <mesh
        position={position}
        rotation={new THREE.Euler(...rotation)}
        scale={[scale, scale, scale]}
        onClick={onClick}
      >
        <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
        <meshStandardMaterial 
          color={selected ? "#88ccff" : "#ffffff"} 
          opacity={0.8}
          transparent={true}
        />
      </mesh>
    );
  } else if (modelPath === "cone") {
    return (
      <mesh
        position={position}
        rotation={new THREE.Euler(...rotation)}
        scale={[scale, scale, scale]}
        onClick={onClick}
      >
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial 
          color={selected ? "#88ccff" : "#ffffff"} 
          opacity={0.8}
          transparent={true}
        />
      </mesh>
    );
  } else if (modelPath === "custom_table") {
    // Create a simple table from primitives
    return (
      <group
        position={position}
        rotation={new THREE.Euler(...rotation)}
        scale={[scale, scale, scale]}
        onClick={onClick}
      >
        {/* Table top */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.5, 0.1, 1]} />
          <meshStandardMaterial 
            color={selected ? "#88ccff" : "#cd8c52"} 
          />
        </mesh>
        {/* Table legs */}
        {[[-0.6, 0, 0.4], [0.6, 0, 0.4], [-0.6, 0, -0.4], [0.6, 0, -0.4]].map(
          (pos, i) => (
            <mesh key={i} position={pos}>
              <boxGeometry args={[0.1, 0.8, 0.1]} />
              <meshStandardMaterial 
                color={selected ? "#88ccff" : "#8b5a2b"} 
              />
            </mesh>
          )
        )}
      </group>
    );
  } else if (modelPath === "custom_chair") {
    // Create a simple chair from primitives
    return (
      <group
        position={position}
        rotation={new THREE.Euler(...rotation)}
        scale={[scale, scale, scale]}
        onClick={onClick}
      >
        {/* Seat */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial 
            color={selected ? "#88ccff" : "#cd8c52"} 
          />
        </mesh>
        {/* Back */}
        <mesh position={[0, 0.65, -0.25]}>
          <boxGeometry args={[0.6, 0.7, 0.1]} />
          <meshStandardMaterial 
            color={selected ? "#88ccff" : "#cd8c52"} 
          />
        </mesh>
        {/* Legs */}
        {[[-0.25, 0, 0.25], [0.25, 0, 0.25], [-0.25, 0, -0.25], [0.25, 0, -0.25]].map(
          (pos, i) => (
            <mesh key={i} position={pos}>
              <boxGeometry args={[0.05, 0.5, 0.05]} />
              <meshStandardMaterial 
                color={selected ? "#88ccff" : "#8b5a2b"} 
              />
            </mesh>
          )
        )}
      </group>
    );
  } else {
    // Load GLTF model
    const { scene } = useGLTF(modelPath, true);
    
    return (
      <primitive
        object={scene.clone()}
        position={position}
        rotation={new THREE.Euler(...rotation)}
        scale={[scale, scale, scale]}
        onClick={onClick}
      />
    );
  }
};

// Component to handle AR placement of objects
const ARObjects = () => {
  const { camera } = useThree();
  const { objects, selectedObject, selectObject, updateObjectPosition } = useAR();
  const { playHit } = useAudio();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  // Initialize camera with video feed
  useEffect(() => {
    setupARCamera(camera);
  }, [camera]);
  
  // Place object on click
  const handlePlaceObject = (event) => {
    if (!selectedObject) {
      // If no object is selected, try to select one
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        objects.map(obj => obj.ref.current),
        true
      );
      
      if (intersects.length > 0) {
        const objectId = intersects[0].object.userData.objectId;
        selectObject(objectId);
      }
    } else {
      // Calculate placement position based on camera and raycast
      const depth = 3; // Fixed distance in front of camera
      const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const position = new THREE.Vector3().addVectors(
        camera.position,
        direction.multiplyScalar(depth)
      );
      
      updateObjectPosition(selectedObject, position.toArray());
      playHit();
      toast.success("Object placed");
    }
  };
  
  // Connect objects with their references
  useEffect(() => {
    objects.forEach(obj => {
      if (obj.ref.current) {
        obj.ref.current.userData.objectId = obj.id;
      }
    });
  }, [objects]);
  
  return (
    <>
      {/* Environment lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Render all objects */}
      {objects.map((object) => (
        <Model
          key={object.id}
          modelPath={object.model.path}
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
          selected={selectedObject === object.id}
          onClick={(e) => {
            e.stopPropagation();
            selectObject(object.id);
          }}
          ref={object.ref}
        />
      ))}
      
      {/* Invisible plane for raycasting to place objects */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -1, 0]} 
        onClick={handlePlaceObject}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial opacity={0} transparent />
      </mesh>
    </>
  );
};

// Main AR Scene Component
const ARScene = () => {
  const [arReady, setARReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Setup video stream
    const setupVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight },
          },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setARReady(true);
        }
      } catch (error) {
        console.error("Failed to get camera stream:", error);
        toast.error("Failed to access camera");
      }
    };
    
    setupVideo();
    
    return () => {
      // Clean up video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  return (
    <div className="relative h-full w-full">
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute h-full w-full object-cover"
        playsInline
        muted
      />
      
      {/* Three.js canvas overlay */}
      <Canvas
        className="absolute top-0 left-0 h-full w-full"
        camera={{ position: [0, 0, 0], fov: 75 }}
      >
        {arReady && <ARObjects />}
        {/* Controls for development, can be removed for production */}
        {import.meta.env.DEV && <OrbitControls />}
      </Canvas>
    </div>
  );
};

export default ARScene;
