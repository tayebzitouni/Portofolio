import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Stars, Line } from "@react-three/drei";
import * as THREE from "three";
import { useWebGLSupported } from "@/hooks/use-webgl-supported";
import { ThreeErrorBoundary } from "./ThreeErrorBoundary";

const SPACING = 13;
const CAM_Y = 2.8;

// Reversed: oldest first → newest last (journey from past to present)
const experiences = [
  {
    role: "Scientific Clubs — Active Member",
    company: "Ingenieums & GDG 2024",
    date: "2024",
    location: "Algiers",
    description: "Hackathons, tech workshops, and STEM initiatives. Active contributor in Google Developer Group and Ingenieums club.",
    color: "#f472b6",
    tags: ["GDG", "Hackathons", "STEM", "Workshops"],
  },
  {
    role: "Professional Intern (Stage)",
    company: "Algerie Telecom",
    date: "2024",
    location: "On-site, Algeria",
    description: "Completed a professional internship at Algeria's national telecom operator — gained enterprise-level exposure and real-world network operations experience.",
    color: "#fbbf24",
    tags: ["Enterprise", "Telecom", "On-site", "Algeria"],
  },
  {
    role: "Web Developer Intern",
    company: "ProdigyInfoTech",
    date: "Sep – Oct 2024",
    location: "Remote",
    description: "Developed responsive web pages with HTML, CSS, JavaScript. Hands-on Git experience in a remote collaborative team.",
    color: "#34d399",
    tags: ["HTML", "CSS", "JavaScript", "Git"],
  },
  {
    role: "Help Desk Freelancer",
    company: "Self-Employed",
    date: "Freelance",
    location: "Remote",
    description: "Providing remote IT support, troubleshooting, and helpdesk services for various clients.",
    color: "#60a5fa",
    tags: ["IT Support", "Remote", "Troubleshooting"],
  },
  {
    role: "Freelancer",
    company: "Algemtic",
    date: "Current",
    location: "Remote",
    description: "Developing a custom desktop application integrated directly with specialized hardware controllers for enterprise operations.",
    color: "#818cf8",
    tags: [".NET", "WinForms", "Controllers", "Desktop"],
  },
  {
    role: "Freelance .NET Backend & Desktop Developer",
    company: "Self-Employed",
    date: "2025 – Present",
    location: "Remote",
    description: "Building desktop apps and REST APIs in C#, .NET Core, WinForms/WPF, SQL Server. Clean Architecture, CQRS, JWT auth for multiple clients.",
    color: "#a78bfa",
    tags: [".NET Core", "C#", "SQL Server", "Clean Arch"],
  },
];

const N = experiences.length;

// ─── Camera that follows a continuous float targetT ─────────────────────────
function CameraController({
  targetTRef,
  onActiveChange,
}: {
  targetTRef: React.MutableRefObject<number>;
  onActiveChange: (i: number) => void;
}) {
  const { camera } = useThree();
  const currentT = useRef(0);
  const lastActive = useRef(0);

  useFrame(() => {
    // Smooth follow
    currentT.current += (targetTRef.current - currentT.current) * 0.06;

    const targetZ = 5 - currentT.current * SPACING;
    camera.position.z += (targetZ - camera.position.z) * 0.09;
    camera.position.y += (CAM_Y - camera.position.y) * 0.06;
    camera.position.x += (0 - camera.position.x) * 0.06;
    camera.lookAt(0, 0.5, camera.position.z - 5);

    // Notify active index
    const active = Math.round(Math.min(Math.max(currentT.current, 0), N - 1));
    if (active !== lastActive.current) {
      lastActive.current = active;
      onActiveChange(active);
    }
  });

  return null;
}

// ─── Road ────────────────────────────────────────────────────────────────────
function Road({ roadLength }: { roadLength: number }) {
  const leftEdge = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let z = 7; z >= -(roadLength + 4); z -= 1)
      pts.push(new THREE.Vector3(-2.2, 0.02, z));
    return pts;
  }, [roadLength]);

  const rightEdge = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let z = 7; z >= -(roadLength + 4); z -= 1)
      pts.push(new THREE.Vector3(2.2, 0.02, z));
    return pts;
  }, [roadLength]);

  const dashCount = Math.floor((roadLength + 10) / 2.5);

  return (
    <>
      <Line points={leftEdge} color="#7c3aed" lineWidth={2} transparent opacity={0.7} />
      <Line points={rightEdge} color="#7c3aed" lineWidth={2} transparent opacity={0.7} />
      {Array.from({ length: dashCount }).map((_, i) => {
        const z = 6 - i * 2.5;
        return (
          <Line
            key={i}
            points={[new THREE.Vector3(0, 0.02, z), new THREE.Vector3(0, 0.02, z - 1.2)]}
            color="#a78bfa"
            lineWidth={1}
            transparent
            opacity={0.22}
          />
        );
      })}
    </>
  );
}

