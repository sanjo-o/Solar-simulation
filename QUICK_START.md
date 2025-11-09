# 🚀 Quick Start Guide

## Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
```

This will install all required packages:
- React & React DOM
- Three.js (3D graphics)
- Vite (build tool)
- Tailwind CSS (styling)
- lucide-react (icons)

### Step 2: Start Development Server
```bash
npm run dev
```

The application will start on `http://localhost:5173` (or the next available port).

### Step 3: Open in Browser
Open your browser and navigate to the URL shown in the terminal.

---

## 🎮 How to Use

### Basic Controls
1. **Drag Mouse**: Rotate the camera around the solar system
2. **Scroll Wheel**: Zoom in/out
3. **Click Planet**: Select a planet to view information
4. **Play/Pause**: Start or stop the animation
5. **Speed Slider**: Adjust animation speed (1-100)
6. **Time Unit**: Switch between Day, Month, and Year

### Language
- Click the **Globe icon** to switch between English and Mongolian

### Reset
- Click **"Reset Camera"** to return to the default view

---

## 📁 Project Structure Explained

```
solar/
├── src/
│   ├── components/
│   │   └── SolarSystem.jsx    # Main 3D visualization component
│   ├── App.jsx                 # Root component
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind CSS styles
├── index.html                  # HTML entry point
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── README.md                   # Full documentation
```

---

## 🔧 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

To preview the production build:
```bash
npm run preview
```

---

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically use the next available port.

### Three.js Not Rendering
- Check browser console for errors
- Ensure your browser supports WebGL
- Try updating your graphics drivers

### Styles Not Loading
- Ensure Tailwind is properly configured
- Check that `index.css` is imported in `main.jsx`
- Restart the dev server

### Module Not Found Errors
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

---

## 📚 Key Files

### `src/components/SolarSystem.jsx`
The main component containing:
- Three.js scene setup
- Planet data and rendering
- Animation loop
- User interactions
- UI controls

### `package.json`
Contains all project dependencies and scripts.

### `vite.config.js`
Vite configuration for React development.

### `tailwind.config.js`
Tailwind CSS configuration for styling.

---

## 🎯 Next Steps

1. **Customize Planets**: Edit `planetData` array in `SolarSystem.jsx`
2. **Add More Planets**: Add new objects to the `planetData` array
3. **Change Colors**: Modify planet colors in `planetData`
4. **Adjust Speeds**: Change default speed in `useState(50)`
5. **Add Features**: Implement moons, asteroid belts, or other celestial bodies

---

## 💡 Tips

- Use Chrome or Firefox for best WebGL performance
- Adjust speed slider for different viewing experiences
- Try different time units to see orbital periods
- Click planets to learn more about them
- Use mouse wheel to get closer views

---

## 📖 Learn More

- See `CODE_DOCUMENTATION.md` for detailed code explanations
- See `README.md` for full project documentation
- Check [Three.js Docs](https://threejs.org/docs/) for 3D graphics
- Check [React Docs](https://react.dev/) for React concepts

---

## 🎓 Understanding the Code

The solar system uses these key concepts:

1. **Three.js Scene**: The 3D world container
2. **Camera**: Your viewpoint into the scene
3. **Renderer**: Draws the 3D scene to the screen
4. **Animation Loop**: Updates positions every frame
5. **Raycasting**: Detects mouse clicks on 3D objects
6. **State Management**: React state for UI, refs for Three.js

For detailed explanations, see `CODE_DOCUMENTATION.md`.

---

Happy exploring! 🚀🌌

