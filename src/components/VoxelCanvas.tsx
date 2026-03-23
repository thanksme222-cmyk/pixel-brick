"use client";

import {
  useRef,
  useImperativeHandle,
  forwardRef,
  Suspense,
} from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Box,
  Sphere,
  Cylinder,
  ContactShadows,
  Grid,
  Float,
} from "@react-three/drei";
import * as THREE from "three";

export interface VoxelCanvasRef {
  resetCamera: () => void;
}

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

  // ✅ SAFE texture loading (no empty string, no crash)
  const texture = textureUrl
    ? useLoader(THREE.TextureLoader, textureUrl)
    : null;

  // ✅ Correct color space (fix washed-out textures)
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  // ✅ Smooth animation
  useFrame((_, delta) => {
    if (meshRef.current && rotationSpeed > 0) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  const hasTexture = !!texture;

  const materialProps: THREE.MeshStandardMaterialParameters = {
    color: hasTexture ? "#ffffff" : color,
    map: texture || undefined,
    roughness: 0.2,
    metalness: 0.1,
  };

  return (
    <group ref={meshRef}>
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        {shape === "box" && (
          <Box args={[scale, scale, scale]} position={[0, scale / 2, 0]} castShadow>
            <meshStandardMaterial {...materialProps} />
          </Box>
        )}

        {shape === "sphere" && (
          <Sphere args={[scale * 0.6, 48, 48]} position={[0, scale * 0.6, 0]} castShadow>
            <meshStandardMaterial {...materialProps} />
          </Sphere>
        )}

        {shape === "cylinder" && (
          <Cylinder
            args={[0.5 * scale, 0.5 * scale, scale, 32]}
            position={[0, scale / 2, 0]}
            castShadow
          >
            <meshStandardMaterial {...materialProps} />
          </Cylinder>
        )}
      </Float>
    </group>
  );
}

const VoxelCanvas = forwardRef<VoxelCanvasRef, VoxelCanvasProps>(
  (props, ref) => {
    const {
      brightness = 1.5,
      color = "#004643",
      shape = "box",
      textureUrl = null,
      scale = 1,
      rotationSpeed = 0,
    } = props;

    const controlsRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      resetCamera: () => {
        controlsRef.current?.reset();
      },
    }));

    return (
      <div className="h-full w-full min-h-[500px] bg-white">
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          camera={{ position: [5, 5, 5], fov: 45 }}
        >
          {/* Background */}
          <color attach="background" args={["#ffffff"]} />

          {/* Lighting */}
          <ambientLight intensity={brightness * 0.4} />

          <directionalLight
            position={[5, 10, 5]}
            intensity={brightness}
            castShadow
          />

          <pointLight
            position={[10, 10, 10]}
            intensity={brightness * 0.6}
          />

          {/* Grid */}
          <Grid
            infiniteGrid
            sectionColor={color}
            cellColor="#e5e7eb"
            sectionThickness={1.2}
            fadeDistance={40}
          />

          {/* Object */}
          <Suspense fallback={null}>
            <SceneObject
              shape={shape}
              color={color}
              textureUrl={textureUrl}
              scale={scale}
              rotationSpeed={rotationSpeed}
            />
          </Suspense>

          {/* Shadows */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.35}
            scale={15}
            blur={2.5}
            far={4}
          />

          {/* Controls */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      </div>
    );
  }
);

VoxelCanvas.displayName = "VoxelCanvas";
export default VoxelCanvas;