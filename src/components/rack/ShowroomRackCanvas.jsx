import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Hanger Finish Palette
const HANGER_FINISH_PALETTE = {
  walnut: {
    wood: '#452a17',
    woodRoughness: 0.45,
    woodMetalness: 0.05,
    hook: '#3a3a3c',
    hookRoughness: 0.25,
    hookMetalness: 0.95
  },
  chrome: {
    wood: '#c8cbd0',
    woodRoughness: 0.28,
    woodMetalness: 0.85,
    hook: '#e0e2e5',
    hookRoughness: 0.15,
    hookMetalness: 0.95
  },
  ebony: {
    wood: '#141416',
    woodRoughness: 0.50,
    woodMetalness: 0.10,
    hook: '#2c2d30',
    hookRoughness: 0.30,
    hookMetalness: 0.90
  },
  brass: {
    wood: '#a6822c',
    woodRoughness: 0.35,
    woodMetalness: 0.65,
    hook: '#c49a37',
    hookRoughness: 0.20,
    hookMetalness: 0.95
  }
};

// 3D Realistic Wooden Hanger Component
function RealisticHanger({ finish = 'walnut' }) {
  const palette = HANGER_FINISH_PALETTE[finish] || HANGER_FINISH_PALETTE.walnut;

  // 1. Hook Geometry: Arcs naturally over the rail at y=2.0, z=0
  const hookGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.01, 0.052),   // front tip of hook
      new THREE.Vector3(0, 2.058, 0.018),  // top curve over rail
      new THREE.Vector3(0, 2.045, -0.048), // back curve behind rail
      new THREE.Vector3(0, 1.95, -0.015),  // dropping down
      new THREE.Vector3(0, 1.68, -0.020)   // entering neck apex into wooden bar
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.011, 12, false);
  }, []);

  // 2. Wooden Shoulder Bar Geometry: Sweeps down and tucks naturally inside shoulders
  const woodGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const shoulderW = 0.44; // Safely inside dress shoulder span
    const apexY = 1.68;
    const dropY = 1.54;
    const barH = 0.038;

    shape.moveTo(0, apexY);
    shape.quadraticCurveTo(shoulderW * 0.5, apexY - 0.02, shoulderW, dropY);
    shape.lineTo(shoulderW, dropY - barH);
    shape.quadraticCurveTo(shoulderW * 0.5, apexY - 0.02 - barH, 0, apexY - barH);
    shape.quadraticCurveTo(-shoulderW * 0.5, apexY - 0.02 - barH, -shoulderW, dropY - barH);
    shape.lineTo(-shoulderW, dropY);
    shape.quadraticCurveTo(-shoulderW * 0.5, apexY - 0.02, 0, apexY);

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.016,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.004,
      bevelThickness: 0.004
    });
  }, []);

  return (
    <group>
      {/* Metallic Hook */}
      <mesh geometry={hookGeo}>
        <meshStandardMaterial
          color={palette.hook}
          roughness={palette.hookRoughness}
          metalness={palette.hookMetalness}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Ferrule collar ring at hook junction */}
      <mesh position={[0, 1.685, -0.020]}>
        <cylinderGeometry args={[0.015, 0.015, 0.016, 16]} />
        <meshStandardMaterial
          color={palette.hook}
          roughness={palette.hookRoughness}
          metalness={palette.hookMetalness}
        />
      </mesh>

      {/* Wooden Shoulder Bar (positioned at z = -0.034, front face at -0.014, safely behind front fabric at z = 0) */}
      <mesh geometry={woodGeo} position={[0, 0, -0.034]}>
        <meshStandardMaterial
          color={palette.wood}
          roughness={palette.woodRoughness}
          metalness={palette.woodMetalness}
        />
      </mesh>
    </group>
  );
}

