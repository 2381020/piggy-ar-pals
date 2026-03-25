
# WebAR Pig 3D Viewer

## Overview
A mobile-first WebAR experience featuring an animated 3D pig model that appears to stand on the ground with realistic shadows. Includes camera background, interactive controls, and a food delivery-style UI.

## Pages & Layout

### Main AR Page (fullscreen)
- **Camera Background**: Request camera permission on load, display as fullscreen background
- **3D Scene Overlay**: Three.js canvas on top of camera feed using react-three-fiber
- **Loading Screen**: Animated spinner while model loads
- **AR Status Indicator**: Badge showing "AR Active" / "3D Mode"

### Simple Checkout Page
- Food delivery style order simulation (GoFood/GrabFood inspired)

## 3D Scene
- **Pig Model**: Use animated GLB from Mixamo/Sketchfab CDN (pig with idle/walk/jump animations)
- **Ground Plane**: Transparent plane at y=0 with contact shadow using `@react-three/drei`'s `ContactShadows`
- **Lighting**: Ambient light + Directional light with shadow casting
- **Camera**: Positioned to view pig at ~1.5m distance

## Interactions
- **Tap/Click on pig** → Jump animation
- **Drag** → Rotate model (OrbitControls)
- **Pinch/Scroll** → Zoom in/out
- **Drag position** → Move pig on ground plane

## UI Controls (Mobile-style overlay)
Bottom toolbar with buttons:
- 🔄 Putar (rotate)
- 🔍 Zoom
- 📍 Reset Posisi
- 🐷 Animasi Lompat
- 🎬 Ganti Animasi (cycle idle/walk)
- 🛒 Order Sekarang → navigates to checkout

## Components
- `ARScene` - Main Three.js canvas with camera feed background
- `PigModel` - 3D model loader with animation controls
- `Ground` - Transparent ground plane + contact shadows
- `ARControls` - UI overlay buttons
- `LoadingScreen` - Loading state
- `CheckoutPage` - Simple order page

## Tech
- react-three-fiber v8.18, three.js, @react-three/drei v9.122.0
- Camera API (navigator.mediaDevices.getUserMedia)
- Tailwind CSS for UI
- Fallback to 3D viewer if WebXR unavailable

## Design
- Mobile-first, fullscreen experience
- Dark semi-transparent bottom toolbar
- Rounded buttons with icons
- GoFood/GrabFood-inspired green accent color scheme
- Smooth transitions and animations