// ─── Grid floor ──────────────────────────────────────────────────────────────
function GridFloor({ roadLength }: { roadLength: number }) {
  const lines = useMemo(() => {
    const result: Array<{ x1: number; x2: number; z1: number; z2: number }> = [];
    const gridW = 30;
    const step = 2;
    for (let x = -gridW / 2; x <= gridW / 2; x += step)
      result.push({ x1: x, x2: x, z1: 7, z2: -(roadLength + 4) });
    for (let z = 7; z >= -(roadLength + 4); z -= step)
      result.push({ x1: -gridW / 2, x2: gridW / 2, z1: z, z2: z });
    return result;
  }, [roadLength]);

  return (
    <>
      {lines.map((l, i) => (
        <Line
          key={i}
          points={[new THREE.Vector3(l.x1, -0.01, l.z1), new THREE.Vector3(l.x2, -0.01, l.z2)]}
          color="#1e0e40"
          lineWidth={0.5}
          transparent
          opacity={0.45}
        />
      ))}
    </>
  );
}

// ─── Pulsing node sphere ──────────────────────────────────────────────────────
function NodeSphere({ color, isActive, isPast }: { color: string; isActive: boolean; isPast: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const pulse = isActive ? Math.sin(state.clock.elapsedTime * 3) * 0.12 + 1.12 : 1;
    meshRef.current.scale.setScalar(pulse);
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.28, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isActive ? 2.5 : isPast ? 0.6 : 0.15}
        roughness={0}
        metalness={0.8}
      />
    </mesh>
  );
}

// ─── Single experience milestone ──────────────────────────────────────────────
function ExperienceNode({
  experience,
  index,
  isActive,
  isPast,
}: {
  experience: (typeof experiences)[0];
  index: number;
  isActive: boolean;
  isPast: boolean;
}) {
  const z = -index * SPACING;
  const side = index % 2 === 0 ? -1 : 1;
  const nodePos: [number, number, number] = [side * 2.6, 0.4, z];
  const cardX = side * 6.8;

  return (
    <group>
      <group position={nodePos}>
        <NodeSphere color={experience.color} isActive={isActive} isPast={isPast} />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.46, 0.025, 8, 48]} />
          <meshStandardMaterial
            color={experience.color}
            emissive={experience.color}
            emissiveIntensity={isActive ? 4 : 0.2}
            transparent
            opacity={isActive ? 1 : 0.18}
          />
        </mesh>
      </group>

      <Line
        points={[new THREE.Vector3(side * 2.2, 0.4, z), new THREE.Vector3(side * 2.6, 0.4, z)]}
        color={experience.color}
        lineWidth={1.5}
        transparent
        opacity={isActive ? 0.9 : 0.25}
      />
      <Line
        points={[new THREE.Vector3(side * 2.6, 0, z), new THREE.Vector3(side * 2.6, 0.4, z)]}
        color={experience.color}
        lineWidth={1}
        transparent
        opacity={isActive ? 0.5 : 0.12}
      />

      <Html
        transform
        occlude={false}
        position={[cardX, 0.8, z]}
        rotation={[0, -side * 0.18, 0]}
        style={{ width: 270, pointerEvents: "none" }}
        distanceFactor={9}
        zIndexRange={[0, 10]}
      >
        <div
          style={{
            width: 270,
            background: isActive
              ? "linear-gradient(135deg, rgba(15,8,35,0.97) 0%, rgba(25,10,50,0.95) 100%)"
              : "rgba(8,4,20,0.7)",
            border: `1px solid ${isActive ? experience.color + "bb" : "rgba(90,60,150,0.2)"}`,
            borderRadius: 14,
            padding: "16px 18px",
            fontFamily: "'Space Grotesk', Inter, sans-serif",
            boxShadow: isActive ? `0 0 40px ${experience.color}30, inset 0 0 20px rgba(0,0,0,0.5)` : "none",
            backdropFilter: "blur(16px)",
          }}
        >
          <div style={{ fontSize: 9.5, color: experience.color, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 5, opacity: 0.9 }}>
            {experience.date} · {experience.location}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? "#ffffff" : "#a090c0", lineHeight: 1.35, marginBottom: 3 }}>
            {experience.role}
          </div>
          <div style={{ fontSize: 12, color: experience.color, fontWeight: 600, marginBottom: isActive ? 12 : 0 }}>
            {experience.company}
          </div>
          {isActive && (
            <>
              <div style={{ height: 1, background: `linear-gradient(to right, ${experience.color}55, transparent)`, marginBottom: 10 }} />
              <div style={{ fontSize: 11.5, color: "#c5b0e0", lineHeight: 1.65, marginBottom: 12 }}>
                {experience.description}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {experience.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 10, background: `${experience.color}18`, border: `1px solid ${experience.color}50`, color: experience.color, padding: "2px 9px", borderRadius: 100, fontWeight: 600 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}

// ─── Floating particles ───────────────────────────────────────────────────────
function FloatingParticles({ roadLength }: { roadLength: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 280;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = Math.random() * 10 + 0.2;
      arr[i * 3 + 2] = -(Math.random() * (roadLength + 8));
    }
    return arr;
  }, [roadLength]);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.03) * 0.03;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#c4b5fd" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// ─── Full 3D scene ────────────────────────────────────────────────────────────
