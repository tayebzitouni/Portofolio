import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject, PointerEvent, ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Html, Line, Stars } from "@react-three/drei";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, MessageCircle, Send, X } from "lucide-react";
import * as THREE from "three";
import { ThreeErrorBoundary } from "./ThreeErrorBoundary";
import { useWebGLSupported } from "@/hooks/use-webgl-supported";

type Phase = "intro" | "world";
type Facing = "north" | "south" | "east" | "west";

type Rect = {
  id: string;
  x1: number;
  x2: number;
  z1: number;
  z2: number;
  color: string;
  accent?: string;
};

type RoomId = "about" | "experience" | "projects" | "skills" | "education" | "contact";

type Room = Rect & {
  id: RoomId;
  name: string;
  kicker: string;
  story: string;
  chips: string[];
};

type PlayerState = {
  x: number;
  z: number;
  facing: Facing;
};

type MoveInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

type DetailItem = {
  title: string;
  eyebrow: string;
  body: string;
  meta: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const PLAYER_Y = 1.65;
const MOVE_SPEED = 7;
const WORLD_BOUNDS = {
  x1: -26,
  x2: 26,
  z1: -58,
  z2: 44,
};

const GUIDE_POSITION = new THREE.Vector3(20, 0, 34);
const GUIDE_INTERACT_DISTANCE = 7;

const PROFILE = {
  name: "Tayeb Zitouni",
  role: "Software Engineer / .NET Developer",
  location: "Algiers, Algeria",
};

const INTRO_STATS = [
  ["3+", "Years building"],
  ["10+", "Projects shipped"],
  ["15K+", "YouTube audience"],
  ["3", "Markets served"],
] as const;

const WALKABLES: Rect[] = [
  { id: "main-axis", x1: -2.2, x2: 2.2, z1: -12, z2: 12, color: "#0b1220" },
  { id: "north-lane", x1: -2.2, x2: 2.2, z1: 12, z2: 24, color: "#0b1220" },
  { id: "south-lane", x1: -2.2, x2: 2.2, z1: -38, z2: -12, color: "#0b1220" },
  { id: "about-link", x1: -14, x2: -2.2, z1: 6, z2: 10, color: "#111827" },
  { id: "projects-link", x1: -14, x2: -2.2, z1: -10, z2: -6, color: "#111827" },
  { id: "experience-link", x1: 2.2, x2: 12, z1: -2, z2: 2, color: "#111827" },
  { id: "skills-link", x1: 2.2, x2: 12, z1: -18, z2: -14, color: "#111827" },
];

const ROOMS: Room[] = [
  {
    id: "about",
    name: "Origin",
    kicker: "Who I am",
    x1: -22,
    x2: -14,
    z1: 1,
    z2: 15,
    color: "#ff7a18",
    accent: "#ffd166",
    story: "The room of identity, ambition, and the systems-thinking behind the code.",
    chips: ["Builder", "Teacher", "Freelancer"],
  },
  {
    id: "experience",
    name: "Timeline",
    kicker: "What I shipped",
    x1: 12,
    x2: 22,
    z1: -7,
    z2: 7,
    color: "#5eead4",
    accent: "#99f6e4",
    story: "A moving timeline where practical delivery matters more than decorative titles.",
    chips: ["Clients", "Systems", "Execution"],
  },
  {
    id: "projects",
    name: "Lab",
    kicker: "Selected builds",
    x1: -22,
    x2: -14,
    z1: -17,
    z2: -3,
    color: "#38bdf8",
    accent: "#bae6fd",
    story: "An experimental chamber where products feel like objects you can walk around.",
    chips: ["Apps", "APIs", "Desktop"],
  },
  {
    id: "skills",
    name: "Stack",
    kicker: "Tools and patterns",
    x1: 12,
    x2: 22,
    z1: -25,
    z2: -11,
    color: "#a3e635",
    accent: "#d9f99d",
    story: "A room built like a technical solar system around architecture and delivery.",
    chips: [".NET", "Architecture", "Databases"],
  },
  {
    id: "education",
    name: "Signals",
    kicker: "Learning and awards",
    x1: -8,
    x2: 8,
    z1: 24,
    z2: 38,
    color: "#f472b6",
    accent: "#fbcfe8",
    story: "A memory chamber shaped by study, contests, scholarships, and momentum.",
    chips: ["Study", "Awards", "Competitions"],
  },
  {
    id: "contact",
    name: "Dock",
    kicker: "Let's build",
    x1: -8,
    x2: 8,
    z1: -52,
    z2: -38,
    color: "#fb7185",
    accent: "#fecdd3",
    story: "The last chamber opens into collaboration, remote work, and new opportunities.",
    chips: ["Remote", "Available", "Contact"],
  },
] as const;

const ABOUT_COPY = [
  "21-year-old computer science student and freelance software engineer focused on the .NET ecosystem.",
  "Building for clients across Algeria, Morocco, and Saudi Arabia while growing with product discipline and execution.",
] as const;

const EXPERIENCE_ITEMS = [
  ["2025 - Present", "Freelance .NET backend and desktop developer"],
  ["2023 - Present", "Software engineering student at the Higher School of Computer Science"],
  ["2024", "Administrative app builder for document automation and internal workflows"],
] as const;

const PROJECT_ITEMS = [
  "HR and administration desktop suite",
  "Freelance client API platforms",
  "Educational creator ecosystem",
  "Hackathon and club prototypes",
] as const;

const SKILLS_GROUPS = [
  ["Languages", "C#, C++, JavaScript, Java, Pascal"],
  ["Frameworks", ".NET Core, ASP.NET Core, Entity Framework, SignalR"],
  ["Architecture", "Clean Architecture, CQRS, SOLID, REST API, JWT Auth"],
  ["Tools", "SQL Server, SQLite, Git, Docker, Visual Studio, VS Code"],
] as const;

const EDUCATION_ITEMS = [
  "3rd year Computer Science / Higher School of Computer Science, Algiers",
  "Higher School of Computer Science / Sidi Bel Abbes",
  "Baccalaureate in Experimental Sciences / 18.17 out of 20",
  "15K+ YouTube subscribers with educational content",
] as const;

const CONTACT_ITEMS = [
  ["Email", "tayebzitouni1122111@gmail.com"],
  ["Phone", "+213 554 917 545"],
  ["GitHub", "github.com/tayebzitouni"],
  ["LinkedIn", "linkedin.com/in/tayeb-zitouni"],
] as const;

const ROOM_DETAILS: Record<RoomId, DetailItem[]> = {
  about: [
    {
      title: "Freelance engineer",
      eyebrow: "Profile",
      body: "Builds desktop applications, backend services, and workflow tools with a focus on clear structure and real client outcomes.",
      meta: "C# / .NET / SQL Server",
    },
    {
      title: "Content creator",
      eyebrow: "Audience",
      body: "Runs educational content for BAC students and turns complex ideas into material people can actually understand and use.",
      meta: "15K+ subscribers",
    },
    {
      title: "Product mindset",
      eyebrow: "Approach",
      body: "Balances technical decisions with usability, maintainability, and delivery speed instead of treating code as an isolated artifact.",
      meta: "Architecture / clarity / execution",
    },
  ],
  experience: EXPERIENCE_ITEMS.map(([date, title]) => ({
    title,
    eyebrow: date,
    body: "A practical stage in the portfolio story, focused on learning by shipping systems and solving operational problems.",
    meta: "Delivery record",
  })),
  projects: PROJECT_ITEMS.map((title, index) => ({
    title,
    eyebrow: `Project ${index + 1}`,
    body: "A selected build that represents applied engineering, client thinking, and the ability to turn requirements into working software.",
    meta: "Selected work",
  })),
  skills: SKILLS_GROUPS.map(([title, body]) => ({
    title,
    eyebrow: "Technical stack",
    body,
    meta: "Core toolkit",
  })),
  education: EDUCATION_ITEMS.map((title, index) => ({
    title,
    eyebrow: `Signal ${String(index + 1).padStart(2, "0")}`,
    body: "A learning milestone that adds context to the engineering journey, competitive mindset, and long-term growth.",
    meta: "Education and growth",
  })),
  contact: CONTACT_ITEMS.map(([title, body]) => ({
    title,
    eyebrow: "Contact",
    body,
    meta: "Open channel",
  })),
};

function rectContains(rect: Rect, x: number, z: number) {
  return x >= rect.x1 && x <= rect.x2 && z >= rect.z1 && z <= rect.z2;
}

function isWalkable(x: number, z: number) {
  return x >= WORLD_BOUNDS.x1 && x <= WORLD_BOUNDS.x2 && z >= WORLD_BOUNDS.z1 && z <= WORLD_BOUNDS.z2;
}

function getRoomAt(x: number, z: number) {
  return ROOMS.find((room) => rectContains(room, x, z)) ?? null;
}

function getRoomCenter(room: Room) {
  return new THREE.Vector3((room.x1 + room.x2) / 2, 0, (room.z1 + room.z2) / 2);
}

function getFacingVector(facing: Facing) {
  switch (facing) {
    case "north":
      return new THREE.Vector3(0, 0, -1);
    case "south":
      return new THREE.Vector3(0, 0, 1);
    case "east":
      return new THREE.Vector3(1, 0, 0);
    case "west":
      return new THREE.Vector3(-1, 0, 0);
  }
}

function turnLeft(facing: Facing): Facing {
  switch (facing) {
    case "north":
      return "west";
    case "west":
      return "south";
    case "south":
      return "east";
    case "east":
      return "north";
  }
}

function turnRight(facing: Facing): Facing {
  switch (facing) {
    case "north":
      return "east";
    case "east":
      return "south";
    case "south":
      return "west";
    case "west":
      return "north";
  }
}

function IntroStructures() {
  const coreRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!coreRef.current) return;
    coreRef.current.rotation.y = state.clock.elapsedTime * 0.24;
    coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.14;
    coreRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.24;
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 2, 4]} intensity={14} color="#ffd166" />
      <pointLight position={[4, 1, -2]} intensity={10} color="#38bdf8" />
      <pointLight position={[-4, -1, -2]} intensity={10} color="#fb7185" />
      <fog attach="fog" args={["#05070c", 8, 25]} />
      <Stars radius={40} depth={14} count={1000} factor={2.6} saturation={0} fade speed={0.8} />

      <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8.6, 64]} />
        <meshStandardMaterial color="#09111b" />
      </mesh>
      <mesh position={[0, -2.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.1, 4.9, 100]} />
        <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={2.2} transparent opacity={0.6} />
      </mesh>

      <group ref={coreRef} position={[0, 0.35, 0]}>
        <mesh>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial color="#fff3d4" emissive="#ff7a18" emissiveIntensity={1.7} metalness={0.75} roughness={0.16} />
        </mesh>
        <mesh scale={1.7}>
          <torusGeometry args={[1.42, 0.05, 24, 180]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.8} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.35}>
          <torusGeometry args={[1.92, 0.032, 24, 180]} />
          <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={2.5} transparent opacity={0.82} />
        </mesh>
      </group>

      {[
        [-4.2, -0.5, -2],
        [4.2, -0.3, -2],
        [-2.8, 1.4, -4],
        [2.8, 1.6, -4],
      ].map((position, index) => (
        <Float key={index} speed={1.8 + index * 0.2} rotationIntensity={0.5} floatIntensity={0.8}>
          <mesh position={position as [number, number, number]} rotation={[0.2, 0.4, 0]}>
            <boxGeometry args={[0.64, 3.4, 0.64]} />
            <meshStandardMaterial color="#0f172a" emissive={index % 2 === 0 ? "#38bdf8" : "#fb7185"} emissiveIntensity={0.58} metalness={0.44} roughness={0.28} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === "Enter") onStart();
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onStart]);

  return (
    <div
      className="atlas-intro"
      onClick={onStart}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onStart();
      }}
      role="button"
      tabIndex={0}
      aria-label="Enter the 3D portfolio"
    >
      <div className="atlas-intro__scene">
        <Canvas camera={{ position: [0, 0.5, 8.5], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
          <IntroStructures />
        </Canvas>
      </div>
      <div className="atlas-intro__halo atlas-intro__halo--left" />
      <div className="atlas-intro__halo atlas-intro__halo--right" />
      <div className="atlas-intro__grid" />

      <div className="atlas-intro__content">
        <div className="atlas-badge atlas-intro__badge">
          <span className="atlas-badge__dot" />
          Spatial portfolio / full 3D
        </div>

        <main className="atlas-intro__hero">
          <p className="atlas-intro__eyebrow">Software engineer / .NET developer / interactive portfolio</p>
          <h1 className="atlas-intro__title atlas-intro__title--massive">
            <span>Tayeb</span>
            <span>Zitouni</span>
          </h1>
          <p className="atlas-intro__copy atlas-intro__copy--hero">
            I build software systems, desktop applications, and backend tools with C#, .NET, and SQL Server. Step inside my 3D world to explore the projects, skills, and story behind the work.
          </p>
          <div className="atlas-start-cue">
            <kbd>Enter</kbd>
            <span>Start discovering the profile</span>
          </div>
        </main>

        <div className="atlas-intro__footer">
          <div className="atlas-intro__identity-name">
            <strong>{PROFILE.name}</strong>
            <span>{PROFILE.role}</span>
          </div>
          <div className="atlas-intro__stats atlas-intro__stats--row">
            {INTRO_STATS.map(([value, label]) => (
              <div key={label} className="atlas-stat">
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="atlas-intro__cta atlas-intro__cta--center">
            <span>Press Enter or click to enter the 3D world</span>
            <small>Then use right or left to turn, and up to move forward</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParticleCloud() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(1300 * 3);
    for (let i = 0; i < 1300; i += 1) {
      array[i * 3] = (Math.random() - 0.5) * 80;
      array[i * 3 + 1] = Math.random() * 12 - 1.5;
      array[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    return array;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#fff8e7" size={0.035} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function FloorRect({ rect }: { rect: Rect }) {
  const width = rect.x2 - rect.x1;
  const depth = rect.z2 - rect.z1;
  const centerX = (rect.x1 + rect.x2) / 2;
  const centerZ = (rect.z1 + rect.z2) / 2;
  const color = rect.color;
  const edge = rect.accent ?? rect.color;

  return (
    <group>
      <mesh position={[centerX, 0, centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#08101b" />
      </mesh>
      <mesh position={[centerX, 0.01, centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width - 0.2, depth - 0.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.42} transparent opacity={0.1} />
      </mesh>
      <Line points={[[rect.x1, 0.02, rect.z1], [rect.x2, 0.02, rect.z1], [rect.x2, 0.02, rect.z2], [rect.x1, 0.02, rect.z2], [rect.x1, 0.02, rect.z1]]} color={edge} lineWidth={1.2} transparent opacity={0.7} />
    </group>
  );
}

function WallBox({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#101828" emissive={color} emissiveIntensity={0.18} metalness={0.18} roughness={0.75} />
    </mesh>
  );
}

function MazeArchitecture() {
  const walls: Array<{ position: [number, number, number]; size: [number, number, number]; color: string }> = [
    { position: [-2.5, 1.7, 0], size: [0.5, 3.4, 24], color: "#5eead4" },
    { position: [2.5, 1.7, 0], size: [0.5, 3.4, 24], color: "#5eead4" },
    { position: [-16.5, 1.7, 8], size: [0.5, 3.4, 14], color: "#ff7a18" },
    { position: [-19.5, 1.7, 15.3], size: [6, 3.4, 0.5], color: "#ff7a18" },
    { position: [-19.5, 1.7, 0.7], size: [6, 3.4, 0.5], color: "#ff7a18" },
    { position: [-13.7, 1.7, 3.2], size: [0.5, 3.4, 4.2], color: "#ff7a18" },
    { position: [-13.7, 1.7, 12.8], size: [0.5, 3.4, 4.2], color: "#ff7a18" },
    { position: [-16.5, 1.7, -10], size: [0.5, 3.4, 14], color: "#38bdf8" },
    { position: [-19.5, 1.7, -17.3], size: [6, 3.4, 0.5], color: "#38bdf8" },
    { position: [-19.5, 1.7, -2.7], size: [6, 3.4, 0.5], color: "#38bdf8" },
    { position: [-13.7, 1.7, -13], size: [0.5, 3.4, 4.6], color: "#38bdf8" },
    { position: [-13.7, 1.7, -6.8], size: [0.5, 3.4, 4.6], color: "#38bdf8" },
    { position: [16.9, 1.7, 0], size: [0.5, 3.4, 14], color: "#5eead4" },
    { position: [11.7, 1.7, -4.9], size: [0.5, 3.4, 4], color: "#5eead4" },
    { position: [11.7, 1.7, 4.9], size: [0.5, 3.4, 4], color: "#5eead4" },
    { position: [17, 1.7, 7.3], size: [10, 3.4, 0.5], color: "#5eead4" },
    { position: [17, 1.7, -7.3], size: [10, 3.4, 0.5], color: "#5eead4" },
    { position: [16.9, 1.7, -18], size: [0.5, 3.4, 14], color: "#a3e635" },
    { position: [11.7, 1.7, -22.8], size: [0.5, 3.4, 4.6], color: "#a3e635" },
    { position: [11.7, 1.7, -13.2], size: [0.5, 3.4, 4.6], color: "#a3e635" },
    { position: [17, 1.7, -10.7], size: [10, 3.4, 0.5], color: "#a3e635" },
    { position: [17, 1.7, -25.3], size: [10, 3.4, 0.5], color: "#a3e635" },
    { position: [-8.3, 1.7, 31], size: [0.5, 3.4, 14], color: "#f472b6" },
    { position: [8.3, 1.7, 31], size: [0.5, 3.4, 14], color: "#f472b6" },
    { position: [-5.2, 1.7, 23.7], size: [6.1, 3.4, 0.5], color: "#f472b6" },
    { position: [5.2, 1.7, 23.7], size: [6.1, 3.4, 0.5], color: "#f472b6" },
    { position: [0, 1.7, 38.3], size: [16.6, 3.4, 0.5], color: "#f472b6" },
    { position: [-8.3, 1.7, -45], size: [0.5, 3.4, 14], color: "#fb7185" },
    { position: [8.3, 1.7, -45], size: [0.5, 3.4, 14], color: "#fb7185" },
    { position: [0, 1.7, -52.3], size: [16.6, 3.4, 0.5], color: "#fb7185" },
    { position: [-5.2, 1.7, -37.7], size: [6.1, 3.4, 0.5], color: "#fb7185" },
    { position: [5.2, 1.7, -37.7], size: [6.1, 3.4, 0.5], color: "#fb7185" },
  ];

  return (
    <group>
      <mesh position={[0, -0.01, -7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 140]} />
        <meshStandardMaterial color="#04070f" />
      </mesh>
      {[...WALKABLES, ...ROOMS].map((rect) => (
        <FloorRect key={rect.id} rect={rect} />
      ))}
      {walls.map((wall, index) => (
        <WallBox key={index} position={wall.position} size={wall.size} color={wall.color} />
      ))}
      <gridHelper args={[120, 96, "#162033" as unknown as THREE.Color, "#0c1220" as unknown as THREE.Color]} position={[0, 0.001, -7]} />
    </group>
  );
}

function RoomBeacon({ room }: { room: Room }) {
  const center = getRoomCenter(room);
  return (
    <group position={[center.x, 0, center.z]}>
      <Float speed={1.8} rotationIntensity={0.18} floatIntensity={0.7}>
        <mesh position={[0, 2.7, 0]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color={room.accent} emissive={room.color} emissiveIntensity={2.1} />
        </mesh>
      </Float>
      <Html position={[0, 4.2, 0]} center style={{ pointerEvents: "none" }}>
        <div className="atlas-portal-label" style={{ borderColor: `${room.color}66`, color: room.accent }}>
          {room.name}
        </div>
      </Html>
    </group>
  );
}

function GuideAgent({ speech, isNear }: { speech: string; isNear: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const pulse = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(pulse * 0.42) * 0.08;
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(pulse * 0.62) * 0.1;
      headRef.current.rotation.x = Math.sin(pulse * 0.38) * 0.035;
    }
  });

  return (
    <group position={[GUIDE_POSITION.x, 0, GUIDE_POSITION.z]}>
      <pointLight position={[0, 2.8, 0]} color="#ffd166" intensity={isNear ? 2.2 : 1.1} distance={10} />

      <mesh position={[0, 0.08, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.65, 48]} />
        <meshStandardMaterial color="#101620" emissive="#38bdf8" emissiveIntensity={0.13} roughness={0.62} />
      </mesh>

      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[2.7, 0.28, 1.45]} />
        <meshStandardMaterial color="#121826" emissive="#38bdf8" emissiveIntensity={0.18} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.92, 0.56]}>
        <boxGeometry args={[2.9, 1.15, 0.22]} />
        <meshStandardMaterial color="#0b1020" emissive="#38bdf8" emissiveIntensity={0.12} roughness={0.74} />
      </mesh>
      <mesh position={[-1.12, 0.28, 0]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.08, 0.08, 0.58, 16]} />
        <meshStandardMaterial color="#0a0f1c" metalness={0.45} roughness={0.32} />
      </mesh>
      <mesh position={[1.12, 0.28, 0]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.08, 0.08, 0.58, 16]} />
        <meshStandardMaterial color="#0a0f1c" metalness={0.45} roughness={0.32} />
      </mesh>

      <group ref={groupRef} position={[0, 0.72, -0.1]}>
        <group ref={headRef} position={[0, 1.34, 0.02]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.36, 40, 32]} />
            <meshStandardMaterial color="#f2c9a4" roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.2, -0.04]} scale={[1.06, 0.54, 0.88]}>
            <sphereGeometry args={[0.36, 40, 20]} />
            <meshStandardMaterial color="#18120f" roughness={0.72} />
          </mesh>
          <mesh position={[-0.29, 0.03, 0.04]}>
            <sphereGeometry args={[0.075, 18, 14]} />
            <meshStandardMaterial color="#f2c9a4" roughness={0.48} />
          </mesh>
          <mesh position={[0.29, 0.03, 0.04]}>
            <sphereGeometry args={[0.075, 18, 14]} />
            <meshStandardMaterial color="#f2c9a4" roughness={0.48} />
          </mesh>
          <mesh position={[-0.12, 0.02, 0.32]}>
            <sphereGeometry args={[0.032, 16, 12]} />
            <meshStandardMaterial color="#08111f" roughness={0.2} />
          </mesh>
          <mesh position={[0.12, 0.02, 0.32]}>
            <sphereGeometry args={[0.032, 16, 12]} />
            <meshStandardMaterial color="#08111f" roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.08, 0.35]} scale={[0.9, 0.34, 0.16]}>
            <sphereGeometry args={[0.05, 16, 10]} />
            <meshStandardMaterial color="#d18b72" roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.19, 0.31]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.015, 0.18, 6, 10]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.4} />
          </mesh>
        </group>

        <mesh position={[0, 0.92, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 0.24, 24]} />
          <meshStandardMaterial color="#efc5a1" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.49, 0]} scale={[0.78, 1, 0.5]}>
          <capsuleGeometry args={[0.36, 0.72, 10, 24]} />
          <meshStandardMaterial color="#172033" emissive="#38bdf8" emissiveIntensity={0.08} roughness={0.46} />
        </mesh>
        <mesh position={[0, 0.6, 0.27]} scale={[0.44, 0.82, 0.08]}>
          <capsuleGeometry args={[0.2, 0.48, 8, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.34} />
        </mesh>
        <mesh position={[0, 0.45, 0.36]} rotation={[0, 0, 0.78]}>
          <boxGeometry args={[0.07, 0.78, 0.04]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#38bdf8" emissiveIntensity={0.2} roughness={0.3} />
        </mesh>

        <mesh position={[-0.45, 0.48, 0.08]} rotation={[0.16, 0, 0.72]}>
          <capsuleGeometry args={[0.09, 0.56, 8, 16]} />
          <meshStandardMaterial color="#172033" roughness={0.42} />
        </mesh>
        <mesh position={[0.45, 0.48, 0.08]} rotation={[0.16, 0, -0.72]}>
          <capsuleGeometry args={[0.09, 0.56, 8, 16]} />
          <meshStandardMaterial color="#172033" roughness={0.42} />
        </mesh>
        <mesh position={[-0.67, 0.22, 0.32]} rotation={[1.05, 0, 0.35]}>
          <capsuleGeometry args={[0.075, 0.38, 8, 14]} />
          <meshStandardMaterial color="#f2c9a4" roughness={0.44} />
        </mesh>
        <mesh position={[0.67, 0.22, 0.32]} rotation={[1.05, 0, -0.35]}>
          <capsuleGeometry args={[0.075, 0.38, 8, 14]} />
          <meshStandardMaterial color="#f2c9a4" roughness={0.44} />
        </mesh>
        <mesh position={[-0.7, -0.08, 0.38]} rotation={[1.22, 0, 0.18]}>
          <sphereGeometry args={[0.105, 18, 14]} />
          <meshStandardMaterial color="#f2c9a4" roughness={0.42} />
        </mesh>
        <mesh position={[0.7, -0.08, 0.38]} rotation={[1.22, 0, -0.18]}>
          <sphereGeometry args={[0.105, 18, 14]} />
          <meshStandardMaterial color="#f2c9a4" roughness={0.42} />
        </mesh>

        <mesh position={[-0.44, 0.02, 0.06]} rotation={[0.78, 0, 0.18]}>
          <capsuleGeometry args={[0.12, 0.62, 8, 16]} />
          <meshStandardMaterial color="#202a3f" roughness={0.5} />
        </mesh>
        <mesh position={[0.44, 0.02, 0.06]} rotation={[0.78, 0, -0.18]}>
          <capsuleGeometry args={[0.12, 0.62, 8, 16]} />
          <meshStandardMaterial color="#202a3f" roughness={0.5} />
        </mesh>
        <mesh position={[-0.52, -0.35, 0.43]} rotation={[1.38, 0, 0.08]}>
          <capsuleGeometry args={[0.105, 0.58, 8, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[0.52, -0.35, 0.43]} rotation={[1.38, 0, -0.08]}>
          <capsuleGeometry args={[0.105, 0.58, 8, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[-0.54, -0.7, 0.8]} scale={[1.45, 0.42, 0.8]}>
          <sphereGeometry args={[0.13, 18, 12]} />
          <meshStandardMaterial color="#020617" roughness={0.38} />
        </mesh>
        <mesh position={[0.54, -0.7, 0.8]} scale={[1.45, 0.42, 0.8]}>
          <sphereGeometry args={[0.13, 18, 12]} />
          <meshStandardMaterial color="#020617" roughness={0.38} />
        </mesh>
      </group>

      <mesh position={[0, 0.76, -0.72]} rotation={[-0.32, 0, 0]}>
        <boxGeometry args={[1.3, 0.08, 0.78]} />
        <meshStandardMaterial color="#05070c" emissive="#5eead4" emissiveIntensity={0.55} metalness={0.4} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.83, -0.93]} rotation={[-0.9, 0, 0]}>
        <boxGeometry args={[1.18, 0.05, 0.56]} />
        <meshStandardMaterial color="#07111e" emissive="#38bdf8" emissiveIntensity={0.34} metalness={0.34} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.93, -1.17]} rotation={[-0.9, 0, 0]}>
        <planeGeometry args={[0.82, 0.34]} />
        <meshStandardMaterial color="#5eead4" emissive="#5eead4" emissiveIntensity={0.65} transparent opacity={0.75} />
      </mesh>

      <Html position={[0, 3.05, 0]} center distanceFactor={9} style={{ pointerEvents: "none" }}>
        <div className={isNear ? "atlas-guide-bubble atlas-guide-bubble--near" : "atlas-guide-bubble"}>
          <span>AI guide</span>
          <p>{speech || (isNear ? "Ask me anything. I can explain Tayeb's work or help with general questions." : "Come closer to talk.")}</p>
        </div>
      </Html>
    </group>
  );
}

