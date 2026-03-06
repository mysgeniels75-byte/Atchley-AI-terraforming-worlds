/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Cpu, 
  Globe, 
  Layers, 
  Shield, 
  Terminal, 
  Zap,
  ChevronRight,
  Maximize2,
  Settings,
  Database,
  Eraser,
  ArrowUpCircle,
  Target,
  AlertTriangle,
  MousePointer2,
  Compass,
  MapPin,
  Eye,
  EyeOff,
  Navigation,
  Sprout,
  Snowflake,
  ZapOff,
  Infinity,
  Waves,
  Brain,
  BookOpen,
  MessageSquare
} from "lucide-react";

// --- ATCHLEY SYSTEM CONSTRAINTS ---
const SYSTEM_LIMITS = {
  Z_CEILING: 28.0,
  Z_FLOOR: 0.0,
  THERMAL_MAX: 102.0,
  SWARM_VEL_MAX: 1.2,
  EROSION_BASE: 0.008,
  GRID_RES: 100, // Increased resolution for larger map
  MAP_DIM: 500,  // Requested 500x500
  BRUSH_RADIUS: 25,
  BRUSH_STRENGTH: 0.8,
  AGENT_COUNT: 25 // Requested 25 agents
};

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

type Tool = 'none' | 'erode' | 'deposit' | 'priority';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({ temp: 32, b0: 8, b1: 0, density: "0.00" });
  const [isFrozen, setIsFrozen] = useState(false);
  const [swarmData, setSwarmData] = useState<{ id: string; y: string }[]>([]);
  const [messages, setMessages] = useState<{ role: string; text: string; thought?: string }[]>([
    { role: 'system', text: 'Sovereign Link Established. Atchley Topological Terraforming System Online.' }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'console' | 'engineering' | 'cognitive'>('telemetry');
  const [activeTool, setActiveTool] = useState<Tool>('none');
  const [priorityZones, setPriorityZones] = useState<{ x: number; z: number; radius: number }[]>([]);
  const [brushRadius, setBrushRadius] = useState(12);
  const [brushStrength, setBrushStrength] = useState(0.8);
  const [waypoints, setWaypoints] = useState<{ x: number; z: number; label: string }[]>([]);
  const [isObserverMode, setIsObserverMode] = useState(false);
  const [isFirstPerson, setIsFirstPerson] = useState(false);
  const [wormActive, setWormActive] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  const [seeds, setSeeds] = useState<{ x: number; z: number; growth: number; id: string }[]>([]);
  const [entropy, setEntropy] = useState(0);
  const [isDeepFrozen, setIsDeepFrozen] = useState(false);
  const [singularityProgress, setSingularityProgress] = useState(0);

  // AI Interaction
  const askAI = async (query: string) => {
    setIsThinking(true);
    try {
      const model = "gemini-3-flash-preview";
      const response = await genAI.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: query }] }],
        config: {
          systemInstruction: "You are the Sovereign Intelligence of the Atchley Neural-Cartographic System. You assist Devin Atchley. The system is a topological terraforming manifold based on the Atchley Unified Field and Atchley Unified Metis. Reference 'Topological Blob Invariant Variants', 'Conflict Validators', 'OWL3DGE Axiomatics', and 'Structural Safety' in your technical assessments. Keep responses concise and authoritative.",
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });

      const text = response.text;
      const thought = response.candidates?.[0]?.content?.parts?.find(p => (p as any).thought)?.text || 
                      response.candidates?.[0]?.content?.parts?.find(p => p.text && p.text.length > 500)?.text; // Fallback heuristic if thought flag is missing
      
      if (text) {
        setMessages(prev => [...prev, { role: 'ai', text, thought }]);
        if (thought) {
          setActiveTab('cognitive'); // Auto-switch to show the thought process
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'system', text: 'Error: Neural link unstable. Retry command.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isThinking) return;
    const userMsg = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue("");
    askAI(userMsg);
  };

  const activeToolRef = useRef<Tool>('none');
  const priorityZonesRef = useRef<{ x: number; z: number; radius: number }[]>([]);
  const brushRadiusRef = useRef(12);
  const brushStrengthRef = useRef(0.8);
  const isObserverModeRef = useRef(false);
  const isFirstPersonRef = useRef(false);
  const waypointsRef = useRef<{ x: number; z: number; label: string }[]>([]);
  const wormActiveRef = useRef(false);
  const seedsRef = useRef<{ x: number; z: number; growth: number; id: string }[]>([]);
  const isDeepFrozenRef = useRef(false);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    priorityZonesRef.current = priorityZones;
  }, [priorityZones]);

  useEffect(() => {
    brushRadiusRef.current = brushRadius;
  }, [brushRadius]);

  useEffect(() => {
    brushStrengthRef.current = brushStrength;
  }, [brushStrength]);

  useEffect(() => {
    isObserverModeRef.current = isObserverMode;
  }, [isObserverMode]);

  useEffect(() => {
    isFirstPersonRef.current = isFirstPerson;
  }, [isFirstPerson]);

  useEffect(() => {
    waypointsRef.current = waypoints;
  }, [waypoints]);

  useEffect(() => {
    wormActiveRef.current = wormActive;
  }, [wormActive]);

  useEffect(() => {
    seedsRef.current = seeds;
  }, [seeds]);

  useEffect(() => {
    isDeepFrozenRef.current = isDeepFrozen;
  }, [isDeepFrozen]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x01040a);
    scene.fog = new THREE.FogExp2(0x01040a, 0.0015);
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 40;
    controls.maxDistance = 500;

    // Jacobian Bound Visualizer
    const jacobianGeo = new THREE.BoxGeometry(SYSTEM_LIMITS.MAP_DIM, 30, SYSTEM_LIMITS.MAP_DIM);
    const jacobianMat = new THREE.MeshBasicMaterial({ 
      color: 0xff00ff, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.05 
    });
    const jacobianBox = new THREE.Mesh(jacobianGeo, jacobianMat);
    jacobianBox.position.y = 15;
    scene.add(jacobianBox);

    // Raycasting & Brush
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let brushGeo = new THREE.RingGeometry(brushRadiusRef.current * 0.8, brushRadiusRef.current, 32);
    const brushMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    let brushMesh = new THREE.Mesh(brushGeo, brushMat);
    brushMesh.rotation.x = -Math.PI / 2;
    brushMesh.visible = false;
    scene.add(brushMesh);

    // Worm Entity (for Betti Inversion Travel)
    const wormGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const wormMat = new THREE.MeshStandardMaterial({ 
      color: 0xff00ff, 
      emissive: 0xff00ff, 
      emissiveIntensity: 2 
    });
    const worm = new THREE.Mesh(wormGeo, wormMat);
    worm.visible = false;
    scene.add(worm);

    const wormLight = new THREE.PointLight(0xff00ff, 10, 50);
    worm.add(wormLight);

    const wormTrailPoints: THREE.Vector3[] = [];
    const wormTrailGeo = new THREE.BufferGeometry().setFromPoints(new Array(50).fill(new THREE.Vector3()));
    const wormTrailMat = new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.8 });
    const wormTrail = new THREE.Line(wormTrailGeo, wormTrailMat);
    scene.add(wormTrail);

    let currentWaypointIdx = 0;
    let wormProgress = 0;

    let isPointerDown = false;
    const priorityZoneMeshes: THREE.Mesh[] = [];
    const waypointMeshes: THREE.Group[] = [];
    const seedMeshes: THREE.Group[] = [];

    const updateWaypoints = () => {
      waypointMeshes.forEach(m => scene.remove(m));
      waypointMeshes.length = 0;

      waypointsRef.current.forEach((wp, i) => {
        const group = new THREE.Group();
        const markerGeo = new THREE.ConeGeometry(1, 4, 4);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.rotation.x = Math.PI;
        marker.position.y = 10;
        group.add(marker);
        const light = new THREE.PointLight(0x00f3ff, 2, 10);
        light.position.y = 8;
        group.add(light);
        group.position.set(wp.x, 0, wp.z);
        scene.add(group);
        waypointMeshes.push(group);
      });
    };

    const updateSeeds = () => {
      seedMeshes.forEach(m => scene.remove(m));
      seedMeshes.length = 0;

      seedsRef.current.forEach((seed) => {
        const group = new THREE.Group();
        
        // Seed core
        const coreGeo = new THREE.IcosahedronGeometry(0.5, 0);
        const coreMat = new THREE.MeshStandardMaterial({ 
          color: 0x44ff44, 
          emissive: 0x44ff44, 
          emissiveIntensity: 1 
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        group.add(core);

        // Growth structure (crystal-like)
        const structGeo = new THREE.CylinderGeometry(0.1, 1, 1, 6);
        const structMat = new THREE.MeshStandardMaterial({ 
          color: 0x00ff88, 
          transparent: true, 
          opacity: 0.6,
          wireframe: true
        });
        const struct = new THREE.Mesh(structGeo, structMat);
        struct.position.y = 0.5;
        struct.scale.set(seed.growth * 5, seed.growth * 15, seed.growth * 5);
        group.add(struct);

        group.position.set(seed.x, 0, seed.z);
        scene.add(group);
        seedMeshes.push(group);
      });
    };

    // Expose updates to window for reactivity
    (window as any).updateAtchleyWaypoints = updateWaypoints;
    (window as any).updateAtchleySeeds = updateSeeds;

    const updateBrush = (event: PointerEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(landscape);

      if (intersects.length > 0 && activeToolRef.current !== 'none') {
        brushMesh.visible = true;
        brushMesh.position.copy(intersects[0].point);
        brushMesh.position.y += 0.5;
        
        // Update brush size if changed
        if (brushMesh.geometry.parameters.outerRadius !== brushRadiusRef.current) {
          brushMesh.geometry.dispose();
          brushMesh.geometry = new THREE.RingGeometry(brushRadiusRef.current * 0.8, brushRadiusRef.current, 32);
        }

        // Tool specific colors
        if (activeToolRef.current === 'erode') brushMat.color.set(0xff4444);
        else if (activeToolRef.current === 'deposit') brushMat.color.set(0x44ff44);
        else if (activeToolRef.current === 'priority') brushMat.color.set(0xffff44);
        else if (activeToolRef.current === 'seed') brushMat.color.set(0x44ff44);
      } else {
        brushMesh.visible = false;
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      isPointerDown = true;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(landscape);
      
      if (intersects.length > 0) {
        const point = intersects[0].point;
        
        if (activeToolRef.current === 'priority') {
          const newZone = { x: point.x, z: point.z, radius: brushRadiusRef.current };
          priorityZonesRef.current = [...priorityZonesRef.current, newZone];
          setPriorityZones(priorityZonesRef.current);
          
          const zoneGeo = new THREE.CircleGeometry(brushRadiusRef.current, 32);
          const zoneMat = new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.1 });
          const zoneMesh = new THREE.Mesh(zoneGeo, zoneMat);
          zoneMesh.rotation.x = -Math.PI / 2;
          zoneMesh.position.copy(point);
          zoneMesh.position.y += 0.1;
          scene.add(zoneMesh);
          priorityZoneMeshes.push(zoneMesh);
        } else if (activeToolRef.current === 'seed') {
          const newSeed = { x: point.x, z: point.z, growth: 0.1, id: `SEED-${Date.now()}` };
          setSeeds(prev => [...prev, newSeed]);
        } else if (activeToolRef.current === 'none' && event.shiftKey) {
          // Quick seed placement with shift-click
          const newSeed = { x: point.x, z: point.z, growth: 0.1, id: `SEED-${Date.now()}` };
          setSeeds(prev => [...prev, newSeed]);
        }
      }
    };

    const handlePointerUp = () => { isPointerDown = false; };

    mountRef.current.addEventListener('pointermove', updateBrush);
    mountRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    // Terrain Geometry
    const geometry = new THREE.PlaneGeometry(
      SYSTEM_LIMITS.MAP_DIM, 
      SYSTEM_LIMITS.MAP_DIM, 
      SYSTEM_LIMITS.GRID_RES, 
      SYSTEM_LIMITS.GRID_RES
    );
    
    // Custom Material for the "Topological Manifold"
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00f3ff, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.15,
      emissive: 0x003344,
      emissiveIntensity: 0.8,
      side: THREE.DoubleSide
    });
    
    const landscape = new THREE.Mesh(geometry, material);
    landscape.rotation.x = -Math.PI / 2;
    scene.add(landscape);

    // Grid Floor for scale
    const gridHelper = new THREE.GridHelper(SYSTEM_LIMITS.MAP_DIM, 50, 0x00f3ff, 0x001122);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Swarm Agents
    type AgentSkill = 'BUILD' | 'SMOOTH' | 'SCOUT';
    const swarm: { 
      mesh: THREE.Mesh; 
      light: THREE.PointLight; 
      vel: THREE.Vector3; 
      id: string;
      trail: THREE.Line;
      skill: AgentSkill;
      target: THREE.Vector3 | null;
    }[] = [];

    const agentGeo = new THREE.OctahedronGeometry(0.8, 0);
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.3 });

    const skills: AgentSkill[] = ['BUILD', 'SMOOTH', 'SCOUT'];

    for (let i = 0; i < SYSTEM_LIMITS.AGENT_COUNT; i++) {
      const skill = skills[i % skills.length];
      const agentColor = skill === 'BUILD' ? 0x00f3ff : skill === 'SMOOTH' ? 0xffffff : 0xffcc00;
      const agent = new THREE.Mesh(agentGeo, new THREE.MeshBasicMaterial({ color: agentColor }));
      agent.position.set((Math.random() - 0.5) * SYSTEM_LIMITS.MAP_DIM, 5, (Math.random() - 0.5) * SYSTEM_LIMITS.MAP_DIM);
      scene.add(agent);

      const light = new THREE.PointLight(agentColor, 4, 40);
      scene.add(light);

      // Trail
      const trailPoints = [];
      for(let j=0; j<20; j++) trailPoints.push(new THREE.Vector3().copy(agent.position));
      const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPoints);
      const trail = new THREE.Line(trailGeo, trailMaterial);
      scene.add(trail);

      swarm.push({
        mesh: agent,
        light: light,
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5),
        id: `Ψ-${i.toString(16).toUpperCase()}`,
        trail: trail,
        skill: skill,
        target: null
      });
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00f3ff, 0.5);
    directionalLight.position.set(50, 100, 50);
    scene.add(directionalLight);

    camera.position.set(400, 300, 400);
    controls.update();

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      controls.update();

      // Waypoint animations
      waypointMeshes.forEach((m, i) => {
        m.children[0].rotation.y += 0.02;
        m.children[0].position.y = 10 + Math.sin(time * 2 + i) * 2;
      });

      // Seed animations and growth
      seedMeshes.forEach((m, i) => {
        const seed = seedsRef.current[i];
        if (seed) {
          m.children[0].rotation.y += 0.05;
          m.children[1].rotation.y -= 0.01;
          
          if (!isDeepFrozenRef.current) {
            // Growth logic
            if (seed.growth < 1) {
              seed.growth += 0.0005;
              m.children[1].scale.set(seed.growth * 5, seed.growth * 15, seed.growth * 5);
              
              // Structural Rigidity: Seeds raise the terrain around them
              const pos = geometry.attributes.position.array as Float32Array;
              const b = SYSTEM_LIMITS.MAP_DIM / 2;
              const gx = Math.floor(((seed.x + b) / SYSTEM_LIMITS.MAP_DIM) * SYSTEM_LIMITS.GRID_RES);
              const gz = Math.floor(((seed.z + b) / SYSTEM_LIMITS.MAP_DIM) * SYSTEM_LIMITS.GRID_RES);
              const idx = (gz * (SYSTEM_LIMITS.GRID_RES + 1) + gx) * 3;
              if (pos[idx + 2] !== undefined) {
                pos[idx + 2] = Math.min(SYSTEM_LIMITS.Z_CEILING, pos[idx + 2] + 0.05);
                geometry.attributes.position.needsUpdate = true;
              }
            }
          }
        }
      });

      // Observer Mode Camera
      if (isObserverModeRef.current) {
        camera.position.x = Math.cos(time * 0.1) * 200;
        camera.position.z = Math.sin(time * 0.1) * 200;
        camera.lookAt(0, 0, 0);
      } else if (isFirstPersonRef.current && swarm.length > 0) {
        // First Person View: Follow the first agent
        const lead = swarm[0];
        const offset = new THREE.Vector3(0, 5, -10).applyQuaternion(lead.mesh.quaternion);
        const targetPos = lead.mesh.position.clone().add(offset);
        camera.position.lerp(targetPos, 0.1);
        camera.lookAt(lead.mesh.position.clone().add(lead.vel.clone().multiplyScalar(10)));
        controls.enabled = false;
      } else {
        controls.enabled = true;
      }

      // Thermal Dynamics
      const currentTemp = 35 + (Math.sin(time * 0.15) * 25) + (parseFloat(metrics.density) * 8);
      if (currentTemp > SYSTEM_LIMITS.THERMAL_MAX && !isFrozen) {
        setIsFrozen(true);
        setMessages(prev => [...prev, { role: 'system', text: 'CRITICAL: Thermal breach detected. Manifold locked.' }]);
      } else if (isFrozen && currentTemp < 75) {
        setIsFrozen(false);
        setMessages(prev => [...prev, { role: 'system', text: 'RECOVERY: Thermal stability restored. Manifold unlocked.' }]);
      }

      const pos = geometry.attributes.position.array as Float32Array;
      let totalD = 0;
      let totalEntropy = 0;

      if (!isFrozen && !isDeepFrozenRef.current) {
        // Apply Tools
        if (isPointerDown && brushMesh.visible) {
          const brushPos = brushMesh.position;
          for (let i = 0; i < pos.length; i += 3) {
            const dx = pos[i] - brushPos.x;
            const dz = pos[i + 1] - brushPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < brushRadiusRef.current) {
              const falloff = 1 - (dist / brushRadiusRef.current);
              if (activeToolRef.current === 'erode') {
                pos[i + 2] = Math.max(SYSTEM_LIMITS.Z_FLOOR, pos[i + 2] - brushStrengthRef.current * falloff);
              } else if (activeToolRef.current === 'deposit') {
                pos[i + 2] = Math.min(SYSTEM_LIMITS.Z_CEILING, pos[i + 2] + brushStrengthRef.current * falloff);
              }
            }
          }
        }

        // Worm Travel Logic (Jacobian Betti Inversion)
        if (wormActiveRef.current && waypointsRef.current.length >= 2) {
          worm.visible = true;
          wormTrail.visible = true;
          
          const start = waypointsRef.current[currentWaypointIdx];
          const end = waypointsRef.current[(currentWaypointIdx + 1) % waypointsRef.current.length];
          
          wormProgress += 0.005;
          if (wormProgress >= 1) {
            wormProgress = 0;
            currentWaypointIdx = (currentWaypointIdx + 1) % waypointsRef.current.length;
          }

          const targetX = THREE.MathUtils.lerp(start.x, end.x, wormProgress);
          const targetZ = THREE.MathUtils.lerp(start.z, end.z, wormProgress);
          
          // Betti Inversion Height (Jacobian Fractal Logic)
          // We use a sine wave modulated by distance to simulate "fractal inversion"
          const distToCenter = Math.sqrt(targetX * targetX + targetZ * targetZ);
          
          // Enhanced Jacobian Fractal Logic: 
          // Height is an inversion of the local Betti-like density
          const bettiInversion = Math.abs(Math.sin(distToCenter * 0.1 - time * 1.5) * Math.cos(targetX * 0.05) * 20);
          const bettiHeight = Math.max(5, 30 - bettiInversion);
          
          worm.position.set(targetX, bettiHeight, targetZ);
          wormLight.intensity = 5 + Math.sin(time * 5) * 5;
          
          // Update Worm Trail
          const trailPoints = (wormTrail.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array;
          for(let j = trailPoints.length - 1; j >= 3; j--) {
            trailPoints[j] = trailPoints[j-3];
          }
          trailPoints[0] = worm.position.x;
          trailPoints[1] = worm.position.y;
          trailPoints[2] = worm.position.z;
          wormTrail.geometry.attributes.position.needsUpdate = true;
          
          // Jacobian Fractal Visual Feedback
          jacobianMat.opacity = 0.05 + Math.sin(time * 2) * 0.02;
        } else {
          worm.visible = false;
          wormTrail.visible = false;
        }

        // Natural Erosion
        for (let i = 2; i < pos.length; i += 3) {
          pos[i] = Math.max(SYSTEM_LIMITS.Z_FLOOR, pos[i] - SYSTEM_LIMITS.EROSION_BASE);
          pos[i] = Math.min(SYSTEM_LIMITS.Z_CEILING, pos[i]);
          totalD += pos[i];
          
          // Calculate Entropy (roughness)
          if (i > 5) {
            totalEntropy += Math.abs(pos[i] - pos[i-3]);
          }
        }

        // Swarm Intelligence & Terraforming
        const sharedGoals: THREE.Vector3[] = [];

        swarm.forEach(agent => {
          // Communication & Tactics
          if (agent.skill === 'SCOUT') {
            // Scouts look for low density areas
            const b = SYSTEM_LIMITS.MAP_DIM / 2;
            const gx = Math.floor(((agent.mesh.position.x + b) / SYSTEM_LIMITS.MAP_DIM) * SYSTEM_LIMITS.GRID_RES);
            const gz = Math.floor(((agent.mesh.position.z + b) / SYSTEM_LIMITS.MAP_DIM) * SYSTEM_LIMITS.GRID_RES);
            const idx = (gz * (SYSTEM_LIMITS.GRID_RES + 1) + gx) * 3;
            if (pos[idx + 2] < 5) {
              sharedGoals.push(agent.mesh.position.clone());
            }
          }

          // Movement logic based on skill
          if (agent.skill === 'BUILD' && sharedGoals.length > 0) {
            // Builders move towards shared goals
            const goal = sharedGoals[0];
            const dir = goal.clone().sub(agent.mesh.position).normalize();
            agent.vel.add(dir.multiplyScalar(0.05));
          } else {
            agent.vel.x += (Math.random() - 0.5) * 0.15;
            agent.vel.z += (Math.random() - 0.5) * 0.15;
          }

          // Priority Zone Attraction
          priorityZonesRef.current.forEach(zone => {
            const dx = zone.x - agent.mesh.position.x;
            const dz = zone.z - agent.mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < 100) {
              const force = (1 - dist / 100) * 0.05;
              agent.vel.x += dx * force;
              agent.vel.z += dz * force;
            }
          });

          agent.vel.clampLength(0, SYSTEM_LIMITS.SWARM_VEL_MAX);
          agent.mesh.position.add(agent.vel);

          // Boundary Check
          const b = SYSTEM_LIMITS.MAP_DIM / 2;
          if (Math.abs(agent.mesh.position.x) > b) agent.vel.x *= -1.2;
          if (Math.abs(agent.mesh.position.z) > b) agent.vel.z *= -1.2;

          // Terrain Interaction based on skill
          const gx = Math.floor(((agent.mesh.position.x + b) / SYSTEM_LIMITS.MAP_DIM) * SYSTEM_LIMITS.GRID_RES);
          const gz = Math.floor(((agent.mesh.position.z + b) / SYSTEM_LIMITS.MAP_DIM) * SYSTEM_LIMITS.GRID_RES);
          const idx = (gz * (SYSTEM_LIMITS.GRID_RES + 1) + gx) * 3;
          
          if (pos[idx + 2] !== undefined) {
            if (agent.skill === 'BUILD') {
              pos[idx + 2] += 0.5; // Stronger build
            } else if (agent.skill === 'SMOOTH') {
              // Average with neighbors
              const nIdx = idx + 3;
              if (pos[nIdx + 2] !== undefined) {
                const avg = (pos[idx + 2] + pos[nIdx + 2]) / 2;
                pos[idx + 2] = THREE.MathUtils.lerp(pos[idx + 2], avg, 0.1);
              }
            } else {
              pos[idx + 2] += 0.2; // Default build
            }
            agent.mesh.position.y = pos[idx + 2] + 3.0;
          }

          agent.light.position.copy(agent.mesh.position);
          agent.mesh.rotation.y += 0.08;
          agent.mesh.rotation.z += 0.03;

          // Update Trail
          const trailPoints = (agent.trail.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array;
          for(let j = trailPoints.length - 1; j >= 3; j--) {
            trailPoints[j] = trailPoints[j-3];
          }
          trailPoints[0] = agent.mesh.position.x;
          trailPoints[1] = agent.mesh.position.y;
          trailPoints[2] = agent.mesh.position.z;
          agent.trail.geometry.attributes.position.needsUpdate = true;
        });

        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        // Update Metrics
        if (Math.random() > 0.95) {
          const finalEntropy = totalEntropy / 5000;
          const finalSingularity = (parseFloat(metrics.density) * finalEntropy) / 100;
          
          setMetrics({
            temp: currentTemp,
            b0: swarm.length,
            b1: Math.floor(totalD / 250),
            density: (totalD / 1500).toFixed(2)
          });
          setEntropy(finalEntropy);
          setSingularityProgress(finalSingularity);
          setSwarmData(swarm.map(s => ({ id: s.id, y: s.mesh.position.y.toFixed(1) })));

          // Autonomous Deepfreeze
          if (finalSingularity > 0.9 && !isDeepFrozenRef.current) {
            setIsDeepFrozen(true);
            setMessages(prev => [...prev, { role: 'system', text: 'SINGULARITY DETECTED: Initiating Autonomous Deepfreeze.' }]);
          }
        }
      }
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') {
        setIsCinematic(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Initial waypoint update
    updateWaypoints();
    updateSeeds();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(frameId);
      if (mountRef.current) {
        mountRef.current.removeEventListener('pointermove', updateBrush);
        mountRef.current.removeEventListener('pointerdown', handlePointerDown);
        mountRef.current.innerHTML = "";
      }
      geometry.dispose();
      material.dispose();
      brushGeo.dispose();
      brushMat.dispose();
      jacobianGeo.dispose();
      jacobianMat.dispose();
      wormGeo.dispose();
      wormMat.dispose();
      wormTrailGeo.dispose();
      wormTrailMat.dispose();
      priorityZoneMeshes.forEach(m => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
    };
  }, [isFrozen]);

  useEffect(() => {
    if ((window as any).updateAtchleyWaypoints) {
      (window as any).updateAtchleyWaypoints();
    }
  }, [waypoints]);

  useEffect(() => {
    if ((window as any).updateAtchleySeeds) {
      (window as any).updateAtchleySeeds();
    }
  }, [seeds]);

  return (
    <div className={`h-screen flex flex-col bg-[#01040a] text-cyan-50 font-mono overflow-hidden selection:bg-cyan-500/30`}>
      <div className="scanline" />
      
      {/* Floating UI Toggle */}
      <button 
        onClick={() => setIsCinematic(!isCinematic)}
        className="fixed top-4 left-4 z-[100] w-8 h-8 bg-black/40 border border-white/10 flex items-center justify-center text-cyan-500 hover:bg-cyan-500/20 transition-all rounded-sm"
        title="Toggle Interface (H)"
      >
        {isCinematic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>

      {/* Top Navigation Bar */}
      <AnimatePresence>
        {!isCinematic && (
          <motion.header 
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            className="h-14 border-b border-cyan-500/20 bg-black/90 flex items-center justify-between px-6 backdrop-blur-xl z-50 relative"
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-500 flex items-center justify-center rounded-sm">
                  <Shield className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h1 className="text-xs font-black tracking-[0.2em] text-white uppercase flex items-center gap-2">
                    Atchley Topological Terraforming
                    <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-[8px] border border-cyan-500/20 rounded">V12.4</span>
                  </h1>
                  <p className="text-[9px] text-cyan-400/60 font-bold uppercase tracking-widest">Sovereign Agent: Devin Atchley</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-10 items-center">
                <button 
                  onClick={() => setIsCinematic(true)}
                  className="p-2 bg-white/5 border border-white/10 text-cyan-400 hover:bg-cyan-500/20 transition-all rounded-sm group"
                  title="Cinematic Mode (Hide UI)"
                >
                  <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="text-[8px] opacity-40 block uppercase tracking-tighter">Entropy</span>
                        <span className="text-xs font-bold text-emerald-400">{entropy.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] opacity-40 block uppercase tracking-tighter">Singularity</span>
                        <span className="text-xs font-bold text-fuchsia-400">{(singularityProgress * 100).toFixed(1)}%</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] opacity-40 block uppercase tracking-tighter">Cognitive Load</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-bold ${isThinking ? 'text-cyan-400 animate-pulse' : 'text-white/20'}`}>
                            {isThinking ? 'SYNTHESIZING' : 'IDLE'}
                          </span>
                          {isThinking && <Brain className="w-3 h-3 text-cyan-500 animate-spin-slow" />}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[8px] opacity-40 block uppercase tracking-tighter">Manifold Density</span>
                        <span className="text-xs font-bold text-cyan-400">{metrics.density} <span className="text-[8px] opacity-50">U/m²</span></span>
                    </div>
                    <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-cyan-500" 
                          animate={{ width: `${Math.min(100, parseFloat(metrics.density) * 10)}%` }}
                        />
                    </div>
                </div>

                <div className={`px-4 py-1.5 border ${isFrozen || isDeepFrozen ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5'} text-[10px] font-black flex items-center gap-2 rounded-sm`}>
                    <div className={`w-2 h-2 rounded-full ${isFrozen || isDeepFrozen ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`} />
                    {isDeepFrozen ? 'DEEPFREEZE_ACTIVE' : isFrozen ? 'SYSTEM_HALT' : `THERMAL: ${metrics.temp.toFixed(1)}°C`}
                </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCinematic && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsCinematic(false)}
            className="fixed bottom-8 right-8 z-[100] p-4 bg-cyan-500 text-black rounded-full shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-110 transition-transform flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
          >
            <Settings className="w-4 h-4 animate-spin-slow" />
            Restore Interface
          </motion.button>
        )}
      </AnimatePresence>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Telemetry & Swarm Data */}
        <AnimatePresence>
          {!isCinematic && (
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-72 border-r border-white/5 bg-black/40 flex flex-col z-40 backdrop-blur-xl"
            >
            <div className="p-4 border-b border-white/5 flex gap-2">
                <button 
                  onClick={() => setActiveTab('telemetry')}
                  className={`flex-1 py-2 text-[9px] font-black tracking-widest uppercase transition-all ${activeTab === 'telemetry' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-white/40 hover:text-white/60'}`}
                >
                  Telemetry
                </button>
                <button 
                  onClick={() => setActiveTab('console')}
                  className={`flex-1 py-2 text-[9px] font-black tracking-widest uppercase transition-all ${activeTab === 'console' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-white/40 hover:text-white/60'}`}
                >
                  Logs
                </button>
                <button 
                  onClick={() => setActiveTab('engineering')}
                  className={`flex-1 py-2 text-[9px] font-black tracking-widest uppercase transition-all ${activeTab === 'engineering' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-white/40 hover:text-white/60'}`}
                >
                  Engineering
                </button>
                <button 
                  onClick={() => setActiveTab('cognitive')}
                  className={`flex-1 py-2 text-[9px] font-black tracking-widest uppercase transition-all flex flex-col items-center ${activeTab === 'cognitive' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-white/40 hover:text-white/60'}`}
                >
                  Cognitive
                  <span className="text-[6px] opacity-50">Community Feed</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                <div className="mb-4 space-y-2">
                  <button 
                    onClick={() => setIsObserverMode(!isObserverMode)}
                    className={`w-full py-2 px-4 border text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                      isObserverMode 
                      ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {isObserverMode ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {isObserverMode ? 'Observer Active' : 'Engage Observer'}
                  </button>

                  <button 
                    onClick={() => setIsFirstPerson(!isFirstPerson)}
                    className={`w-full py-2 px-4 border text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                      isFirstPerson 
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    <Maximize2 className="w-3 h-3" />
                    {isFirstPerson ? 'Exit First Person' : 'Possess Agent'}
                  </button>

                  <button 
                    onClick={() => setIsCinematic(true)}
                    className="w-full py-2 px-4 border border-white/10 text-cyan-400/60 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <EyeOff className="w-3 h-3" />
                    Hide Interface (H)
                  </button>

                  <button 
                    onClick={() => setIsDeepFrozen(!isDeepFrozen)}
                    className={`w-full py-2 px-4 border text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                      isDeepFrozen 
                      ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    <Snowflake className={`w-3 h-3 ${isDeepFrozen ? 'animate-spin' : ''}`} />
                    {isDeepFrozen ? 'Deepfreeze Active' : 'Manual Deepfreeze'}
                  </button>
                </div>

                {activeTab === 'telemetry' ? (
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-[9px] font-black text-cyan-500/60 mb-3 tracking-[0.2em] uppercase flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Psi Swarm Status
                      </h2>
                      <div className="space-y-1">
                          {swarmData.map(s => (
                              <div key={s.id} className="group flex justify-between items-center text-[10px] bg-white/5 p-2.5 border-l-2 border-cyan-500/20 hover:border-cyan-500 hover:bg-cyan-500/5 transition-all">
                                  <span className="opacity-40 group-hover:opacity-100 transition-opacity">{s.id}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[8px] opacity-30">ALT</span>
                                    <span className="font-bold text-white tabular-nums">{s.y}m</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h2 className="text-[9px] font-black text-cyan-500/60 mb-3 tracking-[0.2em] uppercase flex items-center gap-2">
                        <Database className="w-3 h-3" />
                        System Vectors
                      </h2>
                      {[
                        { label: 'Grid Resolution', value: `${SYSTEM_LIMITS.GRID_RES}px` },
                        { label: 'Erosion Rate', value: `${SYSTEM_LIMITS.EROSION_BASE}Δ` },
                        { label: 'Sovereign Buffer', value: 'Active' },
                        { label: 'Manifold Sync', value: '98.2%' }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-[9px]">
                          <span className="opacity-40 uppercase">{item.label}</span>
                          <span className="text-cyan-400 font-bold">{item.value}</span>
                        </div>
                      ))}
                    </section>
                  </div>
                ) : activeTab === 'console' ? (
                  <div className="space-y-2">
                    {messages.filter(m => m.role === 'system' || m.role === 'ai' || m.role === 'user').map((m, i) => (
                      <div key={i} className={`text-[9px] border-l pl-2 py-1 ${m.role === 'user' ? 'text-emerald-400 border-emerald-500/30' : m.role === 'ai' ? 'text-cyan-400 border-cyan-500/30' : 'text-white/40 border-white/10'}`}>
                        <span className="opacity-40 mr-2">[{m.role.toUpperCase()}]</span>
                        {m.text}
                      </div>
                    ))}
                  </div>
                ) : activeTab === 'cognitive' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-[8px] font-black text-white/40 uppercase tracking-widest">
                        <Globe className="w-3 h-3" />
                        Public Cognitive Feed
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[7px] text-emerald-400 font-bold uppercase">Live Observation</span>
                      </div>
                    </div>

                    {/* Neural Topology Map (Visualizer) */}
                    <div className="relative h-32 bg-black/40 border border-white/5 rounded-sm overflow-hidden group">
                      <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <defs>
                            <radialGradient id="neural-glow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="rgba(6,182,212,0.4)" />
                              <stop offset="100%" stopColor="transparent" />
                            </radialGradient>
                          </defs>
                          {/* Simulated Neural Connections */}
                          {[...Array(12)].map((_, i) => (
                            <motion.line
                              key={i}
                              x1={Math.random() * 100} y1={Math.random() * 100}
                              x2={Math.random() * 100} y2={Math.random() * 100}
                              stroke="rgba(6,182,212,0.2)"
                              strokeWidth="0.5"
                              animate={{
                                opacity: isThinking ? [0.1, 0.5, 0.1] : 0.1,
                                strokeWidth: isThinking ? [0.5, 1, 0.5] : 0.5
                              }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                          {isThinking && (
                            <motion.circle
                              cx="50" cy="50" r="20"
                              fill="url(#neural-glow)"
                              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            />
                          )}
                        </svg>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <Brain className={`w-8 h-8 text-cyan-500/40 mb-2 ${isThinking ? 'animate-pulse scale-110' : ''}`} />
                        <span className="text-[8px] font-black text-cyan-400 uppercase tracking-[0.3em]">Neural Topology Active</span>
                      </div>
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <div className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-[6px] text-cyan-400 uppercase font-black">Sync: 99.8%</div>
                        <div className="px-1.5 py-0.5 bg-fuchsia-500/10 border border-fuchsia-500/20 text-[6px] text-fuchsia-400 uppercase font-black">Depth: 128-bit</div>
                      </div>
                    </div>

                    {/* Cognitive Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Reasoning Depth', value: 'High', color: 'text-cyan-400' },
                        { label: 'Semantic Density', value: '0.84 ρ', color: 'text-emerald-400' },
                        { label: 'Axiomatic Consistency', value: '99.9%', color: 'text-fuchsia-400' },
                        { label: 'Manifold Awareness', value: 'Active', color: 'text-blue-400' }
                      ].map((stat, i) => (
                        <div key={i} className="p-2 bg-white/5 border border-white/10 rounded-sm flex flex-col gap-1">
                          <span className="text-[7px] text-white/40 uppercase font-black tracking-widest">{stat.label}</span>
                          <span className={`text-[10px] font-bold ${stat.color}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-sm">
                      <h3 className="text-[10px] font-black text-cyan-400 uppercase mb-2 flex items-center gap-2">
                        <Terminal className="w-3 h-3" />
                        Neural Reasoning Stream
                      </h3>
                      <p className="text-[9px] text-white/60 leading-relaxed italic">
                        Observing internal manifold weights and topological conflict validation logic...
                      </p>
                    </div>

                    {isThinking && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black text-cyan-500/40 uppercase animate-pulse">
                          <span>Neural Synthesis in Progress</span>
                          <span>{Math.floor(Math.random() * 100)}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 5, repeat: Infinity }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {messages.filter(m => m.thought).map((m, i) => (
                        <div key={i} className="space-y-2 group">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[8px] font-bold text-cyan-500/40 uppercase">
                              <ChevronRight className="w-2 h-2" />
                              Cognitive Trace {i + 1}
                            </div>
                            <button className="text-[7px] font-black text-cyan-500/20 hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center gap-1">
                              <BookOpen className="w-2 h-2" />
                              Learn from Logic
                            </button>
                          </div>
                          <div className="text-[10px] text-white/80 bg-white/5 p-3 border-l border-cyan-500/30 font-mono leading-relaxed whitespace-pre-wrap group-hover:bg-cyan-500/5 transition-colors">
                            {m.thought}
                          </div>
                          <div className="flex gap-2">
                            <button className="px-2 py-1 bg-white/5 border border-white/10 text-[7px] font-black text-white/40 hover:text-cyan-400 hover:border-cyan-500/30 transition-all uppercase">
                              Verify Logic
                            </button>
                            <button className="px-2 py-1 bg-white/5 border border-white/10 text-[7px] font-black text-white/40 hover:text-fuchsia-400 hover:border-fuchsia-500/30 transition-all uppercase">
                              Share Insight
                            </button>
                          </div>
                        </div>
                      ))}
                      {messages.filter(m => m.thought).length === 0 && (
                        <div className="text-center py-10 opacity-20">
                          <Cpu className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                          <p className="text-[9px] uppercase font-black tracking-widest">No cognitive data captured</p>
                        </div>
                      )}
                    </div>

                    {/* Community Observation Feed (Simulated) */}
                    <div className="mt-6 border-t border-white/10 pt-4">
                      <h3 className="text-[9px] font-black text-white/40 uppercase mb-3 tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        Community Observation Feed
                      </h3>
                      <div className="space-y-2">
                        {[
                          { user: 'Observer_Alpha', text: 'Topological smoothing logic verified. Manifold stability confirmed.', time: '2m ago' },
                          { user: 'Dev_Atchley', text: 'Neural synthesis depth reached 128-bit. System nominal.', time: '5m ago' },
                          { user: 'Sim_Explorer', text: 'Learning from the erosion vector calculation. Fascinating logic.', time: '12m ago' }
                        ].map((log, i) => (
                          <div key={i} className="p-2 bg-white/2 border border-white/5 rounded-sm flex justify-between items-start gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black text-cyan-500/60 uppercase">{log.user}</span>
                              <p className="text-[9px] text-white/40 leading-tight">{log.text}</p>
                            </div>
                            <span className="text-[7px] text-white/20 whitespace-nowrap">{log.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-[9px] font-black text-cyan-500/60 mb-3 tracking-[0.2em] uppercase flex items-center gap-2">
                        <Settings className="w-3 h-3" />
                        Topological Tools
                      </h2>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'none', label: 'Observe', icon: MousePointer2 },
                          { id: 'erode', label: 'Erode', icon: Eraser },
                          { id: 'deposit', label: 'Deposit', icon: ArrowUpCircle },
                          { id: 'priority', label: 'Priority', icon: Target },
                          { id: 'seed', label: 'Seed', icon: Sprout },
                        ].map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as Tool)}
                            className={`flex flex-col items-center justify-center p-3 border transition-all gap-2 ${
                              activeTool === tool.id 
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_100px_rgba(6,182,212,0.2)]' 
                              : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                            }`}
                          >
                            <tool.icon className={`w-4 h-4 ${activeTool === tool.id && tool.id === 'seed' ? 'animate-bounce' : ''}`} />
                            <span className="text-[8px] font-black uppercase">{tool.label}</span>
                          </button>
                        ))}
                      </div>

                      {activeTool !== 'none' && (
                        <div className="mt-4 space-y-4 p-3 bg-white/5 border border-white/10 rounded-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between text-[8px] uppercase font-bold text-cyan-400/60">
                              <span>Brush Radius</span>
                              <span>{brushRadius}m</span>
                            </div>
                            <input 
                              type="range" min="2" max="30" step="1" 
                              value={brushRadius} 
                              onChange={(e) => setBrushRadius(parseInt(e.target.value))}
                              className="w-full accent-cyan-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[8px] uppercase font-bold text-cyan-400/60">
                              <span>Brush Strength</span>
                              <span>{(brushStrength * 10).toFixed(1)}x</span>
                            </div>
                            <input 
                              type="range" min="0.1" max="2.0" step="0.1" 
                              value={brushStrength} 
                              onChange={(e) => setBrushStrength(parseFloat(e.target.value))}
                              className="w-full accent-cyan-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={() => {
                          setPriorityZones([]);
                          priorityZonesRef.current = [];
                          setMessages(prev => [...prev, { role: 'system', text: 'Priority zones purged. Swarm returning to default vectors.' }]);
                        }}
                        className="w-full mt-2 py-2 bg-white/5 border border-white/10 text-[8px] font-black uppercase text-white/40 hover:text-white/60 hover:bg-white/10 transition-all"
                      >
                        Purge Priority Zones
                      </button>
                    </section>

                    <section>
                      <h2 className="text-[9px] font-black text-cyan-500/60 mb-3 tracking-[0.2em] uppercase flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        Coordinate Memory
                      </h2>
                      <div className="space-y-2">
                        <button 
                          onClick={() => {
                            if (activeTool === 'seed') {
                              // If seed tool is active, this button can act as a "Mass Seeding"
                              const newSeeds = Array.from({ length: 5 }).map(() => ({
                                x: (Math.random() - 0.5) * 100,
                                z: (Math.random() - 0.5) * 100,
                                growth: 0.1,
                                id: `SEED-${Math.random()}`
                              }));
                              setSeeds(prev => [...prev, ...newSeeds]);
                              setMessages(prev => [...prev, { role: 'system', text: 'Algorithmic mass seeding initiated.' }]);
                            } else {
                              const newWaypoint = { 
                                x: (Math.random() - 0.5) * 100, 
                                z: (Math.random() - 0.5) * 100, 
                                label: `LOC-${waypoints.length + 1}` 
                              };
                              setWaypoints([...waypoints, newWaypoint]);
                              setMessages(prev => [...prev, { role: 'system', text: `Coordinate ${newWaypoint.label} stored in memory.` }]);
                            }
                          }}
                          className="w-full py-2 bg-cyan-500/10 border border-cyan-500/30 text-[8px] font-black uppercase text-cyan-400 hover:bg-cyan-500/20 transition-all"
                        >
                          {activeTool === 'seed' ? 'Inject Data Seeds' : 'Store Current Vector'}
                        </button>
                        
                        <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                          {waypoints.map((wp, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-white/5 border border-white/5 text-[8px]">
                              <span className="text-white/60">{wp.label}</span>
                              <span className="text-cyan-500/40">[{wp.x.toFixed(0)}, {wp.z.toFixed(0)}]</span>
                            </div>
                          ))}
                        </div>

                        {waypoints.length >= 2 && (
                          <button 
                            onClick={() => setWormActive(!wormActive)}
                            className={`w-full py-2 border text-[8px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
                              wormActive 
                              ? 'bg-red-500/20 border-red-500 text-red-400' 
                              : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                            }`}
                          >
                            <Navigation className="w-3 h-3" />
                            {wormActive ? 'Halt Worm Travel' : 'Initiate Worm Travel'}
                          </button>
                        )}
                      </div>
                    </section>

                    <section className="p-3 bg-red-500/5 border border-red-500/20 rounded-sm">
                      <div className="flex items-center gap-2 text-red-400 font-black text-[9px] uppercase mb-2">
                        <AlertTriangle className="w-3 h-3" />
                        Conflict Validator
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px]">
                          <span className="opacity-60">Structural Safety</span>
                          <span className="text-green-400">NOMINAL</span>
                        </div>
                        <div className="flex justify-between text-[8px]">
                          <span className="opacity-60">Blob Invariants</span>
                          <span className="text-cyan-400">STABLE</span>
                        </div>
                        <div className="flex justify-between text-[8px]">
                          <span className="opacity-60">Entropy Threshold</span>
                          <span className={entropy > 1.5 ? 'text-red-400' : 'text-cyan-400'}>{entropy > 1.5 ? 'CRITICAL' : 'STABLE'}</span>
                        </div>
                        <div className="flex justify-between text-[8px]">
                          <span className="opacity-60">OWL3DGE Sync</span>
                          <span className="text-yellow-400">94.1%</span>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-2">
                      <h2 className="text-[9px] font-black text-cyan-500/60 mb-1 tracking-[0.2em] uppercase">Axiomatic Theorems</h2>
                      <p className="text-[8px] text-white/30 leading-relaxed italic">
                        "Topological stability is achieved through the synthesis of autonomous swarm vectors and sovereign manual intervention."
                      </p>
                    </section>
                  </div>
                )}
            </div>

            <div className="p-4 bg-cyan-500/5 border-t border-white/5">
                <div className="flex items-center gap-2 text-cyan-500 font-bold text-[9px] uppercase mb-2">
                  <Terminal className="w-3 h-3" />
                  Observation Protocol
                </div>
                <p className="text-[9px] text-white/40 leading-relaxed italic">
                  Topological variance monitored in real-time. Swarm agents executing terraforming subroutines.
                </p>
            </div>
          </motion.aside>
        )}
        </AnimatePresence>

        {/* Center: Observation Manifold */}
        <div className="flex-1 relative bg-[#01040a]">
            <div ref={mountRef} className="w-full h-full cursor-crosshair" />
            
            {/* Overlay HUD Elements */}
            <div className="absolute top-6 left-6 pointer-events-none space-y-4">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-black/80 border-l-2 border-cyan-500 p-4 backdrop-blur-md shadow-2xl max-w-xs"
                >
                    <div className="text-[10px] font-black text-cyan-400 mb-1 uppercase tracking-widest flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      Manifold Observation
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed">
                      Topological terraforming resolution: {SYSTEM_LIMITS.GRID_RES}². 
                      Swarm agility coefficient: {SYSTEM_LIMITS.SWARM_VEL_MAX}.
                    </p>
                </motion.div>

                {activeTool !== 'none' && (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-black/80 border-l-2 border-white/20 p-3 backdrop-blur-md shadow-2xl"
                  >
                    <div className="text-[8px] font-black text-white/40 mb-2 uppercase tracking-widest flex items-center gap-2">
                      <Settings className="w-3 h-3" />
                      Active Tool: {activeTool}
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <div className="text-[7px] text-white/20 uppercase">Radius</div>
                        <div className="text-[10px] font-bold text-cyan-400">{brushRadius}m</div>
                      </div>
                      <div>
                        <div className="text-[7px] text-white/20 uppercase">Strength</div>
                        <div className="text-[10px] font-bold text-cyan-400">{(brushStrength * 10).toFixed(1)}x</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-2 pointer-events-auto">
                  <div className="px-3 py-1.5 bg-black/80 border border-white/10 text-[8px] text-white/40 uppercase tracking-widest flex items-center gap-2 backdrop-blur-sm">
                    <div className="w-1 h-1 bg-cyan-500 rounded-full" />
                    Live Feed
                  </div>
                  <button 
                    onClick={() => setIsCinematic(!isCinematic)}
                    className={`px-3 py-1.5 bg-black/80 border border-white/10 text-[8px] uppercase tracking-widest flex items-center gap-2 backdrop-blur-sm transition-all ${isCinematic ? 'text-cyan-400 border-cyan-500' : 'text-white/40'}`}
                  >
                    <Maximize2 className="w-2 h-2" />
                    {isCinematic ? 'Exit Cinematic' : 'Cinematic View'}
                  </button>
                </div>
            </div>

            {/* Frozen State Overlay */}
            <AnimatePresence>
              {(isFrozen || isDeepFrozen) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 ${isDeepFrozen ? 'bg-blue-950/40' : 'bg-blue-900/20'} backdrop-blur-sm flex items-center justify-center pointer-events-none z-30`}
                  >
                      <div className={`p-12 border ${isDeepFrozen ? 'border-blue-400' : 'border-blue-500/50'} bg-black/95 shadow-[0_0_100px_rgba(59,130,246,0.1)] text-center relative overflow-hidden`}>
                          <div className={`absolute top-0 left-0 w-full h-1 ${isDeepFrozen ? 'bg-blue-400' : 'bg-blue-500'} animate-pulse`} />
                          <div className={`text-5xl font-black ${isDeepFrozen ? 'text-blue-400' : 'text-blue-500'} tracking-[0.4em] italic mb-4`}>
                            {isDeepFrozen ? 'DEEPFREEZE_ACTIVE' : 'SYSTEM_LOCKED'}
                          </div>
                          <div className="text-[10px] text-white/40 tracking-[0.3em] uppercase max-w-sm mx-auto leading-loose">
                            {isDeepFrozen 
                              ? 'Entropy singularity reached. All topological growth and swarm vectors suspended to prevent manifold collapse.'
                              : 'Thermal variance breach detected. Topological stability compromised. Initiating cooling sequence.'
                            }
                          </div>
                      </div>
                  </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
              <div className="flex gap-4">
                <div className="bg-black/80 border border-white/10 p-3 backdrop-blur-md">
                  <div className="text-[8px] text-white/30 uppercase mb-2">Vector Stability</div>
                  <div className="flex gap-1 items-end h-8">
                    {[40, 70, 50, 90, 60, 80, 45, 75, 55, 85].map((h, i) => (
                      <motion.div 
                        key={i} 
                        className="w-1 bg-cyan-500/40"
                        animate={{ height: `${h}%` }}
                        transition={{ repeat: Infinity, duration: 1 + Math.random(), repeatType: 'reverse' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Atchley_Topological_Terraforming</div>
                <div className="text-[8px] text-cyan-500/40 font-bold">COORDINATES: 37.7749° N, 122.4194° W</div>
              </div>
            </div>
        </div>

        {/* Right Sidebar: Neural Console */}
        <AnimatePresence>
          {!isCinematic && (
            <motion.aside 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-96 border-l border-white/5 bg-black/60 flex flex-col z-40 backdrop-blur-2xl shadow-[-20px_0_50px_rgba(0,0,0,0.8)]"
            >
            <div className="p-5 border-b border-cyan-500/10 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  <h2 className="text-[10px] font-black text-cyan-500 tracking-[0.3em] uppercase">Neural_Console</h2>
                </div>
                <div className="flex gap-2">
                  <Settings className="w-3 h-3 text-white/20 hover:text-white/60 cursor-pointer transition-colors" />
                  <Layers className="w-3 h-3 text-white/20 hover:text-white/60 cursor-pointer transition-colors" />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.filter(m => m.role !== 'system').map((m, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={idx} 
                      className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                          {m.role === 'ai' && <Cpu className="w-3 h-3 text-cyan-500" />}
                          <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest">
                            {m.role === 'user' ? 'Devin Atchley' : 'Sovereign Intelligence'}
                          </span>
                        </div>
                        <div className={`max-w-[95%] p-4 text-[11px] leading-relaxed shadow-2xl ${
                            m.role === 'user' 
                            ? 'bg-cyan-500/10 border border-cyan-400/20 text-cyan-50 rounded-lg rounded-tr-none' 
                            : 'bg-white/5 border border-white/10 text-white/80 rounded-lg rounded-tl-none'
                        }`}>
                            {m.text}
                        </div>
                    </motion.div>
                ))}
                {isThinking && (
                    <div className="flex items-start">
                        <div className="px-4 py-3 text-[10px] bg-cyan-500/5 border border-cyan-500/20 rounded-sm animate-pulse text-cyan-400 font-bold flex items-center gap-3">
                            <Zap className="w-3 h-3 animate-bounce" />
                            CALCULATING MANIFOLD VECTORS...
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSendMessage} className="p-6 border-t border-white/5 bg-black/40">
                <div className="relative group">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Transmit command to sovereign core..."
                        className="w-full bg-white/5 border border-white/10 rounded-sm pl-4 pr-12 py-3 text-[11px] focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all text-white placeholder-white/20"
                    />
                    <button 
                        type="submit"
                        disabled={isThinking}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-cyan-500 hover:text-cyan-400 disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="text-[8px] text-white/20 uppercase tracking-widest">Secure Link: AES-256</div>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-cyan-500/40 rounded-full" />
                    <div className="w-1 h-1 bg-cyan-500/40 rounded-full" />
                    <div className="w-1 h-1 bg-cyan-500/40 rounded-full" />
                  </div>
                </div>
            </form>
          </motion.aside>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
}