// 3D Hanging Garment Item Component
function HangingGarmentItem({
  item,
  index,
  isSelected,
  isInspecting,
  activeView,
  hangerFinish,
  onSelect,
  isMobile,
  isZoomed
}) {
  const groupRef = useRef();
  const meshRef = useRef();
  const backMeshRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  // Load textures
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  
  const frontTex = useMemo(() => {
    const tex = textureLoader.load(item.image);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    return tex;
  }, [item.image, textureLoader]);

  const backTex = useMemo(() => {
    const url = item.views?.find(v => v.id === 'back')?.image || item.image;
    const tex = textureLoader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    return tex;
  }, [item.views, item.image, textureLoader]);

  const trouserTex = useMemo(() => {
    const url = item.views?.find(v => v.id === 'trouser')?.image;
    if (!url) return null;
    const tex = textureLoader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    return tex;
  }, [item.views, textureLoader]);

  const dupattaTex = useMemo(() => {
    const url = item.views?.find(v => v.id === 'dupatta')?.image;
    if (!url) return null;
    const tex = textureLoader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    return tex;
  }, [item.views, textureLoader]);

  // Garment dimensions: aspect ratio 1122/1402 = 0.80
  const garmentW = 1.60;
  const garmentH = 2.00;

  // Active texture based on view
  const currentTex = useMemo(() => {
    if (activeView === 'trouser' && trouserTex) return trouserTex;
    if (activeView === 'dupatta' && dupattaTex) return dupattaTex;
    return frontTex;
  }, [activeView, frontTex, trouserTex, dupattaTex]);

  // Animation for Selection / Return to rail using GSAP
  useEffect(() => {
    const grp = groupRef.current;
    if (!grp) return;

    if (isSelected) {
      // Cinematic entrance: Lift off rail, move forward along Z, shift left for showroom dossier
      const targetX = isMobile ? 0 : -1.65;
      const targetZ = isZoomed ? 3.4 : (isMobile ? 2.2 : 2.5);
      const targetY = isMobile ? -0.15 : 0.05;

      gsap.to(grp.position, {
        x: targetX,
        y: targetY,
        z: targetZ,
        duration: 0.75,
        ease: 'power3.out'
      });

      // Animate rotation based on active view
      if (activeView === 'back') {
        gsap.to(grp.rotation, {
          y: Math.PI,
          x: 0,
          z: 0,
          duration: 0.65,
          ease: 'power2.inOut'
        });
      } else {
        gsap.to(grp.rotation, {
          y: 0,
          x: 0,
          z: 0,
          duration: 0.55,
          ease: 'power2.out'
        });
      }
    } else {
      // Return to Rail position
      const defaultX = index * 2.2;
      gsap.to(grp.position, {
        x: defaultX,
        y: 0,
        z: 0,
        duration: 0.65,
        ease: 'power3.inOut'
      });
      gsap.to(grp.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [isSelected, index, isMobile, activeView, isZoomed]);

  // Subtle breathing & hover sway
  useFrame((state) => {
    const grp = groupRef.current;
    if (!grp) return;

    if (!isInspecting) {
      // Hover lift
      const targetHoverY = isHovered ? 0.08 : 0;
      grp.position.y = THREE.MathUtils.lerp(grp.position.y, targetHoverY, 0.15);
      
      // Subtle idle breathing
      const idleSway = Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.008;
      grp.rotation.z = THREE.MathUtils.lerp(grp.rotation.z, idleSway, 0.1);
    }
  });

  // Calculate opacity/visibility when another item is selected
  const opacity = (isInspecting && !isSelected) ? 0.15 : 1.0;

  return (
    <group
      ref={groupRef}
      position={[index * 2.2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (!isInspecting) {
          onSelect(item);
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!isInspecting) {
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        setIsHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 3D Realistic Wooden Hanger */}
      <RealisticHanger finish={hangerFinish} isHovered={isHovered} />

      {/* Front Kameez Fabric Plane (visible on rack and for front/trouser/dupatta views) */}
      <mesh
        ref={meshRef}
        position={[0, 0.82 + (item.collarOffset || 0), 0]}
        visible={!isSelected || activeView !== 'back'}
      >
        <planeGeometry args={[garmentW, garmentH, 16, 16]} />
        <meshStandardMaterial
          map={currentTex}
          transparent={true}
          alphaTest={0.5}
          depthWrite={true}
          side={THREE.DoubleSide}
          roughness={0.70}
          metalness={0.05}
          opacity={opacity}
        />
      </mesh>

      {/* Back Kameez Fabric Plane (ONLY rendered during 3D flip inspection for back view) */}
      <mesh
        ref={backMeshRef}
        position={[0, 0.82 + (item.collarOffset || 0), 0]}
        rotation={[0, Math.PI, 0]}
        visible={isSelected && activeView === 'back'}
      >
        <planeGeometry args={[garmentW, garmentH, 16, 16]} />
        <meshStandardMaterial
          map={backTex}
          transparent={true}
          alphaTest={0.1}
          depthWrite={true}
          side={THREE.DoubleSide}
          roughness={0.70}
          metalness={0.05}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

// Complete 3D Showroom Scene with Satin Chrome Rail and Wall
function ShowroomScene({
  items,
  selectedItem,
  onSelectItem,
  activeView,
  hangerFinish,
  roomTone,
  scrollX,
  isZoomed
}) {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const railGroupRef = useRef();

  // Smoothly apply scrollX to railGroup
  useFrame(() => {
    if (railGroupRef.current && !selectedItem) {
      railGroupRef.current.position.x = scrollX.current;
    }
  });

  return (
    <>
      {/* Luxury Atelier Lighting */}
      <ambientLight intensity={roomTone === 'atelier' ? 0.7 : 1.1} color="#fffdfa" />
      
      {/* Key Light */}
      <directionalLight
        position={[4, 6, 5]}
        intensity={roomTone === 'atelier' ? 1.4 : 1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Rail Accent Light */}
      <pointLight position={[0, 3, 1]} intensity={0.8} distance={10} color="#ffffff" />

      {/* Rim Light from back */}
      <directionalLight position={[-3, 2, -4]} intensity={0.5} color="#f4ede2" />

      {/* Horizontal Brushed Chrome Rail (y = 2.0, z = 0) */}
      <group position={[0, 0, 0]}>
        {/* The Rail Cylinder */}
        <mesh position={[0, 2.0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.042, 0.042, 40, 32]} />
          <meshStandardMaterial
            color="#c8cbd0"
            roughness={0.22}
            metalness={0.92}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Left & Right Luxury Mounting Flanges */}
        <mesh position={[-16, 2.0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 32]} />
          <meshStandardMaterial color="#2a2c30" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[16, 2.0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 32]} />
          <meshStandardMaterial color="#2a2c30" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>

      {/* Draggable Hanging Garments Group */}
      <group ref={railGroupRef}>
        {items.map((item, idx) => (
          <HangingGarmentItem
            key={item.id}
            item={item}
            index={idx}
            isSelected={selectedItem?.id === item.id}
            isInspecting={!!selectedItem}
            activeView={activeView}
            hangerFinish={hangerFinish}
            onSelect={onSelectItem}
            isMobile={isMobile}
            isZoomed={isZoomed}
          />
        ))}
      </group>

      {/* Studio Wall Backing with subtle drop shadow */}
      <mesh position={[0, 1.0, -2.5]}>
        <planeGeometry args={[60, 25]} />
        <meshStandardMaterial
          color={roomTone === 'atelier' ? '#141416' : roomTone === 'gallery' ? '#f5efeb' : '#f8f7f5'}
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>
    </>
  );
}

// Exported Top-level Canvas with Smooth Pointer Drag & Inertia
export default function ShowroomRackCanvas({
  items,
  selectedItem,
  onSelectItem,
  activeView,
  hangerFinish,
  roomTone,
  isZoomed
}) {
  const scrollX = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const lastX = useRef(0);

  // Spacing and boundaries
  const itemSpacing = 2.2;
  const maxScroll = 0.5;
  const minScroll = -(items.length - 1) * itemSpacing - 0.5;

  // Pointer Drag Handlers
  const handlePointerDown = (e) => {
    if (selectedItem) return;
    isDragging.current = true;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startX.current = clientX;
    lastX.current = clientX;
    velocity.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || selectedItem) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const delta = (clientX - lastX.current) * 0.007;
    scrollX.current += delta;
    velocity.current = delta;
    lastX.current = clientX;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Inertia and spring loop
  useEffect(() => {
    let animId;
    const tick = () => {
      if (!isDragging.current && !selectedItem) {
        scrollX.current += velocity.current;
        velocity.current *= 0.94; // friction

        // Spring bounds
        if (scrollX.current > maxScroll) {
          scrollX.current += (maxScroll - scrollX.current) * 0.12;
          velocity.current *= 0.7;
        } else if (scrollX.current < minScroll) {
          scrollX.current += (minScroll - scrollX.current) * 0.12;
          velocity.current *= 0.7;
        }
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [selectedItem, minScroll]);

  return (
    <div
      className="relative w-full h-full select-none touch-none cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        camera={{ position: [0, 1.2, 6.8], fov: 40 }}
        dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
        gl={{ antialias: true, alpha: true }}
      >
        <ShowroomScene
          items={items}
          selectedItem={selectedItem}
          onSelectItem={onSelectItem}
          activeView={activeView}
          hangerFinish={hangerFinish}
          roomTone={roomTone}
          scrollX={scrollX}
          isZoomed={isZoomed}
        />
      </Canvas>
    </div>
  );
}
