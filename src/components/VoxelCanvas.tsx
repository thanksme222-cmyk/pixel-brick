"use client";

import { useRef, useImperativeHandle, forwardRef, Suspense } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  Box, 
  Sphere, 
  Cylinder, 
  ContactShadows, 
  Grid, 
  Float 
} from "@react-three/drei";
import * as THREE from "three";

interface VoxelCanvasProps {
  brightness?: number;
  color?: string;
  shape?: "box" | "sphere" | "cylinder";
  textureUrl?: string | null;
  scale?: number;
  rotationSpeed?: number;
}

interface SceneObjectProps {
  shape: "box" | "sphere" | "cylinder";
  color: string;
  textureUrl: string | null;
  scale: number;
  rotationSpeed: number;
}

function SceneObject({
  shape,
  color,
  textureUrl,
  scale,
  rotationSpeed,
}: SceneObjectProps) {
  const meshRef = useRef<THREE.Group>(null);

  // We use a try-catch approach by providing an empty string if null
  // useLoader will wait for the texture to load or fail silently
  const texture = useLoader(
    THREE.TextureLoader,
    textureUrl || "" 
  ) as THREE.Texture;

  useFrame((_, delta) => {
    if (meshRef.current && rotationSpeed > 0) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  const hasValidTexture = !!textureUrl && texture;

  const materialProps: THREE.MeshStandardMaterialProps = {
    color: hasValidTexture ? "#ffffff" : color,
    map: hasValidTexture ? texture : undefined,
    roughness: 0.2,
    metalness: 0.1,
  };

  return (
    <group ref={meshRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        {shape === "box" && (
          <Box args={[scale, scale, scale]} position={[0, scale / 2, 0]} castShadow>
            <meshStandardMaterial {...materialProps} />
          </Box>
        )}

        {shape === "sphere" && (
          <Sphere args={[scale * 0.6, 64, 64]} position={[0, scale * 0.6, 0]} castShadow>
            <meshStandardMaterial {...materialProps} />
          </Sphere>
        )}

        {shape === "cylinder" && (
          <Cylinder args={[0.5 * scale, 0.5 * scale, scale, 32]} position={[0, scale / 2, 0]} castShadow>
            <meshStandardMaterial {...materialProps} />
          </Cylinder>
        )}
      </Float>
    </group>
  );
}

export interface VoxelCanvasRef {
  resetCamera: () => void;
}

const VoxelCanvas = forwardRef<VoxelCanvasRef, VoxelCanvasProps>((props, ref) => {
  const {
    brightness = 1.5,
    color = "#004643",
    shape = "box",
    textureUrl = null,
    scale = 1,
    rotationSpeed = 0,
  } = props;

  // We type this as 'any' temporarily to avoid the three-stdlib import error
  const controlsRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      controlsRef.current?.reset();
    },
  }));

  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        camera={{ position: [5, 5, 5], fov: 45 }}
      >
        <color attach="background" args={["#ffffff"]} />

        <ambientLight intensity={brightness * 0.3} />
        <pointLight position={[10, 10, 10]} intensity={brightness} castShadow />
        <spotLight
          position={[-5, 8, 5]}
          angle={0.3}
          intensity={brightness * 0.8}
          castShadow
        />

        <Grid
          infiniteGrid
          fadeDistance={30}
          sectionSize={1}
          sectionThickness={1.5}
          sectionColor={color}
          cellSize={0.5}
          cellColor="#e2e8f0"
        />

        <Suspense fallback={null}>
          <SceneObject
            shape={shape}
            color={color}
            textureUrl={textureUrl}
            scale={scale}
            rotationSpeed={rotationSpeed}
          />
        </Suspense>

        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.3}
          scale={10 * scale}
          blur={2}
          far={4}
        />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
        />
      </Canvas>
    </div>
  );
});

VoxelCanvas.displayName = "VoxelCanvas";
export default VoxelCanvas;