function WorldPlaque({
  position,
  room,
  title,
  children,
  width = 230,
}: {
  position: [number, number, number];
  room: Room;
  title: string;
  children: ReactNode;
  width?: number;
}) {
  return (
    <Html position={position} center distanceFactor={10} style={{ pointerEvents: "none" }}>
      <div className="atlas-room-plaque" style={{ width, borderColor: `${room.color}55`, boxShadow: `0 20px 60px ${room.color}18` }}>
        <span style={{ color: room.accent }}>{title}</span>
        <div>{children}</div>
      </div>
    </Html>
  );
}

function ExhibitCore({ room }: { room: Room }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  const geometry = (() => {
    switch (room.id) {
      case "about":
        return <icosahedronGeometry args={[1.05, 1]} />;
      case "experience":
        return <torusKnotGeometry args={[0.7, 0.22, 120, 18, 2, 3]} />;
      case "projects":
        return <boxGeometry args={[1.2, 1.2, 1.2]} />;
      case "skills":
        return <sphereGeometry args={[0.82, 28, 28]} />;
      case "education":
        return <octahedronGeometry args={[1.1, 0]} />;
      case "contact":
        return <coneGeometry args={[0.84, 1.8, 24]} />;
    }
  })();

  return (
    <group ref={ref} position={[0, 1.8, 0]}>
      <mesh>{geometry}<meshStandardMaterial color={room.accent} emissive={room.color} emissiveIntensity={1.8} metalness={0.62} roughness={0.16} /></mesh>
      <mesh scale={1.55}>
        <torusGeometry args={[1.25, 0.04, 22, 140]} />
        <meshStandardMaterial color={room.color} emissive={room.color} emissiveIntensity={2.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.15}>
        <torusGeometry args={[1.68, 0.025, 22, 140]} />
        <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={1.7} transparent opacity={0.86} />
      </mesh>
    </group>
  );
}

