# 🌌 Solar System 3D Visualization

An interactive 3D solar system visualization built with React, Three.js, and Tailwind CSS. Explore the planets, control animation speed, and learn about each celestial body in English or Mongolian.

## 📋 Features

- **3D Visualization**: Realistic 3D rendering of the solar system with the Sun and 8 planets
- **Interactive Controls**: 
  - Play/Pause animation
  - Adjustable speed (1-100)
  - Time unit selection (Day/Month/Year)
  - Camera controls (drag to rotate, scroll to zoom)
- **Planet Information**: Click on any planet to view detailed information
- **Bilingual Support**: English and Mongolian language options
- **Hover Effects**: Planets highlight when hovered over
- **Responsive Design**: Works on different screen sizes

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Three.js** - 3D graphics library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **lucide-react** - Icon library

## 📁 Project Structure

```
solar/
├── src/
│   ├── components/
│   │   └── SolarSystem.jsx    # Main solar system component
│   ├── App.jsx                 # Root app component
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind CSS imports
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎮 Controls

- **Mouse Drag**: Rotate the camera around the solar system
- **Mouse Wheel**: Zoom in/out
- **Click Planet**: Select a planet and view its information
- **Play/Pause Button**: Start or stop the animation
- **Speed Slider**: Adjust animation speed (1-100)
- **Time Unit Buttons**: Switch between Day, Month, and Year units
- **Reset Camera**: Return to the default camera position
- **Language Toggle**: Switch between English and Mongolian

## 📊 Planet Data

The visualization includes:
- Mercury (Буд)
- Venus (Сугар)
- Earth (Дэлхий)
- Mars (Ангараг)
- Jupiter (Бархасбадь)
- Saturn (Санчир)
- Uranus (Тэнгэрийн ван)
- Neptune (Далайн ван)

Each planet displays:
- Radius (in km, relative to Earth)
- Mass
- Orbital period (days)
- Rotation period (hours)
- Summary description

## 📝 Code Structure

### SolarSystem Component

The main component is organized into several sections:

1. **Constants**
   - `translations`: Bilingual text strings
   - `planetData`: Array of planet objects with physical properties

2. **State Management**
   - Animation state (playing, speed, time unit)
   - UI state (selected planet, language, hovered planet)
   - Three.js refs (scene, camera, renderer, planets)

3. **Three.js Setup** (in `useEffect`)
   - Scene initialization
   - Camera setup (PerspectiveCamera)
   - Renderer setup (WebGLRenderer)
   - Lighting (AmbientLight, PointLight)
   - Sun creation
   - Planet creation with orbits
   - Mouse controls (drag, click, wheel)
   - Animation loop
   - Camera animation helper
   - Resize handler
   - Cleanup

4. **UI Components**
   - Header with title and controls
   - Bottom control panel
   - Hover tooltip
   - Planet information panel

### Key Functions

- **animate()**: Main animation loop that updates planet positions and rotations
- **animateCameraTo()**: Smoothly animates camera to focus on a selected planet
- **onClick()**: Handles planet selection using raycasting
- **onMouseMove()**: Handles camera rotation and hover detection

## 🎨 Styling

The project uses Tailwind CSS for styling:
- Dark theme with transparent overlays
- Responsive design with flexbox
- Smooth transitions and hover effects
- Gradient backgrounds for UI panels

## 🔧 Configuration

### Vite
The `vite.config.js` file configures the Vite build tool with React plugin.

### Tailwind CSS
The `tailwind.config.js` file sets up Tailwind to scan React components for class names.

### PostCSS
The `postcss.config.js` file configures PostCSS to process Tailwind CSS.

## 📚 Dependencies

### Production Dependencies
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `three`: ^0.158.0
- `lucide-react`: ^0.294.0

### Development Dependencies
- `@vitejs/plugin-react`: ^4.2.1
- `vite`: ^5.0.8
- `tailwindcss`: ^3.3.6
- `autoprefixer`: ^10.4.16
- `postcss`: ^8.4.32

## 🐛 Troubleshooting

If you encounter issues:

1. **Port already in use**: Change the port in `vite.config.js` or kill the process using the port
2. **Three.js not rendering**: Check browser console for WebGL support
3. **Styles not loading**: Ensure Tailwind is properly configured and CSS is imported

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Credits

- Planet data based on NASA's solar system information
- Icons from lucide-react
- 3D graphics powered by Three.js

