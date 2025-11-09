# 📖 Solar System Component - Code Documentation

This document provides a detailed breakdown of the Solar System component code, explaining each section and its purpose.

## 📑 Table of Contents

1. [Imports](#imports)
2. [Constants](#constants)
3. [Component Structure](#component-structure)
4. [State Management](#state-management)
5. [Three.js Setup](#threejs-setup)
6. [Event Handlers](#event-handlers)
7. [Animation Loop](#animation-loop)
8. [UI Components](#ui-components)

---

## 1. Imports

```javascript
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, Globe, X } from 'lucide-react';
```

**Purpose**: 
- `React` hooks: `useEffect` for side effects, `useRef` for DOM/Three.js references, `useState` for component state
- `THREE`: Three.js library for 3D graphics (scene, camera, renderer, geometries, materials, lights)
- `lucide-react`: Icon components for UI buttons

---

## 2. Constants

### 2.1 Translations Object

```javascript
const translations = {
  en: { ... },
  mn: { ... }
}
```

**Purpose**: Stores all UI text strings in English and Mongolian for internationalization.

**Keys**:
- `play/pause`: Animation control labels
- `speed`: Speed control label
- `unit_day/month/year`: Time unit labels
- `language/reset_camera/close`: UI control labels
- `radius/mass/orbital_period/rotation_period`: Planet property labels
- `days/hours`: Time unit suffixes

### 2.2 Planet Data Array

```javascript
const planetData = [ ... ]
```

**Purpose**: Contains physical and orbital properties for each planet.

**Properties for each planet**:
- `id`: Unique identifier (string)
- `radius`: Relative radius compared to Earth (number, Earth = 1.0)
- `color`: Hexadecimal color code (number, e.g., 0x4A90E2)
- `orbitRadius`: Distance from sun in 3D units (number)
- `orbitalPeriod`: Days to complete one orbit (number)
- `rotationPeriod`: Hours to complete one rotation (number)
- `mass`: Planet mass in scientific notation (string)
- `name`: Object with `en` and `mn` properties for planet name
- `summary`: Object with `en` and `mn` properties for planet description

**Planets included**:
1. Mercury (Буд) - Smallest, closest to Sun
2. Venus (Сугар) - Hottest, thick atmosphere
3. Earth (Дэлхий) - Our home planet
4. Mars (Ангараг) - Red planet with ice caps
5. Jupiter (Бархасбадь) - Largest gas giant
6. Saturn (Санчир) - Famous for rings
7. Uranus (Тэнгэрийн ван) - Tilted ice giant
8. Neptune (Далайн ван) - Windiest planet

---

## 3. Component Structure

### 3.1 Refs (useRef)

```javascript
const containerRef = useRef(null);      // DOM container for Three.js canvas
const sceneRef = useRef(null);          // Three.js scene object
const cameraRef = useRef(null);         // Three.js camera object
const rendererRef = useRef(null);       // Three.js renderer object
const planetsRef = useRef([]);          // Array of planet objects
const animationIdRef = useRef(null);    // Animation frame ID for cleanup
const mouseRef = useRef(new THREE.Vector2());  // Mouse position in normalized coordinates
const raycasterRef = useRef(new THREE.Raycaster());  // For mouse/object intersection
```

**Purpose**: Store references to Three.js objects and DOM elements that need to persist across renders without causing re-renders.

### 3.2 State (useState)

```javascript
const [isPlaying, setIsPlaying] = useState(true);        // Animation play/pause state
const [speed, setSpeed] = useState(50);                  // Animation speed (1-100)
const [timeUnit, setTimeUnit] = useState('day');         // Time unit: 'day', 'month', 'year'
const [selectedPlanet, setSelectedPlanet] = useState(null);  // Currently selected planet data
const [lang, setLang] = useState('en');                  // Current language: 'en' or 'mn'
const [hoveredPlanet, setHoveredPlanet] = useState(null);    // Planet currently under mouse
```

**Purpose**: Manage UI state and user interactions.

### 3.3 Translation Helper

```javascript
const t = translations[lang];
```

**Purpose**: Get current language translations for easy access in JSX.

---

## 4. Three.js Setup (useEffect)

### 4.1 Scene Initialization

```javascript
const scene = new THREE.Scene();
```

**Purpose**: Create the 3D world container where all objects exist.

### 4.2 Camera Setup

```javascript
const camera = new THREE.PerspectiveCamera(
  75,                                    // Field of view (degrees)
  containerRef.current.clientWidth / containerRef.current.clientHeight,  // Aspect ratio
  0.1,                                   // Near clipping plane
  1000                                    // Far clipping plane
);
camera.position.set(50, 50, 50);        // Initial camera position (x, y, z)
camera.lookAt(0, 0, 0);                 // Point camera at origin (sun)
```

**Purpose**: Create a perspective camera that mimics human vision. Position it to view the solar system.

### 4.3 Renderer Setup

```javascript
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0x000000);       // Black background
containerRef.current.appendChild(renderer.domElement);
```

**Purpose**: Create WebGL renderer to draw the 3D scene. Append canvas to DOM.

### 4.4 Lighting

```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
const sunLight = new THREE.PointLight(0xffffff, 2, 500);
```

**Purpose**:
- `AmbientLight`: Provides base illumination to all objects
- `PointLight`: Simulates sunlight from the sun's position

### 4.5 Sun Creation

```javascript
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
```

**Purpose**: Create a yellow sphere representing the sun.
- `SphereGeometry`: 3D sphere shape (radius=5, 32 segments for smoothness)
- `MeshBasicMaterial`: Material that doesn't react to light (self-illuminated)
- `Mesh`: Combination of geometry and material

### 4.6 Planet Creation

```javascript
planetData.forEach(data => {
  // Orbit group
  const orbitGroup = new THREE.Group();
  
  // Planet mesh
  const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ 
    color: data.color,
    emissive: data.color,
    emissiveIntensity: 0
  });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.x = data.orbitRadius;
  planet.userData = data;  // Store planet data for later access
  
  // Orbit ring
  const orbitGeometry = new THREE.RingGeometry(...);
  const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);
});
```

**Purpose**: For each planet:
1. Create an `orbitGroup` to rotate around the sun
2. Create planet sphere with appropriate size and color
3. Position planet at its orbital radius
4. Store planet data in `userData` for click detection
5. Create a visual orbit ring (semi-transparent circle)

**Key Concepts**:
- `Group`: Container that can be rotated (orbit simulation)
- `MeshStandardMaterial`: Material that reacts to light
- `emissive`: Self-illumination color (used for hover effects)
- `userData`: Custom property to store application data

---

## 5. Event Handlers

### 5.1 Mouse Controls

#### onMouseDown
```javascript
const onMouseDown = (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
};
```
**Purpose**: Start camera drag interaction.

#### onMouseMove
```javascript
const onMouseMove = (e) => {
  if (isDragging) {
    // Rotate camera around origin
    camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005);
    // Update mouse position for raycasting
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }
};
```
**Purpose**: 
- Rotate camera when dragging
- Update normalized mouse coordinates (-1 to 1) for raycasting

#### onMouseUp
```javascript
const onMouseUp = () => {
  isDragging = false;
};
```
**Purpose**: End camera drag interaction.

### 5.2 Click Handler

```javascript
const onClick = (e) => {
  if (isDragging) return;  // Ignore clicks during drag
  
  // Update mouse position
  raycasterRef.current.setFromCamera(mouseRef.current, camera);
  const intersects = raycasterRef.current.intersectObjects(planets.map(p => p.planet));
  
  if (intersects.length > 0) {
    const clickedPlanet = intersects[0].object;
    setSelectedPlanet(clickedPlanet.userData);
    // Animate camera to planet
    animateCameraTo(targetPos, planetPos);
  }
};
```

**Purpose**: 
- Use raycasting to detect which planet was clicked
- Set selected planet state
- Smoothly animate camera to focus on planet

**Raycasting**: Technique to determine which 3D objects intersect with a ray (mouse cursor) from camera.

### 5.3 Wheel Handler (Zoom)

```javascript
const onWheel = (e) => {
  const delta = e.deltaY * 0.05;
  const direction = camera.position.clone().normalize();
  camera.position.addScaledVector(direction, delta);
  // Clamp distance between 20 and 200
  const distance = camera.position.length();
  if (distance < 20) camera.position.setLength(20);
  if (distance > 200) camera.position.setLength(200);
};
```

**Purpose**: Zoom in/out by moving camera closer/farther from origin, with distance limits.

### 5.4 Resize Handler

```javascript
const handleResize = () => {
  camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
};
```

**Purpose**: Update camera aspect ratio and renderer size when window resizes.

---

## 6. Animation Loop

### 6.1 Main Animation Function

```javascript
const animate = () => {
  animationIdRef.current = requestAnimationFrame(animate);
  const delta = clock.getDelta();  // Time since last frame (seconds)
  
  if (isPlaying) {
    const speedMultiplier = timeUnit === 'day' ? 1 : timeUnit === 'month' ? 30 : 365;
    
    planets.forEach(({ orbitGroup, planet, data }) => {
      // Orbital motion
      const orbitSpeed = (delta * speed * speedMultiplier) / data.orbitalPeriod;
      orbitGroup.rotation.y += orbitSpeed;
      
      // Planetary rotation
      const rotationSpeed = (delta * speed * speedMultiplier * 24) / data.rotationPeriod;
      planet.rotation.y += rotationSpeed;
    });
    
    sun.rotation.y += 0.001;  // Slow sun rotation
  }
  
  // Hover effects and rendering
  renderer.render(scene, camera);
};
```

**Purpose**: 
- Continuously update and render the scene
- Calculate orbital and rotational speeds based on real periods
- Apply speed multiplier based on time unit
- Rotate orbit groups (orbital motion) and planets (rotation)

**Key Calculations**:
- `orbitSpeed`: How much to rotate orbit group per frame
- `rotationSpeed`: How much to rotate planet per frame
- Speed is normalized by actual orbital/rotation periods

### 6.2 Hover Detection

```javascript
raycasterRef.current.setFromCamera(mouseRef.current, camera);
const intersects = raycasterRef.current.intersectObjects(planets.map(p => p.planet));

planets.forEach(({ planet }) => {
  planet.material.emissiveIntensity = 0;  // Reset
  planet.scale.set(1, 1, 1);              // Reset scale
});

if (intersects.length > 0) {
  const hoveredMesh = intersects[0].object;
  hoveredMesh.material.emissiveIntensity = 0.2;  // Glow effect
  hoveredMesh.scale.set(1.1, 1.1, 1.1);         // Scale up
  setHoveredPlanet(hoveredMesh.userData);
}
```

**Purpose**: 
- Detect which planet is under mouse cursor
- Apply visual feedback (glow, scale up)
- Update hover state for tooltip display

### 6.3 Camera Animation

```javascript
function animateCameraTo(targetPos, lookAtPos) {
  const startPos = camera.position.clone();
  const startTime = Date.now();
  const duration = 1000;  // 1 second
  
  const animateCam = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);  // Ease-out cubic
    
    camera.position.lerpVectors(startPos, targetPos, eased);
    camera.lookAt(lookAtPos);
    
    if (progress < 1) {
      requestAnimationFrame(animateCam);
    }
  };
  animateCam();
}
```

**Purpose**: Smoothly animate camera from current position to target position with easing.

**Techniques**:
- `lerpVectors`: Linear interpolation between two vectors
- Ease-out cubic: Smooth deceleration
- Separate animation loop for camera movement

---

## 7. UI Components

### 7.1 Header

```javascript
<div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
  <h1>🌌 Solar System</h1>
  <button onClick={() => setLang(...)}>Language Toggle</button>
  <button onClick={handleReset}>Reset Camera</button>
</div>
```

**Purpose**: Title bar with language toggle and camera reset button.

### 7.2 Control Panel

```javascript
<div className="absolute bottom-0 ...">
  <button onClick={() => setIsPlaying(!isPlaying)}>Play/Pause</button>
  <input type="range" value={speed} onChange={...} />  // Speed slider
  <div>
    {['day', 'month', 'year'].map(unit => (
      <button onClick={() => setTimeUnit(unit)}>...</button>
    ))}
  </div>
</div>
```

**Purpose**: Bottom control panel with:
- Play/Pause button
- Speed slider (1-100)
- Time unit buttons (Day/Month/Year)

### 7.3 Hover Tooltip

```javascript
{hoveredPlanet && !selectedPlanet && (
  <div className="absolute top-1/2 left-1/2 ...">
    {hoveredPlanet.name[lang]}
  </div>
)}
```

**Purpose**: Display planet name when hovering (centered on screen).

### 7.4 Info Panel

```javascript
{selectedPlanet && (
  <div className="absolute top-1/2 right-4 ...">
    <h2>{selectedPlanet.name[lang]}</h2>
    <p>{selectedPlanet.summary[lang]}</p>
    <div>
      <div>Radius: {(selectedPlanet.radius * 6371).toFixed(0)} km</div>
      <div>Mass: {selectedPlanet.mass}</div>
      <div>Orbital Period: {selectedPlanet.orbitalPeriod} days</div>
      <div>Rotation Period: {selectedPlanet.rotationPeriod} hours</div>
    </div>
    <button onClick={() => setSelectedPlanet(null)}>Close</button>
  </div>
)}
```

**Purpose**: Display detailed planet information when a planet is selected.

**Calculations**:
- Radius in km: `radius * 6371` (Earth's radius in km)

---

## 8. Cleanup

```javascript
return () => {
  // Remove event listeners
  // Cancel animation frame
  // Remove renderer from DOM
  // Dispose renderer
};
```

**Purpose**: Clean up resources when component unmounts to prevent memory leaks.

---

## 🎯 Key Concepts Summary

### Three.js Hierarchy
```
Scene
  ├── Sun (Mesh)
  ├── Orbit Rings (Mesh)
  └── Orbit Groups (Group)
      └── Planets (Mesh)
```

### Animation Flow
1. User adjusts speed/time unit → State updates
2. Animation loop reads state → Calculates movements
3. Updates 3D object positions/rotations
4. Renderer draws frame
5. Repeat (60 FPS)

### Interaction Flow
1. User moves mouse → Updates mouse position
2. Raycaster checks intersections → Finds hovered planet
3. User clicks → Selects planet → Animates camera
4. State updates → UI re-renders → Shows info panel

### State Management
- **React State**: UI state (playing, speed, selected planet, language)
- **Three.js Objects**: 3D scene data (stored in refs)
- **Event Handlers**: Bridge between UI and 3D world

---

## 🐛 Common Issues & Solutions

1. **Planets not visible**: Check lighting setup and camera position
2. **Animation stuttering**: Reduce speed or optimize render loop
3. **Click not working**: Verify raycasting setup and event listeners
4. **Camera jumpy**: Check drag detection logic
5. **Memory leaks**: Ensure proper cleanup in useEffect return

---

## 📚 Further Reading

- [Three.js Documentation](https://threejs.org/docs/)
- [React Hooks Guide](https://react.dev/reference/react)
- [WebGL Basics](https://webglfundamentals.org/)
- [Raycasting Explained](https://en.wikipedia.org/wiki/Ray_casting)

---

## 🎓 Learning Points

1. **3D Graphics**: Understanding scenes, cameras, renderers, and coordinate systems
2. **Animation**: Frame-based animation with requestAnimationFrame
3. **User Interaction**: Mouse events, raycasting, camera controls
4. **State Management**: Combining React state with imperative Three.js APIs
5. **Performance**: Efficient rendering, cleanup, and optimization techniques

