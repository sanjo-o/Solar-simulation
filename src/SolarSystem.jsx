import React, { useState, useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Billboard, useTexture, Loader } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Calculator, X, MapPin, Thermometer, Weight, Activity, FileText, ChevronRight, LayoutGrid, Gauge } from 'lucide-react';

// --- IMAGE IMPORTS ---
import mercuryImg from './textures/mercury.jpg';
import venusImg   from './textures/venus.jpg';
import earthImg   from './textures/earth.jpg';
import marsImg    from './textures/mars.jpg';
import jupiterImg from './textures/jupiter.jpg';
import saturnImg  from './textures/saturn.jpg';
import uranusImg  from './textures/uranus.jpg';
import neptuneImg from './textures/neptune.jpg';
import sunImg     from './textures/sun.jpg';

// --- DATA ---
const SUN_DATA = {
  id: "sun",
  name: { en: "The Sun", mn: "Нар" },
  radius: 109,
  velocity: 0,
  orbitRadius: 0, 
  texture: sunImg,
  color: "#FDB813",
  details: { temp: "5,500°C", gravity: "274 m/s²", type: { en: "Yellow Dwarf Star", mn: "Шар одой од" }, desc: { en: "The heart of our solar system.", mn: "Манай нарны аймгийн төв." } }
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
  en: { app_title: "Solar Simulator", sim_settings: "Simulation Target", years: "Years", months: "Months", days: "Days", start_sim: "Simulate", stop_sim: "Stop", reset: "Reset", dist_traveled: "Distance Traveled", velocity: "Avg Velocity", million_km: "million km", km_s: "km/s", lang: "EN", focus: "Focus", exit: "Exit", mission_report: "Mission Report", mission_complete: "Simulation Complete", report_desc: "Visualizing planetary travel distance for this period.", close: "Close", menu: "System Map", overview: "System Overview", speed: "Speed" },
  mn: { app_title: "Нарны Систем", sim_settings: "Симуляцийн тохиргоо", years: "Жил", months: "Сар", days: "Өдөр", start_sim: "Эхлүүлэх", stop_sim: "Зогсоох", reset: "Шинэчлэх", dist_traveled: "Туулсан зам", velocity: "Дундаж хурд", million_km: "сая км", km_s: "км/с", lang: "МН", focus: "Төвлөрөх", exit: "Гарах", mission_report: "Үр дүнгийн тайлан", mission_complete: "Симуляци дууслаа", report_desc: "Энэ хугацаанд гаргуудын туулсан замыг харьцуулав.", close: "Хаах", menu: "Газрын зураг", overview: "Системийг харах", speed: "Хурд" }
};

