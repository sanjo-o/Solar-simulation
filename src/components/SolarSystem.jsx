import React, { useEffect, useRef, useState } from 'react';

import * as THREE from 'three';

import { Play, Pause, Globe, X } from 'lucide-react';



// Translations

const translations = {

  en: {

    play: "Play",

    pause: "Pause",

    speed: "Speed",

    unit_day: "Day",

    unit_month: "Month",

    unit_year: "Year",

    language: "Language",

    reset_camera: "Reset Camera",

    close: "Close",

    radius: "Radius",

    mass: "Mass",

    orbital_period: "Orbital Period",

    rotation_period: "Rotation Period",

    days: "days",

    hours: "hours"

  },

  mn: {

    play: "Тоглуулах",

    pause: "Зогсоох",

    speed: "Хурд",

    unit_day: "Өдөр",

    unit_month: "Сар",

    unit_year: "Жил",

    language: "Хэл",

    reset_camera: "Камер шинэчлэх",

    close: "Хаах",

    radius: "Радиус",

    mass: "Масс",

    orbital_period: "Тойрох хугацаа",

    rotation_period: "Эргэх хугацаа",

    days: "өдөр",

    hours: "цаг"

  }

};



// Planet data

const planetData = [

  {

    id: "mercury",

    radius: 0.38,

    color: 0x8C7853,

    orbitRadius: 15,

    orbitalPeriod: 88,

    rotationPeriod: 1407.6,

    mass: "3.30e23 kg",

    name: { en: "Mercury", mn: "Буд" },

    summary: { en: "The smallest planet, closest to the Sun.", mn: "Хамгийн жижиг гараг, Нарнаас хамгийн ойр." }

  },

  {

    id: "venus",

    radius: 0.95,

    color: 0xFFC649,

    orbitRadius: 22,

    orbitalPeriod: 224.7,

    rotationPeriod: 5832.5,

    mass: "4.87e24 kg",

    name: { en: "Venus", mn: "Сугар" },

    summary: { en: "The hottest planet with thick atmosphere.", mn: "Өтгөн агаар мандалтай хамгийн халуун гараг." }

  },

  {

    id: "earth",

    radius: 1,

    color: 0x4A90E2,

    orbitRadius: 30,

    orbitalPeriod: 365.25,

    rotationPeriod: 24,

    mass: "5.97e24 kg",

    name: { en: "Earth", mn: "Дэлхий" },

    summary: { en: "Our home planet with liquid water and life.", mn: "Бидний гэр — ус, амьдралтай." }

  },

  {

    id: "mars",

    radius: 0.53,

    color: 0xE27B58,

    orbitRadius: 40,

    orbitalPeriod: 687,

    rotationPeriod: 24.6,

    mass: "6.42e23 kg",

    name: { en: "Mars", mn: "Ангараг" },

    summary: { en: "The red planet with polar ice caps.", mn: "Туйлын мөсөн бүрхүүлтэй улаан гараг." }

  },

  {

    id: "jupiter",

    radius: 2.5,

    color: 0xC88B3A,

    orbitRadius: 55,

    orbitalPeriod: 4331,

    rotationPeriod: 9.9,

    mass: "1.90e27 kg",

    name: { en: "Jupiter", mn: "Бархасбадь" },

    summary: { en: "The largest planet, a gas giant.", mn: "Хамгийн том гараг, хийн аварга." }

  },

  {

    id: "saturn",

    radius: 2.1,

    color: 0xFAD5A5,

    orbitRadius: 70,

    orbitalPeriod: 10747,

    rotationPeriod: 10.7,

    mass: "5.68e26 kg",

    name: { en: "Saturn", mn: "Санчир" },

    summary: { en: "Famous for its beautiful ring system.", mn: "Үзэсгэлэнт цагирагаараа алдартай." }

  },

  {

    id: "uranus",

    radius: 1.6,

    color: 0x4FD0E0,

    orbitRadius: 85,

    orbitalPeriod: 30589,

    rotationPeriod: 17.2,

    mass: "8.68e25 kg",

    name: { en: "Uranus", mn: "Тэнгэрийн ван" },

    summary: { en: "An ice giant tilted on its side.", mn: "Хажуу тийш хазайсан мөсөн аварга." }

  },

  {

    id: "neptune",

    radius: 1.55,

    color: 0x4169E1,

    orbitRadius: 100,

    orbitalPeriod: 59800,

    rotationPeriod: 16.1,

    mass: "1.02e26 kg",

    name: { en: "Neptune", mn: "Далайн ван" },

    summary: { en: "The windiest planet in the solar system.", mn: "Нарны аймагт хамгийн салхитай гараг." }

  }

];