function AboutExhibit({ room }: { room: Room }) {
  const center = getRoomCenter(room);
  return (
    <group position={[center.x, 0, center.z]}>
      <ExhibitCore room={room} />
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 64]} />
        <meshStandardMaterial color={room.color} emissive={room.color} emissiveIntensity={1.4} transparent opacity={0.12} />
      </mesh>
      {[
        [-2.1, 0.75, -2.8, "3+", "Years building"],
        [2.1, 0.75, -2.8, "10+", "Projects shipped"],
        [-2.1, 0.75, 2.8, "15K+", "YouTube audience"],
        [2.1, 0.75, 2.8, "3", "Markets served"],
      ].map(([x, y, z, value, label]) => (
        <Float key={label as string} speed={1.6} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh position={[x as number, y as number, z as number]}>
            <boxGeometry args={[1.55, 1.55, 1.55]} />
            <meshStandardMaterial color="#0b1220" emissive={room.color} emissiveIntensity={0.35} />
          </mesh>
          <Html position={[x as number, y as number, z as number]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
            <div className="atlas-room-mini">
              <strong style={{ color: room.accent }}>{value}</strong>
              <span>{label}</span>
            </div>
          </Html>
        </Float>
      ))}
      <WorldPlaque position={[-3.6, 2.1, 0]} room={room} title="Origin">
        {ABOUT_COPY.map((line) => <p key={line}>{line}</p>)}
      </WorldPlaque>
      <WorldPlaque position={[3.6, 2, 0]} room={room} title="Principles">
        <div className="atlas-room-chip-list">
          {["Clean Architecture", "CQRS", "SOLID", "ASP.NET Core", "WPF", "SQL Server"].map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      </WorldPlaque>
    </group>
  );
}

