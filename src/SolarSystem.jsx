import React, { useState, useRef, Suspense, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Billboard, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { createXRStore, XR, Interactive } from '@react-three/xr';
import { Play, Pause, RotateCcw, X, MapPin, Thermometer, Weight, Activity, FileText, LayoutGrid, Gauge, Glasses, Hand } from 'lucide-react';

// ==================== TEXTURE IMPORTS ====================
import mercuryImg from './textures/mercury.jpg';
import venusImg from './textures/venus.jpg';
import earthImg from './textures/earth.jpg';
import marsImg from './textures/mars.jpg';
import jupiterImg from './textures/jupiter.jpg';
import saturnImg from './textures/saturn.jpg';
import uranusImg from './textures/uranus.jpg';
import neptuneImg from './textures/neptune.jpg';
import sunImg from './textures/sun.jpg';

// ==================== DATA CONFIGURATION ====================
const SUN_DATA = {
  id: "sun",
  name: { en: "The Sun", mn: "Нар" },
  radius: 109,
  velocity: 0,
  orbitRadius: 0,
  texture: sunImg,
  color: "#FDB813",
  details: {
    temp: "5,500°C",
    gravity: "274 m/s²",
    type: { en: "Yellow Dwarf Star", mn: "Шар одой од" },
    desc: { en: "The heart of our solar system.", mn: "Манай нарны аймгийн төв." }
  }
};

const PLANET_DATA = [
  { id: "mercury", radius: 0.38, orbitRadius: 12, period: 87.97, velocity: 47.87, texture: mercuryImg, color: "#8C7853", name: { en: "Mercury", mn: "Буд" }, details: { temp: "167°C", gravity: "3.7 m/s²", type: {en: "Terrestrial", mn: "Хатуу"}, desc: { en: "Smallest planet, closest to Sun.", mn: "Нартай хамгийн ойр, хамгийн жижиг." } } },
  { id: "venus", radius: 0.95, orbitRadius: 18, period: 224.70, velocity: 35.02, texture: venusImg, color: "#FFC649", name: { en: "Venus", mn: "Сугар" }, details: { temp: "464°C", gravity: "8.87 m/s²", type: {en: "Terrestrial", mn: "Хатуу"}, desc: { en: "Hottest planet due to greenhouse effect.", mn: "Хүлэмжийн хийн улмаас хамгийн халуун." } } },
  { id: "earth", radius: 1, orbitRadius: 25, period: 365.25, velocity: 29.78, texture: earthImg, color: "#2E7DD1", hasClouds: true, hasAtmosphere: true, name: { en: "Earth", mn: "Дэлхий" }, details: { temp: "15°C", gravity: "9.8 m/s²", type: {en: "Terrestrial", mn: "Хатуу"}, desc: { en: "The only known planet with life.", mn: "Амьдрал байгаа нь батлагдсан цор ганц гараг." } } },
  { id: "mars", radius: 0.53, orbitRadius: 35, period: 686.98, velocity: 24.07, texture: marsImg, color: "#CD5C5C", name: { en: "Mars", mn: "Ангараг" }, details: { temp: "-65°C", gravity: "3.71 m/s²", type: {en: "Terrestrial", mn: "Хатуу"}, desc: { en: "The Red Planet. Dusty and cold.", mn: "Улаан нүдэн гараг. Тоостой, хүйтэн." } } },
  { id: "jupiter", radius: 2.8, orbitRadius: 60, period: 4332.59, velocity: 13.07, texture: jupiterImg, color: "#D4A373", name: { en: "Jupiter", mn: "Бархасбадь" }, details: { temp: "-110°C", gravity: "24.79 m/s²", type: {en: "Gas Giant", mn: "Хийн аварга"}, desc: { en: "Largest planet in the solar system.", mn: "Нарны аймгийн хамгийн том гараг." } } },
  { id: "saturn", radius: 2.3, orbitRadius: 85, period: 10759.22, velocity: 9.69, texture: saturnImg, color: "#FAD5A5", hasRing: true, name: { en: "Saturn", mn: "Санчир" }, details: { temp: "-140°C", gravity: "10.44 m/s²", type: {en: "Gas Giant", mn: "Хийн аварга"}, desc: { en: "Famous for its beautiful ring system.", mn: "Үзэсгэлэнт цагирагаараа алдартай." } } },
  { id: "uranus", radius: 1.6, orbitRadius: 110, period: 30688.5, velocity: 6.81, texture: uranusImg, color: "#4FD0E7", name: { en: "Uranus", mn: "Тэнгэрийн ван" }, details: { temp: "-195°C", gravity: "8.69 m/s²", type: {en: "Ice Giant", mn: "Мөсөн аварга"}, desc: { en: "Rotates on its side.", mn: "Хажуулдаж эргэдэг онцлогтой." } } },
  { id: "neptune", radius: 1.55, orbitRadius: 135, period: 60182, velocity: 5.43, texture: neptuneImg, color: "#4166F5", name: { en: "Neptune", mn: "Далайн ван" }, details: { temp: "-200°C", gravity: "11.15 m/s²", type: {en: "Ice Giant", mn: "Мөсөн аварга"}, desc: { en: "Windiest planet with supersonic storms.", mn: "Хэт авианы хурдтай шуурга болдог." } } }
];

const TRANSLATIONS = {
  en: { 
    app_title: "Solar Simulator", sim_settings: "Simulation Target", years: "Years", months: "Months", days: "Days", 
    start_sim: "Simulate", stop_sim: "Stop", reset: "Reset", dist_traveled: "Distance Traveled", velocity: "Avg Velocity",
    million_km: "million km", km_s: "km/s", lang: "EN", focus: "Focus", exit: "Exit", mission_report: "Mission Report",
    mission_complete: "Simulation Complete", report_desc: "Visualizing planetary travel distance for this period.",
    close: "Close", menu: "System Map", overview: "System Overview", speed: "Speed", enter_vr: "Enter VR", exit_vr: "Exit VR",
    vr_not_supported: "VR not supported", vr_hint: "Point at planets to select", grab_planet: "Selected", loading: "Loading System..."
  },
  mn: { 
    app_title: "Нарны Систем", sim_settings: "Симуляцийн тохиргоо", years: "Жил", months: "Сар", days: "Өдөр",
    start_sim: "Эхлүүлэх", stop_sim: "Зогсоох", reset: "Шинэчлэх", dist_traveled: "Туулсан зам", velocity: "Дундаж хурд",
    million_km: "сая км", km_s: "км/с", lang: "МН", focus: "Төвлөрөх", exit: "Гарах", mission_report: "Үр дүнгийн тайлан",
    mission_complete: "Симуляци дууслаа", report_desc: "Энэ хугацаанд гаргуудын туулсан замыг харьцуулав.",
    close: "Хаах", menu: "Газрын зураг", overview: "Системийг харах", speed: "Хурд", enter_vr: "VR-д орох", exit_vr: "VR-аас гарах",
    vr_not_supported: "VR дэмжигдэхгүй", vr_hint: "Гараараа заана уу", grab_planet: "Сонгосон", loading: "Систем ачааллаж байна..."
  }
};

// ==================== SHADERS ====================
const AtmosphereShader = {
  uniforms: { 
    c: { value: 0.15 }, 
    p: { value: 6.5 }, 
    glowColor: { value: new THREE.Color(0x4ca6ff) } 
  },
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float c;
    uniform float p;
    uniform vec3 glowColor;
    varying vec3 vNormal;
    void main() {
      float intensity = pow(c - dot(vNormal, vec3(0, 0, 1.0)), p);
      gl_FragColor = vec4(glowColor, 1.0) * intensity;
    }
  `,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true
};

// ==================== TEXTURE COMPONENTS ====================
function PlanetSkin({ texturePath }) {
  const texture = useTexture(texturePath);
  return <meshStandardMaterial map={texture} roughness={1} metalness={0} />;
}

function FallbackSkin({ color }) {
  return <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />;
}

// ==================== PROCEDURAL TEXTURES (Fallback) ====================
function createProceduralTexture(color, type = 'planet') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  const baseColor = new THREE.Color(color);
  
  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  gradient.addColorStop(0, baseColor.getStyle());
  gradient.addColorStop(0.7, baseColor.clone().multiplyScalar(0.7).getStyle());
  gradient.addColorStop(1, baseColor.clone().multiplyScalar(0.3).getStyle());
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ==================== VR HAND TRACKING HINT ====================
function VRHint({ lang }) {
  const [visible, setVisible] = useState(true);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <Billboard position={[0, 20, 0]}>
      <Html center>
        <div className="bg-blue-600/90 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl shadow-2xl animate-pulse">
          <div className="flex items-center gap-3 text-white">
            <Hand className="w-6 h-6" />
            <span className="font-bold text-lg">{t.vr_hint}</span>
          </div>
        </div>
      </Html>
    </Billboard>
  );
}

// ==================== CAMERA RIG ====================
function CameraRig({ selectedPlanet, focusRef, isVR }) {
  const { camera, controls } = useThree();
  const isFlying = useRef(false);
  const targetPos = useRef(new THREE.Vector3());
  const currentTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    isFlying.current = true;
  }, [selectedPlanet]);

  useFrame(() => {
    if (isVR || !controls) return;

    if (selectedPlanet && focusRef.current) {
      focusRef.current.getWorldPosition(targetPos.current);
      currentTarget.current.lerp(targetPos.current, 0.1);
      controls.target.copy(currentTarget.current);

      if (isFlying.current) {
        const offset = selectedPlanet.id === 'sun' ? 35 : selectedPlanet.radius * 12;
        const height = selectedPlanet.id === 'sun' ? 5 : selectedPlanet.radius * 4;
        
        const direction = targetPos.current.clone().normalize();
        if (targetPos.current.length() < 0.1) direction.set(0, 0, 1);
        
        const desiredPos = targetPos.current.clone().add(direction.multiplyScalar(offset));
        desiredPos.y += height;
        
        camera.position.lerp(desiredPos, 0.05);
        
        if (camera.position.distanceTo(desiredPos) < 2) {
          isFlying.current = false;
        }
      }
    } else {
      const overviewPos = new THREE.Vector3(0, 60, 140);
      
      if (isFlying.current) {
        currentTarget.current.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        controls.target.copy(currentTarget.current);
        camera.position.lerp(overviewPos, 0.05);
        
        if (camera.position.distanceTo(overviewPos) < 2) {
          isFlying.current = false;
        }
      }
    }

    controls.update();
  });

  return null;
}

// ==================== SUN COMPONENT ====================
function Sun({ onClick, isSelected, focusRef, isVR }) {
  const meshRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.002;
      if (isSelected && focusRef) focusRef.current = meshRef.current;
    }
  });

  const handleSelect = useCallback(() => {
    onClick(SUN_DATA);
    setIsHovered(false);
  }, [onClick]);

  const handleHover = useCallback(() => setIsHovered(true), []);
  const handleBlur = useCallback(() => setIsHovered(false), []);

  const sunMesh = (
    <group ref={meshRef}>
      <mesh>
        <sphereGeometry args={[8, 64, 64]} />
        <Suspense fallback={<meshBasicMaterial color={SUN_DATA.color} />}>
          {SUN_DATA.texture ? (
            <PlanetSkin texturePath={SUN_DATA.texture} />
          ) : (
            <meshBasicMaterial color={SUN_DATA.color} toneMapped={false} />
          )}
        </Suspense>
      </mesh>
      <mesh scale={1.2}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial 
          color={isHovered ? "#FFD700" : "#FDB813"} 
          transparent 
          opacity={isHovered ? 0.5 : 0.3} 
          side={THREE.BackSide} 
        />
      </mesh>
    </group>
  );

  return (
    <group>
      <pointLight intensity={1.5} distance={0} decay={0} castShadow color="#FFFFDD" />
      
      {isVR ? (
        <Interactive onSelect={handleSelect} onHover={handleHover} onBlur={handleBlur}>
          {sunMesh}
          <mesh visible={false}>
            <sphereGeometry args={[14, 16, 16]} />
          </mesh>
        </Interactive>
      ) : (
        <>
          {sunMesh}
          <mesh 
            visible={false} 
            onClick={handleSelect}
            onPointerOver={() => {
              document.body.style.cursor = 'pointer';
              setIsHovered(true);
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
              setIsHovered(false);
            }}
          >
            <sphereGeometry args={[14, 16, 16]} />
          </mesh>
        </>
      )}

      {isSelected && (
        <Billboard>
          <Html center>
            <div className="w-20 h-20 rounded-full border-[3px] border-yellow-400/60 animate-pulse" />
          </Html>
        </Billboard>
      )}
    </group>
  );
}

// ==================== PLANET COMPONENT ====================
const Planet = React.memo(({ data, simState, onClick, isSelected, focusRef, lang, isVR }) => {
  const planetRef = useRef();
  const meshRef = useRef();
  const cloudsRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinched, setIsPinched] = useState(false);

  const texture = useMemo(() => createProceduralTexture(data.color), [data.color]);

  const orbitRingGeometry = useMemo(() => 
    new THREE.RingGeometry(data.orbitRadius - 0.1, data.orbitRadius + 0.1, 128),
    [data.orbitRadius]
  );

  const planetGeometry = useMemo(() => 
    new THREE.SphereGeometry(data.radius, 64, 64),
    [data.radius]
  );

  const ringGeometry = useMemo(() => 
    data.hasRing ? new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.5, 64) : null,
    [data.hasRing, data.radius]
  );

  useFrame((state, delta) => {
    if (!planetRef.current) return;

    const angle = (simState.current.totalDays / data.period) * (Math.PI * 2);
    planetRef.current.position.x = Math.cos(angle) * data.orbitRadius;
    planetRef.current.position.z = Math.sin(angle) * data.orbitRadius;

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.01;
    }

    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.012;
    if (isSelected && focusRef) focusRef.current = planetRef.current;
  });

  const handleSelect = useCallback(() => {
    onClick(data);
    setIsPinched(true);
    setTimeout(() => setIsPinched(false), 1000);
    setIsHovered(false);
  }, [onClick, data]);

  const handleHover = useCallback(() => setIsHovered(true), []);
  const handleBlur = useCallback(() => setIsHovered(false), []);

  const planetMesh = (
    <>
      <mesh castShadow receiveShadow>
        <primitive object={planetGeometry} />
        <Suspense fallback={<FallbackSkin color={data.color} />}>
          {data.texture ? (
            <PlanetSkin texturePath={data.texture} />
          ) : (
            <FallbackSkin color={data.color} />
          )}
        </Suspense>
      </mesh>

      {data.hasAtmosphere && (
        <mesh scale={1.1}>
          <primitive object={planetGeometry} />
          <shaderMaterial attach="material" args={[AtmosphereShader]} />
        </mesh>
      )}

      {data.hasClouds && (
        <mesh ref={cloudsRef} scale={1.02}>
          <primitive object={planetGeometry} />
          <meshStandardMaterial color="white" transparent opacity={0.4} />
        </mesh>
      )}

      {data.hasRing && ringGeometry && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <primitive object={ringGeometry} />
          <meshStandardMaterial color={data.color} opacity={0.8} transparent side={THREE.DoubleSide} />
        </mesh>
      )}

      {(isHovered || isPinched) && (
        <mesh scale={1.3}>
          <primitive object={planetGeometry} />
          <meshBasicMaterial 
            color={isPinched ? "#00ff00" : data.color} 
            transparent 
            opacity={isPinched ? 0.4 : 0.2} 
            side={THREE.BackSide} 
          />
        </mesh>
      )}
    </>
  );

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={orbitRingGeometry} />
        <meshBasicMaterial color="#ffffff" opacity={0.1} transparent side={THREE.DoubleSide} />
      </mesh>

      <group ref={planetRef}>
        <group ref={meshRef}>
          {isVR ? (
            <Interactive onSelect={handleSelect} onHover={handleHover} onBlur={handleBlur}>
              {planetMesh}
              <mesh visible={false}>
                <sphereGeometry args={[Math.max(data.radius * 3, 2), 16, 16]} />
              </mesh>
            </Interactive>
          ) : (
            <>
              {planetMesh}
              <mesh 
                visible={false} 
                onClick={handleSelect}
                onPointerOver={() => {
                  document.body.style.cursor = 'pointer';
                  setIsHovered(true);
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'auto';
                  setIsHovered(false);
                }}
              >
                <sphereGeometry args={[Math.max(data.radius * 3, 2), 16, 16]} />
              </mesh>
            </>
          )}
        </group>

        {!isVR && (
          <Html 
            position={[0, data.radius + 1.5, 0]} 
            center 
            distanceFactor={15}
            style={{ pointerEvents: 'none' }}
          >
            <div className={`flex flex-col items-center transition-all duration-300 ${isSelected || isHovered ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
              <div className="bg-black/50 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap">
                {data.name[lang]}
              </div>
              <div className="w-0.5 h-4 bg-white/20" />
            </div>
          </Html>
        )}

        {isPinched && isVR && (
          <Billboard position={[0, data.radius + 3, 0]}>
            <Html center>
              <div className="bg-green-500/90 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-xl">
                <span className="text-white font-bold">{TRANSLATIONS[lang].grab_planet}</span>
              </div>
            </Html>
          </Billboard>
        )}
      </group>
    </>
  );
});

