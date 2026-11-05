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
    // 1. WebGL Support Check
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

    let width = container.clientWidth || 560;
    let height = container.clientHeight || 420;

    // 2. Scene & Camera Setup (No heavy fog eating the lighting)
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 7.2);
    camera.lookAt(0, -0.2, 0);

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
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 3. Crisp Cyber Lighting Setup (Illuminates keys clearly with cyan & purple rim glow)
    const ambientLight = new THREE.AmbientLight(0x2a3e66, 1.6);
    scene.add(ambientLight);

    // Key Light from top-front
    const mainDirLight = new THREE.DirectionalLight(0xffffff, 2.4);
    mainDirLight.position.set(2, 8, 6);
    scene.add(mainDirLight);

    // Electric Cyan Rim Light (Left)
    const cyanLight = new THREE.DirectionalLight(0x00d9ff, 3.8);
    cyanLight.position.set(-6, 3, 3);
    scene.add(cyanLight);

    // Vivid Purple Rim Light (Right & Behind)
    const purpleLight = new THREE.DirectionalLight(0x8257ff, 4.0);
    purpleLight.position.set(6, 3, -2);
    scene.add(purpleLight);

    // Point Light directly beneath floating keys for underglow
    const glowPoint = new THREE.PointLight(0x00d9ff, 3.5, 8);
    glowPoint.position.set(1.5, 1.8, 1);
    scene.add(glowPoint);

    // Keyboard Master Group (for smooth mouse tracking)
    const keyboardGroup = new THREE.Group();
    keyboardGroup.rotation.x = 0.48;
    keyboardGroup.rotation.y = -0.32;
    keyboardGroup.rotation.z = 0.12;
    scene.add(keyboardGroup);

    // 4. Helper function to create sharp, readable keycap canvas textures
    const createKeycapTexture = (
      label: string,
      bgTop: string,
      bgBottom: string,
      textColor: string,
      borderColor: string,
      isAccent = false
    ): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Rounded Keycap Profile
      ctx.fillStyle = bgBottom;
      ctx.fillRect(0, 0, 128, 128);

      const grad = ctx.createLinearGradient(0, 0, 0, 128);
      grad.addColorStop(0, bgTop);
      grad.addColorStop(1, bgBottom);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(8, 8, 112, 112, 16);
      ctx.fill();

      // Chamfer Border Highlight
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Inner Dish Top Highlight
      ctx.fillStyle = isAccent ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(18, 18, 92, 92, 10);
      ctx.fill();

      // Keycap Legend Text
      if (label) {
        ctx.fillStyle = textColor;
        ctx.font = 'bold 44px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (isAccent) {
          ctx.shadowColor = textColor;
          ctx.shadowBlur = 10;
        }
        ctx.fillText(label, 64, 64);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      return texture;
    };

    // 5. Keyboard Chassis Base (High-end CNC Gunmetal Finish)
    const chassisWidth = 6.6;
    const chassisHeight = 0.42;
    const chassisDepth = 2.85;

    const chassisGeo = new THREE.BoxGeometry(chassisWidth, chassisHeight, chassisDepth);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x111c30,
      metalness: 0.85,
      roughness: 0.22,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    chassisMesh.position.y = -chassisHeight / 2;
    keyboardGroup.add(chassisMesh);

    // Glowing Cyber Edge Rim beneath keyboard
    const edgeGeo = new THREE.BoxGeometry(chassisWidth + 0.12, 0.06, chassisDepth + 0.12);
    const edgeMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.95,
    });
    const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
    edgeMesh.position.y = -chassisHeight + 0.03;
    keyboardGroup.add(edgeMesh);

    // Switch Mounting Plate (Brushed Gunmetal / Midnight Blue)
    const plateGeo = new THREE.BoxGeometry(chassisWidth - 0.2, 0.06, chassisDepth - 0.2);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x18243c,
      metalness: 0.7,
      roughness: 0.3,
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = 0.02;
    keyboardGroup.add(plateMesh);

    // 6. Realistic 65% Mechanical Keycaps Grid with Authentic Legends
    const KEY_ROWS = [
      ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'DEL'],
      ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
      ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'],
      ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', '↑', 'SHIFT'],
      ['CTRL', 'OPT', 'CMD', 'SPACE', 'CMD', '←', '↓', '→'],
    ];

    interface KeyMeshItem {
      mesh: THREE.Mesh;
      initialY: number;
      targetY: number;
      row: number;
      col: number;
      isAccent: boolean;
      rgbLed: THREE.Mesh;
    }

    const keyItems: KeyMeshItem[] = [];
    const rowSpacing = 0.46;
    const colSpacing = 0.42;

    KEY_ROWS.forEach((rowKeys, rIdx) => {
      const zPos = -0.92 + rIdx * rowSpacing;

      rowKeys.forEach((keyLabel, cIdx) => {
        let keyWidth = 0.36;
        let xOffset = 0;

        // Custom widths for special keys
        if (keyLabel === 'SPACE') {
          keyWidth = 2.2;
          xOffset = 0.92;
        } else if (keyLabel === 'ENTER' || keyLabel === 'SHIFT' || keyLabel === 'TAB' || keyLabel === 'CAPS') {
          keyWidth = 0.58;
        }

        const isEsc = keyLabel === 'ESC';
        const isEnter = keyLabel === 'ENTER';
        const isSpace = keyLabel === 'SPACE';
        const isTyphonKey = ['T', 'Y', 'P', 'H', 'O', 'N'].includes(keyLabel);

        let bgTop = '#22324e';
        let bgBottom = '#162238';
        let textColor = '#D4E2F5';
        let borderColor = 'rgba(120, 160, 255, 0.28)';
        let isAccent = false;

        if (isEsc) {
          bgTop = '#00D9FF';
          bgBottom = '#0284C7';
          textColor = '#050B18';
          borderColor = '#00D9FF';
          isAccent = true;
        } else if (isEnter) {
          bgTop = '#8257FF';
          bgBottom = '#5B21B6';
          textColor = '#FFFFFF';
          borderColor = '#8257FF';
          isAccent = true;
        } else if (isSpace) {
          bgTop = '#168BFF';
          bgBottom = '#0369A1';
          textColor = '#FFFFFF';
          borderColor = '#38BDF8';
          isAccent = true;
        } else if (isTyphonKey) {
          bgTop = (rIdx + cIdx) % 2 === 0 ? '#1E3A8A' : '#4C1D95';
          bgBottom = '#0F172A';
          textColor = (rIdx + cIdx) % 2 === 0 ? '#00D9FF' : '#A78BFA';
          borderColor = (rIdx + cIdx) % 2 === 0 ? 'rgba(0, 217, 255, 0.5)' : 'rgba(130, 87, 255, 0.5)';
          isAccent = true;
        }

        const topTexture = createKeycapTexture(
          keyLabel.length > 2 ? keyLabel.slice(0, 3) : keyLabel,
          bgTop,
          bgBottom,
          textColor,
          borderColor,
          isAccent
        );

        // Individual Keycap Geometry & Materials
        const keyGeo = new THREE.BoxGeometry(keyWidth, 0.22, 0.36);
        const materials = [
          new THREE.MeshStandardMaterial({ color: 0x18243c, roughness: 0.3, metalness: 0.5 }), // right
          new THREE.MeshStandardMaterial({ color: 0x18243c, roughness: 0.3, metalness: 0.5 }), // left
          new THREE.MeshStandardMaterial({ map: topTexture, roughness: 0.25, metalness: 0.4 }), // top with label!
          new THREE.MeshStandardMaterial({ color: 0x101a2c, roughness: 0.5 }), // bottom
          new THREE.MeshStandardMaterial({ color: 0x162238, roughness: 0.3, metalness: 0.5 }), // front
          new THREE.MeshStandardMaterial({ color: 0x141e32, roughness: 0.3, metalness: 0.5 }), // back
        ];

        const keyMesh = new THREE.Mesh(keyGeo, materials);
        const xPos = -2.75 + cIdx * colSpacing + xOffset;
        keyMesh.position.set(xPos, 0.16, zPos);
        keyboardGroup.add(keyMesh);

        // Per-Key Underglow RGB LED mesh beneath the switch
        const ledGeo = new THREE.PlaneGeometry(keyWidth + 0.06, 0.42);
        const ledMat = new THREE.MeshBasicMaterial({
          color: isAccent ? (isEnter ? 0x8257ff : 0x00d9ff) : 0x00d9ff,
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide,
        });
        const ledMesh = new THREE.Mesh(ledGeo, ledMat);
        ledMesh.rotation.x = Math.PI / 2;
        ledMesh.position.set(xPos, 0.05, zPos);
        keyboardGroup.add(ledMesh);

        keyItems.push({
          mesh: keyMesh,
          initialY: 0.16,
          targetY: 0.16,
          row: rIdx,
          col: cIdx,
          isAccent,
          rgbLed: ledMesh,
        });
      });
    });

    // 7. Levitating 3D Keycaps with Bold Printed Letters: "T", "R", "E" (Centerpiece Floating Elements)
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
        pos: new THREE.Vector3(2.4, 2.1, 0.9),
        bgTop: '#00D9FF',
        bgBottom: '#0284C7',
        text: '#050B18',
        border: '#FFFFFF',
        scale: 0.85,
        freq: 1.6,
        amp: 0.22,
        phase: 0,
      },
      {
        letter: 'R',
        pos: new THREE.Vector3(1.2, 3.1, -0.2),
        bgTop: '#8257FF',
        bgBottom: '#5B21B6',
        text: '#FFFFFF',
        border: '#A78BFA',
        scale: 0.95,
        freq: 1.3,
        amp: 0.26,
        phase: 1.8,
      },
      {
        letter: 'E',
        pos: new THREE.Vector3(3.2, 0.9, 1.6),
        bgTop: '#168BFF',
        bgBottom: '#0369A1',
        text: '#FFFFFF',
        border: '#7DD3FC',
        scale: 0.78,
        freq: 1.9,
        amp: 0.18,
        phase: 3.2,
      },
    ];

    floatingDefs.forEach((def) => {
      const tex = createKeycapTexture(def.letter, def.bgTop, def.bgBottom, def.text, def.border, true);
      const fGeo = new THREE.BoxGeometry(0.72 * def.scale, 0.44 * def.scale, 0.72 * def.scale);
      const fMats = [
        new THREE.MeshStandardMaterial({ color: 0x18243c, roughness: 0.25, metalness: 0.6 }),
        new THREE.MeshStandardMaterial({ color: 0x18243c, roughness: 0.25, metalness: 0.6 }),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.2, metalness: 0.4, emissive: 0x002244, emissiveIntensity: 0.3 }),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }),
        new THREE.MeshStandardMaterial({ color: 0x1a2844, roughness: 0.25, metalness: 0.6 }),
        new THREE.MeshStandardMaterial({ color: 0x1a2844, roughness: 0.25, metalness: 0.6 }),
      ];

      const fMesh = new THREE.Mesh(fGeo, fMats);
      fMesh.position.copy(def.pos);
      fMesh.rotation.set(0.35, 0.55, -0.15);
      floatingGroup.add(fMesh);

      // Glowing mechanical cross stem (+) on the underside
      const stemGeo = new THREE.BoxGeometry(0.22 * def.scale, 0.18 * def.scale, 0.22 * def.scale);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0x00d9ff });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = -0.26 * def.scale;
      fMesh.add(stemMesh);

      // Outer cyber wireframe contour
      const edges = new THREE.EdgesGeometry(fGeo);
      const edgeLineMat = new THREE.LineBasicMaterial({ color: 0x00d9ff, linewidth: 2 });
      const wire = new THREE.LineSegments(edges, edgeLineMat);
      fMesh.add(wire);

      floatingKeys.push({
        mesh: fMesh,
        basePos: def.pos.clone(),
        freq: def.freq,
        amp: def.amp,
        phase: def.phase,
        rotSpeed: new THREE.Vector3(0.007, 0.011, 0.005),
      });
    });

    // 8. Cyber Orbital Energy Rings around Keyboard
    const ring1Geo = new THREE.TorusGeometry(4.2, 0.035, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.65,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2.6;
    ring1.position.set(0.6, 0.3, -0.4);
    scene.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(4.8, 0.025, 16, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x8257ff,
      transparent: true,
      opacity: 0.55,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3.0;
    ring2.rotation.y = 0.25;
    ring2.position.set(0.6, 0.1, -0.6);
    scene.add(ring2);

    // 9. Floating Cyber Sparks & Light Streaks
    const particleCount = 80;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 11;
      particlePositions[i + 1] = (Math.random() - 0.2) * 6;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00d9ff,
      size: 0.07,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    setIsLoaded(true);

    // 10. Interactive Physics & Animated Ghost Keystrokes
    let targetTiltX = 0.48;
    let targetTiltY = -0.32;
    let currentTiltX = 0.48;
    let currentTiltY = -0.32;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetTiltY = -0.32 + x * 0.28;
      targetTiltX = 0.48 - y * 0.22;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Ghost typing simulator: randomly presses keys to bring mechanical keyboard to life
    let lastGhostKeyTime = 0;

    // 11. High Performance Render & Animation Loop
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

      // Dynamic Per-Key RGB Wave Sweep (Cyan -> Blue -> Purple)
      const waveSpeed = elapsed * 2.8;
      keyItems.forEach((item) => {
        const wave = Math.sin(waveSpeed - item.col * 0.35 + item.row * 0.4);
        const hue = 0.52 + (wave + 1) * 0.12; // Cycles between cyan (0.52) and violet (0.76)
        (item.rgbLed.material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.6);
        (item.rgbLed.material as THREE.MeshBasicMaterial).opacity = 0.4 + (wave + 1) * 0.25;

        // Animate key depression & bounce back
        item.mesh.position.y += (item.targetY - item.mesh.position.y) * 0.25;
        if (Math.abs(item.mesh.position.y - item.targetY) < 0.005 && item.targetY < item.initialY) {
          // Release pressed key
          item.targetY = item.initialY;
        }
      });

      // Ghost Key Typing: trigger a random key press every 140ms
      if (elapsed - lastGhostKeyTime > 0.14) {
        lastGhostKeyTime = elapsed;
        const randomKey = keyItems[Math.floor(Math.random() * keyItems.length)];
        if (randomKey && randomKey.targetY === randomKey.initialY) {
          randomKey.targetY = randomKey.initialY - 0.07; // Key travel depression
        }
      }

      // Floating Keycaps Levitation, Tumbling & Pulsing
      floatingKeys.forEach((fk) => {
        fk.mesh.position.y = fk.basePos.y + Math.sin(elapsed * fk.freq + fk.phase) * fk.amp;
        fk.mesh.rotation.x += fk.rotSpeed.x;
        fk.mesh.rotation.y += fk.rotSpeed.y;
      });

      // Orbital Rings Rotation
      ring1.rotation.z = elapsed * 0.12;
      ring2.rotation.z = -elapsed * 0.09;

      // Chassis Underglow dynamic color shift
      const edgeWave = (Math.sin(elapsed * 2) + 1) / 2;
      edgeMat.color.setHSL(0.52 + edgeWave * 0.2, 1, 0.55);

      renderer.render(scene, camera);
    };

    animate();

    // 12. Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 560;
      height = container.clientHeight || 420;
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
      edgeGeo.dispose();
      edgeMat.dispose();
      plateGeo.dispose();
      plateMat.dispose();
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
          maxWidth: '560px',
          height: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '340px',
            height: '340px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 217, 255, 0.25) 0%, rgba(130, 87, 255, 0.15) 50%, transparent 75%)',
            filter: 'blur(35px)',
            pointerEvents: 'none',
          }}
        />
        <svg
          viewBox="0 0 600 420"
          style={{ width: '100%', height: '100%', overflow: 'visible', filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.7))' }}
        >
          <polygon points="70,180 430,70 540,240 180,350" fill="#111C30" stroke="#00D9FF" strokeWidth="3" />
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
        maxWidth: '580px',
        height: '440px',
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
