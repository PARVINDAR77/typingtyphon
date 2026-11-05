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

    let width = container.clientWidth || 640;
    let height = container.clientHeight || 480;

    // 2. Scene, Camera & High-Performance Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 4.3, 7.6);
    camera.lookAt(0.2, -0.1, 0);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    container.appendChild(renderer.domElement);

    // 3. Vibrant Cyber RGB Lighting (Cyan, Sapphire Blue, Neon Purple, Magenta)
    const ambientLight = new THREE.AmbientLight(0x162238, 2.2);
    scene.add(ambientLight);

    // Main Directional Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 8, 6);
    scene.add(keyLight);

    // Electric Cyan Flood Light (Left side of keyboard)
    const cyanLight = new THREE.DirectionalLight(0x00d9ff, 5.0);
    cyanLight.position.set(-6, 3.5, 3.5);
    scene.add(cyanLight);

    // Vivid Neon Purple / Magenta Flood Light (Right side of keyboard)
    const purpleLight = new THREE.DirectionalLight(0x9d4edd, 5.5);
    purpleLight.position.set(6, 4, -2);
    scene.add(purpleLight);

    // Under-Desk Radiant RGB Spill Light
    const rgbDeskPoint = new THREE.PointLight(0x00d9ff, 4.5, 9);
    rgbDeskPoint.position.set(-1, -0.8, 1);
    scene.add(rgbDeskPoint);

    const rgbDeskPoint2 = new THREE.PointLight(0x8257ff, 4.5, 9);
    rgbDeskPoint2.position.set(2, -0.8, 0);
    scene.add(rgbDeskPoint2);

    // Master 3D Keyboard Group (3/4 Isometric Perspective)
    const keyboardGroup = new THREE.Group();
    keyboardGroup.rotation.x = 0.50;
    keyboardGroup.rotation.y = -0.34;
    keyboardGroup.rotation.z = 0.13;
    scene.add(keyboardGroup);

    // 4. Volumetric Radiant Cyber Background Aurora (Cyan to Magenta Gradient)
    const createAuroraNebula = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Dual-pole glowing nebula: Cyan on Left, Purple on Right
        const grad = ctx.createRadialGradient(200, 240, 20, 256, 256, 240);
        grad.addColorStop(0, 'rgba(0, 217, 255, 0.45)');
        grad.addColorStop(0.35, 'rgba(22, 139, 255, 0.3)');
        grad.addColorStop(0.65, 'rgba(130, 87, 255, 0.25)');
        grad.addColorStop(0.85, 'rgba(217, 70, 239, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(13, 9.5, 1);
      sprite.position.set(0.6, 0.4, -2.8);
      scene.add(sprite);
    };
    createAuroraNebula();

    // 5. Tapered OEM Mechanical Keycap Geometry Creator
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
            pos.setY(i, y - 0.015);
          }
        }
      }
      geo.computeVertexNormals();
      return geo;
    };

    // 6. High-Definition Glowing Keycap Texture Generator (Rich Dual-Tone RGB Colors)
    const createColorfulKeycapTexture = (
      label: string,
      colorTheme: 'cyan' | 'purple' | 'blue' | 'magenta' | 'amber',
      isAccent = false
    ): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      let gradTop = '#132038';
      let gradBottom = '#0B1322';
      let textColor = '#FFFFFF';
      let borderGlow = 'rgba(0, 217, 255, 0.4)';
      let textGlow = '#00D9FF';

      if (colorTheme === 'cyan') {
        gradTop = '#083344';
        gradBottom = '#041d28';
        textColor = '#00D9FF';
        borderGlow = '#00D9FF';
        textGlow = '#00D9FF';
      } else if (colorTheme === 'purple') {
        gradTop = '#3b0764';
        gradBottom = '#1e0538';
        textColor = '#E9D5FF';
        borderGlow = '#8257FF';
        textGlow = '#8257FF';
      } else if (colorTheme === 'blue') {
        gradTop = '#172554';
        gradBottom = '#0c1530';
        textColor = '#60A5FA';
        borderGlow = '#38BDF8';
        textGlow = '#168BFF';
      } else if (colorTheme === 'magenta') {
        gradTop = '#500724';
        gradBottom = '#2d0414';
        textColor = '#F472B6';
        borderGlow = '#EC4899';
        textGlow = '#F43F5E';
      } else if (colorTheme === 'amber') {
        gradTop = '#451a03';
        gradBottom = '#250e02';
        textColor = '#FBBF24';
        borderGlow = '#F59E0B';
        textGlow = '#F59E0B';
      }

      if (isAccent) {
        gradTop = colorTheme === 'purple' ? '#8257FF' : '#00D9FF';
        gradBottom = colorTheme === 'purple' ? '#581C87' : '#0284C7';
        textColor = colorTheme === 'purple' ? '#FFFFFF' : '#050B18';
        borderGlow = '#FFFFFF';
        textGlow = textColor;
      }

      // Base PBT Keycap Body
      ctx.fillStyle = gradBottom;
      ctx.fillRect(0, 0, 256, 256);

      // Top Dish with Rich Color Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, gradTop);
      grad.addColorStop(1, gradBottom);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(14, 14, 228, 228, 28);
      ctx.fill();

      // Chamfer Inner Bevel Ring with Neon RGB Border
      ctx.strokeStyle = borderGlow;
      ctx.lineWidth = isAccent ? 8 : 5;
      ctx.stroke();

      // Frosted Dish Center Glow
      ctx.fillStyle = isAccent ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(32, 32, 192, 192, 18);
      ctx.fill();

      // Keycap Legend (Space Grotesk typography)
      if (label) {
        ctx.fillStyle = textColor;
        ctx.font = 'bold 88px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = textGlow;
        ctx.shadowBlur = isAccent ? 22 : 12;
        ctx.fillText(label, 128, 128);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      return texture;
    };

    // 7. CNC Aluminum Chassis & Glowing RGB Edge Lightbar
    const totalUnits = 15.0;
    const unitSize = 0.38;
    const paddingX = 0.35;
    const paddingZ = 0.35;
    const chassisW = totalUnits * unitSize + paddingX * 2; // ~6.4 units
    const chassisD = 5 * unitSize + paddingZ * 2 + 0.35; // ~2.6 units

    // Bottom Incline Wedge Chassis
    const baseWedgeGeo = new THREE.BoxGeometry(chassisW, 0.44, chassisD);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0f1728,
      metalness: 0.85,
      roughness: 0.25,
    });
    const chassisMesh = new THREE.Mesh(baseWedgeGeo, chassisMat);
    chassisMesh.position.y = -0.22;
    keyboardGroup.add(chassisMesh);

    // Front Anodized Aluminum Chamfer Lip
    const frontTrimGeo = new THREE.BoxGeometry(chassisW + 0.1, 0.12, 0.14);
    const frontTrimMat = new THREE.MeshStandardMaterial({
      color: 0x162238,
      metalness: 0.9,
      roughness: 0.15,
    });
    const frontTrim = new THREE.Mesh(frontTrimGeo, frontTrimMat);
    frontTrim.position.set(0, -0.06, chassisD / 2 + 0.06);
    keyboardGroup.add(frontTrim);

    // Continuous 360° Vibrant RGB Underglow Diffuser
    const lightbarGeo = new THREE.BoxGeometry(chassisW + 0.12, 0.08, chassisD + 0.12);
    const lightbarMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.95,
    });
    const lightbarMesh = new THREE.Mesh(lightbarGeo, lightbarMat);
    lightbarMesh.position.y = -0.42;
    keyboardGroup.add(lightbarMesh);

    // Dark Brushed Aluminum Switch Mounting Plate
    const plateGeo = new THREE.BoxGeometry(chassisW - 0.14, 0.06, chassisD - 0.14);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x111c30,
      metalness: 0.8,
      roughness: 0.25,
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = 0.01;
    keyboardGroup.add(plateMesh);

    // 8. 65% ANSI Mechanical Keycap Grid with Colorful RGB Spectrum (Cyan -> Blue -> Violet -> Magenta)
    interface KeyDef {
      label: string;
      u: number;
      theme: 'cyan' | 'purple' | 'blue' | 'magenta' | 'amber';
      isAccent?: boolean;
    }

    const KEYBOARD_GRID: KeyDef[][] = [
      // Row 0: Function & Numbers (15.0u total)
      [
        { label: 'ESC', u: 1.0, theme: 'cyan', isAccent: true },
        { label: '1', u: 1.0, theme: 'cyan' },
        { label: '2', u: 1.0, theme: 'cyan' },
        { label: '3', u: 1.0, theme: 'blue' },
        { label: '4', u: 1.0, theme: 'blue' },
        { label: '5', u: 1.0, theme: 'blue' },
        { label: '6', u: 1.0, theme: 'blue' },
        { label: '7', u: 1.0, theme: 'purple' },
        { label: '8', u: 1.0, theme: 'purple' },
        { label: '9', u: 1.0, theme: 'purple' },
        { label: '0', u: 1.0, theme: 'magenta' },
        { label: '-', u: 1.0, theme: 'magenta' },
        { label: '=', u: 1.0, theme: 'magenta' },
        { label: 'DEL', u: 2.0, theme: 'magenta', isAccent: true },
      ],
      // Row 1: QWERTY (15.0u total)
      [
        { label: 'TAB', u: 1.5, theme: 'cyan', isAccent: true },
        { label: 'Q', u: 1.0, theme: 'cyan' },
        { label: 'W', u: 1.0, theme: 'cyan' },
        { label: 'E', u: 1.0, theme: 'blue' },
        { label: 'R', u: 1.0, theme: 'blue' },
        { label: 'T', u: 1.0, theme: 'cyan', isAccent: true }, // Typhon Key!
        { label: 'Y', u: 1.0, theme: 'purple', isAccent: true }, // Typhon Key!
        { label: 'U', u: 1.0, theme: 'purple' },
        { label: 'I', u: 1.0, theme: 'purple' },
        { label: 'O', u: 1.0, theme: 'magenta' },
        { label: 'P', u: 1.0, theme: 'magenta', isAccent: true },
        { label: '[', u: 1.0, theme: 'magenta' },
        { label: ']', u: 1.0, theme: 'magenta' },
        { label: '\\', u: 1.5, theme: 'magenta' },
      ],
      // Row 2: Home Row (15.0u total)
      [
        { label: 'CAPS', u: 1.75, theme: 'cyan' },
        { label: 'A', u: 1.0, theme: 'cyan' },
        { label: 'S', u: 1.0, theme: 'cyan' },
        { label: 'D', u: 1.0, theme: 'blue' },
        { label: 'F', u: 1.0, theme: 'cyan', isAccent: true }, // Tactile anchor
        { label: 'G', u: 1.0, theme: 'blue' },
        { label: 'H', u: 1.0, theme: 'purple' },
        { label: 'J', u: 1.0, theme: 'purple', isAccent: true }, // Tactile anchor
        { label: 'K', u: 1.0, theme: 'purple' },
        { label: 'L', u: 1.0, theme: 'magenta' },
        { label: ';', u: 1.0, theme: 'magenta' },
        { label: "'", u: 1.0, theme: 'magenta' },
        { label: 'ENTER', u: 2.25, theme: 'purple', isAccent: true },
      ],
      // Row 3: Bottom Alphas & Up Arrow (15.0u total)
      [
        { label: 'SHIFT', u: 2.25, theme: 'cyan' },
        { label: 'Z', u: 1.0, theme: 'cyan' },
        { label: 'X', u: 1.0, theme: 'blue' },
        { label: 'C', u: 1.0, theme: 'blue' },
        { label: 'V', u: 1.0, theme: 'blue' },
        { label: 'B', u: 1.0, theme: 'purple' },
        { label: 'N', u: 1.0, theme: 'purple' },
        { label: 'M', u: 1.0, theme: 'purple' },
        { label: ',', u: 1.0, theme: 'magenta' },
        { label: '.', u: 1.0, theme: 'magenta' },
        { label: '/', u: 1.0, theme: 'magenta' },
        { label: 'SHIFT', u: 1.75, theme: 'purple' },
        { label: '▲', u: 1.0, theme: 'cyan', isAccent: true },
      ],
      // Row 4: Modifiers, Spacebar & Arrow Cluster (15.0u total)
      [
        { label: 'CTRL', u: 1.25, theme: 'cyan' },
        { label: 'WIN', u: 1.25, theme: 'cyan' },
        { label: 'ALT', u: 1.25, theme: 'blue' },
        { label: 'SPACE', u: 6.25, theme: 'blue', isAccent: true },
        { label: 'ALT', u: 1.0, theme: 'purple' },
        { label: 'FN', u: 1.0, theme: 'purple' },
        { label: '◀', u: 1.0, theme: 'cyan', isAccent: true },
        { label: '▼', u: 1.0, theme: 'cyan', isAccent: true },
        { label: '▶', u: 1.0, theme: 'cyan', isAccent: true },
      ],
    ];

    interface ActiveKeyItem {
      mesh: THREE.Mesh;
      initialY: number;
      targetY: number;
      rgbLed: THREE.Mesh;
      colIdx: number;
      rowIdx: number;
      baseColor: THREE.Color;
      sideMaterial: THREE.MeshStandardMaterial;
    }

    const keyList: ActiveKeyItem[] = [];
    const originX = -((totalUnits * unitSize) / 2);
    const originZ = -((5 * unitSize) / 2) + 0.15;

    // Translucent mechanical switch housing geometry
    const switchGeo = new THREE.BoxGeometry(0.25, 0.16, 0.25);
    const crossStemGeo = new THREE.BoxGeometry(0.09, 0.12, 0.09);

    KEYBOARD_GRID.forEach((row, rIdx) => {
      let currentX = originX;
      const zPos = originZ + rIdx * (unitSize + 0.07);

      row.forEach((kDef, cIdx) => {
        const keyW = kDef.u * unitSize - 0.035;
        const keyD = unitSize - 0.035;
        const keyH = 0.24;
        const centerX = currentX + (kDef.u * unitSize) / 2;

        // Calculate RGB color hue for this column (0.50 = Cyan -> 0.65 = Blue -> 0.78 = Purple -> 0.88 = Magenta)
        const hueProgress = (cIdx / 14) * 0.38;
        const keyHue = 0.50 + hueProgress;
        const baseKeyColor = new THREE.Color().setHSL(keyHue, 1.0, 0.55);

        // 1. Tapered OEM Keycap Mesh
        const keyGeo = createOEMKeycapGeometry(keyW, keyH, keyD);
        const topTexture = createColorfulKeycapTexture(kDef.label, kDef.theme, kDef.isAccent);

        // Radiant Translucent "Pudding Keycap" side materials catching colorful RGB
        const sideMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(keyHue, 0.85, 0.18),
          emissive: new THREE.Color().setHSL(keyHue, 1.0, 0.35),
          emissiveIntensity: kDef.isAccent ? 0.6 : 0.35,
          roughness: 0.25,
          metalness: 0.4,
        });

        const topMat = new THREE.MeshStandardMaterial({
          map: topTexture,
          roughness: 0.2,
          metalness: 0.3,
          emissive: new THREE.Color().setHSL(keyHue, 1.0, 0.15),
          emissiveIntensity: 0.25,
        });

        const bottomMat = new THREE.MeshStandardMaterial({ color: 0x0a101d, roughness: 0.6 });

        const materials = [
          sideMat, // right
          sideMat, // left
          topMat,  // top with colorful illuminated legend!
          bottomMat, // bottom
          sideMat, // front
          sideMat, // back
        ];

        const keyMesh = new THREE.Mesh(keyGeo, materials);
        keyMesh.position.set(centerX, 0.22, zPos);
        keyboardGroup.add(keyMesh);

        // 2. Mechanical Switch Stem & Housing under Keycap
        const switchMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(keyHue, 1.0, 0.35),
          emissive: new THREE.Color().setHSL(keyHue, 1.0, 0.5),
          emissiveIntensity: 0.45,
          roughness: 0.15,
          transparent: true,
          opacity: 0.85,
        });
        const switchMesh = new THREE.Mesh(switchGeo, switchMat);
        switchMesh.position.set(centerX, 0.08, zPos);
        keyboardGroup.add(switchMesh);

        const stemMat = new THREE.MeshBasicMaterial({ color: baseKeyColor });
        const stemMesh = new THREE.Mesh(crossStemGeo, stemMat);
        stemMesh.position.set(centerX, 0.14, zPos);
        keyboardGroup.add(stemMesh);

        // 3. Radiant Under-Key RGB LED Glow Plate spilling colorful light
        const ledGeo = new THREE.PlaneGeometry(keyW + 0.1, keyD + 0.1);
        const ledMat = new THREE.MeshBasicMaterial({
          color: baseKeyColor,
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
          baseColor: baseKeyColor,
          sideMaterial: sideMat,
        });

        currentX += kDef.u * unitSize;
      });
    });

    // 9. Right-Side-Up Floating 3D Keycaps ("T", "R", "E") Directly Facing Camera
    const floatingGroup = new THREE.Group();
    scene.add(floatingGroup);

    interface FloatingKeycapItem {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      freq: number;
      amp: number;
      phase: number;
      rotSpeed: THREE.Vector3;
    }

    const floatingKeys: FloatingKeycapItem[] = [];
    const floatingDefs = [
      {
        letter: 'T',
        pos: new THREE.Vector3(2.5, 2.1, 1.0),
        theme: 'cyan' as const,
        scale: 1.25,
        freq: 1.8,
        amp: 0.22,
        phase: 0,
      },
      {
        letter: 'R',
        pos: new THREE.Vector3(1.1, 3.2, -0.1),
        theme: 'purple' as const,
        scale: 1.35,
        freq: 1.4,
        amp: 0.25,
        phase: 1.6,
      },
      {
        letter: 'E',
        pos: new THREE.Vector3(3.3, 0.8, 1.7),
        theme: 'magenta' as const,
        scale: 1.15,
        freq: 2.1,
        amp: 0.18,
        phase: 3.1,
      },
    ];

    floatingDefs.forEach((def) => {
      const fGeo = createOEMKeycapGeometry(0.76 * def.scale, 0.46 * def.scale, 0.76 * def.scale);
      const fTexture = createColorfulKeycapTexture(def.letter, def.theme, true);
      const glowCol = def.theme === 'cyan' ? 0x00d9ff : def.theme === 'purple' ? 0x8257ff : 0xec4899;

      const fSideMat = new THREE.MeshStandardMaterial({
        color: glowCol,
        emissive: glowCol,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0.4,
      });

      const fTopMat = new THREE.MeshStandardMaterial({
        map: fTexture,
        roughness: 0.15,
        metalness: 0.3,
        emissive: glowCol,
        emissiveIntensity: 0.45,
      });

      const fMats = [
        fSideMat,
        fSideMat,
        fTopMat, // Top face with the bold letter directly facing user!
        new THREE.MeshStandardMaterial({ color: 0x0a101d, roughness: 0.6 }),
        fSideMat,
        fSideMat,
      ];

      const fMesh = new THREE.Mesh(fGeo, fMats);
      fMesh.position.copy(def.pos);
      // Carefully angled so the top face with bold letter directly faces the camera!
      fMesh.rotation.set(-0.35, -0.45, 0.15);
      floatingGroup.add(fMesh);

      // Cherry MX cross stem (+) on the underside
      const stemH = new THREE.BoxGeometry(0.24 * def.scale, 0.16 * def.scale, 0.08 * def.scale);
      const stemV = new THREE.BoxGeometry(0.08 * def.scale, 0.16 * def.scale, 0.24 * def.scale);
      const stemMat = new THREE.MeshBasicMaterial({ color: glowCol });
      const stemMeshH = new THREE.Mesh(stemH, stemMat);
      const stemMeshV = new THREE.Mesh(stemV, stemMat);
      stemMeshH.position.y = -0.24 * def.scale;
      stemMeshV.position.y = -0.24 * def.scale;
      fMesh.add(stemMeshH);
      fMesh.add(stemMeshV);

      // Glowing Neon Wireframe Contour
      const edges = new THREE.EdgesGeometry(fGeo);
      const edgeLineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
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

    // 10. Colorful Glowing 3D Orbital Energy Rings (Electric Cyan & Royal Purple)
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
      color: 0xd946ef,
      transparent: true,
      opacity: 0.75,
    });
    const ring2 = new THREE.Line(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3.1;
    ring2.rotation.y = 0.2;
    scene.add(ring2);

    // 11. Multi-Colored Glowing Cosmic Particles (Cyan & Magenta Sparks)
    const particleCount = 110;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.2) * 7;
      particlePositions[i + 2] = (Math.random() - 0.5) * 9;

      // Half cyan, half purple/magenta sparks
      if (Math.random() > 0.5) {
        particleColors[i] = 0.0;
        particleColors[i + 1] = 0.85;
        particleColors[i + 2] = 1.0;
      } else {
        particleColors[i] = 0.85;
        particleColors[i + 1] = 0.3;
        particleColors[i + 2] = 1.0;
      }
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    setIsLoaded(true);

    // 12. Interactive Mouse Tracking
    let targetTiltX = 0.50;
    let targetTiltY = -0.34;
    let currentTiltX = 0.50;
    let currentTiltY = -0.34;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetTiltY = -0.34 + x * 0.28;
      targetTiltX = 0.50 - y * 0.22;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 13. Dynamic RGB Wave & Mechanical Keystroke Animation Loop
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

      // Real-time RGB Neon Wave sweeping diagonally across keyboard matrix
      const waveSpeed = elapsed * 3.5;
      keyList.forEach((item) => {
        const wave = Math.sin(waveSpeed - item.colIdx * 0.28 + item.rowIdx * 0.35);
        // Cycles smoothly across full cyber spectrum: Cyan (0.50) -> Royal Blue (0.64) -> Purple (0.78) -> Magenta (0.88)
        const dynamicHue = 0.48 + ((wave + 1) / 2) * 0.40;
        const dynamicColor = new THREE.Color().setHSL(dynamicHue, 1.0, 0.62);

        (item.rgbLed.material as THREE.MeshBasicMaterial).color.copy(dynamicColor);
        (item.rgbLed.material as THREE.MeshBasicMaterial).opacity = 0.55 + ((wave + 1) / 2) * 0.35;
        item.sideMaterial.emissive.copy(dynamicColor);
        item.sideMaterial.emissiveIntensity = 0.4 + ((wave + 1) / 2) * 0.4;

        // Mechanical key travel depression and spring bounce
        item.mesh.position.y += (item.targetY - item.mesh.position.y) * 0.28;
        if (Math.abs(item.mesh.position.y - item.targetY) < 0.005 && item.targetY < item.initialY) {
          item.targetY = item.initialY;
        }
      });

      // Ghost Key Typing: trigger authentic mechanical keystroke every 110ms
      if (elapsed - lastGhostKeyTime > 0.11) {
        lastGhostKeyTime = elapsed;
        const randomKey = keyList[Math.floor(Math.random() * keyList.length)];
        if (randomKey && randomKey.targetY === randomKey.initialY) {
          randomKey.targetY = randomKey.initialY - 0.065;
          (randomKey.rgbLed.material as THREE.MeshBasicMaterial).opacity = 1.0;
        }
      }

      // Floating Keycaps Levitation & Gentle 3D Wobble
      floatingKeys.forEach((fk) => {
        fk.mesh.position.y = fk.basePos.y + Math.sin(elapsed * fk.freq + fk.phase) * fk.amp;
        fk.mesh.rotation.y += fk.rotSpeed.y;
        fk.mesh.rotation.z += fk.rotSpeed.z;
      });

      // Orbital Energy Arcs Rotation
      ring1.rotation.z = elapsed * 0.12;
      ring2.rotation.z = -elapsed * 0.08;

      // Chassis Underglow Acrylic dynamic color shift
      const edgeWave = (Math.sin(elapsed * 2.2) + 1) / 2;
      lightbarMat.color.setHSL(0.50 + edgeWave * 0.38, 1.0, 0.60);

      renderer.render(scene, camera);
    };

    animate();

    // 14. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 640;
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
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 217, 255, 0.3) 0%, rgba(130, 87, 255, 0.2) 50%, transparent 75%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
          }}
        />
        <svg
          viewBox="0 0 600 420"
          style={{ width: '100%', height: '100%', overflow: 'visible', filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.75))' }}
        >
          <polygon points="70,180 430,70 540,240 180,350" fill="#0C1524" stroke="#00D9FF" strokeWidth="3" />
          <polygon points="120,200 170,180 185,210 135,230" fill="#00D9FF" />
          <polygon points="260,170 340,140 360,180 280,210" fill="#8257FF" />
          <polygon points="230,260 380,210 410,250 260,300" fill="#EC4899" />
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
          <span>Loading Colorful 3D Mechanical Engine...</span>
        </div>
      )}
    </div>
  );
};