function Scene({
  targetTRef,
  onActiveChange,
}: {
  targetTRef: React.MutableRefObject<number>;
  onActiveChange: (i: number) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const roadLength = (N - 1) * SPACING + 10;

  const handleActive = useCallback(
    (i: number) => {
      setActiveIndex(i);
      onActiveChange(i);
    },
    [onActiveChange]
  );

  return (
    <>
      <color attach="background" args={["#040211"]} />
      <fog attach="fog" args={["#040211", 18, 60]} />
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 6, 5]} intensity={3} color="#7c3aed" />
      <pointLight position={[0, 4, -(roadLength / 2)]} intensity={1.5} color="#3b82f6" />
      <Stars radius={90} depth={60} count={2500} factor={3} saturation={0} fade speed={0.2} />
      <FloatingParticles roadLength={roadLength} />
      <GridFloor roadLength={roadLength} />
      <Road roadLength={roadLength} />
      {experiences.map((exp, i) => (
        <ExperienceNode
          key={i}
          experience={exp}
          index={i}
          isActive={i === activeIndex}
          isPast={i < activeIndex}
        />
      ))}
      <CameraController targetTRef={targetTRef} onActiveChange={handleActive} />
    </>
  );
}

function ExperienceFallback() {
  return <div style={{ padding: "40px 0", color: "#9090a0", textAlign: "center" }}>3D scene unavailable.</div>;
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ExperienceScene() {
  const webgl = useWebGLSupported();
  const containerRef = useRef<HTMLDivElement>(null);

  // Continuous target T controlled by mouse X position
  const targetTRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleActiveChange = useCallback((i: number) => setActiveIndex(i), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        targetTRef.current = Math.min(targetTRef.current + 1, N - 1);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        targetTRef.current = Math.max(targetTRef.current - 1, 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (webgl === null) return null;
  if (!webgl) return <ExperienceFallback />;

  const exp = experiences[activeIndex];

  return (
    <div
      ref={containerRef}
      data-testid="experience-3d-scene"
      style={{ position: "relative", width: "100%", height: "100%", cursor: "crosshair" }}
    >
      <ThreeErrorBoundary fallback={<ExperienceFallback />}>
        <Canvas
          camera={{ position: [0, CAM_Y, 5], fov: 65, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false, failIfMajorPerformanceCaveat: false }}
          style={{ width: "100%", height: "100%" }}
          dpr={[1, 1.5]}
        >
          <Scene targetTRef={targetTRef} onActiveChange={handleActiveChange} />
        </Canvas>
      </ThreeErrorBoundary>

      {/* Transparent overlay — sits above Canvas to reliably capture mouse movement */}
      <div
        style={{ position: "absolute", inset: 0, zIndex: 5, cursor: "crosshair" }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          targetTRef.current = x * (N - 1);
        }}
      />

      {/* Progress dots */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          zIndex: 20,
        }}
      >
        {experiences.map((e, i) => (
          <button
            key={i}
            onClick={() => { targetTRef.current = i; }}
            data-testid={`button-exp-dot-${i}`}
            title={e.company}
            style={{
              width: i === activeIndex ? 22 : 8,
              height: 8,
              borderRadius: 100,
              background: i === activeIndex ? e.color : i < activeIndex ? "rgba(167,139,250,0.4)" : "rgba(50,30,100,0.55)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Active label top-left */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 24,
          zIndex: 20,
          fontFamily: "'Space Grotesk', sans-serif",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: 10, color: exp.color, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>
          {activeIndex + 1} / {N}
        </div>
        <div style={{ fontSize: 13, color: "#e2d9ff", fontWeight: 700 }}>{exp.company}</div>
      </div>

      {/* Hint */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          fontSize: 10.5,
          color: "#4a3070",
          fontFamily: "'Space Grotesk', sans-serif",
          background: "rgba(5,2,15,0.7)",
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid rgba(80,50,140,0.25)",
          backdropFilter: "blur(6px)",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        Move mouse left / right · Arrow keys · Click dots
      </div>

      {/* Timeline label */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 24,
          right: 24,
          display: "flex",
          justifyContent: "space-between",
          zIndex: 20,
          pointerEvents: "none",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 9.5,
          color: "#3d2a6a",
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        <span>← Oldest</span>
        <span>Newest →</span>
      </div>
    </div>
  );
}