function ExperienceExhibit({ room }: { room: Room }) {
  const center = getRoomCenter(room);
  return (
    <group position={[center.x, 0, center.z]}>
      <ExhibitCore room={room} />
      {EXPERIENCE_ITEMS.map(([date, title], index) => (
        <group key={title} position={[-2.8 + index * 2.8, 0, 3]}>
          <mesh position={[0, 1.1 + index * 0.18, 0]}>
            <boxGeometry args={[0.54, 2.2 + index * 0.35, 0.54]} />
            <meshStandardMaterial color="#0c1520" emissive={room.color} emissiveIntensity={0.4} />
          </mesh>
          <WorldPlaque position={[0, 3.1 + index * 0.18, 0]} room={room} title={date} width={200}>
            <p>{title}</p>
          </WorldPlaque>
        </group>
      ))}
      <WorldPlaque position={[0, 2.2, -3.3]} room={room} title="Experience">
        <p>Practical backend and desktop engineering, with a strong bias for delivery, clarity, and durable architecture.</p>
      </WorldPlaque>
    </group>
  );
}

function ProjectsExhibit({ room }: { room: Room }) {
  const center = getRoomCenter(room);
  return (
    <group position={[center.x, 0, center.z]}>
      <ExhibitCore room={room} />
      {PROJECT_ITEMS.map((project, index) => (
        <Float key={project} speed={1.5 + index * 0.12} rotationIntensity={0.24} floatIntensity={0.55}>
          <mesh position={[-2.7 + (index % 2) * 5.4, 1.25 + Math.floor(index / 2) * 1.45, -2.2 + (index % 2) * 0.3]}>
            <boxGeometry args={[2.2, 1.18, 0.12]} />
            <meshStandardMaterial color="#09121d" emissive={room.color} emissiveIntensity={0.28} />
          </mesh>
          <WorldPlaque position={[-2.7 + (index % 2) * 5.4, 1.25 + Math.floor(index / 2) * 1.45, -2.05 + (index % 2) * 0.3]} room={room} title={`Project ${index + 1}`} width={210}>
            <p>{project}</p>
          </WorldPlaque>
        </Float>
      ))}
    </group>
  );
}