// ==================== MAIN SCENE ====================
function SceneContent({ xrStore }) {
  const { controls } = useThree();
  const simRef = useRef({ totalDays: 0, targetDays: 0, isSimulating: false, finished: false, speed: 1 });
  const focusRef = useRef(null);

  const [uiDays, setUiDays] = useState(0);
  const [simSpeed, setSimSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [lang, setLang] = useState('en');
  const [inputs, setInputs] = useState({ y: 0, m: 0, d: 0 });
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isVR, setIsVR] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr')
        .then(setIsVRSupported)
        .catch(() => setIsVRSupported(false));
    }
  }, []);

  // Listen to XR session changes
  useEffect(() => {
    const checkVRSession = () => {
      setIsVR(xrStore.isPresenting);
    };

    checkVRSession();
    const interval = setInterval(checkVRSession, 100);
    return () => clearInterval(interval);
  }, [xrStore]);

  useEffect(() => {
    if (controls) {
      controls.enabled = !isVR;
    }
  }, [isVR, controls]);

  const handleFocus = useCallback((planetData) => {
    if (selectedPlanet?.id === planetData.id) return;
    setSelectedPlanet(planetData);
  }, [selectedPlanet]);

  const handleOverview = useCallback(() => {
    setSelectedPlanet(null);
    focusRef.current = null;
  }, []);

  const handleSpeedChange = useCallback((e) => {
    const val = parseFloat(e.target.value);
    setSimSpeed(val);
    simRef.current.speed = val;
  }, []);

  useFrame((state, delta) => {
    const sim = simRef.current;
    if (sim.isSimulating) {
      const increment = (5 * sim.speed) * (delta * 60);

      if (sim.targetDays > 0) {
        sim.totalDays += increment;
        if (sim.totalDays >= sim.targetDays) {
          sim.totalDays = sim.targetDays;
          sim.isSimulating = false;
          sim.finished = true;
          sim.targetDays = 0;
        }
      } else {
        sim.totalDays += increment;
      }
    }

    if (Math.floor(state.clock.elapsedTime * 5) % 1 === 0) {
      setUiDays(Math.floor(sim.totalDays));
      if (sim.finished) {
        setShowReport(true);
        sim.finished = false;
      }
    }
  });

  const toggleSim = useCallback(() => {
    const total = (inputs.y * 365) + (inputs.m * 30) + inputs.d;
    simRef.current.isSimulating = !simRef.current.isSimulating;
    setShowReport(false);
    if (total > 0 && simRef.current.isSimulating) {
      simRef.current.targetDays = simRef.current.totalDays + total;
    }
  }, [inputs]);

  const reset = useCallback(() => {
    simRef.current = { totalDays: 0, targetDays: 0, isSimulating: false, finished: false, speed: simSpeed };
    setUiDays(0);
    setInputs({ y: 0, m: 0, d: 0 });
    handleOverview();
    setShowReport(false);
  }, [simSpeed, handleOverview]);

  const formatDist = useCallback((km) => 
    km > 1000000 ? `${(km / 1000000).toFixed(2)} ${t.million_km}` : `${km.toLocaleString()} km`,
    [t]
  );

  const currentDist = selectedPlanet ? (selectedPlanet.velocity * uiDays * 24 * 3600) : 0;

  const handleEnterVR = useCallback(async () => {
    try {
      await xrStore.enterVR();
    } catch (error) {
      console.error('Failed to enter VR:', error);
    }
  }, [xrStore]);

  return (
    <>
      <OrbitControls 
        makeDefault 
        maxDistance={400} 
        minDistance={2} 
        enablePan={true}
        enabled={!isVR}
      />

      <CameraRig selectedPlanet={selectedPlanet} focusRef={focusRef} isVR={isVR} />

      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffaa00" distance={0} decay={0} />
      <directionalLight position={[50, 50, 50]} intensity={0.5} color="#ffffff" />

      {isVR && <VRHint lang={lang} />}

      <Sun onClick={handleFocus} isSelected={selectedPlanet?.id === 'sun'} focusRef={focusRef} isVR={isVR} />

      {PLANET_DATA.map((p) => (
        <Planet 
          key={p.id}
          data={p}
          simState={simRef}
          isSelected={selectedPlanet?.id === p.id}
          onClick={handleFocus}
          focusRef={focusRef}
          lang={lang}
          isVR={isVR}
        />
      ))}

      {!isVR && (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
          <div className="w-full h-full text-white font-sans select-none relative">
            
            <div className="absolute top-1/2 -translate-y-1/2 left-6 pointer-events-auto flex flex-col gap-2 z-50">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-1 w-48">
                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 mb-1">
                  {t.menu}
                </div>
                <button 
                  onClick={handleOverview}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${!selectedPlanet ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-white/10 text-gray-300'}`}
                >
                  <LayoutGrid className="w-4 h-4" /> {t.overview}
                </button>
                <div className="h-[1px] bg-white/10 my-1" />
                <button 
                  onClick={() => handleFocus(SUN_DATA)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${selectedPlanet?.id === 'sun' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'hover:bg-white/10 text-gray-300'}`}
                >
                  <div className="w-2 h-2 rounded-full bg-[#FDB813] shadow-[0_0_8px_#FDB813]" /> 
                  {SUN_DATA.name[lang]}
                </button>
                
                <div className="h-[1px] bg-white/10 my-1" />
                
                <div className="flex flex-col gap-1 max-h-[40vh] overflow-y-auto pr-1">
                  {PLANET_DATA.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleFocus(p)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium w-full text-left
                        ${selectedPlanet?.id === p.id 
                          ? 'bg-blue-600/30 text-blue-200 border border-blue-500/50' 
                          : 'hover:bg-white/10 text-gray-300'}`}
                    >
                      <div 
                        className="w-2 h-2 rounded-full shadow-sm" 
                        style={{ backgroundColor: p.color, boxShadow: `0 0 5px ${p.color}` }} 
                      />
                      {p.name[lang]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 pointer-events-auto flex gap-3">
              <button
                onClick={() => setLang(l => l === 'en' ? 'mn' : 'en')}
                className="bg-black/40 backdrop-blur-xl border border-white/10 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold hover:bg-white/10 transition-all"
              >
                {t.lang}
              </button>
              
              {isVRSupported && (
                <button
                  onClick={handleEnterVR}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 h-10 rounded-full flex items-center gap-2 font-medium transition-all shadow-lg shadow-blue-900/50"
                >
                  <Glasses className="w-4 h-4" /> {t.enter_vr}
                </button>
              )}
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto w-full max-w-2xl px-6">
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl flex flex-col gap-4">
                
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>{t.sim_settings}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">{t.speed}</span>
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={simSpeed}
                      onChange={handleSpeedChange}
                      className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs text-white font-mono w-8">{simSpeed.toFixed(1)}x</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex bg-black/30 rounded-xl p-1 border border-white/5 flex-1">
                    {[
                      { key: 'y', label: t.years, max: 100 },
                      { key: 'm', label: t.months, max: 12 },
                      { key: 'd', label: t.days, max: 30 }
                    ].map((field) => (
                      <div key={field.key} className="relative flex-1 group">
                        <input
                          type="number"
                          min="0"
                          max={field.max}
                          value={inputs[field.key] || ''}
                          placeholder="0"
                          onChange={(e) => setInputs(prev => ({ ...prev, [field.key]: parseInt(e.target.value) || 0 }))}
                          className="w-full bg-transparent text-center text-white font-bold py-2 focus:outline-none focus:bg-white/5 rounded-lg transition-all"
                        />
                        <span className="absolute bottom-0 left-0 w-full text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest pointer-events-none pb-0.5 group-hover:text-blue-400 transition-colors">
                          {field.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="h-10 w-[1px] bg-white/10" />

                  <button
                    onClick={toggleSim}
                    className={`h-12 px-6 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg
                      ${simRef.current.isSimulating 
                        ? 'bg-red-500/80 hover:bg-red-500 text-white shadow-red-900/30' 
                        : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-900/30'}`}
                  >
                    {simRef.current.isSimulating ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    {simRef.current.isSimulating ? t.stop_sim : t.start_sim}
                  </button>

                  <button
                    onClick={reset}
                    className="h-12 w-12 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all group"
                  >
                    <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
                  </button>
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Gauge className="w-3 h-3" />
                    <span>{t.days}: <span className="text-white font-mono text-sm">{uiDays}</span></span>
                  </div>
                  {selectedPlanet && (
                     <div className="flex items-center gap-2 text-blue-300">
                       <MapPin className="w-3 h-3" />
                       <span>{t.dist_traveled}: <span className="text-white font-mono">{formatDist(currentDist)}</span></span>
                     </div>
                  )}
                </div>
              </div>
            </div>

            {selectedPlanet && (
              <div className="absolute top-1/2 -translate-y-1/2 right-6 pointer-events-auto w-80">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="relative h-32 bg-gradient-to-b from-blue-900/40 to-black/0 p-6 flex flex-col justify-end">
                    <div className="absolute top-4 right-4">
                       <button onClick={handleOverview} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                         <X className="w-5 h-5" />
                       </button>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-1">{selectedPlanet.name[lang]}</h2>
                    <p className="text-blue-300 text-sm font-medium">{selectedPlanet.details.type[lang]}</p>
                  </div>
                  
                  <div className="p-6 pt-2 space-y-6">
                    <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-blue-500 pl-3">
                      {selectedPlanet.details.desc[lang]}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-1">
                          <Thermometer className="w-3 h-3" /> Temp
                        </div>
                        <div className="text-white font-mono">{selectedPlanet.details.temp}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-1">
                          <Weight className="w-3 h-3" /> Gravity
                        </div>
                        <div className="text-white font-mono">{selectedPlanet.details.gravity}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5 col-span-2">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-1">
                          <Activity className="w-3 h-3" /> {t.velocity}
                        </div>
                        <div className="text-white font-mono">{selectedPlanet.velocity} {t.km_s}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showReport && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-[60]">
                <div className="bg-[#1a1a2e] border border-blue-500/30 p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(59,130,246,0.3)] text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{t.mission_complete}</h3>
                  <p className="text-gray-400 text-sm mb-8">{t.report_desc}</p>
                  
                  <div className="bg-black/30 rounded-xl p-4 mb-8 border border-white/5">
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{t.days}</div>
                    <div className="text-3xl font-mono text-white">{uiDays}</div>
                  </div>
                  
                  <button
                    onClick={() => setShowReport(false)}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </Html>
      )}
    </>
  );
}

// Create XR store globally
const store = createXRStore();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [lang] = useState('en');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <Canvas
        shadows
        camera={{ position: [0, 60, 140], fov: 45 }}
        gl={{ 
          antialias: true, 
          toneMapping: THREE.ACESFilmicToneMapping, 
          outputColorSpace: THREE.SRGBColorSpace 
        }}
      >
        <XR store={store}>
          <Suspense fallback={null}>
            <SceneContent xrStore={store} />
          </Suspense>
        </XR>
      </Canvas>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
             <div className="text-blue-500 font-mono text-sm animate-pulse">{TRANSLATIONS[lang].loading}</div>
          </div>
        </div>
      )}
    </div>
  );
}