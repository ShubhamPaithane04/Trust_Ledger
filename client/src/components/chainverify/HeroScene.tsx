import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef, useMemo } from "react";
import type { Mesh } from "three";

function Hex({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.x += dt * 0.15;
    ref.current.rotation.y += dt * 0.25;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref} position={position} scale={scale}>
        <cylinderGeometry args={[1, 1, 0.3, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.12}
          metalness={0.35}
          roughness={0.6}
          wireframe={false}
        />
      </mesh>
      <mesh position={position} scale={scale * 1.02}>
        <cylinderGeometry args={[1, 1, 0.32, 6]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.2} />
      </mesh>
    </Float>
  );
}

function Nodes() {
  const hexes = useMemo(() => {
    const palette = ["#2E5D54", "#B5562B", "#D08A3E", "#1C1814"];
    const arr: { position: [number, number, number]; color: string; scale: number }[] = [];
    for (let i = 0; i < 14; i++) {
      arr.push({
        position: [
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6 - 2,
        ],
        color: palette[i % palette.length],
        scale: Math.random() * 0.6 + 0.4,
      });
    }
    return arr;
  }, []);
  return (
    <>
      {hexes.map((h, i) => (
        <Hex key={i} {...h} />
      ))}
    </>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.0} color="#FFE3B8" />
      <pointLight position={[-10, -8, 4]} intensity={0.7} color="#B5562B" />
      <Nodes />
    </Canvas>
  );
}