const AtmosphereShader = {
  uniforms: { c: { value: 0.15 }, p: { value: 6.5 }, glowColor: { value: new THREE.Color(0x4ca6ff) } },
  vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform float c; uniform float p; uniform vec3 glowColor; varying vec3 vNormal; void main() { float intensity = pow(c - dot(vNormal, vec3(0, 0, 1.0)), p); gl_FragColor = vec4(glowColor, 1.0) * intensity; }`,
  side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
};

function PlanetSkin({ texturePath, color }) {
  const texture = useTexture(texturePath);
  return <meshStandardMaterial map={texture} roughness={1} metalness={0} />;
}
function FallbackSkin({ color }) {
  return <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />;
}

// --- CAMERA RIG ---
function CameraRig({ selectedPlanet, focusRef }) {
    const { camera, controls } = useThree();
    const isFlying = useRef(false);

    useEffect(() => {
        isFlying.current = true;
    }, [selectedPlanet]);
    
    useFrame((state, delta) => {
        if (!controls) return;

        // MODE 1: TRACKING OBJECT
        if (selectedPlanet && focusRef.current) {
            const currentPos = new THREE.Vector3();
            focusRef.current.getWorldPosition(currentPos);

            // 1. Lock Target
            controls.target.lerp(currentPos, 0.5);

            // 2. Fly In (Run Once)
            if (isFlying.current) {
                let offsetDistance, heightOffset;

                if (selectedPlanet.id === 'sun') {
                    // SUN SETTINGS
                    offsetDistance = 35; 
                    heightOffset = 5; 
                } else {
                    // PLANET SETTINGS
                    offsetDistance = selectedPlanet.radius * 12;
                    heightOffset = selectedPlanet.radius * 4;
                }

                // Calculate "Day Side" Position
                const vecFromSun = currentPos.clone().normalize(); 
                if (currentPos.length() < 0.1) vecFromSun.set(0, 0, 1); 

                const desiredCamPos = currentPos.clone().add(vecFromSun.multiplyScalar(offsetDistance));
                desiredCamPos.y += heightOffset; 

                // Fly
                camera.position.lerp(desiredCamPos, 0.05);

                // RELEASE CONTROL
                if (camera.position.distanceTo(desiredCamPos) < 2) {
                    isFlying.current = false;
                }
            }
        } 
        // MODE 2: OVERVIEW
        else {
            const origin = new THREE.Vector3(0, 0, 0);
            const overviewPos = new THREE.Vector3(0, 60, 140);
            
            if (isFlying.current) {
               controls.target.lerp(origin, 0.1);
               camera.position.lerp(overviewPos, 0.05);
               if (camera.position.distanceTo(overviewPos) < 2) isFlying.current = false;
            }
        }
        
        controls.update();
    });
    return null;
}

// --- 3D COMPONENTS ---
function Sun({ onClick, isSelected, focusRef }) {
  const meshRef = useRef();
  const texture = useTexture(SUN_DATA.texture); 
  
  useFrame((state, delta) => { 
      if (meshRef.current) meshRef.current.rotation.y += delta * 0.002; 
      if (isSelected && focusRef) focusRef.current = meshRef.current;
  });

  return (
    <group>
      <pointLight intensity={1.5} distance={0} decay={0} castShadow color="#FFFFDD" />
      <group 
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(SUN_DATA); }} 
        onPointerOver={() => document.body.style.cursor = 'pointer'} 
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <mesh><sphereGeometry args={[8, 64, 64]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
        <mesh scale={[1.2, 1.2, 1.2]}><sphereGeometry args={[8, 32, 32]} /><meshBasicMaterial color="#FDB813" transparent opacity={0.3} side={THREE.BackSide} /></mesh>
        <mesh visible={false} onClick={(e) => { e.stopPropagation(); onClick(SUN_DATA); }}><sphereGeometry args={[14, 16, 16]} /><meshBasicMaterial transparent opacity={0} /></mesh>
      </group>
      {isSelected && <Billboard><Html center><div className="w-20 h-20 rounded-full border-[3px] border-yellow-400/60 animate-pulse" /></Html></Billboard>}
    </group>
  );
}

function Planet({ data, simState, onClick, isSelected, focusRef, lang }) {
  const planetRef = useRef();
  const meshRef = useRef();
  const cloudsRef = useRef();
  const startAngle = 0; 

  useFrame((state) => {
    if (!planetRef.current) return;
    
    const angle = startAngle + (simState.current.totalDays / data.period) * (Math.PI * 2);
    planetRef.current.position.x = Math.cos(angle) * data.orbitRadius;
    planetRef.current.position.z = Math.sin(angle) * data.orbitRadius;
    
    if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
        if (isSelected) meshRef.current.userData.distanceTraveled = data.velocity * simState.current.totalDays * 24 * 3600;
    }
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.012;

    if (isSelected && focusRef) {
        focusRef.current = planetRef.current;
    }
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.orbitRadius - 0.1, data.orbitRadius + 0.1, 128]} />
        <meshBasicMaterial color="#ffffff" opacity={0.1} transparent side={THREE.DoubleSide} />
      </mesh>
      <group ref={planetRef}>
          <group ref={meshRef}>
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[data.radius, 64, 64]} />
                <Suspense fallback={<FallbackSkin color={data.color} />}>{data.texture ? <PlanetSkin texturePath={data.texture} color={data.color} /> : <FallbackSkin color={data.color} />}</Suspense>
            </mesh>
            {data.hasAtmosphere && <mesh scale={[1.1, 1.1, 1.1]}><sphereGeometry args={[data.radius, 64, 64]} /><shaderMaterial attach="material" args={[AtmosphereShader]} /></mesh>}
            {data.hasClouds && <mesh ref={cloudsRef} scale={[1.02, 1.02, 1.02]}><sphereGeometry args={[data.radius, 64, 64]} /><meshStandardMaterial color="white" transparent opacity={0.4} /></mesh>}
            {data.hasRing && <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[data.radius * 1.4, data.radius * 2.5, 64]} /><meshStandardMaterial color={data.color} opacity={0.8} transparent side={THREE.DoubleSide} /></mesh>}
          </group>
          
          <mesh 
            visible={false} 
            onClick={(e) => { e.stopPropagation(); onClick(data); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'} 
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
             <sphereGeometry args={[Math.max(data.radius * 3, 2), 16, 16]} />
             <meshBasicMaterial transparent opacity={0} />
          </mesh>

          <Html position={[0, data.radius + 1.5, 0]} center distanceFactor={15} style={{pointerEvents: 'none'}}>
             <div className={`flex flex-col items-center transition-all duration-300 ${isSelected ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                <div className="bg-black/50 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap">
                    {data.name[lang]}
                </div>
                <div className="w-0.5 h-4 bg-white/20"></div>
             </div>
          </Html>
      </group>
    </>
  );
}