function SkillsExhibit({ room }: { room: Room }) {
  const center = getRoomCenter(room);
  return (
    <group position={[center.x, 0, center.z]}>
      <ExhibitCore room={room} />
      {SKILLS_GROUPS.map(([label, value], index) => (
        <WorldPlaque key={label} position={[-3.2 + (index % 2) * 6.4, 1.8 + Math.floor(index / 2) * 1.4, 3.2]} room={room} title={label} width={220}>
          <p>{value}</p>
        </WorldPlaque>
      ))}
      {[0, 1, 2, 3].map((index) => (
        <Float key={index} speed={1.8 + index * 0.15} rotationIntensity={0.35} floatIntensity={0.65}>
          <mesh position={[Math.cos(index * (Math.PI / 2)) * 2.5, 1.4, Math.sin(index * (Math.PI / 2)) * 2.5]}>
            <sphereGeometry args={[0.32, 18, 18]} />
            <meshStandardMaterial color={room.accent} emissive={room.color} emissiveIntensity={1.6} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function EducationExhibit({ room }: { room: Room }) {
  const center = getRoomCenter(room);
  return (
    <group position={[center.x, 0, center.z]}>
      <ExhibitCore room={room} />
      {EDUCATION_ITEMS.map((item, index) => (
        <WorldPlaque key={item} position={[-5.2 + index * 3.45, 2.15 + (index % 2) * 0.5, -3.2 + (index % 2) * 2.4]} room={room} title={`Signal ${String(index + 1).padStart(2, "0")}`} width={210}>
          <p>{item}</p>
        </WorldPlaque>
      ))}
    </group>
  );
}

function ContactExhibit({ room }: { room: Room }) {
  const center = getRoomCenter(room);
  return (
    <group position={[center.x, 0, center.z]}>
      <ExhibitCore room={room} />
      <WorldPlaque position={[0, 2.2, -3.3]} room={room} title="Open channel" width={280}>
        <p>Open to freelance projects, long-term collaboration, and product teams that want disciplined engineering.</p>
      </WorldPlaque>
      {CONTACT_ITEMS.map(([label, value], index) => (
        <WorldPlaque key={label} position={[-4.2 + (index % 2) * 8.4, 1.9 + Math.floor(index / 2) * 1.35, 2.9]} room={room} title={label} width={240}>
          <p>{value}</p>
        </WorldPlaque>
      ))}
    </group>
  );
}

function RoomExhibit({ room }: { room: Room }) {
  switch (room.id) {
    case "about":
      return <AboutExhibit room={room} />;
    case "experience":
      return <ExperienceExhibit room={room} />;
    case "projects":
      return <ProjectsExhibit room={room} />;
    case "skills":
      return <SkillsExhibit room={room} />;
    case "education":
      return <EducationExhibit room={room} />;
    case "contact":
      return <ContactExhibit room={room} />;
  }
}

function PlayerController({
  playerRef,
  virtualInputRef,
  onRoomChange,
  onGuideNearChange,
}: {
  playerRef: MutableRefObject<PlayerState>;
  virtualInputRef: MutableRefObject<MoveInput>;
  onRoomChange: (room: Room | null) => void;
  onGuideNearChange: (isNear: boolean) => void;
}) {
  const { camera } = useThree();
  const cameraPos = useRef(new THREE.Vector3(0, PLAYER_Y + 2.4, 6.5));
  const lookAt = useRef(new THREE.Vector3(0, PLAYER_Y, 0));
  const keys = useRef<MoveInput>({ up: false, down: false, left: false, right: false });
  const previousInput = useRef<MoveInput>({ up: false, down: false, left: false, right: false });
  const lastRoom = useRef<Room | null>(null);
  const lastGuideNear = useRef(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (event.key === "ArrowUp" || key === "w") keys.current.up = true;
      if (event.key === "ArrowDown" || key === "s") keys.current.down = true;
      if (event.key === "ArrowLeft" || key === "a") keys.current.left = true;
      if (event.key === "ArrowRight" || key === "d") keys.current.right = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (event.key === "ArrowUp" || key === "w") keys.current.up = false;
      if (event.key === "ArrowDown" || key === "s") keys.current.down = false;
      if (event.key === "ArrowLeft" || key === "a") keys.current.left = false;
      if (event.key === "ArrowRight" || key === "d") keys.current.right = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const player = playerRef.current;
    const input = {
      up: keys.current.up || virtualInputRef.current.up,
      down: keys.current.down || virtualInputRef.current.down,
      left: keys.current.left || virtualInputRef.current.left,
      right: keys.current.right || virtualInputRef.current.right,
    };
    if (input.left && !previousInput.current.left) {
      player.facing = turnLeft(player.facing);
    }

    if (input.right && !previousInput.current.right) {
      player.facing = turnRight(player.facing);
    }

    const facingVector = getFacingVector(player.facing);
    let dx = 0;
    let dz = 0;

    if (input.up) {
      dx += facingVector.x * MOVE_SPEED * delta;
      dz += facingVector.z * MOVE_SPEED * delta;
    }

    if (input.down) {
      dx -= facingVector.x * MOVE_SPEED * delta;
      dz -= facingVector.z * MOVE_SPEED * delta;
    }

    const movedX = isWalkable(player.x + dx, player.z);
    const movedZ = isWalkable(player.x, player.z + dz);

    if (movedX) player.x += dx;
    if (movedZ) player.z += dz;

    const playerPosition = new THREE.Vector3(player.x, PLAYER_Y, player.z);
    const targetCamera = playerPosition.clone().add(new THREE.Vector3(0, 2.55, 0)).add(facingVector.clone().multiplyScalar(-5.4));
    const targetLook = playerPosition.clone().add(facingVector.clone().multiplyScalar(2.6));

    cameraPos.current.lerp(targetCamera, 0.12);
    lookAt.current.lerp(targetLook, 0.12);
    camera.position.copy(cameraPos.current);
    camera.lookAt(lookAt.current);

    const room = getRoomAt(player.x, player.z);
    if (room?.id !== lastRoom.current?.id) {
      lastRoom.current = room;
      onRoomChange(room);
    }

    const guideNear = playerPosition.distanceTo(new THREE.Vector3(GUIDE_POSITION.x, PLAYER_Y, GUIDE_POSITION.z)) < GUIDE_INTERACT_DISTANCE;
    if (guideNear !== lastGuideNear.current) {
      lastGuideNear.current = guideNear;
      onGuideNearChange(guideNear);
    }

    previousInput.current = input;
  });

  return null;
}

function ArrowPad({ inputRef }: { inputRef: MutableRefObject<MoveInput> }) {
  const setInput = (key: keyof MoveInput, value: boolean) => {
    inputRef.current[key] = value;
  };

  const bindButton = (key: keyof MoveInput) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setInput(key, true);
    },
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setInput(key, false);
    },
    onPointerCancel: () => setInput(key, false),
    onPointerLeave: () => setInput(key, false),
  });

  return (
    <div className="atlas-arrow-pad" aria-label="Movement controls">
      <button className="atlas-arrow-pad__button atlas-arrow-pad__up" aria-label="Move forward" {...bindButton("up")}>
        <ArrowUp aria-hidden="true" />
      </button>
      <button className="atlas-arrow-pad__button atlas-arrow-pad__left" aria-label="Turn left" {...bindButton("left")}>
        <ArrowLeft aria-hidden="true" />
      </button>
      <button className="atlas-arrow-pad__button atlas-arrow-pad__right" aria-label="Turn right" {...bindButton("right")}>
        <ArrowRight aria-hidden="true" />
      </button>
      <button className="atlas-arrow-pad__button atlas-arrow-pad__down" aria-label="Move backward" {...bindButton("down")}>
        <ArrowDown aria-hidden="true" />
      </button>
    </div>
  );
}