export default function SolarSystem() {

  const containerRef = useRef(null);

  const sceneRef = useRef(null);

  const cameraRef = useRef(null);

  const rendererRef = useRef(null);

  const planetsRef = useRef([]);

  const animationIdRef = useRef(null);

  const mouseRef = useRef(new THREE.Vector2());

  const raycasterRef = useRef(new THREE.Raycaster());

  

  const [isPlaying, setIsPlaying] = useState(true);

  const [speed, setSpeed] = useState(50);

  const [timeUnit, setTimeUnit] = useState('day');

  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const [lang, setLang] = useState('en');

  const [hoveredPlanet, setHoveredPlanet] = useState(null);

  

  // Refs to access current state values in animation loop

  const isPlayingRef = useRef(isPlaying);

  const speedRef = useRef(speed);

  const timeUnitRef = useRef(timeUnit);

  const selectedPlanetRef = useRef(selectedPlanet);



  const t = translations[lang];



  // Keep refs in sync with state

  useEffect(() => {

    isPlayingRef.current = isPlaying;

  }, [isPlaying]);



  useEffect(() => {

    speedRef.current = speed;

  }, [speed]);



  useEffect(() => {

    timeUnitRef.current = timeUnit;

  }, [timeUnit]);



  useEffect(() => {

    selectedPlanetRef.current = selectedPlanet;

  }, [selectedPlanet]);



  useEffect(() => {

    if (!containerRef.current) return;



    // Scene setup

    const scene = new THREE.Scene();

    sceneRef.current = scene;



    // Camera setup

    const camera = new THREE.PerspectiveCamera(

      75,

      containerRef.current.clientWidth / containerRef.current.clientHeight,

      0.1,

      1000

    );

    camera.position.set(50, 50, 50);

    camera.lookAt(0, 0, 0);

    cameraRef.current = camera;



    // Renderer setup

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);

    renderer.setClearColor(0x000000);

    containerRef.current.appendChild(renderer.domElement);

    rendererRef.current = renderer;



    // Lighting

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);

    scene.add(ambientLight);



    // Sun

  // 1️⃣ Load texture
  const textureLoader = new THREE.TextureLoader();
  const sunTexture = textureLoader.load("src/models/the_sun/textures/moon_baseColor.jpeg"); // update path to your image

// 2️⃣ Create a material using that texture
  const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,       // use the texture
  // optional tweaks:
  // emissive: 0xFDB813, // adds glow color if using MeshStandardMaterial
  // emissiveIntensity: 1
  });

  const sunGeometry = new THREE.SphereGeometry(5, 64, 64); // more segments = smoother
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

