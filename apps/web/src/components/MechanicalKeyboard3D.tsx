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
    // 1. Verify WebGL support
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

    let width = container.clientWidth || 660;
    let height = container.clientHeight || 480;

    // 2. Scene, Camera & Transparent Renderer (Seamless background integration with #050B18)
    const scene = new THREE.Scene();
    // Absolutely NO background color or fog — 100% transparent to blend with website background
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 7.5);
    camera.lookAt(0.2, -0.15, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true, // Transparent canvas blending with page background
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    container.appendChild(renderer.domElement);

    // 3. Cinematic Cyber Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x182438, 1.8);
    scene.add(ambientLight);

    // Key Light from top-front
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(2.5, 8, 6);
    scene.add(keyLight);

    // Cyan Left Rim Light
    const cyanLight = new THREE.DirectionalLight(0x00d9ff, 4.5);
    cyanLight.position.set(-6, 3, 3);
    scene.add(cyanLight);

    // Neon Purple Right Rim Light
    const purpleLight = new THREE.DirectionalLight(0x8257ff, 4.8);
    purpleLight.position.set(6, 3.5, -2);
    scene.add(purpleLight);

    // Subtle Under-Board Radiant Point Lights
    const underCyan = new THREE.PointLight(0x00d9ff, 3.5, 7);
    underCyan.position.set(-2, -0.6, 0.8);
    scene.add(underCyan);

    const underPurple = new THREE.PointLight(0x8257ff, 3.8, 7);
    underPurple.position.set(2, -0.6, 0.2);
    scene.add(underPurple);

    // Master Keyboard Group (3/4 Isometric Perspective matching Master Design Spec)
    const keyboardGroup = new THREE.Group();
    keyboardGroup.rotation.x = 0.50;
    keyboardGroup.rotation.y = -0.34;
    keyboardGroup.rotation.z = 0.13;
    scene.add(keyboardGroup);

    // 4. Authentic Tapered OEM Mechanical Keycap Geometry
    const createOEMKeycapGeometry = (w: number, h: number, d: number) => {
      const geo = new THREE.BoxGeometry(w, h, d, 2, 1, 2);
      const pos = geo.attributes.position;
      const taper = 0.85;

      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > 0) {
          pos.setX(i, pos.getX(i) * taper);
          pos.setZ(i, pos.getZ(i) * taper);
          const x = pos.getX(i);
          if (Math.abs(x) < (w * taper) / 3) {
            pos.setY(i, y - 0.015); // Cylindrical ergonomic finger dip
          }
        }
      }
      geo.computeVertexNormals();
      return geo;
    };

    // 5. Stealth Black Double-Shot PBT Texture Generator with Backlit Glowing Legends
    const createStealthPBTTexture = (
      label: string,
      glowColor: string,
      isAccent = false,
      isSpace = false
    ): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Deep Stealth Charcoal/Black PBT Keycap Body (Matching Concept Art)
      ctx.fillStyle = '#0a101d';
      ctx.fillRect(0, 0, 256, 256);

      // Top Dish
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, isAccent ? '#1a2842' : '#141d2e');
      grad.addColorStop(1, isAccent ? '#0e1626' : '#0c1320');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(14, 14, 228, 228, 26);
      ctx.fill();

      // Chamfer Inner Accent Border
      ctx.strokeStyle = isAccent ? glowColor : 'rgba(120, 160, 255, 0.22)';
      ctx.lineWidth = isAccent ? 6 : 3.5;
      ctx.stroke();

      // Frosted Dish Center Reflection
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(32, 32, 192, 192, 18);
      ctx.fill();

      // Special Laser Line for Spacebar
      if (isSpace) {
        ctx.strokeStyle = '#00D9FF';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#00D9FF';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(50, 128);
        ctx.lineTo(206, 128);
        ctx.stroke();
      } else if (label) {
        // Backlit Legend (Glowing translucent glyph)
        ctx.fillStyle = isAccent ? '#FFFFFF' : glowColor;
        ctx.font = 'bold 84px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isAccent ? 22 : 14;
        ctx.fillText(label, 128, 128);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      return texture;
    };

    // 6. Stealth CNC Aluminum Chassis & RGB Underglow Lightbar
    const totalUnits = 15.0;
    const unitSize = 0.38;
    const paddingX = 0.35;
    const paddingZ = 0.35;
    const chassisW = totalUnits * unitSize + paddingX * 2; // ~6.4 units
    const chassisD = 5 * unitSize + paddingZ * 2 + 0.35; // ~2.6 units

    // Bottom Wedge Case (Stealth Anodized Matte Aluminum)
    const baseWedgeGeo = new THREE.BoxGeometry(chassisW, 0.44, chassisD);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x090f1a, // Deep stealth black/charcoal matching #050B18
      metalness: 0.88,
      roughness: 0.22,
    });
    const chassisMesh = new THREE.Mesh(baseWedgeGeo, chassisMat);
    chassisMesh.position.y = -0.22;
    keyboardGroup.add(chassisMesh);

    // Front CNC Machined Aluminum Bevel Lip
    const frontTrimGeo = new THREE.BoxGeometry(chassisW + 0.08, 0.12, 0.14);
    const frontTrimMat = new THREE.MeshStandardMaterial({
      color: 0x121b2d,
      metalness: 0.9,
      roughness: 0.15,
    });
    const frontTrim = new THREE.Mesh(frontTrimGeo, frontTrimMat);
    frontTrim.position.set(0, -0.06, chassisD / 2 + 0.06);
    keyboardGroup.add(frontTrim);

    // 360° Acrylic Dual-Tone RGB Underglow Lightbar
    const lightbarGeo = new THREE.BoxGeometry(chassisW + 0.12, 0.07, chassisD + 0.12);
    const lightbarMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.92,
    });
    const lightbarMesh = new THREE.Mesh(lightbarGeo, lightbarMat);
    lightbarMesh.position.y = -0.42;
    keyboardGroup.add(lightbarMesh);

    // Dark Brushed Aluminum Switch Mounting Plate
    const plateGeo = new THREE.BoxGeometry(chassisW - 0.14, 0.05, chassisD - 0.14);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x080d18,
      metalness: 0.85,
      roughness: 0.25,
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = 0.01;
    keyboardGroup.add(plateMesh);

    // 7. Precise 65% ANSI Layout: Stealth Black Keycaps with Vibrant RGB Gaps
    interface KeyDefinition {
      label: string;
      u: number;
      isAccent?: boolean;
    }

    const ANSI_LAYOUT: KeyDefinition[][] = [
      // Row 0: Function & Numbers (15.0u total)
      [
        { label: 'ESC', u: 1.0, isAccent: true },
        { label: '1', u: 1.0 },
        { label: '2', u: 1.0 },
        { label: '3', u: 1.0 },
        { label: '4', u: 1.0 },
        { label: '5', u: 1.0 },
        { label: '6', u: 1.0 },
        { label: '7', u: 1.0 },
        { label: '8', u: 1.0 },
        { label: '9', u: 1.0 },
        { label: '0', u: 1.0 },
        { label: '-', u: 1.0 },
        { label: '=', u: 1.0 },
        { label: 'DEL', u: 2.0, isAccent: true },
      ],
      // Row 1: QWERTY (15.0u total)
      [
        { label: 'TAB', u: 1.5, isAccent: true },
        { label: 'Q', u: 1.0 },
        { label: 'W', u: 1.0 },
        { label: 'E', u: 1.0 },
        { label: 'R', u: 1.0 },
        { label: 'T', u: 1.0, isAccent: true }, // Typhon Accent Key
        { label: 'Y', u: 1.0, isAccent: true }, // Typhon Accent Key
        { label: 'U', u: 1.0 },
        { label: 'I', u: 1.0 },
        { label: 'O', u: 1.0 },
        { label: 'P', u: 1.0, isAccent: true },
        { label: '[', u: 1.0 },
        { label: ']', u: 1.0 },
        { label: '\\', u: 1.5 },
      ],
      // Row 2: Home Row (15.0u total)
      [
        { label: 'CAPS', u: 1.75 },
        { label: 'A', u: 1.0 },
        { label: 'S', u: 1.0 },
        { label: 'D', u: 1.0 },
        { label: 'F', u: 1.0, isAccent: true }, // Tactile Anchor
        { label: 'G', u: 1.0 },
        { label: 'H', u: 1.0 },
        { label: 'J', u: 1.0, isAccent: true }, // Tactile Anchor
        { label: 'K', u: 1.0 },
        { label: 'L', u: 1.0 },
        { label: ';', u: 1.0 },
        { label: "'", u: 1.0 },
        { label: 'ENTER', u: 2.25, isAccent: true },
      ],
      // Row 3: Bottom Alphas & Up Arrow (15.0u total)
      [
        { label: 'SHIFT', u: 2.25 },
        { label: 'Z', u: 1.0 },
        { label: 'X', u: 1.0 },
        { label: 'C', u: 1.0 },
        { label: 'V', u: 1.0 },
        { label: 'B', u: 1.0 },
        { label: 'N', u: 1.0, isAccent: true },
        { label: 'M', u: 1.0 },
        { label: ',', u: 1.0 },
        { label: '.', u: 1.0 },
        { label: '/', u: 1.0 },
        { label: 'SHIFT', u: 1.75 },
        { label: '▲', u: 1.0, isAccent: true },
      ],
      // Row 4: Modifiers, Spacebar & Arrow Cluster (15.0u total)
      [
        { label: 'CTRL', u: 1.25 },
        { label: 'WIN', u: 1.25 },
        { label: 'ALT', u: 1.25 },
        { label: 'SPACE', u: 6.25, isAccent: true },
        { label: 'ALT', u: 1.0 },
        { label: 'FN', u: 1.0 },
        { label: '◀', u: 1.0, isAccent: true },
        { label: '▼', u: 1.0, isAccent: true },
        { label: '▶', u: 1.0, isAccent: true },
      ],
    ];

    interface ActiveKey {
      mesh: THREE.Mesh;
      initialY: number;
      targetY: number;
      rgbLed: THREE.Mesh;
      colIdx: number;
      rowIdx: number;
    }

    const keyList: ActiveKey[] = [];
    const originX = -((totalUnits * unitSize) / 2);
    const originZ = -((5 * unitSize) / 2) + 0.15;

    // Translucent mechanical switch housing geometry & materials
    const switchGeo = new THREE.BoxGeometry(0.24, 0.16, 0.24);
    const crossStemGeo = new THREE.BoxGeometry(0.08, 0.12, 0.08);

    // Shared stealth black PBT side material
    const stealthSideMat = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      roughness: 0.28,
      metalness: 0.45,
    });
    const bottomMat = new THREE.MeshStandardMaterial({ color: 0x060a12, roughness: 0.6 });

    ANSI_LAYOUT.forEach((row, rIdx) => {
      let currentX = originX;
      const zPos = originZ + rIdx * (unitSize + 0.07);

      row.forEach((kDef, cIdx) => {
        const keyW = kDef.u * unitSize - 0.035;
        const keyD = unitSize - 0.035;
        const keyH = 0.24;
        const centerX = currentX + (kDef.u * unitSize) / 2;

        // Calculate RGB glow color based on column position:
        // Left columns (0-5) = Electric Cyan (#00D9FF)
        // Center columns (6-9) = Deep Cyber Blue (#168BFF)
        // Right columns (10-13) = Royal Purple (#8257FF)
        let glowColor = '#00D9FF';
        let ledHex = 0x00d9ff;
        if (cIdx >= 6 && cIdx <= 9) {
          glowColor = '#168BFF';
          ledHex = 0x168bff;
        } else if (cIdx >= 10) {
          glowColor = '#8257FF';
          ledHex = 0x8257ff;
        }

        // 1. Tapered OEM Keycap Mesh
        const keyGeo = createOEMKeycapGeometry(keyW, keyH, keyD);
        const isSpace = kDef.label === 'SPACE';
        const topTexture = createStealthPBTTexture(kDef.label, glowColor, kDef.isAccent, isSpace);

        const topMat = new THREE.MeshStandardMaterial({
          map: topTexture,
          roughness: 0.22,
          metalness: 0.35,
        });

        const materials = [
          stealthSideMat,
          stealthSideMat,
          topMat, // Top face with crisp backlit legend
          bottomMat,
          stealthSideMat,
          stealthSideMat,
        ];

        const keyMesh = new THREE.Mesh(keyGeo, materials);
        keyMesh.position.set(centerX, 0.22, zPos);
        keyboardGroup.add(keyMesh);

        // 2. Translucent Mechanical Switch Housing beneath Keycap
        const switchMat = new THREE.MeshStandardMaterial({
          color: 0x142035,
          emissive: ledHex,
          emissiveIntensity: 0.35,
          roughness: 0.15,
          transparent: true,
          opacity: 0.75,
        });
        const switchMesh = new THREE.Mesh(switchGeo, switchMat);
        switchMesh.position.set(centerX, 0.08, zPos);
        keyboardGroup.add(switchMesh);

        const stemMat = new THREE.MeshBasicMaterial({ color: ledHex });
        const stemMesh = new THREE.Mesh(crossStemGeo, stemMat);
        stemMesh.position.set(centerX, 0.14, zPos);
        keyboardGroup.add(stemMesh);

        // 3. High-Intensity Radiant Under-Key RGB LED Mesh (Spills light between keycaps!)
        const ledGeo = new THREE.PlaneGeometry(keyW + 0.12, keyD + 0.12);
        const ledMat = new THREE.MeshBasicMaterial({
          color: ledHex,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        });
        const ledMesh = new THREE.Mesh(ledGeo, ledMat);
        ledMesh.rotation.x = Math.PI / 2;
        ledMesh.position.set(centerX, 0.045, zPos);
        keyboardGroup.add(ledMesh);

        keyList.push({
          mesh: keyMesh,
          initialY: 0.22,
          targetY: 0.22,
          rgbLed: ledMesh,
          colIdx: cIdx,
          rowIdx: rIdx,
        });

        currentX += kDef.u * unitSize;
      });
    });

    // 8. Stealth Black Floating Keycaps ("T", "R", "E") Directly Facing the Camera
    const floatingGroup = new THREE.Group();
    scene.add(floatingGroup);

    interface FloatingItem {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      freq: number;
      amp: number;
      phase: number;
      rotSpeed: THREE.Vector3;
    }

    const floatingKeys: FloatingItem[] = [];
    const floatingDefs = [
      {
        letter: 'T',
        pos: new THREE.Vector3(2.4, 2.1, 1.0),
        color: '#00D9FF',
        ledHex: 0x00d9ff,
        scale: 1.25,
        freq: 1.8,
        amp: 0.22,
        phase: 0,
      },
      {
        letter: 'R',
        pos: new THREE.Vector3(1.1, 3.2, -0.1),
        color: '#8257FF',
        ledHex: 0x8257ff,
        scale: 1.35,
        freq: 1.4,
        amp: 0.25,
        phase: 1.6,
      },
      {
        letter: 'E',
        pos: new THREE.Vector3(3.2, 0.8, 1.6),
        color: '#168BFF',
        ledHex: 0x168bff,
        scale: 1.15,
        freq: 2.1,
        amp: 0.18,
        phase: 3.1,
      },
    ];

    floatingDefs.forEach((def) => {
      const fGeo = createOEMKeycapGeometry(0.76 * def.scale, 0.46 * def.scale, 0.76 * def.scale);
      const fTexture = createStealthPBTTexture(def.letter, def.color, true);

      const fTopMat = new THREE.MeshStandardMaterial({
        map: fTexture,
        roughness: 0.18,
        metalness: 0.35,
      });

      const fMats = [
        stealthSideMat,
        stealthSideMat,
        fTopMat, // Top face with bold glowing letter facing user
        bottomMat,
        stealthSideMat,
        stealthSideMat,
      ];

      const fMesh = new THREE.Mesh(fGeo, fMats);
      fMesh.position.copy(def.pos);
      // Tilted so the top face with bold letter directly faces the camera!
      fMesh.rotation.set(-0.35, -0.45, 0.15);
      floatingGroup.add(fMesh);

      // Cherry MX cross stem (+) on the underside
      const stemH = new THREE.BoxGeometry(0.24 * def.scale, 0.16 * def.scale, 0.08 * def.scale);
      const stemV = new THREE.BoxGeometry(0.08 * def.scale, 0.16 * def.scale, 0.24 * def.scale);
      const stemMat = new THREE.MeshBasicMaterial({ color: def.ledHex });
      const stemMeshH = new THREE.Mesh(stemH, stemMat);
      const stemMeshV = new THREE.Mesh(stemV, stemMat);
      stemMeshH.position.y = -0.24 * def.scale;
      stemMeshV.position.y = -0.24 * def.scale;
      fMesh.add(stemMeshH);
      fMesh.add(stemMeshV);

      // Glowing Neon Wireframe Contour
      const edges = new THREE.EdgesGeometry(fGeo);
      const edgeLineMat = new THREE.LineBasicMaterial({
        color: def.ledHex,
        linewidth: 2,
      });
      const wire = new THREE.LineSegments(edges, edgeLineMat);
      fMesh.add(wire);

      floatingKeys.push({
        mesh: fMesh,
        basePos: def.pos.clone(),
        freq: def.freq,
        amp: def.amp,
        phase: def.phase,
        rotSpeed: new THREE.Vector3(0.005, 0.008, 0.003),
      });
    });

    // 9. Glowing 3D Orbital Energy Rings (Electric Cyan & Royal Purple)
    const curve1 = new THREE.EllipseCurve(0.4, 0.2, 4.4, 3.2, 0, 2 * Math.PI, false, 0);
    const points1 = curve1.getPoints(120);
    const ring1Geo = new THREE.BufferGeometry().setFromPoints(
      points1.map((p) => new THREE.Vector3(p.x, p.y, (p.x * 0.35) - 0.5))
    );
    const ring1Mat = new THREE.LineBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.85,
    });
    const ring1 = new THREE.Line(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2.7;
    scene.add(ring1);

    const curve2 = new THREE.EllipseCurve(0.4, 0.1, 5.0, 3.6, 0, 2 * Math.PI, false, 0);
    const points2 = curve2.getPoints(120);
    const ring2Geo = new THREE.BufferGeometry().setFromPoints(
      points2.map((p) => new THREE.Vector3(p.x, p.y, -(p.x * 0.3) - 0.8))
    );
    const ring2Mat = new THREE.LineBasicMaterial({
      color: 0x8257ff,
      transparent: true,
      opacity: 0.75,
    });
    const ring2 = new THREE.Line(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3.1;
    ring2.rotation.y = 0.2;
    scene.add(ring2);

    // 10. Cosmic Sparks & Particle Dust (Cyan & Purple Stars)
    const particleCount = 100;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.2) * 7;
      particlePositions[i + 2] = (Math.random() - 0.5) * 9;

      if (Math.random() > 0.5) {
        particleColors[i] = 0.0;
        particleColors[i + 1] = 0.85;
        particleColors[i + 2] = 1.0;
      } else {
        particleColors[i] = 0.51;
        particleColors[i + 1] = 0.34;
        particleColors[i + 2] = 1.0;
      }
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    setIsLoaded(true);

    // 11. Mouse Parallax & Dynamic Interactive Tilt
    let targetTiltX = 0.50;
    let targetTiltY = -0.34;
    let currentTiltX = 0.50;
    let currentTiltY = -0.34;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetTiltY = -0.34 + x * 0.25;
      targetTiltX = 0.50 - y * 0.20;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 12. Dynamic Real-Time RGB Wave & Ghost Typing Keystroke Physics
    let lastGhostKeyTime = 0;
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse tilt interpolation
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;
      keyboardGroup.rotation.x = currentTiltX;
      keyboardGroup.rotation.y = currentTiltY;

      // Real-time RGB Neon Wave sweeping diagonally across switches (Under the black keycaps)
      const waveSpeed = elapsed * 3.2;
      keyList.forEach((item) => {
        const wave = Math.sin(waveSpeed - item.colIdx * 0.28 + item.rowIdx * 0.35);
        // Cycles across cyber spectrum: Cyan (0.50) -> Sapphire Blue (0.62) -> Purple (0.76)
        const dynamicHue = 0.50 + ((wave + 1) / 2) * 0.26;
        const dynamicColor = new THREE.Color().setHSL(dynamicHue, 1.0, 0.60);

        (item.rgbLed.material as THREE.MeshBasicMaterial).color.copy(dynamicColor);
        (item.rgbLed.material as THREE.MeshBasicMaterial).opacity = 0.55 + ((wave + 1) / 2) * 0.35;

        // Mechanical key travel depression and spring bounce
        item.mesh.position.y += (item.targetY - item.mesh.position.y) * 0.28;
        if (Math.abs(item.mesh.position.y - item.targetY) < 0.005 && item.targetY < item.initialY) {
          item.targetY = item.initialY;
        }
      });

      // Ghost Key Typing: trigger authentic mechanical keystroke every 115ms
      if (elapsed - lastGhostKeyTime > 0.115) {
        lastGhostKeyTime = elapsed;
        const randomKey = keyList[Math.floor(Math.random() * keyList.length)];
        if (randomKey && randomKey.targetY === randomKey.initialY) {
          randomKey.targetY = randomKey.initialY - 0.065; // Mechanical travel depth
          (randomKey.rgbLed.material as THREE.MeshBasicMaterial).opacity = 1.0;
        }
      }

      // Floating Keycaps Levitation & Smooth Wobble
      floatingKeys.forEach((fk) => {
        fk.mesh.position.y = fk.basePos.y + Math.sin(elapsed * fk.freq + fk.phase) * fk.amp;
        fk.mesh.rotation.y += fk.rotSpeed.y;
        fk.mesh.rotation.z += fk.rotSpeed.z;
      });

      // Orbital Energy Arcs Rotation
      ring1.rotation.z = elapsed * 0.10;
      ring2.rotation.z = -elapsed * 0.08;

      // Chassis Underglow Acrylic dynamic color shift
      const edgeWave = (Math.sin(elapsed * 2.0) + 1) / 2;
      lightbarMat.color.setHSL(0.50 + edgeWave * 0.26, 1.0, 0.60);

      renderer.render(scene, camera);
    };

    animate();

    // 13. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 660;
      height = container.clientHeight || 480;
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

      baseWedgeGeo.dispose();
      chassisMat.dispose();
      frontTrimGeo.dispose();
      frontTrimMat.dispose();
      lightbarGeo.dispose();
      lightbarMat.dispose();
      plateGeo.dispose();
      plateMat.dispose();
      switchGeo.dispose();
      crossStemGeo.dispose();
      stealthSideMat.dispose();
      bottomMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive]);

  if (!webglSupported) {
    return (
      <div
        className={`mechanical-keyboard-fallback ${className}`}
        style={{
          width: '100%',
          maxWidth: '680px',
          height: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <svg
          viewBox="0 0 600 420"
          style={{ width: '100%', height: '100%', overflow: 'visible', filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.75))' }}
        >
          <polygon points="70,180 430,70 540,240 180,350" fill="#0C1524" stroke="#00D9FF" strokeWidth="3" />
          <polygon points="120,200 170,180 185,210 135,230" fill="#00D9FF" />
          <polygon points="260,170 340,140 360,180 280,210" fill="#8257FF" />
          <polygon points="230,260 380,210 410,250 260,300" fill="#168BFF" />
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
        maxWidth: '720px',
        height: '500px',
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
            color: '#00D9FF',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-heading)',
          }}
        >
          <span>Loading 3D Mechanical Engine...</span>
        </div>
      )}
    </div>
  );
};
