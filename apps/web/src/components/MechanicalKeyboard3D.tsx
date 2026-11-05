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

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 460;

    // 2. Scene, Camera & Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 4.4, 7.8);
    camera.lookAt(0.3, -0.15, 0);

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
    renderer.toneMappingExposure = 1.45;
    container.appendChild(renderer.domElement);

    // 3. Cinematic Studio Lighting (No pitch-black shadows, rich specular highlights)
    const ambientLight = new THREE.AmbientLight(0x1a2948, 1.8);
    scene.add(ambientLight);

    // Main Studio Directional Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(3, 9, 6);
    scene.add(keyLight);

    // Electric Cyan Left Fill & Rim Light
    const cyanRim = new THREE.DirectionalLight(0x00d9ff, 4.2);
    cyanRim.position.set(-6, 3.5, 4);
    scene.add(cyanRim);

    // Vivid Neon Purple Backlight (giving keycap top rims separation from background)
    const purpleRim = new THREE.DirectionalLight(0x8257ff, 4.5);
    purpleRim.position.set(6, 4, -3);
    scene.add(purpleRim);

    // Under-board glow light source
    const deskGlowLight = new THREE.PointLight(0x00d9ff, 3.2, 7);
    deskGlowLight.position.set(0, -0.6, 0.5);
    scene.add(deskGlowLight);

    // Master Keyboard Group (3/4 Isometric Perspective matching Master UI Spec)
    const keyboardGroup = new THREE.Group();
    keyboardGroup.rotation.x = 0.52;
    keyboardGroup.rotation.y = -0.36;
    keyboardGroup.rotation.z = 0.14;
    scene.add(keyboardGroup);

    // 4. Background Volumetric Nebula Glow Sprite
    const createNebulaSprite = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
        rad.addColorStop(0, 'rgba(0, 217, 255, 0.35)');
        rad.addColorStop(0.45, 'rgba(130, 87, 255, 0.22)');
        rad.addColorStop(0.75, 'rgba(22, 139, 255, 0.08)');
        rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, 256, 256);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(11, 8, 1);
      sprite.position.set(0.5, 0.4, -2.5);
      scene.add(sprite);
    };
    createNebulaSprite();

    // 5. Authentic Tapered OEM Mechanical Keycap Geometry Creator
    // Creates a realistic truncated pyramid with 15% top taper and concave dish
    const createTaperedKeycapGeometry = (w: number, h: number, d: number) => {
      const geo = new THREE.BoxGeometry(w, h, d, 2, 1, 2);
      const pos = geo.attributes.position;
      const taper = 0.84; // 16% top taper matching real OEM profile keycaps

      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > 0) {
          pos.setX(i, pos.getX(i) * taper);
          pos.setZ(i, pos.getZ(i) * taper);
          // Subtle concave finger saddle curve on top center vertices
          const x = pos.getX(i);
          if (Math.abs(x) < (w * taper) / 3) {
            pos.setY(i, y - 0.015);
          }
        }
      }
      geo.computeVertexNormals();
      return geo;
    };

    // 6. High-Definition Canvas Keycap Texture Generator (Double-Shot PBT Quality)
    const createPBTTexture = (
      label: string,
      type: 'charcoal' | 'cyan' | 'purple' | 'blue' | 'typhon',
      sublabel = ''
    ): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      let gradTop = '#1c2840';
      let gradBottom = '#10192a';
      let textColor = '#D8E5F7';
      let borderGlow = 'rgba(120, 160, 255, 0.28)';
      let isGlow = false;

      if (type === 'cyan') {
        gradTop = '#00D9FF';
        gradBottom = '#0284C7';
        textColor = '#050B18';
        borderGlow = '#00D9FF';
        isGlow = true;
      } else if (type === 'purple') {
        gradTop = '#8257FF';
        gradBottom = '#5B21B6';
        textColor = '#FFFFFF';
        borderGlow = '#8257FF';
        isGlow = true;
      } else if (type === 'blue') {
        gradTop = '#168BFF';
        gradBottom = '#0284C7';
        textColor = '#FFFFFF';
        borderGlow = '#38BDF8';
        isGlow = true;
      } else if (type === 'typhon') {
        gradTop = '#1e3256';
        gradBottom = '#111e35';
        textColor = '#00D9FF';
        borderGlow = 'rgba(0, 217, 255, 0.65)';
        isGlow = true;
      }

      // Base PBT Keycap Body
      ctx.fillStyle = gradBottom;
      ctx.fillRect(0, 0, 256, 256);

      // Top Dish Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, gradTop);
      grad.addColorStop(1, gradBottom);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(14, 14, 228, 228, 30);
      ctx.fill();

      // Chamfer Inner Bevel Ring
      ctx.strokeStyle = borderGlow;
      ctx.lineWidth = 6;
      ctx.stroke();

      // Soft Cylindrical Finger Saddle Highlight
      ctx.fillStyle = isGlow ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.07)';
      ctx.beginPath();
      ctx.roundRect(32, 32, 192, 192, 20);
      ctx.fill();

      // Keycap Legend (Space Grotesk typography)
      if (label) {
        ctx.fillStyle = textColor;
        ctx.font = 'bold 84px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (isGlow) {
          ctx.shadowColor = textColor;
          ctx.shadowBlur = 18;
        }
        ctx.fillText(label, 128, sublabel ? 110 : 128);
      }

      if (sublabel) {
        ctx.fillStyle = textColor;
        ctx.font = 'bold 42px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sublabel, 128, 175);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      return texture;
    };

    // 7. Beveled CNC Aluminum Chassis with Integrated Lightbar
    const totalUnits = 15.0;
    const unitSize = 0.38;
    const paddingX = 0.35;
    const paddingZ = 0.35;
    const chassisW = totalUnits * unitSize + paddingX * 2; // ~6.4 units
    const chassisD = 5 * unitSize + paddingZ * 2 + 0.35; // ~2.6 units

    // Bottom Incline Wedge Chassis (6-degree typing angle)
    const baseWedgeGeo = new THREE.BoxGeometry(chassisW, 0.44, chassisD);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0c1524,
      metalness: 0.88,
      roughness: 0.2,
    });
    const chassisMesh = new THREE.Mesh(baseWedgeGeo, chassisMat);
    chassisMesh.position.y = -0.22;
    keyboardGroup.add(chassisMesh);

    // Front Chamfered Accent Trim (Anodized Aluminum)
    const frontTrimGeo = new THREE.BoxGeometry(chassisW + 0.08, 0.12, 0.14);
    const frontTrimMat = new THREE.MeshStandardMaterial({
      color: 0x162238,
      metalness: 0.9,
      roughness: 0.15,
    });
    const frontTrim = new THREE.Mesh(frontTrimGeo, frontTrimMat);
    frontTrim.position.set(0, -0.06, chassisD / 2 + 0.06);
    keyboardGroup.add(frontTrim);

    // Continuous 360° Acrylic RGB Underglow Lightbar Strip
    const lightbarGeo = new THREE.BoxGeometry(chassisW + 0.08, 0.06, chassisD + 0.08);
    const lightbarMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.9,
    });
    const lightbarMesh = new THREE.Mesh(lightbarGeo, lightbarMat);
    lightbarMesh.position.y = -0.42;
    keyboardGroup.add(lightbarMesh);

    // Dark Brushed Aluminum Switch Mounting Plate
    const plateGeo = new THREE.BoxGeometry(chassisW - 0.16, 0.05, chassisD - 0.16);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x0a101d,
      metalness: 0.85,
      roughness: 0.25,
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = 0.01;
    keyboardGroup.add(plateMesh);

    // 8. Mathematically Perfect 65% ANSI Mechanical Layout (15.0 Units per row)
    interface KeyDefinition {
      label: string;
      sub?: string;
      u: number;
      type: 'charcoal' | 'cyan' | 'purple' | 'blue' | 'typhon';
    }

    const ANSI_65_LAYOUT: KeyDefinition[][] = [
      // Row 0: Function & Numbers (15.0u total)
      [
        { label: 'ESC', u: 1.0, type: 'cyan' },
        { label: '1', u: 1.0, type: 'charcoal' },
        { label: '2', u: 1.0, type: 'charcoal' },
        { label: '3', u: 1.0, type: 'charcoal' },
        { label: '4', u: 1.0, type: 'charcoal' },
        { label: '5', u: 1.0, type: 'charcoal' },
        { label: '6', u: 1.0, type: 'charcoal' },
        { label: '7', u: 1.0, type: 'charcoal' },
        { label: '8', u: 1.0, type: 'charcoal' },
        { label: '9', u: 1.0, type: 'charcoal' },
        { label: '0', u: 1.0, type: 'charcoal' },
        { label: '-', u: 1.0, type: 'charcoal' },
        { label: '=', u: 1.0, type: 'charcoal' },
        { label: '⌫', u: 2.0, type: 'purple' },
      ],
      // Row 1: QWERTY (15.0u total)
      [
        { label: 'TAB', u: 1.5, type: 'charcoal' },
        { label: 'Q', u: 1.0, type: 'charcoal' },
        { label: 'W', u: 1.0, type: 'charcoal' },
        { label: 'E', u: 1.0, type: 'charcoal' },
        { label: 'R', u: 1.0, type: 'charcoal' },
        { label: 'T', u: 1.0, type: 'typhon' },
        { label: 'Y', u: 1.0, type: 'typhon' },
        { label: 'U', u: 1.0, type: 'charcoal' },
        { label: 'I', u: 1.0, type: 'charcoal' },
        { label: 'O', u: 1.0, type: 'charcoal' },
        { label: 'P', u: 1.0, type: 'typhon' },
        { label: '[', u: 1.0, type: 'charcoal' },
        { label: ']', u: 1.0, type: 'charcoal' },
        { label: '\\', u: 1.5, type: 'charcoal' },
      ],
      // Row 2: Home Row (15.0u total)
      [
        { label: 'CAPS', u: 1.75, type: 'charcoal' },
        { label: 'A', u: 1.0, type: 'charcoal' },
        { label: 'S', u: 1.0, type: 'charcoal' },
        { label: 'D', u: 1.0, type: 'charcoal' },
        { label: 'F', u: 1.0, type: 'cyan' },
        { label: 'G', u: 1.0, type: 'charcoal' },
        { label: 'H', u: 1.0, type: 'typhon' },
        { label: 'J', u: 1.0, type: 'purple' },
        { label: 'K', u: 1.0, type: 'charcoal' },
        { label: 'L', u: 1.0, type: 'charcoal' },
        { label: ';', u: 1.0, type: 'charcoal' },
        { label: "'", u: 1.0, type: 'charcoal' },
        { label: 'ENTER', u: 2.25, type: 'purple' },
      ],
      // Row 3: Bottom Alphas & Up Arrow (15.0u total)
      [
        { label: 'SHIFT', u: 2.25, type: 'charcoal' },
        { label: 'Z', u: 1.0, type: 'charcoal' },
        { label: 'X', u: 1.0, type: 'charcoal' },
        { label: 'C', u: 1.0, type: 'charcoal' },
        { label: 'V', u: 1.0, type: 'charcoal' },
        { label: 'B', u: 1.0, type: 'charcoal' },
        { label: 'N', u: 1.0, type: 'typhon' },
        { label: 'M', u: 1.0, type: 'charcoal' },
        { label: ',', u: 1.0, type: 'charcoal' },
        { label: '.', u: 1.0, type: 'charcoal' },
        { label: '/', u: 1.0, type: 'charcoal' },
        { label: 'SHIFT', u: 1.75, type: 'charcoal' },
        { label: '▲', u: 1.0, type: 'cyan' },
      ],
      // Row 4: Modifiers, Spacebar & Arrow Cluster (15.0u total)
      [
        { label: 'CTRL', u: 1.25, type: 'charcoal' },
        { label: 'WIN', u: 1.25, type: 'charcoal' },
        { label: 'ALT', u: 1.25, type: 'charcoal' },
        { label: 'SPACE', u: 6.25, type: 'blue' },
        { label: 'ALT', u: 1.0, type: 'charcoal' },
        { label: 'FN', u: 1.0, type: 'charcoal' },
        { label: '◀', u: 1.0, type: 'cyan' },
        { label: '▼', u: 1.0, type: 'cyan' },
        { label: '▶', u: 1.0, type: 'cyan' },
      ],
    ];

    interface InteractiveKey {
      mesh: THREE.Mesh;
      initialY: number;
      targetY: number;
      rgbLed: THREE.Mesh;
      colIdx: number;
      rowIdx: number;
      isAccent: boolean;
    }

    const keyList: InteractiveKey[] = [];
    const originX = -((totalUnits * unitSize) / 2);
    const originZ = -((5 * unitSize) / 2) + 0.15;

    // Translucent mechanical switch housing geometry & material
    const switchHousingGeo = new THREE.BoxGeometry(0.24, 0.14, 0.24);
    const switchHousingMat = new THREE.MeshStandardMaterial({
      color: 0x182845,
      roughness: 0.15,
      metalness: 0.3,
      transparent: true,
      opacity: 0.75,
    });

    const crossStemGeo = new THREE.BoxGeometry(0.08, 0.12, 0.08);
    const crossStemMat = new THREE.MeshBasicMaterial({ color: 0x00d9ff });

    ANSI_65_LAYOUT.forEach((row, rIdx) => {
      let currentX = originX;
      const zPos = originZ + rIdx * (unitSize + 0.07);

      row.forEach((kDef, cIdx) => {
        const keyW = kDef.u * unitSize - 0.04;
        const keyD = unitSize - 0.04;
        const keyH = 0.22;
        const centerX = currentX + (kDef.u * unitSize) / 2;

        // 1. Tapered OEM Keycap Mesh
        const keyGeo = createTaperedKeycapGeometry(keyW, keyH, keyD);
        const topTexture = createPBTTexture(kDef.label, kDef.type, kDef.sub);

        const materials = [
          new THREE.MeshStandardMaterial({ color: 0x121b2d, roughness: 0.3, metalness: 0.5 }), // right
          new THREE.MeshStandardMaterial({ color: 0x121b2d, roughness: 0.3, metalness: 0.5 }), // left
          new THREE.MeshStandardMaterial({ map: topTexture, roughness: 0.2, metalness: 0.4 }), // top with crisp PBT legend
          new THREE.MeshStandardMaterial({ color: 0x0a101d, roughness: 0.6 }), // bottom
          new THREE.MeshStandardMaterial({ color: 0x142035, roughness: 0.3, metalness: 0.5 }), // front
          new THREE.MeshStandardMaterial({ color: 0x121b2d, roughness: 0.3, metalness: 0.5 }), // back
        ];

        const keyMesh = new THREE.Mesh(keyGeo, materials);
        keyMesh.position.set(centerX, 0.18, zPos);
        keyboardGroup.add(keyMesh);

        // 2. Mechanical Switch Stem & Housing beneath Keycap
        const switchHousing = new THREE.Mesh(switchHousingGeo, switchHousingMat);
        switchHousing.position.set(centerX, 0.07, zPos);
        keyboardGroup.add(switchHousing);

        const stem = new THREE.Mesh(crossStemGeo, crossStemMat);
        stem.position.set(centerX, 0.12, zPos);
        keyboardGroup.add(stem);

        // 3. Per-Key Dynamic RGB LED Glow Plate under Switch
        const ledGeo = new THREE.PlaneGeometry(keyW + 0.08, keyD + 0.08);
        const ledMat = new THREE.MeshBasicMaterial({
          color: kDef.type === 'purple' ? 0x8257ff : 0x00d9ff,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide,
        });
        const ledMesh = new THREE.Mesh(ledGeo, ledMat);
        ledMesh.rotation.x = Math.PI / 2;
        ledMesh.position.set(centerX, 0.035, zPos);
        keyboardGroup.add(ledMesh);

        keyList.push({
          mesh: keyMesh,
          initialY: 0.18,
          targetY: 0.18,
          rgbLed: ledMesh,
          colIdx: cIdx,
          rowIdx: rIdx,
          isAccent: kDef.type !== 'charcoal',
        });

        currentX += kDef.u * unitSize;
      });
    });

    // 9. Majestic Levitating 3D Keycaps ("T", "R", "E") with Cherry MX Cross Stems
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
        pos: new THREE.Vector3(2.5, 2.0, 1.1),
        type: 'cyan' as const,
        scale: 1.15,
        freq: 1.7,
        amp: 0.22,
        phase: 0,
      },
      {
        letter: 'R',
        pos: new THREE.Vector3(1.3, 3.2, 0.1),
        type: 'purple' as const,
        scale: 1.25,
        freq: 1.3,
        amp: 0.26,
        phase: 1.6,
      },
      {
        letter: 'E',
        pos: new THREE.Vector3(3.2, 0.8, 1.8),
        type: 'blue' as const,
        scale: 1.05,
        freq: 2.0,
        amp: 0.18,
        phase: 3.1,
      },
    ];

    floatingDefs.forEach((def) => {
      const fGeo = createTaperedKeycapGeometry(0.72 * def.scale, 0.44 * def.scale, 0.72 * def.scale);
      const fTexture = createPBTTexture(def.letter, def.type);
      const fMats = [
        new THREE.MeshStandardMaterial({ color: 0x142035, roughness: 0.25, metalness: 0.6 }),
        new THREE.MeshStandardMaterial({ color: 0x142035, roughness: 0.25, metalness: 0.6 }),
        new THREE.MeshStandardMaterial({ map: fTexture, roughness: 0.2, metalness: 0.4, emissive: 0x001a33, emissiveIntensity: 0.35 }),
        new THREE.MeshStandardMaterial({ color: 0x0a101d, roughness: 0.5 }),
        new THREE.MeshStandardMaterial({ color: 0x16243c, roughness: 0.25, metalness: 0.6 }),
        new THREE.MeshStandardMaterial({ color: 0x142035, roughness: 0.25, metalness: 0.6 }),
      ];

      const fMesh = new THREE.Mesh(fGeo, fMats);
      fMesh.position.copy(def.pos);
      fMesh.rotation.set(0.35, 0.52, -0.12);
      floatingGroup.add(fMesh);

      // Cherry MX cross stem (+) on underside of floating keycap
      const stemH = new THREE.BoxGeometry(0.24 * def.scale, 0.18 * def.scale, 0.08 * def.scale);
      const stemV = new THREE.BoxGeometry(0.08 * def.scale, 0.18 * def.scale, 0.24 * def.scale);
      const stemMat = new THREE.MeshBasicMaterial({ color: def.type === 'purple' ? 0x8257ff : 0x00d9ff });
      const stemMeshH = new THREE.Mesh(stemH, stemMat);
      const stemMeshV = new THREE.Mesh(stemV, stemMat);
      stemMeshH.position.y = -0.25 * def.scale;
      stemMeshV.position.y = -0.25 * def.scale;
      fMesh.add(stemMeshH);
      fMesh.add(stemMeshV);

      // Glowing wireframe aura edges
      const edges = new THREE.EdgesGeometry(fGeo);
      const edgeLineMat = new THREE.LineBasicMaterial({
        color: def.type === 'purple' ? 0xa78bfa : 0x00d9ff,
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
        rotSpeed: new THREE.Vector3(0.006, 0.01, 0.004),
      });
    });

    // 10. Dynamic Orbital Energy Arcs Wrapping in 3D Space (Matching Master Concept Art)
    const curve1 = new THREE.EllipseCurve(0.4, 0.2, 4.4, 3.2, 0, 2 * Math.PI, false, 0);
    const points1 = curve1.getPoints(120);
    const ring1Geo = new THREE.BufferGeometry().setFromPoints(
      points1.map((p) => new THREE.Vector3(p.x, p.y, (p.x * 0.4) - 0.5))
    );
    const ring1Mat = new THREE.LineBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.75,
      linewidth: 3,
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
      opacity: 0.65,
      linewidth: 2,
    });
    const ring2 = new THREE.Line(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3.1;
    ring2.rotation.y = 0.2;
    scene.add(ring2);

    // 11. Ambient Cosmic Sparks & Star Dust Particles
    const particleCount = 100;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.2) * 7;
      particlePositions[i + 2] = (Math.random() - 0.5) * 9;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00d9ff,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    setIsLoaded(true);

    // 12. Mouse Tracking & Smooth Interactive Physics
    let targetTiltX = 0.52;
    let targetTiltY = -0.36;
    let currentTiltX = 0.52;
    let currentTiltY = -0.36;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetTiltY = -0.36 + x * 0.28;
      targetTiltX = 0.52 - y * 0.22;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 13. High-Speed Ghost Typing Simulator & Diagonal Wave Animation
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
      const waveSpeed = elapsed * 3.2;
      keyList.forEach((item) => {
        const wave = Math.sin(waveSpeed - item.colIdx * 0.28 + item.rowIdx * 0.35);
        const hue = 0.52 + (wave + 1) * 0.12; // Cycles smoothly between electric cyan (0.52) and neon violet (0.76)
        (item.rgbLed.material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.62);
        (item.rgbLed.material as THREE.MeshBasicMaterial).opacity = 0.45 + (wave + 1) * 0.28;

        // Mechanical key travel depression and spring bounce
        item.mesh.position.y += (item.targetY - item.mesh.position.y) * 0.28;
        if (Math.abs(item.mesh.position.y - item.targetY) < 0.005 && item.targetY < item.initialY) {
          // Release pressed keycap back to resting position
          item.targetY = item.initialY;
        }
      });

      // Ghost Key Typing: trigger authentic mechanical keystroke every 110ms
      if (elapsed - lastGhostKeyTime > 0.11) {
        lastGhostKeyTime = elapsed;
        const randomKey = keyList[Math.floor(Math.random() * keyList.length)];
        if (randomKey && randomKey.targetY === randomKey.initialY) {
          randomKey.targetY = randomKey.initialY - 0.065; // Authentic mechanical key travel depth
          (randomKey.rgbLed.material as THREE.MeshBasicMaterial).opacity = 1.0;
        }
      }

      // Floating Keycaps Levitation & 3D Wobble
      floatingKeys.forEach((fk) => {
        fk.mesh.position.y = fk.basePos.y + Math.sin(elapsed * fk.freq + fk.phase) * fk.amp;
        fk.mesh.rotation.x += fk.rotSpeed.x;
        fk.mesh.rotation.y += fk.rotSpeed.y;
      });

      // Orbital Energy Arcs Slow Rotation
      ring1.rotation.z = elapsed * 0.12;
      ring2.rotation.z = -elapsed * 0.08;

      // Chassis Underglow Acrylic dynamic pulse
      const edgeWave = (Math.sin(elapsed * 2.2) + 1) / 2;
      lightbarMat.color.setHSL(0.52 + edgeWave * 0.22, 1, 0.58);

      renderer.render(scene, camera);
    };

    animate();

    // 14. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 460;
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
      switchHousingGeo.dispose();
      switchHousingMat.dispose();
      crossStemGeo.dispose();
      crossStemMat.dispose();
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
          maxWidth: '640px',
          height: '460px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 217, 255, 0.25) 0%, rgba(130, 87, 255, 0.15) 50%, transparent 75%)',
            filter: 'blur(40px)',
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
        maxWidth: '680px',
        height: '480px',
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