function DetailDeck({
  room,
  selected,
  onSelect,
  onClose,
}: {
  room: Room | null;
  selected: DetailItem | null;
  onSelect: (detail: DetailItem) => void;
  onClose: () => void;
}) {
  if (!room) return null;

  const details = ROOM_DETAILS[room.id];

  return (
    <div className="atlas-detail-dock" style={{ borderColor: `${room.color}44` }}>
      <div className="atlas-detail-dock__cards">
        {details.map((detail) => (
          <button
            key={`${detail.eyebrow}-${detail.title}`}
            className="atlas-detail-card"
            style={{
              borderColor: selected?.title === detail.title ? `${room.color}cc` : `${room.color}33`,
              boxShadow: selected?.title === detail.title ? `0 0 24px ${room.color}24` : "none",
            }}
            onClick={() => onSelect(detail)}
          >
            <span style={{ color: room.accent }}>{detail.eyebrow}</span>
            <strong>{detail.title}</strong>
            <small>{detail.meta}</small>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="atlas-detail-panel" style={{ borderColor: `${room.color}55` }}>
          <button className="atlas-detail-panel__close" aria-label="Close details" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
          <span style={{ color: room.accent }}>{selected.eyebrow}</span>
          <strong>{selected.title}</strong>
          <p>{selected.body}</p>
          <small>{selected.meta}</small>
        </div>
      ) : null}
    </div>
  );
}

function GuideChat({
  isNear,
  messages,
  input,
  isSending,
  onInputChange,
  onSend,
}: {
  isNear: boolean;
  messages: ChatMessage[];
  input: string;
  isSending: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}) {
  if (!isNear) {
    return (
      <div className="atlas-guide-hint">
        <MessageCircle aria-hidden="true" />
        <span>Find the seated AI guide to ask questions</span>
      </div>
    );
  }

  return (
    <div className="atlas-guide-chat">
      <div className="atlas-guide-chat__header">
        <MessageCircle aria-hidden="true" />
        <div>
          <span>AI guide</span>
          <strong>Ask about the profile</strong>
        </div>
      </div>

      <div className="atlas-guide-chat__messages">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === "user" ? "atlas-guide-chat__message atlas-guide-chat__message--user" : "atlas-guide-chat__message"}>
            {message.content}
          </div>
        ))}
        {isSending ? <div className="atlas-guide-chat__message">Thinking...</div> : null}
      </div>

      <form
        className="atlas-guide-chat__form"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <input
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Ask the guide..."
          aria-label="Ask the AI guide"
        />
        <button type="submit" aria-label="Send message" disabled={isSending || input.trim().length === 0}>
          <Send aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

