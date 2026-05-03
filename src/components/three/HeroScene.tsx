import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars, Trail } from "@react-three/drei";
import * as THREE from "three";
import { useWebGLSupported } from "@/hooks/use-webgl-supported";

function FloatingOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.8, 4]} />
        <MeshDistortMaterial
          color="#7c3aed"
          attach="material"
          distort={0.35}
          speed={2}
          roughness={0}
          metalness={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

function WireframeOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = -state.clock.elapsedTime * 0.1;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
  });
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[2.2, 2]} />
      <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.15} />
    </mesh>
  );
}

function FloatingRing({ position, speed, color }: { position: [number, number, number]; speed: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * speed;
    meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.7;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[0.6, 0.04, 16, 60]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
    </Float>
  );
}

function FloatingCube({ position, speed }: { position: [number, number, number]; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * speed;
    meshRef.current.rotation.y = state.clock.elapsedTime * speed * 1.3;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const points = useRef<THREE.Points>(null);
  const count = 600;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.02;
    points.current.rotation.x = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#c4b5fd" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function OrbitingDot({ radius, speed, offset, color }: { radius: number; speed: number; offset: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    meshRef.current.position.x = Math.cos(t) * radius;
    meshRef.current.position.y = Math.sin(t * 0.7) * radius * 0.4;
    meshRef.current.position.z = Math.sin(t) * radius * 0.6;
  });
  return (
    <Trail width={0.5} length={6} color={color} attenuation={(t) => t * t}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </Trail>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#7c3aed" />
      <pointLight position={[-5, -3, -3]} intensity={1} color="#3b82f6" />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#ffffff" />

      <Stars radius={60} depth={30} count={1500} factor={3} saturation={0} fade speed={0.5} />
      <ParticleField />

      <FloatingOrb />
      <WireframeOrb />

      <FloatingRing position={[-4, 1.5, -2]} speed={0.3} color="#7c3aed" />
      <FloatingRing position={[4, -1, -1]} speed={0.2} color="#3b82f6" />
      <FloatingRing position={[0, -3.5, 0.5]} speed={0.25} color="#a78bfa" />

      <FloatingCube position={[-3.5, 2.5, 0]} speed={0.4} />
      <FloatingCube position={[3, 3, -1]} speed={0.3} />
      <FloatingCube position={[-2, -3, 1]} speed={0.5} />
      <FloatingCube position={[4, -2.5, 0]} speed={0.35} />

      <OrbitingDot radius={3.2} speed={0.4} offset={0} color="#a78bfa" />
      <OrbitingDot radius={3.2} speed={0.4} offset={Math.PI * 0.66} color="#60a5fa" />
      <OrbitingDot radius={3.2} speed={0.4} offset={Math.PI * 1.33} color="#c4b5fd" />
    </>
  );
}

export default function HeroScene() {
  const webgl = useWebGLSupported();

  if (webgl === null) return null;

  if (!webgl) {
    return (
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/40 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[128px]" />
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 60 }}
      gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      dpr={[1, 2]}
    >
      <Scene />
    </Canvas>
  );
}