// --- SCENE & UI ---
function SceneContent() {
  const { camera, controls } = useThree();
  const simRef = useRef({ totalDays: 0, targetDays: 0, isSimulating: false, finished: false, speed: 1 }); // ADDED SPEED
  const focusRef = useRef(null);
  
  const [uiDays, setUiDays] = useState(0);
  const [simSpeed, setSimSpeed] = useState(1); // UI State for speed
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [lang, setLang] = useState('en');
  const [inputs, setInputs] = useState({ y: 0, m: 0, d: 0 });
  const t = TRANSLATIONS[lang];

  const handleFocus = (planetData) => {
      if (selectedPlanet?.id === planetData.id) return;
      setSelectedPlanet(planetData);
  };

  const handleOverview = () => {
      setSelectedPlanet(null);
      focusRef.current = null;
  };

  const handleSpeedChange = (e) => {
      const val = parseFloat(e.target.value);
      setSimSpeed(val);
      simRef.current.speed = val;
  };

  useFrame((state, delta) => {
    const sim = simRef.current;
    if (sim.isSimulating) {
      // APPLY SPEED MULTIPLIER HERE
      const increment = (5 * sim.speed) * (delta * 60); 
      
      if (sim.targetDays > 0) {
        sim.totalDays += increment;
        if (sim.totalDays >= sim.targetDays) {
            sim.totalDays = sim.targetDays;
            sim.isSimulating = false;
            sim.finished = true;
            sim.targetDays = 0;
        }
      } else { sim.totalDays += increment; }
    }
    if (state.clock.elapsedTime % 0.2 < 0.05) {
        setUiDays(Math.floor(sim.totalDays));
        if (sim.finished) { setShowReport(true); sim.finished = false; }
    }
  });

  const toggleSim = () => {
    const total = (inputs.y * 365) + (inputs.m * 30) + inputs.d;
    simRef.current.isSimulating = !simRef.current.isSimulating;
    setShowReport(false);
    if (total > 0 && simRef.current.isSimulating) simRef.current.targetDays = simRef.current.totalDays + total;
  };

  const reset = () => {
    simRef.current = { totalDays: 0, targetDays: 0, isSimulating: false, finished: false, speed: simSpeed };
    setUiDays(0); setInputs({ y: 0, m: 0, d: 0 }); handleOverview(); setShowReport(false);
  };

  const formatDist = (km) => km > 1000000 ? `${(km / 1000000).toFixed(2)} ${t.million_km}` : `${km.toLocaleString()} km`;
  const currentDist = selectedPlanet ? (selectedPlanet.velocity * uiDays * 24 * 3600) : 0;

  return (
    <>
        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.2} /> 
        <pointLight position={[0, 0, 0]} intensity={2} color="#ffaa00" distance={0} decay={0} />
        <directionalLight position={[50, 50, 50]} intensity={0.5} color="#ffffff" />
        
        <OrbitControls makeDefault maxDistance={400} minDistance={2} enablePan={true} />
        
        <CameraRig selectedPlanet={selectedPlanet} focusRef={focusRef} />

        <Sun onClick={handleFocus} isSelected={selectedPlanet?.id === 'sun'} focusRef={focusRef} />
        
        {PLANET_DATA.map((p) => (
            <Planet 
                key={p.id} 
                data={p} 
                simState={simRef} 
                isSelected={selectedPlanet?.id === p.id} 
                onClick={handleFocus}
                focusRef={focusRef} 
                lang={lang}
            />
        ))}

        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div className="w-full h-full text-white font-sans select-none relative">
                
                {/* MENU */}
                <div className="absolute top-1/2 -translate-y-1/2 left-6 pointer-events-auto flex flex-col gap-2 z-50">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-1 w-48">
                        <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 mb-1">{t.menu}</div>
                        <button onClick={handleOverview} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${!selectedPlanet ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-white/10 text-gray-300'}`}>
                            <LayoutGrid className="w-4 h-4" /> {t.overview}
                        </button>
                        <div className="h-[1px] bg-white/10 my-1" />
                        <button onClick={() => handleFocus(SUN_DATA)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${selectedPlanet?.id === 'sun' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'hover:bg-white/10 text-gray-300'}`}>
                            <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" /> {SUN_DATA.name[lang]}
                        </button>
                        {PLANET_DATA.map((p) => (
                            <button key={p.id} onClick={() => handleFocus(p)} className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm font-medium group ${selectedPlanet?.id === p.id ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-gray-300'}`}>
                                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />{p.name[lang]}</div>
                                {selectedPlanet?.id === p.id && <ChevronRight className="w-3 h-3 text-blue-400" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Top Header */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-end items-center pointer-events-auto">
                    <div className="flex gap-3">
                        <div className="px-5 py-2 bg-white/10 backdrop-blur rounded-full border border-white/10 flex items-center gap-2"><span className="text-xs text-gray-400">T+</span><span className="font-mono font-bold text-blue-400">{uiDays.toLocaleString()}</span><span className="text-xs text-gray-500">{t.days}</span></div>
                        <button onClick={() => setLang(l => l === 'en' ? 'mn' : 'en')} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">{t.lang}</button>
                        <button onClick={reset} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"><RotateCcw className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Mission Report */}
                {showReport && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
                        <div className="w-full max-w-3xl bg-[#0a0a0a] border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                             <button onClick={() => setShowReport(false)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
                             <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-green-500/20 rounded-2xl"><FileText className="w-8 h-8 text-green-400" /></div>
                                <div><h2 className="text-3xl font-bold text-white">{t.mission_complete}</h2><p className="text-gray-400">{t.report_desc}</p></div>
                             </div>
                             <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                 {PLANET_DATA.sort((a,b) => b.velocity - a.velocity).map((p) => {
                                     const dist = p.velocity * uiDays * 24 * 3600;
                                     const percentage = (dist / (PLANET_DATA[0].velocity * uiDays * 24 * 3600)) * 100; 
                                     return (
                                         <div key={p.id} className="relative">
                                             <div className="flex justify-between text-xs mb-1"><span className="font-bold text-gray-300">{p.name[lang]}</span><span className="font-mono text-blue-400">{formatDist(dist)}</span></div>
                                             <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%`, backgroundColor: p.color }} /></div>
                                         </div>
                                     );
                                 })}
                             </div>
                             <div className="mt-8 pt-6 border-t border-white/10 flex justify-end"><button onClick={() => setShowReport(false)} className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition">{t.close}</button></div>
                        </div>
                    </div>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 pointer-events-auto">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                        
                        {/* SPEED CONTROL */}
                        <div className="mb-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 mb-2">
                                <Gauge className="w-3 h-3 text-blue-400" /> {t.speed}: <span className="text-white">{simSpeed}x</span>
                            </label>
                            <input 
                                type="range" 
                                min="0.1" 
                                max="20" 
                                step="0.1" 
                                value={simSpeed} 
                                onChange={handleSpeedChange}
                                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer hover:bg-white/30 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>

                        <div className="flex items-center gap-3 mb-4"><Calculator className="w-4 h-4 text-blue-400" /><span className="text-xs font-bold text-gray-400 uppercase">{t.sim_settings}</span></div>
                        <div className="grid grid-cols-3 gap-4 mb-6">{['y', 'm', 'd'].map((k, i) => (<div key={k}><label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">{i === 0 ? t.years : i === 1 ? t.months : t.days}</label><input type="number" min="0" value={inputs[k]} onChange={e => setInputs({...inputs, [k]: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center font-mono focus:bg-white/10 outline-none" /></div>))}</div>
                        <button onClick={toggleSim} className={`w-full py-3 rounded-xl font-bold text-sm uppercase flex items-center justify-center gap-2 transition ${simRef.current.isSimulating ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-blue-600'}`}>{simRef.current.isSimulating ? <><Pause className="w-4 h-4"/> {t.stop_sim}</> : <><Play className="w-4 h-4"/> {t.start_sim}</>}</button>
                    </div>
                </div>

                {/* Info Panel */}
                {selectedPlanet && (
                    <div className="absolute top-24 right-6 w-96 pointer-events-auto animate-in slide-in-from-right-10 duration-300">
                        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="relative h-28 bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 flex items-center">
                                <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${selectedPlanet.texture})` }} />
                                <div className="relative z-10 w-full">
                                    <h2 className="text-4xl font-black text-white drop-shadow-md">{selectedPlanet.name[lang]}</h2>
                                    <p className="text-sm text-blue-200 font-medium">{selectedPlanet.details.type[lang]}</p>
                                </div>
                                <button onClick={() => { setSelectedPlanet(null); handleOverview(); }} className="absolute top-4 right-4 z-20"><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                <p className="text-sm text-gray-300 italic border-l-2 border-blue-500 pl-3">"{selectedPlanet.details.desc[lang]}"</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5"><div className="flex items-center gap-2 mb-1 text-gray-400"><Thermometer className="w-4 h-4" /><span className="text-[10px] uppercase font-bold">Temp</span></div><p className="font-mono text-lg font-bold">{selectedPlanet.details.temp}</p></div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5"><div className="flex items-center gap-2 mb-1 text-gray-400"><Weight className="w-4 h-4" /><span className="text-[10px] uppercase font-bold">Gravity</span></div><p className="font-mono text-lg font-bold">{selectedPlanet.details.gravity}</p></div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl border border-blue-500/20"><div className="flex items-center gap-3"><div className="p-2 bg-blue-500/20 rounded-lg"><MapPin className="w-4 h-4 text-blue-400" /></div><div><p className="text-[10px] text-gray-400 uppercase font-bold">{t.dist_traveled}</p><p className="font-mono font-bold text-sm">{formatDist(currentDist)}</p></div></div></div>
                                    <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-xl border border-purple-500/20"><div className="flex items-center gap-3"><div className="p-2 bg-purple-500/20 rounded-lg"><Activity className="w-4 h-4 text-purple-400" /></div><div><p className="text-[10px] text-gray-400 uppercase font-bold">{t.velocity}</p><p className="font-mono font-bold text-sm">{selectedPlanet.velocity} {t.km_s}</p></div></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Html>
    </>
  );
}

export default function SolarSystemV2() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas shadows camera={{ position: [0, 60, 140], fov: 45 }} gl={{ antialias: true }}>
        <color attach="background" args={['#000000']} />
        <Suspense fallback={null}><SceneContent /></Suspense>
      </Canvas>
      <Loader />
    </div>
  );
}