export default function WorldScene() {
  const webgl = useWebGLSupported();
  const [phase, setPhase] = useState<Phase>("intro");
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<DetailItem | null>(null);
  const [isGuideNear, setIsGuideNear] = useState(false);
  const [guideInput, setGuideInput] = useState("");
  const [guideMessages, setGuideMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "I am Tayeb's AI guide. Come closer and ask me about his projects, skills, experience, or contact info.",
    },
  ]);
  const [isGuideSending, setIsGuideSending] = useState(false);
  const playerRef = useRef<PlayerState>({ x: 0, z: 8, facing: "north" });
  const virtualInputRef = useRef<MoveInput>({ up: false, down: false, left: false, right: false });

  useEffect(() => {
    setSelectedDetail(null);
  }, [activeRoom?.id]);

  if (webgl === null) return null;

  if (!webgl) {
    return (
      <div className="atlas-fallback">
        <h1>{PROFILE.name}</h1>
        <p>This 3D portfolio needs WebGL enabled in a modern browser.</p>
      </div>
    );
  }

  if (phase === "intro") {
    return <IntroScreen onStart={() => setPhase("world")} />;
  }

  const latestGuideSpeech = guideMessages.filter((message) => message.role === "assistant").at(-1)?.content ?? "";

  const sendGuideMessage = async () => {
    const question = guideInput.trim();
    if (!question || isGuideSending) return;

    const nextMessages: ChatMessage[] = [...guideMessages, { role: "user", content: question }];
    setGuideMessages(nextMessages);
    setGuideInput("");
    setIsGuideSending(true);

    try {
      const response = await fetch("/api/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      const answer = typeof data.answer === "string" ? data.answer : "I could not answer that yet. Try asking about Tayeb's skills, projects, or contact info.";
      setGuideMessages((messages) => [...messages, { role: "assistant", content: answer }]);
    } catch {
      setGuideMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content: "I am offline right now, but I can still tell you that Tayeb builds .NET apps, backend systems, and client tools.",
        },
      ]);
    } finally {
      setIsGuideSending(false);
    }
  };

  return (
    <div className="atlas-world">
      <ThreeErrorBoundary fallback={<div className="atlas-fallback">The 3D world could not load.</div>}>
        <Canvas camera={{ position: [0, PLAYER_Y + 2.5, 6.5], fov: 62, near: 0.05, far: 220 }} gl={{ antialias: true, alpha: false, failIfMajorPerformanceCaveat: false }} dpr={[1, 1.75]} style={{ position: "absolute", inset: 0 }}>
          <color attach="background" args={["#05070c"]} />
          <fog attach="fog" args={["#05070c", 12, 90]} />
          <ambientLight intensity={0.25} />
          <pointLight position={[0, 8, 4]} color="#fff3d4" intensity={1.25} />
          <pointLight position={[-18, 4, 8]} color="#ff7a18" intensity={1.2} />
          <pointLight position={[18, 4, -4]} color="#38bdf8" intensity={1.1} />
          <pointLight position={[0, 4, 32]} color="#f472b6" intensity={1.05} />
          <pointLight position={[0, 4, -46]} color="#fb7185" intensity={1.05} />
          <Stars radius={100} depth={24} count={1500} factor={3.8} saturation={0} fade speed={0.6} />

          <ParticleCloud />
          <MazeArchitecture />
          {ROOMS.map((room) => (
            <RoomBeacon key={`${room.id}-beacon`} room={room} />
          ))}
          {ROOMS.map((room) => (
            <RoomExhibit key={`${room.id}-exhibit`} room={room} />
          ))}
          <GuideAgent speech={latestGuideSpeech} isNear={isGuideNear} />

          <PlayerController
            playerRef={playerRef}
            virtualInputRef={virtualInputRef}
            onRoomChange={setActiveRoom}
            onGuideNearChange={setIsGuideNear}
          />
        </Canvas>
      </ThreeErrorBoundary>

      <div className="atlas-hud">
        <div className="atlas-hud__top">
          <div className="atlas-brand">
            <span className="atlas-brand__eyebrow">{activeRoom ? activeRoom.kicker : "Free roaming mode"}</span>
            <strong>{activeRoom ? activeRoom.name : PROFILE.name}</strong>
            <small>{activeRoom ? activeRoom.story : PROFILE.role}</small>
          </div>
          <div className="atlas-metadata">
            <span>{PROFILE.location}</span>
            <span>2026 edition</span>
          </div>
        </div>

        <div className="atlas-directory">
          {ROOMS.map((room) => (
            <div key={room.id} className="atlas-directory__item" style={{ color: activeRoom?.id === room.id ? room.accent : "#94a3b8" }}>
              <span style={{ background: room.color, boxShadow: activeRoom?.id === room.id ? `0 0 18px ${room.color}` : "none" }} />
              {room.name}
            </div>
          ))}
        </div>

        <div className="atlas-controls">
          Right/Left turn the camera, Up moves forward, Down goes back
        </div>

        <ArrowPad inputRef={virtualInputRef} />

        <DetailDeck
          room={activeRoom}
          selected={selectedDetail}
          onSelect={setSelectedDetail}
          onClose={() => setSelectedDetail(null)}
        />

        <GuideChat
          isNear={isGuideNear}
          messages={guideMessages}
          input={guideInput}
          isSending={isGuideSending}
          onInputChange={setGuideInput}
          onSend={sendGuideMessage}
        />

        <div className="atlas-progress">
          {ROOMS.map((room) => (
            <div key={room.id} className="atlas-progress__bar" style={{ opacity: activeRoom?.id === room.id ? 1 : 0.3 }}>
              <span style={{ background: room.color, width: activeRoom?.id === room.id ? 34 : 12 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