// 4️⃣ Add point light (if you want it to illuminate other planets)
  const sunLight = new THREE.PointLight(0xffffff, 2, 500);
  scene.add(sunLight);



    // Create planets

    const planets = [];

    planetData.forEach(data => {

      // Orbit group

      const orbitGroup = new THREE.Group();

      scene.add(orbitGroup);



      // Planet

      const geometry = new THREE.SphereGeometry(data.radius, 32, 32);

      const material = new THREE.MeshStandardMaterial({ 

        color: data.color,

        emissive: data.color,

        emissiveIntensity: 0

      });

      const planet = new THREE.Mesh(geometry, material);

      planet.position.x = data.orbitRadius;

      planet.userData = data;

      orbitGroup.add(planet);



      // Orbit ring

      const orbitGeometry = new THREE.RingGeometry(

        data.orbitRadius - 0.1,

        data.orbitRadius + 0.1,

        64

      );

      const orbitMaterial = new THREE.MeshBasicMaterial({

        color: 0xffffff,

        opacity: 0.1,

        transparent: true,

        side: THREE.DoubleSide

      });

      const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);

      orbitRing.rotation.x = Math.PI / 2;

      scene.add(orbitRing);



      planets.push({

        orbitGroup,

        planet,

        data,

        angle: 0

      });

    });



    planetsRef.current = planets;



    // Mouse controls

    let isDragging = false;

    let previousMousePosition = { x: 0, y: 0 };



    const onMouseDown = (e) => {

      isDragging = true;

      previousMousePosition = { x: e.clientX, y: e.clientY };

    };



    const onMouseMove = (e) => {

      if (isDragging) {

        const deltaX = e.clientX - previousMousePosition.x;

        const deltaY = e.clientY - previousMousePosition.y;



        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005);

        

        const axis = new THREE.Vector3(1, 0, 0);

        axis.applyQuaternion(camera.quaternion);

        camera.position.applyAxisAngle(axis, deltaY * 0.005);

        

        camera.lookAt(0, 0, 0);

        previousMousePosition = { x: e.clientX, y: e.clientY };

      }



      // Raycasting for hover

      const rect = renderer.domElement.getBoundingClientRect();

      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;

      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    };



    const onMouseUp = () => {

      isDragging = false;

    };



    const onClick = (e) => {

      if (isDragging) return;



      const rect = renderer.domElement.getBoundingClientRect();

      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;

      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;



      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      const intersects = raycasterRef.current.intersectObjects(

        planets.map(p => p.planet)

      );



      if (intersects.length > 0) {

        const clickedPlanet = intersects[0].object;

        setSelectedPlanet(clickedPlanet.userData);

        

        // Animate camera to planet

        const planetPos = clickedPlanet.getWorldPosition(new THREE.Vector3());

        const targetPos = new THREE.Vector3(

          planetPos.x + 15,

          planetPos.y + 10,

          planetPos.z + 15

        );

        animateCameraTo(targetPos, planetPos);

      }

    };



    const onWheel = (e) => {

      const delta = e.deltaY * 0.05;

      const direction = camera.position.clone().normalize();

      camera.position.addScaledVector(direction, delta);

      

      const distance = camera.position.length();

      if (distance < 20) camera.position.setLength(20);

      if (distance > 200) camera.position.setLength(200);

    };



    renderer.domElement.addEventListener('mousedown', onMouseDown);

    renderer.domElement.addEventListener('mousemove', onMouseMove);

    renderer.domElement.addEventListener('mouseup', onMouseUp);

    renderer.domElement.addEventListener('click', onClick);

    renderer.domElement.addEventListener('wheel', onWheel);



    // Animation

    const clock = new THREE.Clock();

    const animate = () => {

      animationIdRef.current = requestAnimationFrame(animate);



      const delta = clock.getDelta();



      if (isPlayingRef.current) {

        const speedMultiplier = timeUnitRef.current === 'day' ? 1 : timeUnitRef.current === 'month' ? 30 : 365;

        

        planets.forEach(({ orbitGroup, planet, data }) => {

          const orbitSpeed = (delta * speedRef.current * speedMultiplier) / data.orbitalPeriod;

          orbitGroup.rotation.y += orbitSpeed;

          

          const rotationSpeed = (delta * speedRef.current * speedMultiplier * 24) / data.rotationPeriod;

          planet.rotation.y += rotationSpeed;

        });



        sun.rotation.y += 0.001;

      }



      // Hover effect

      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      const intersects = raycasterRef.current.intersectObjects(

        planets.map(p => p.planet)

      );



      planets.forEach(({ planet }) => {

        planet.material.emissiveIntensity = 0;

        planet.scale.set(1, 1, 1);

      });



      if (intersects.length > 0) {

        const hoveredMesh = intersects[0].object;

        hoveredMesh.material.emissiveIntensity = 0.2;

        hoveredMesh.scale.set(1.1, 1.1, 1.1);

        setHoveredPlanet(hoveredMesh.userData);

        renderer.domElement.style.cursor = 'pointer';

      } else {

        setHoveredPlanet(null);

        renderer.domElement.style.cursor = 'auto';

      }



      if (selectedPlanetRef.current) {

        const selected = planets.find(p => p.data.id === selectedPlanetRef.current.id);

        if (selected) {

          selected.planet.material.emissiveIntensity = 0.3;

          selected.planet.scale.set(1.2, 1.2, 1.2);

        }

      }



      renderer.render(scene, camera);

    };



    animate();



    // Camera animation helper

    function animateCameraTo(targetPos, lookAtPos) {

      const startPos = camera.position.clone();

      const startTime = Date.now();

      const duration = 1000;



      const animateCam = () => {

        const elapsed = Date.now() - startTime;

        const progress = Math.min(elapsed / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);



        camera.position.lerpVectors(startPos, targetPos, eased);

        camera.lookAt(lookAtPos);



        if (progress < 1) {

          requestAnimationFrame(animateCam);

        }

      };



      animateCam();

    }



    // Handle resize

    const handleResize = () => {

      if (!containerRef.current) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);

    };



    window.addEventListener('resize', handleResize);



    // Cleanup

    return () => {

      window.removeEventListener('resize', handleResize);

      renderer.domElement.removeEventListener('mousedown', onMouseDown);

      renderer.domElement.removeEventListener('mousemove', onMouseMove);

      renderer.domElement.removeEventListener('mouseup', onMouseUp);

      renderer.domElement.removeEventListener('click', onClick);

      renderer.domElement.removeEventListener('wheel', onWheel);

      

      if (animationIdRef.current) {

        cancelAnimationFrame(animationIdRef.current);

      }

      if (containerRef.current && renderer.domElement) {

        containerRef.current.removeChild(renderer.domElement);

      }

      renderer.dispose();

    };

  }, []);



  const handleReset = () => {

    setSelectedPlanet(null);

    if (cameraRef.current) {

      cameraRef.current.position.set(50, 50, 50);

      cameraRef.current.lookAt(0, 0, 0);

    }

  };



  return (

    <div className="w-full h-screen bg-black relative overflow-hidden">

      <div ref={containerRef} className="w-full h-full" />



      {/* Header */}

      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">

        <div className="flex justify-between items-center max-w-7xl mx-auto pointer-events-auto">

          <h1 className="text-2xl font-bold text-white">

            {lang === 'en' ? '🌌 Solar System' : '🌌 Нарны систем'}

          </h1>

          <div className="flex gap-2">

            <button

              onClick={() => setLang(lang === 'en' ? 'mn' : 'en')}

              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"

            >

              <Globe size={18} />

              {lang === 'en' ? 'EN' : 'MN'}

            </button>

            <button

              onClick={handleReset}

              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"

            >

              {t.reset_camera}

            </button>

          </div>

        </div>

      </div>



      {/* Controls */}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">

        <div className="max-w-7xl mx-auto pointer-events-auto">

          <div className="flex flex-wrap gap-4 items-center justify-center">

            <button

              onClick={() => setIsPlaying(!isPlaying)}

              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"

            >

              {isPlaying ? <Pause size={20} /> : <Play size={20} />}

              {isPlaying ? t.pause : t.play}

            </button>



            <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-lg">

              <span className="text-white text-sm">{t.speed}:</span>

              <input

                type="range"

                min="1"

                max="100"

                value={speed}

                onChange={(e) => setSpeed(Number(e.target.value))}

                className="w-32"

              />

              <span className="text-white text-sm w-8">{speed}</span>

            </div>



            <div className="flex gap-2 bg-white/10 p-1 rounded-lg">

              {['day', 'month', 'year'].map(unit => (

                <button

                  key={unit}

                  onClick={() => setTimeUnit(unit)}

                  className={`px-4 py-2 rounded transition-colors ${

                    timeUnit === unit

                      ? 'bg-blue-600 text-white'

                      : 'text-white/70 hover:text-white'

                  }`}

                >

                  {t[`unit_${unit}`]}

                </button>

              ))}

            </div>

          </div>

        </div>

      </div>



      {/* Hover tooltip */}

      {hoveredPlanet && !selectedPlanet && (

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-3 py-2 rounded text-sm whitespace-nowrap pointer-events-none">

          {hoveredPlanet.name[lang]}

        </div>

      )}



      {/* Info Panel */}

      {selectedPlanet && (

        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-80 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-white">

          <div className="flex justify-between items-start mb-4">

            <h2 className="text-2xl font-bold">{selectedPlanet.name[lang]}</h2>

            <button

              onClick={() => setSelectedPlanet(null)}

              className="text-white/70 hover:text-white transition-colors"

            >

              <X size={24} />

            </button>

          </div>

          

          <p className="text-white/80 mb-4">{selectedPlanet.summary[lang]}</p>

          

          <div className="space-y-2 text-sm">

            <div className="flex justify-between">

              <span className="text-white/60">{t.radius}:</span>

              <span>{(selectedPlanet.radius * 6371).toFixed(0)} km</span>

            </div>

            <div className="flex justify-between">

              <span className="text-white/60">{t.mass}:</span>

              <span>{selectedPlanet.mass}</span>

            </div>

            <div className="flex justify-between">

              <span className="text-white/60">{t.orbital_period}:</span>

              <span>{selectedPlanet.orbitalPeriod} {t.days}</span>

            </div>

            <div className="flex justify-between">

              <span className="text-white/60">{t.rotation_period}:</span>

              <span>{selectedPlanet.rotationPeriod} {t.hours}</span>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

