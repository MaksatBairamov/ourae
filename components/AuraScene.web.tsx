import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type AuraSceneProps = {
  color: string;
  energy?: number;
  anxiety?: number;
};

function AuraSphere({ color, energy = 5, anxiety = 3 }: AuraSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const materialColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (!meshRef.current) return;

    const basePulse = 1 + Math.sin(time * 1.25) * 0.04;
    const anxietyShake = anxiety >= 7 ? Math.sin(time * 5.2) * 0.018 : 0;
    const energyLift = (energy - 5) * 0.008;

    meshRef.current.scale.setScalar(basePulse + anxietyShake + energyLift);
    meshRef.current.rotation.y = time * 0.28;
    meshRef.current.rotation.x = Math.sin(time * 0.36) * 0.14;

    if (materialRef.current) {
      materialRef.current.emissiveIntensity =
        0.34 + Math.sin(time * 1.7) * 0.08 + energy * 0.012;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.3, 96, 96]} />
      <meshStandardMaterial
        ref={materialRef}
        color={materialColor}
        emissive={materialColor}
        emissiveIntensity={0.42}
        roughness={0.28}
        metalness={0.12}
        transparent
        opacity={0.94}
      />
    </mesh>
  );
}

function AuraHalo({ color }: { color: string }) {
  const haloRef = useRef<THREE.Mesh>(null);
  const materialColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (!haloRef.current) return;

    haloRef.current.scale.setScalar(1.72 + Math.sin(time * 0.85) * 0.08);
    haloRef.current.rotation.z = time * 0.1;
  });

  return (
    <mesh ref={haloRef}>
      <sphereGeometry args={[1.35, 64, 64]} />
      <meshBasicMaterial
        color={materialColor}
        transparent
        opacity={0.13}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function AuraParticles({
  color,
  anxiety = 3,
}: {
  color: string;
  anxiety?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materialColor = useMemo(() => new THREE.Color(color), [color]);

  const particles = useMemo(() => {
    return Array.from({ length: 22 }, (_, index) => {
      const angle = (index / 22) * Math.PI * 2;
      const radius = 1.85 + (index % 5) * 0.12;

      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.58,
        z: Math.sin(angle * 1.7) * 0.35,
        size: 0.025 + (index % 4) * 0.006,
      };
    });
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const speed = anxiety >= 7 ? 0.22 : 0.12;
    groupRef.current.rotation.z = clock.getElapsedTime() * speed;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.12;
  });

  return (
    <group ref={groupRef}>
      {particles.map((particle, index) => (
        <mesh key={index} position={[particle.x, particle.y, particle.z]}>
          <sphereGeometry args={[particle.size, 16, 16]} />
          <meshBasicMaterial color={materialColor} transparent opacity={0.52} />
        </mesh>
      ))}
    </group>
  );
}

export function AuraScene({ color, energy = 5, anxiety = 3 }: AuraSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.8], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{
        width: "100%",
        height: 330,
        background: "transparent",
      }}
    >
      <ambientLight intensity={1.05} />
      <pointLight position={[3, 3, 4]} intensity={2.8} />
      <pointLight position={[-3, -2, 3]} intensity={1.25} />

      <AuraHalo color={color} />
      <AuraParticles color={color} anxiety={anxiety} />
      <AuraSphere color={color} energy={energy} anxiety={anxiety} />
    </Canvas>
  );
}
