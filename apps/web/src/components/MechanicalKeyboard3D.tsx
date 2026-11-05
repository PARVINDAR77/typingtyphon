'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface MechanicalKeyboard3DProps {
  interactive?: boolean;
  className?: string;
}

export const MechanicalKeyboard3D: React.FC<MechanicalKeyboard3DProps> = ({
  interactive = true,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    // 1. Verify WebGL availability
    const checkWebGL = (): boolean => {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
      } catch {
        return false;
      }
    };

    if (!checkWebGL()) {
      setWebglSupported(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 540;
    let height = container.clientHeight || 380;

    // 2. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050b18, 0.04);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 7.8);
    camera.lookAt(0, -0.4, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Lighting (Futuristic Cyber RGB: Cyan + Electric Purple)
    const ambientLight = new THREE.AmbientLight(0x101d36, 1.8);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x00d9ff, 4.5, 12);
    cyanPointLight.position.set(-3.5, 2.5, 3.0);
    scene.add(cyanPointLight);

    const purplePointLight = new THREE.PointLight(0x8257ff, 5.0, 12);
    purplePointLight.position.set(3.5, 2.2, 2.5);
    scene.add(purplePointLight);

    const topBlueSpot = new THREE.SpotLight(0x168bff, 3.5, 15, Math.PI / 4, 0.4);
    topBlueSpot.position.set(0, 6, 4);
    topBlueSpot.target.position.set(0, 0, 0);
    scene.add(topBlueSpot);
    scene.add(topBlueSpot.target);

    // Keyboard Group for mouse tilt
    const keyboardGroup = new THREE.Group();
    // Default 30° dynamic tilt matching Master Design Panel 1
    keyboardGroup.rotation.x = 0.52;
    keyboardGroup.rotation.y = -0.38;
    keyboardGroup.rotation.z = 0.14;
    scene.add(keyboardGroup);

    // 4. Keyboard Chassis Base
    const chassisWidth = 6.8;
    const chassisHeight = 0.45;
    const chassisDepth = 2.9;

    const chassisGeo = new THREE.BoxGeometry(chassisWidth, chassisHeight, chassisDepth);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0a1428,
      metalness: 0.85,
      roughness: 0.25,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    chassisMesh.position.y = -chassisHeight / 2;
    keyboardGroup.add(chassisMesh);

    // Chassis Bevel/Edge RGB Underglow strip
    const borderGeo = new THREE.BoxGeometry(chassisWidth + 0.08, 0.08, chassisDepth + 0.08);
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.85,
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.y = -chassisHeight + 0.04;
    keyboardGroup.add(borderMesh);

    // 5. Switch Plate
    const plateGeo = new THREE.BoxGeometry(chassisWidth - 0.25, 0.08, chassisDepth - 0.25);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x101d36,
      metalness: 0.9,
      roughness: 0.2,
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = 0.04;
    keyboardGroup.add(plateMesh);

    // 6. Individual Mechanical Keycaps (65% Layout Grid)
    const keyMaterials = {
      standard: new THREE.MeshStandardMaterial({
        color: 0x101d36,
        metalness: 0.6,
        roughness: 0.35,
      }),
      accentCyan: new THREE.MeshStandardMaterial({
        color: 0x00d9ff,
        emissive: 0x0088cc,
        emissiveIntensity: 0.45,
        metalness: 0.4,
        roughness: 0.25,
      }),
      accentPurple: new THREE.MeshStandardMaterial({
        color: 0x8257ff,
        emissive: 0x5522aa,
        emissiveIntensity: 0.45,
        metalness: 0.4,
        roughness: 0.25,
      }),
      primaryBlue: new THREE.MeshStandardMaterial({
        color: 0x168bff,
        emissive: 0x0f5bbb,
        emissiveIntensity: 0.4,
        metalness: 0.4,
        roughness: 0.3,
      }),
    };

    const keycapGeo = new THREE.BoxGeometry(0.36, 0.24, 0.36);
    const keycapMeshes: { mesh: THREE.Mesh; initialY: number; row: number; col: number }[] = [];

    // 5 Rows of keycaps
    const rows = 5;
    const colsPerRow = [14, 14, 13, 13, 9];
    const rowSpacing = 0.48;
    const colSpacing = 0.44;

    for (let r = 0; r < rows; r++) {
      const cols = colsPerRow[r];
      const zPos = -1.0 + r * rowSpacing;

      for (let c = 0; c < cols; c++) {
        let keyWidth = 0.36;
        let xOffset = 0;

        // Spacebar on bottom row
        const isSpacebar = r === 4 && c === 4;
        if (isSpacebar) {
          keyWidth = 2.1;
          xOffset = 0.85;
        }

        const geo = isSpacebar
          ? new THREE.BoxGeometry(keyWidth, 0.24, 0.36)
          : keycapGeo;

        // Choose key material based on layout accent positions
        let mat = keyMaterials.standard;
        if (r === 0 && c === 0) mat = keyMaterials.accentCyan; // ESC
        else if (r === 2 && c === cols - 1) mat = keyMaterials.accentPurple; // ENTER
        else if (isSpacebar) mat = keyMaterials.primaryBlue; // SPACE
        else if ((r === 1 && (c === 4 || c === 5)) || (r === 2 && (c === 4 || c === 5))) {
          // Home row / center cyber accent keys
          mat = (c + r) % 2 === 0 ? keyMaterials.accentCyan : keyMaterials.accentPurple;
        }

        const keyMesh = new THREE.Mesh(geo, mat);
        const xPos = -2.85 + c * colSpacing + xOffset;
        keyMesh.position.set(xPos, 0.18, zPos);
        keyboardGroup.add(keyMesh);

        keycapMeshes.push({
          mesh: keyMesh,
          initialY: 0.18,
          row: r,
          col: c,
        });
      }
    }

    // 7. Floating 3D Keycaps (Levitating "T", "R", "E" / Cyber Elements above the board)
    const floatingGroup = new THREE.Group();
    scene.add(floatingGroup);

    interface FloatingKey {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      floatFreq: number;
      floatAmp: number;
      phase: number;
    }

    const floatingKeys: FloatingKey[] = [];
    const floatingConfigs = [
      { pos: new THREE.Vector3(2.2, 1.8, 1.2), color: 0x00d9ff, scale: 0.55, freq: 1.8, amp: 0.18, phase: 0 },
      { pos: new THREE.Vector3(1.4, 2.7, 0.4), color: 0x8257ff, scale: 0.62, freq: 1.4, amp: 0.22, phase: 1.5 },
      { pos: new THREE.Vector3(2.8, 0.7, 1.8), color: 0x168bff, scale: 0.48, freq: 2.1, amp: 0.15, phase: 3.1 },
    ];

    floatingConfigs.forEach((cfg) => {
      const fGeo = new THREE.BoxGeometry(0.7, 0.45, 0.7);
      const fMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.35,
        metalness: 0.7,
        roughness: 0.2,
      });
      const fMesh = new THREE.Mesh(fGeo, fMat);
      fMesh.position.copy(cfg.pos);
      fMesh.rotation.set(0.4, 0.6, 0.2);
      floatingGroup.add(fMesh);

      // Add a subtle glowing halo edge to floating keycaps
      const wireGeo = new THREE.EdgesGeometry(fGeo);
      const wireMat = new THREE.LineBasicMaterial({ color: 0xf5f7ff, linewidth: 2 });
      const wireframe = new THREE.LineSegments(wireGeo, wireMat);
      fMesh.add(wireframe);

      floatingKeys.push({
        mesh: fMesh,
        basePos: cfg.pos.clone(),
        rotSpeed: new THREE.Vector3(0.008, 0.012, 0.006),
        floatFreq: cfg.freq,
        floatAmp: cfg.amp,
        phase: cfg.phase,
      });
    });

    // 8. Cyber Light Ring / Orbital Halo behind Keyboard
    const ringGeo = new THREE.TorusGeometry(3.6, 0.025, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.8;
    ringMesh.position.set(0.5, 0.4, -0.6);
    scene.add(ringMesh);

    const secondRingGeo = new THREE.TorusGeometry(4.2, 0.018, 16, 100);
    const secondRingMat = new THREE.MeshBasicMaterial({
      color: 0x8257ff,
      transparent: true,
      opacity: 0.3,
    });
    const secondRingMesh = new THREE.Mesh(secondRingGeo, secondRingMat);
    secondRingMesh.rotation.x = Math.PI / 3.2;
    secondRingMesh.rotation.y = 0.2;
    secondRingMesh.position.set(0.5, 0.2, -0.8);
    scene.add(secondRingMesh);

    // 9. Ambient Cyber Particles
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 10;
      particlePositions[i + 1] = (Math.random() - 0.2) * 6;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00d9ff,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    setIsLoaded(true);

    // 10. Mouse Interaction & Physics Interpolation
    let targetTiltX = 0.52;
    let targetTiltY = -0.38;
    let currentTiltX = 0.52;
    let currentTiltY = -0.38;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetTiltY = -0.38 + x * 0.25;
      targetTiltX = 0.52 - y * 0.2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 11. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Smooth tilt lerp
      currentTiltX += (targetTiltX - currentTiltX) * 0.06;
      currentTiltY += (targetTiltY - currentTiltY) * 0.06;

      keyboardGroup.rotation.x = currentTiltX;
      keyboardGroup.rotation.y = currentTiltY;

      // Floating keys levitation & slow tumbling
      floatingKeys.forEach((fk) => {
        fk.mesh.position.y = fk.basePos.y + Math.sin(elapsed * fk.floatFreq + fk.phase) * fk.floatAmp;
        fk.mesh.rotation.x += fk.rotSpeed.x;
        fk.mesh.rotation.y += fk.rotSpeed.y;
      });

      // Orbital rings subtle counter-rotation
      ringMesh.rotation.z = elapsed * 0.08;
      secondRingMesh.rotation.z = -elapsed * 0.06;

      // Per-key dynamic RGB wave pulse across rows
      const wave = (Math.sin(elapsed * 2.5) + 1) / 2;
      borderMat.color.setHSL(0.55 + wave * 0.2, 1, 0.55);

      renderer.render(scene, camera);
    };

    animate();

    // 12. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 540;
      height = container.clientHeight || 380;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      chassisGeo.dispose();
      chassisMat.dispose();
      borderGeo.dispose();
      borderMat.dispose();
      plateGeo.dispose();
      plateMat.dispose();
      keycapGeo.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      secondRingGeo.dispose();
      secondRingMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive]);

  if (!webglSupported) {
    // Elegant SVG / CSS 3D Mechanical Keyboard Fallback for low-power mobile or WebGL-disabled devices
    return (
      <div
        className={`mechanical-keyboard-fallback ${className}`}
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '380px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 217, 255, 0.22) 0%, rgba(130, 87, 255, 0.1) 50%, transparent 75%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}
        />
        <svg
          viewBox="0 0 600 420"
          style={{ width: '100%', height: '100%', overflow: 'visible', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))' }}
        >
          <defs>
            <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#101D36" />
              <stop offset="100%" stopColor="#0A1428" />
            </linearGradient>
            <linearGradient id="cyberNeon" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D9FF" />
              <stop offset="50%" stopColor="#168BFF" />
              <stop offset="100%" stopColor="#8257FF" />
            </linearGradient>
          </defs>
          {/* Base Perspective Keyboard */}
          <polygon
            points="70,180 430,70 540,240 180,350"
            fill="url(#chassisGrad)"
            stroke="url(#cyberNeon)"
            strokeWidth="3"
          />
          {/* Accent keycaps */}
          <polygon points="120,200 170,180 185,210 135,230" fill="#00D9FF" opacity="0.9" />
          <polygon points="260,170 340,140 360,180 280,210" fill="#8257FF" opacity="0.9" />
          <polygon points="230,260 380,210 410,250 260,300" fill="#168BFF" opacity="0.9" />
          {/* Floating Keycap T */}
          <g transform="translate(420, 80) rotate(-15)">
            <polygon points="0,20 40,0 60,30 20,50" fill="#00D9FF" stroke="#F5F7FF" strokeWidth="2" />
            <text x="30" y="32" fill="#050B18" fontWeight="bold" fontSize="18" textAnchor="middle">T</text>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`mechanical-keyboard-3d ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        height: '380px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
      }}
    >
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-heading)',
          }}
        >
          <span style={{ animation: 'pulse 1.5s infinite' }}>Initializing 3D Keyboard Engine...</span>
        </div>
      )}
    </div>
  );
};
