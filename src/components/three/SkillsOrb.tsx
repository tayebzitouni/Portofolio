import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useWebGLSupported } from "@/hooks/use-webgl-supported";

const skills = [
  { label: "C#", position: [2.0, 0.8, 0] as [number, number, number], color: "#a78bfa" },
  { label: ".NET", position: [-2.0, 0.5, 0.5] as [number, number, number], color: "#60a5fa" },
  { label: "SQL", position: [0.5, 2.2, 0] as [number, number, number], color: "#c4b5fd" },
  { label: "API", position: [-0.5, -2.2, 0] as [number, number, number], color: "#818cf8" },
  { label: "Git", position: [1.5, -1.6, 1] as [number, number, number], color: "#a78bfa" },
  { label: "Docker", position: [-1.8, 1.3, -0.5] as [number, number, number], color: "#60a5fa" },
];

function CentralOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 3]} />
        <MeshDistortMaterial
          color="#7c3aed"
          distort={0.3}
          speed={2}
          roughness={0}
          metalness={0.9}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.1} />
      </mesh>
    </Float>
  );
}

function SkillNode({ label, position, color }: { label: string; position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
  });
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.6}>
      <group position={position}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
        <mesh ref={textRef} position={[0, 0.32, 0]}>
          <planeGeometry args={[0.5, 0.22]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </Float>
  );
}

function ConnectionLine({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(0, 0, 0), new THREE.Vector3(...to)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} transparent opacity={0.15} />
    </line>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={2} color="#7c3aed" />
      <pointLight position={[-3, -3, -2]} intensity={1} color="#3b82f6" />
      <CentralOrb />
      {skills.map((s) => (
        <SkillNode key={s.label} label={s.label} position={s.position} color={s.color} />
      ))}
      {skills.map((s) => (
        <ConnectionLine key={`line-${s.label}`} from={[0, 0, 0]} to={s.position} color={s.color} />
      ))}
    </>
  );
}

const SkillFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-40 h-40 rounded-full bg-primary/20 border border-primary/30 animate-pulse" />
  </div>
);

export default function SkillsOrb() {
  const webgl = useWebGLSupported();

  if (webgl === null) return null;
  if (!webgl) return <SkillFallback />;

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 55 }}
      gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}
      style={{ width: "100%", height: "100%" }}
      dpr={[1, 2]}
    >
      <Scene />
    </Canvas>
  );
}
