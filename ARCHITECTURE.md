# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Application                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         SolarSystem Component                    │  │  │
│  │  │  ┌──────────────────┐  ┌────────────────────┐  │  │  │
│  │  │  │   React State    │  │   Three.js Scene   │  │  │  │
│  │  │  │  - isPlaying     │  │  - Scene           │  │  │  │
│  │  │  │  - speed         │  │  - Camera          │  │  │  │
│  │  │  │  - timeUnit      │  │  - Renderer        │  │  │  │
│  │  │  │  - selectedPlanet│  │  - Sun             │  │  │  │
│  │  │  │  - lang          │  │  - Planets         │  │  │  │
│  │  │  │  - hoveredPlanet │  │  - Lights          │  │  │  │
│  │  │  └──────────────────┘  └────────────────────┘  │  │  │
│  │  │           ↕                      ↕               │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │        Animation Loop (60 FPS)             │  │  │  │
│  │  │  │  - Updates planet positions                │  │  │  │
│  │  │  │  - Handles hover detection                 │  │  │  │
│  │  │  │  - Renders frame                           │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  │           ↕                                      │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │        Event Handlers                       │  │  │  │
│  │  │  │  - Mouse drag (camera rotation)            │  │  │  │
│  │  │  │  - Click (planet selection)                │  │  │  │
│  │  │  │  - Wheel (zoom)                            │  │  │  │
│  │  │  │  - UI controls (play/pause, speed, etc.)   │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │           ↕                                            │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              UI Components                       │  │  │
│  │  │  - Header (title, language, reset)              │  │  │
│  │  │  - Control Panel (play, speed, time unit)       │  │  │
│  │  │  - Hover Tooltip                                │  │  │
│  │  │  - Info Panel (planet details)                  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initialization Flow
```
Component Mount
    ↓
useEffect (Three.js Setup)
    ↓
Create Scene, Camera, Renderer
    ↓
Create Sun and Planets
    ↓
Setup Event Listeners
    ↓
Start Animation Loop
```

### 2. User Interaction Flow
```
User Action (Click/Drag/Wheel)
    ↓
Event Handler
    ↓
Update State or Three.js Objects
    ↓
State Change → Re-render UI
Three.js Change → Next Frame Update
```

### 3. Animation Flow
```
Animation Loop (60 FPS)
    ↓
Check isPlaying State
    ↓
Calculate Planet Positions
    ↓
Update Three.js Objects
    ↓
Check Hover/Selection
    ↓
Render Frame
    ↓
Repeat
```

## Component Hierarchy

```
App
└── SolarSystem
    ├── Three.js Canvas (containerRef)
    ├── Header
    │   ├── Title
    │   ├── Language Toggle
    │   └── Reset Button
    ├── Control Panel
    │   ├── Play/Pause Button
    │   ├── Speed Slider
    │   └── Time Unit Buttons
    ├── Hover Tooltip (conditional)
    └── Info Panel (conditional)
        ├── Planet Name
        ├── Summary
        └── Planet Properties
```

## State Management

### React State (UI State)
- `isPlaying`: Animation play/pause
- `speed`: Animation speed (1-100)
- `timeUnit`: Time unit ('day', 'month', 'year')
- `selectedPlanet`: Currently selected planet data
- `lang`: Current language ('en' or 'mn')
- `hoveredPlanet`: Planet under mouse cursor

### React Refs (Three.js Objects)
- `containerRef`: DOM container for canvas
- `sceneRef`: Three.js scene
- `cameraRef`: Three.js camera
- `rendererRef`: Three.js renderer
- `planetsRef`: Array of planet objects
- `animationIdRef`: Animation frame ID
- `mouseRef`: Mouse position (normalized)
- `raycasterRef`: Raycaster for intersection

### State Refs (For Animation Loop)
- `isPlayingRef`: Current play state
- `speedRef`: Current speed
- `timeUnitRef`: Current time unit
- `selectedPlanetRef`: Current selected planet

**Why Refs for State?**
The animation loop runs in a closure that doesn't have access to updated state values. Refs allow the animation loop to access the current state values without causing re-renders.

## Three.js Scene Graph

```
Scene
├── AmbientLight (base illumination)
├── PointLight (sunlight)
├── Sun (Mesh)
│   └── SphereGeometry + MeshBasicMaterial
├── Orbit Rings (Mesh) × 8
│   └── RingGeometry + MeshBasicMaterial
└── Orbit Groups (Group) × 8
    └── Planet (Mesh)
        └── SphereGeometry + MeshStandardMaterial
```

## Event System

### Mouse Events
- `mousedown`: Start camera drag
- `mousemove`: Update camera rotation, detect hover
- `mouseup`: End camera drag
- `click`: Select planet
- `wheel`: Zoom in/out

### UI Events
- `onClick`: Play/pause, language toggle, reset, time unit selection
- `onChange`: Speed slider

## Rendering Pipeline

```
1. User Interaction or State Change
   ↓
2. Event Handler Updates State/Three.js
   ↓
3. React Re-renders UI (if state changed)
   ↓
4. Animation Loop (60 FPS)
   ↓
5. Update Three.js Objects
   ↓
6. Render Scene to Canvas
   ↓
7. Display in Browser
```

## Key Algorithms

### Orbital Motion
```javascript
orbitSpeed = (deltaTime * speed * speedMultiplier) / orbitalPeriod
orbitGroup.rotation.y += orbitSpeed
```

### Planetary Rotation
```javascript
rotationSpeed = (deltaTime * speed * speedMultiplier * 24) / rotationPeriod
planet.rotation.y += rotationSpeed
```

### Camera Rotation (Drag)
```javascript
deltaX = mouseX - previousMouseX
camera.position.applyAxisAngle(Y_AXIS, deltaX * 0.005)
camera.lookAt(origin)
```

### Raycasting (Click Detection)
```javascript
mouseNormalized = convertToNormalizedCoordinates(mousePosition)
raycaster.setFromCamera(mouseNormalized, camera)
intersects = raycaster.intersectObjects(planets)
selectedPlanet = intersects[0].object.userData
```

### Camera Animation (Smooth Transition)
```javascript
progress = elapsedTime / duration
easedProgress = 1 - (1 - progress)³  // Ease-out cubic
camera.position.lerpVectors(startPos, targetPos, easedProgress)
```

## Performance Considerations

### Optimization Strategies
1. **Refs for State**: Avoid re-renders in animation loop
2. **Single Animation Loop**: One loop handles all updates
3. **Efficient Raycasting**: Only check planets, not all objects
4. **Conditional Rendering**: Only render UI elements when needed
5. **Event Delegation**: Attach events to canvas, not individual objects
6. **Cleanup**: Properly dispose of Three.js resources

### Potential Improvements
1. **LOD (Level of Detail)**: Reduce polygon count for distant planets
2. **Frustum Culling**: Don't render objects outside camera view
3. **Object Pooling**: Reuse geometry and material objects
4. **Web Workers**: Offload calculations to background threads
5. **Instancing**: Use instanced rendering for similar objects

## Dependencies

### Core Dependencies
- **React**: UI framework
- **Three.js**: 3D graphics library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **lucide-react**: Icon library

### Build Tools
- **@vitejs/plugin-react**: Vite plugin for React
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## File Responsibilities

### `SolarSystem.jsx`
- Three.js scene setup and management
- Animation loop
- Event handling
- UI rendering
- State management

### `App.jsx`
- Root component
- Renders SolarSystem

### `main.jsx`
- React entry point
- Renders App to DOM

### `index.css`
- Tailwind CSS imports
- Global styles

### Configuration Files
- `vite.config.js`: Vite build configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration
- `package.json`: Dependencies and scripts

## Browser Compatibility

### Required Features
- WebGL support (for Three.js)
- ES6+ JavaScript support
- CSS Grid and Flexbox (for layout)
- requestAnimationFrame API

### Supported Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Fallbacks
- WebGL not supported: Show error message
- No requestAnimationFrame: Use setTimeout fallback (not implemented)

## Security Considerations

### Current Implementation
- No external API calls
- No user data collection
- No sensitive data storage
- Client-side only

### Future Considerations
- If adding user accounts: Implement proper authentication
- If adding data persistence: Use secure storage
- If adding external APIs: Implement CORS and rate limiting

## Scalability

### Current Limitations
- Fixed number of planets (8)
- Single scene
- No multi-user support
- Client-side only

### Scaling Strategies
- **Add More Objects**: Extend planetData array
- **Multiple Scenes**: Create scene manager
- **Server-Side**: Add backend for data persistence
- **Multi-User**: Add WebSocket support
- **Performance**: Implement LOD and culling

## Testing Strategy

### Unit Tests (Not Implemented)
- Test state management
- Test event handlers
- Test calculations (orbital speed, rotation speed)

### Integration Tests (Not Implemented)
- Test Three.js setup
- Test animation loop
- Test user interactions

### E2E Tests (Not Implemented)
- Test full user flows
- Test browser compatibility
- Test performance

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production
```bash
npm run preview
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, AWS CloudFront
- **Server**: Node.js server with Express
- **Docker**: Containerized deployment

---

This architecture provides a solid foundation for a 3D solar system visualization with room for future enhancements and scalability.

