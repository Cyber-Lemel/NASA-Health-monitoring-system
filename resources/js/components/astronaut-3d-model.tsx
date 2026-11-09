import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import {
    RotateCcw, Eye, Play, Pause, ZoomIn, ZoomOut,
    Flame, Activity, Shield, Crosshair, Sparkles, Image as ImageIcon, X, Zap
} from 'lucide-react';

interface Astronaut3DModelProps {
    heartRate: number; // e.g. 72 bpm
    coreTemp: number; // e.g. 36.8 C
    evaStatus: string; // e.g. "ON-GOING"
    astronautName?: string;
    onSelectCharacter?: (charKey: 'piccolo' | 'frieren' | 'luffy') => void;
}

type CharacterModel = 'piccolo' | 'frieren' | 'luffy';
type ViewMode = 'character' | 'wireframe' | 'aura';
type BodyTarget = 'full' | 'head' | 'chest' | 'beam' | 'legs';

export default function Astronaut3DModel({
    heartRate,
    coreTemp,
    evaStatus,
    astronautName = 'Master Piccolo',
    onSelectCharacter,
}: Astronaut3DModelProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const modelGroupRef = useRef<THREE.Group | null>(null);
    const heartMeshRef = useRef<THREE.Mesh | null>(null);
    const heartLightRef = useRef<THREE.PointLight | null>(null);
    const beamLightRef = useRef<THREE.PointLight | null>(null);
    const beamSpiralRef = useRef<THREE.Mesh | null>(null);
    const staffOrbLightRef = useRef<THREE.PointLight | null>(null);
    
    // Subgroups for models
    const piccoloGroupRef = useRef<THREE.Group | null>(null);
    const frierenGroupRef = useRef<THREE.Group | null>(null);
    const luffyGroupRef = useRef<THREE.Group | null>(null);
    const wireframeGroupRef = useRef<THREE.Group | null>(null);
    const auraGroupRef = useRef<THREE.Group | null>(null);
    const auraParticlesRef = useRef<THREE.Points | null>(null);
    const scannerPlaneRef = useRef<THREE.Mesh | null>(null);

    // State for interactive UI controls
    const [characterModel, setCharacterModel] = useState<CharacterModel>(() => {
        const lower = astronautName?.toLowerCase() || '';
        if (lower.includes('frieren')) return 'frieren';
        if (lower.includes('luffy')) return 'luffy';
        return 'piccolo';
    });
    const [isAutoRotate, setIsAutoRotate] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('character');
    const [selectedTarget, setSelectedTarget] = useState<BodyTarget>('full');
    const [showRefSheetModal, setShowRefSheetModal] = useState(false);

    // Synchronize character model if astronautName changes
    useEffect(() => {
        const lower = astronautName?.toLowerCase() || '';
        if (lower.includes('piccolo')) {
            setCharacterModel('piccolo');
        } else if (lower.includes('frieren')) {
            setCharacterModel('frieren');
        } else if (lower.includes('luffy')) {
            setCharacterModel('luffy');
        }
    }, [astronautName]);

    // Drag-to-rotate interaction refs
    const isDraggingRef = useRef(false);
    const prevMousePosRef = useRef({ x: 0, y: 0 });
    const targetRotationRef = useRef({ x: 0, y: 0 });
    const autoRotateSpeedRef = useRef(0.007);

    // Dynamic color indicators
    const isElevatedTemp = coreTemp > 37.8;
    const isHighHr = heartRate > 115;

    // Keep live vitals updated inside requestAnimationFrame loop
    const heartRateRef = useRef(heartRate);
    const coreTempRef = useRef(coreTemp);
    useEffect(() => {
        heartRateRef.current = heartRate;
        coreTempRef.current = coreTemp;
    }, [heartRate, coreTemp]);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth || 360;
        const height = container.clientHeight || 450;

        // 1. Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.fog = new THREE.FogExp2(0x030b14, 0.035);

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 16);
        cameraRef.current = camera;

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        rendererRef.current = renderer;
        container.appendChild(renderer.domElement);

        // 4. Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.6);
        keyLight.position.set(5, 9, 8);
        scene.add(keyLight);

        const cyanFill = new THREE.DirectionalLight(0x5cdbdf, 1.8);
        cyanFill.position.set(-6, 4, 6);
        scene.add(cyanFill);

        const backRimLight = new THREE.DirectionalLight(0x84cc16, 2.0); // Namekian green rim light
        backRimLight.position.set(0, -6, -8);
        scene.add(backRimLight);

        // Pulsing Point light inside the heart
        const heartPointLight = new THREE.PointLight(0xef4444, 2.0, 5);
        heartPointLight.position.set(0.12, 1.6, 0.4);
        scene.add(heartPointLight);
        heartLightRef.current = heartPointLight;

        // Makankosappo (Special Beam Cannon) Golden Ki Light
        const beamPointLight = new THREE.PointLight(0xfacc15, 3.5, 7);
        beamPointLight.position.set(0.2, 3.8, 1.2);
        scene.add(beamPointLight);
        beamLightRef.current = beamPointLight;

        // Staff orb light for Frieren
        const staffPointLight = new THREE.PointLight(0xdc2626, 3.0, 6);
        staffPointLight.position.set(-1.48, 2.3, 0.62);
        scene.add(staffPointLight);
        staffOrbLightRef.current = staffPointLight;

        // 5. Root Model Group
        const modelGroup = new THREE.Group();
        scene.add(modelGroup);
        modelGroupRef.current = modelGroup;

        // Subgroups for togglable models and view modes
        const piccoloGroup = new THREE.Group();
        const frierenGroup = new THREE.Group();
        const luffyGroup = new THREE.Group();
        const wireframeGroup = new THREE.Group();
        const auraGroup = new THREE.Group();
        modelGroup.add(piccoloGroup);
        modelGroup.add(frierenGroup);
        modelGroup.add(luffyGroup);
        modelGroup.add(wireframeGroup);
        modelGroup.add(auraGroup);
        piccoloGroupRef.current = piccoloGroup;
        frierenGroupRef.current = frierenGroup;
        luffyGroupRef.current = luffyGroup;
        wireframeGroupRef.current = wireframeGroup;
        auraGroupRef.current = auraGroup;

        // -------------------------------------------------------------
        // MATERIALS PALETTE (Piccolo, Frieren, Luffy & HUD Hologram)
        // -------------------------------------------------------------
        // Piccolo Materials (Dragon Ball Official Reference Sheet)
        const piccoloSkinMat = new THREE.MeshStandardMaterial({
            color: 0x5bb328, // Vibrant Namekian Olive-Green
            roughness: 0.5,
            metalness: 0.05,
        });

        const antennaMat = new THREE.MeshStandardMaterial({
            color: 0x4da023,
            roughness: 0.45,
            metalness: 0.05,
        });

        const purpleTurbanMat = new THREE.MeshStandardMaterial({
            color: 0x6a2c8a, // Purple dome on turban
            roughness: 0.4,
            metalness: 0.1,
        });

        const whiteCapeMat = new THREE.MeshStandardMaterial({
            color: 0xf5f5f7, // Crisp white cape, cowl & turban wraps
            roughness: 0.55,
            metalness: 0.05,
            side: THREE.DoubleSide,
        });

        const purpleGiMat = new THREE.MeshStandardMaterial({
            color: 0x48246a, // Iconic dark purple martial arts gi & baggy pants
            roughness: 0.65,
            metalness: 0.05,
        });

        const blueSashMat = new THREE.MeshStandardMaterial({
            color: 0x2b6cb0, // Cerulean blue pleated obi waist sash
            roughness: 0.45,
            metalness: 0.1,
        });

        const pinkPatchMat = new THREE.MeshStandardMaterial({
            color: 0xe58b88, // Pink/salmon segmented muscle patches on arms
            roughness: 0.5,
            metalness: 0.05,
        });

        const redWristMat = new THREE.MeshStandardMaterial({
            color: 0xd92626, // Crimson red wristbands
            roughness: 0.4,
            metalness: 0.15,
        });

        const brownBootMat = new THREE.MeshStandardMaterial({
            color: 0x9b6133, // Tan/brown Namekian pointed shoes
            roughness: 0.6,
            metalness: 0.1,
        });

        const kiGlowMat = new THREE.MeshStandardMaterial({
            color: 0xfef08a, // Glowing yellow/white Ki energy
            emissive: 0xfacc15,
            emissiveIntensity: 2.2,
            roughness: 0.1,
        });

        const eyeScleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const darkStripeMat = new THREE.MeshStandardMaterial({
            color: 0x18181b,
            roughness: 0.6,
            metalness: 0.1,
        });

        // Wireframe NASA Hologram material
        const holoWireMat = new THREE.MeshStandardMaterial({
            color: 0x5cdbdf,
            emissive: 0x144c5c,
            wireframe: true,
            roughness: 0.2,
            metalness: 0.9,
        });

        // =============================================================
        // 1. FULL 3D PICCOLO CHARACTER MODEL (Dragon Ball Reference Sheet)
        // =============================================================
        const piccoloHeadGroup = new THREE.Group();
        piccoloHeadGroup.position.set(0, 3.25, 0);

        // Namekian Head Base
        const headGeo = new THREE.SphereGeometry(0.72, 20, 16);
        headGeo.scale(0.88, 1.05, 0.92);
        const piccoloHeadMesh = new THREE.Mesh(headGeo, piccoloSkinMat);
        piccoloHeadGroup.add(piccoloHeadMesh);

        // Sharp Namekian Jaw & Chin
        const chinGeo = new THREE.ConeGeometry(0.48, 0.54, 14);
        chinGeo.rotateX(Math.PI);
        const piccoloChinMesh = new THREE.Mesh(chinGeo, piccoloSkinMat);
        piccoloChinMesh.position.set(0, -0.44, 0.12);
        piccoloHeadGroup.add(piccoloChinMesh);

        // Angled Brow Ridge
        const browGeo = new THREE.BoxGeometry(0.72, 0.12, 0.22);
        const browMesh = new THREE.Mesh(browGeo, piccoloSkinMat);
        browMesh.position.set(0, 0.26, 0.65);
        browMesh.rotation.x = -0.15;
        piccoloHeadGroup.add(browMesh);

        // Fierce, Sharp Anime Eyes
        const eyeGeo = new THREE.SphereGeometry(0.14, 12, 12);
        eyeGeo.scale(1.0, 1.15, 0.35);

        // Left Eye
        const lEye = new THREE.Mesh(eyeGeo, eyeScleraMat);
        lEye.position.set(0.24, 0.12, 0.64);
        lEye.rotation.z = -0.15;
        const lPupil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyePupilMat);
        lPupil.position.set(0.24, 0.12, 0.72);
        piccoloHeadGroup.add(lEye);
        piccoloHeadGroup.add(lPupil);

        // Right Eye
        const rEye = new THREE.Mesh(eyeGeo, eyeScleraMat);
        rEye.position.set(-0.24, 0.12, 0.64);
        rEye.rotation.z = 0.15;
        const rPupil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyePupilMat);
        rPupil.position.set(-0.24, 0.12, 0.72);
        piccoloHeadGroup.add(rEye);
        piccoloHeadGroup.add(rPupil);

        // Sharp Anime Nose
        const noseGeo = new THREE.ConeGeometry(0.08, 0.22, 4);
        noseGeo.rotateX(Math.PI * 0.45);
        const nose = new THREE.Mesh(noseGeo, piccoloSkinMat);
        nose.position.set(0, -0.06, 0.74);
        piccoloHeadGroup.add(nose);

        // Serious, Stoic Mouth Line
        const mouthGeo = new THREE.BoxGeometry(0.22, 0.025, 0.03);
        const mouthMesh = new THREE.Mesh(mouthGeo, darkStripeMat);
        mouthMesh.position.set(0, -0.26, 0.66);
        piccoloHeadGroup.add(mouthMesh);

        // Two Forehead Antennae with Rounded Bulbous Tips
        const createAntenna = (isLeft: boolean) => {
            const antennaGroup = new THREE.Group();
            const sign = isLeft ? 1 : -1;
            const curve = new THREE.CubicBezierCurve3(
                new THREE.Vector3(sign * 0.16, 0.38, 0.65),
                new THREE.Vector3(sign * 0.26, 0.75, 0.88),
                new THREE.Vector3(sign * 0.22, 1.15, 0.78),
                new THREE.Vector3(sign * 0.16, 1.35, 0.62)
            );
            const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.042, 8, false), antennaMat);
            antennaGroup.add(tube);

            const tip = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), antennaMat);
            tip.position.set(sign * 0.16, 1.35, 0.62);
            antennaGroup.add(tip);
            return antennaGroup;
        };

        piccoloHeadGroup.add(createAntenna(true));
        piccoloHeadGroup.add(createAntenna(false));

        // Long Pointed Namekian Ears
        const earGeo = new THREE.ConeGeometry(0.22, 1.35, 6);
        earGeo.rotateZ(-Math.PI * 0.42);
        earGeo.rotateY(0.25);
        const lEar = new THREE.Mesh(earGeo, piccoloSkinMat);
        lEar.position.set(0.88, 0.15, -0.05);
        piccoloHeadGroup.add(lEar);

        const rEarGeo = earGeo.clone();
        rEarGeo.rotateZ(Math.PI * 0.84);
        const rEar = new THREE.Mesh(rEarGeo, piccoloSkinMat);
        rEar.position.set(-0.88, 0.15, -0.05);
        piccoloHeadGroup.add(rEar);

        // White Wrapped Turban with Purple Dome Crown
        const turbanWrap = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.9, 0.55, 24), whiteCapeMat);
        turbanWrap.position.set(0, 0.42, -0.04);
        piccoloHeadGroup.add(turbanWrap);

        const turbanRoll = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.08, 8, 24), whiteCapeMat);
        turbanRoll.rotateX(Math.PI / 2);
        turbanRoll.position.set(0, 0.18, -0.04);
        piccoloHeadGroup.add(turbanRoll);

        const turbanPurpleCrown = new THREE.Mesh(
            new THREE.SphereGeometry(0.88, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
            purpleTurbanMat
        );
        turbanPurpleCrown.scale.set(1.0, 0.65, 1.0);
        turbanPurpleCrown.position.set(0, 0.62, -0.04);
        piccoloHeadGroup.add(turbanPurpleCrown);

        piccoloGroup.add(piccoloHeadGroup);

        // Weighted White Cowl (Thick Pleated Mantle)
        const cowlOuter = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.34, 14, 28), whiteCapeMat);
        cowlOuter.scale.set(1.22, 0.85, 1.0);
        cowlOuter.rotateX(Math.PI / 2);
        cowlOuter.position.set(0, 2.35, 0.02);
        piccoloGroup.add(cowlOuter);

        const cowlInner = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.24, 12, 24), whiteCapeMat);
        cowlInner.scale.set(1.15, 0.85, 1.0);
        cowlInner.rotateX(Math.PI / 2);
        cowlInner.position.set(0, 2.55, 0.02);
        piccoloGroup.add(cowlInner);

        // Iconic Flared White Shoulder Pauldrons (Shoulder Wings)
        const createShoulderWing = (isLeft: boolean) => {
            const wingGroup = new THREE.Group();
            const sign = isLeft ? 1 : -1;
            wingGroup.position.set(sign * 1.45, 2.3, 0);

            // Flared horizontal wing pauldron
            const wingGeo = new THREE.BoxGeometry(1.2, 0.28, 1.1);
            wingGeo.rotateZ(sign * 0.12);
            wingGeo.scale(1.0, 0.8, 1.1);
            const wing = new THREE.Mesh(wingGeo, whiteCapeMat);
            wingGroup.add(wing);

            // Wing tip taper
            const tipGeo = new THREE.ConeGeometry(0.55, 0.6, 6);
            tipGeo.rotateZ(sign * Math.PI * 0.5);
            const tip = new THREE.Mesh(tipGeo, whiteCapeMat);
            tip.position.set(sign * 0.7, 0, 0);
            wingGroup.add(tip);

            return wingGroup;
        };

        piccoloGroup.add(createShoulderWing(true));
        piccoloGroup.add(createShoulderWing(false));

        // Floor-Length White Flowing Cape
        const capeGeo = new THREE.CylinderGeometry(1.18, 1.75, 4.6, 24, 1, true, -Math.PI * 0.85, Math.PI * 1.7);
        capeGeo.scale(1.15, 1.0, 0.95);
        const cape = new THREE.Mesh(capeGeo, whiteCapeMat);
        cape.position.set(0, 0.4, -0.15);
        piccoloGroup.add(cape);

        // Dark Purple Martial Arts Gi
        const giTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.64, 1.9, 18), purpleGiMat);
        giTorso.position.set(0, 1.6, 0.04);
        piccoloGroup.add(giTorso);

        // Cerulean Blue Pleated Obi Waist Sash
        const obiSash = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.45, 24), blueSashMat);
        obiSash.position.set(0, 0.85, 0.04);
        piccoloGroup.add(obiSash);

        // Horizontal pleat ribs on sash
        for (let r = 0; r < 4; r++) {
            const rib = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.02, 6, 24), blueSashMat);
            rib.rotateX(Math.PI / 2);
            rib.position.set(0, 0.72 + r * 0.09, 0.04);
            piccoloGroup.add(rib);
        }

        // Muscular Green Arms with Pink Segmented Muscle Patches & Red Wristbands
        const createArm = (isLeft: boolean) => {
            const armGroup = new THREE.Group();
            const sign = isLeft ? 1 : -1;
            armGroup.position.set(sign * 1.15, 2.05, 0.05);

            // Bicep
            const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 1.1, 12), piccoloSkinMat);
            bicep.position.set(0, -0.45, 0);
            bicep.rotation.z = sign * 0.12;
            armGroup.add(bicep);

            // Segmented pink patch on outer bicep
            const bicepPatch = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.48, 0.12), pinkPatchMat);
            bicepPatch.position.set(sign * 0.18, -0.45, 0);
            armGroup.add(bicepPatch);

            // Forearm
            const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 1.1, 12), piccoloSkinMat);
            forearm.position.set(sign * 0.15, -1.35, 0.05);
            forearm.rotation.z = sign * 0.08;
            armGroup.add(forearm);

            // Segmented pink patch on forearm
            const forearmPatch = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.52, 0.12), pinkPatchMat);
            forearmPatch.position.set(sign * 0.32, -1.35, 0.05);
            armGroup.add(forearmPatch);

            // Red Wristband
            const wristband = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.32, 14), redWristMat);
            wristband.position.set(sign * 0.18, -1.82, 0.06);
            armGroup.add(wristband);

            // Clenched Fist / Hand
            const fist = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), piccoloSkinMat);
            fist.position.set(sign * 0.2, -2.1, 0.07);
            armGroup.add(fist);

            return armGroup;
        };

        piccoloGroup.add(createArm(true));
        piccoloGroup.add(createArm(false));

        // Makankosappo (Special Beam Cannon) Charging Aura at Forehead/Fingertip
        const beamGroup = new THREE.Group();
        beamGroup.position.set(0.18, 3.65, 0.72);

        // Core Ki Sphere
        const kiSphere = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), kiGlowMat);
        beamGroup.add(kiSphere);

        // Spiraling Energy Ribbon (Makankosappo double-helix spiral)
        const helixPoints: THREE.Vector3[] = [];
        for (let t = 0; t <= Math.PI * 6; t += 0.35) {
            const rad = 0.22 + t * 0.02;
            helixPoints.push(new THREE.Vector3(Math.cos(t) * rad, t * 0.3, Math.sin(t) * rad));
        }
        const helixCurve = new THREE.CatmullRomCurve3(helixPoints);
        const spiralMesh = new THREE.Mesh(new THREE.TubeGeometry(helixCurve, 32, 0.035, 6, false), kiGlowMat);
        beamGroup.add(spiralMesh);
        beamSpiralRef.current = spiralMesh;

        piccoloGroup.add(beamGroup);

        // Billowing Baggy Purple Martial Arts Pants
        const lPants = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.44, 2.4, 16), purpleGiMat);
        lPants.position.set(0.42, -0.65, 0.02);
        piccoloGroup.add(lPants);

        const rPants = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.44, 2.4, 16), purpleGiMat);
        rPants.position.set(-0.42, -0.65, 0.02);
        piccoloGroup.add(rPants);

        // Tan/Brown Namekian Pointed Shoes
        const createBoot = (isLeft: boolean) => {
            const bootGroup = new THREE.Group();
            const sign = isLeft ? 1 : -1;
            bootGroup.position.set(sign * 0.42, -2.4, 0.12);

            // Boot Ankle Cuff
            const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.34, 0.5, 14), brownBootMat);
            bootGroup.add(cuff);

            // Foot / Sole
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.28, 0.95), brownBootMat);
            foot.position.set(0, -0.32, 0.15);
            bootGroup.add(foot);

            // Pointed Up-Curled Namekian Toe
            const toe = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 8), brownBootMat);
            toe.rotateX(-Math.PI * 0.35);
            toe.position.set(0, -0.22, 0.72);
            bootGroup.add(toe);

            // Horizontal Stitch Lines
            for (let s = 0; s < 3; s++) {
                const stitch = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.02, 0.04), darkStripeMat);
                stitch.position.set(0, -0.2 + s * 0.12, 0.2 + s * 0.1);
                bootGroup.add(stitch);
            }

            return bootGroup;
        };

        piccoloGroup.add(createBoot(true));
        piccoloGroup.add(createBoot(false));

        // =============================================================
        // 2. PULSING 3D HEART (Embedded inside Chest)
        // =============================================================
        const heartShape = new THREE.Shape();
        const hx = 0, hy = 0;
        heartShape.moveTo(hx + 0.25, hy + 0.25);
        heartShape.bezierCurveTo(hx + 0.25, hy + 0.25, hx + 0.2, hy, hx, hy);
        heartShape.bezierCurveTo(hx - 0.3, hy, hx - 0.3, hy + 0.35, hx - 0.3, hy + 0.35);
        heartShape.bezierCurveTo(hx - 0.3, hy + 0.55, hx - 0.1, hy + 0.77, hx + 0.25, hy + 0.95);
        heartShape.bezierCurveTo(hx + 0.6, hy + 0.77, hx + 0.8, hy + 0.55, hx + 0.8, hy + 0.35);
        heartShape.bezierCurveTo(hx + 0.8, hy + 0.35, hx + 0.8, hy, hx + 0.5, hy);
        heartShape.bezierCurveTo(hx + 0.35, hy, hx + 0.25, hy + 0.25, hx + 0.25, hy + 0.25);

        const heartExtrude = new THREE.ExtrudeGeometry(heartShape, {
            depth: 0.25,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 2,
            bevelSize: 0.08,
            bevelThickness: 0.08,
        });
        heartExtrude.center();
        heartExtrude.rotateZ(Math.PI);
        heartExtrude.scale(0.5, 0.5, 0.5);

        const heartMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xdc2626,
            emissiveIntensity: 1.3,
            roughness: 0.2,
            metalness: 0.8,
        });
        const heartMesh = new THREE.Mesh(heartExtrude, heartMat);
        heartMesh.position.set(0.12, 1.6, 0.32);
        modelGroup.add(heartMesh);
        heartMeshRef.current = heartMesh;

        // =============================================================
        // 3. HOLOGRAPHIC NASA WIREFRAME MESH
        // =============================================================
        const wfHead = new THREE.Mesh(headGeo, holoWireMat);
        wfHead.position.set(0, 3.25, 0);
        wireframeGroup.add(wfHead);

        const wfTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.75, 2.0, 16), holoWireMat);
        wfTorso.position.set(0, 1.7, 0.04);
        wireframeGroup.add(wfTorso);

        const wfLLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 3.2, 12), holoWireMat);
        wfLLeg.position.set(0.42, -1.8, 0.02);
        wireframeGroup.add(wfLLeg);

        const wfRLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 3.2, 12), holoWireMat);
        wfRLeg.position.set(-0.42, -1.8, 0.02);
        wireframeGroup.add(wfRLeg);

        // =============================================================
        // 4. KI / MANA / STEAM AURA PARTICLES
        // =============================================================
        const auraCount = 110;
        const auraGeo = new THREE.BufferGeometry();
        const auraPos = new Float32Array(auraCount * 3);
        for (let m = 0; m < auraCount * 3; m += 3) {
            auraPos[m] = (Math.random() - 0.5) * 4.8;
            auraPos[m + 1] = Math.random() * 6.5 - 2.5;
            auraPos[m + 2] = (Math.random() - 0.5) * 3.8;
        }
        auraGeo.setAttribute('position', new THREE.BufferAttribute(auraPos, 3));
        const auraPointsMat = new THREE.PointsMaterial({
            color: 0xfef08a, // Electric Ki Yellow
            size: 0.18,
            transparent: true,
            opacity: 0.85,
        });
        const auraPoints = new THREE.Points(auraGeo, auraPointsMat);
        auraGroup.add(auraPoints);
        auraParticlesRef.current = auraPoints;

        const kiShieldGeo = new THREE.SphereGeometry(2.5, 20, 16);
        const kiShieldMat = new THREE.MeshBasicMaterial({
            color: 0x84cc16, // Namekian Ki Green field
            transparent: true,
            opacity: 0.12,
            wireframe: true,
        });
        const kiShieldMesh = new THREE.Mesh(kiShieldGeo, kiShieldMat);
        kiShieldMesh.position.set(0, 1.2, 0);
        auraGroup.add(kiShieldMesh);

        // =============================================================
        // 5. FLOOR TELEMETRY RINGS & SCANNER LASER
        // =============================================================
        const ringGeo = new THREE.RingGeometry(2.4, 2.5, 36);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x1a4b6c,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
        });
        const floorRing = new THREE.Mesh(ringGeo, ringMat);
        floorRing.position.set(0, -4.5, 0);
        scene.add(floorRing);

        const innerRingGeo = new THREE.RingGeometry(1.4, 1.48, 28);
        innerRingGeo.rotateX(Math.PI / 2);
        const innerRingMat = new THREE.MeshBasicMaterial({
            color: 0x5cdbdf,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4,
        });
        const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
        innerRing.position.set(0, -4.5, 0);
        scene.add(innerRing);

        const scanGeo = new THREE.PlaneGeometry(4.8, 0.1);
        scanGeo.rotateX(Math.PI / 2);
        const scanMat = new THREE.MeshBasicMaterial({
            color: 0x84cc16,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
        });
        const scannerPlane = new THREE.Mesh(scanGeo, scanMat);
        scannerPlane.position.set(0, 0, 0);
        scene.add(scannerPlane);
        scannerPlaneRef.current = scannerPlane;

        // =============================================================
        // 6. ANIMATION LOOP
        // =============================================================
        let animationFrameId: number;
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // 1. Model Rotation
            if (modelGroupRef.current) {
                if (isAutoRotate && !isDraggingRef.current) {
                    targetRotationRef.current.y += autoRotateSpeedRef.current;
                }
                modelGroupRef.current.rotation.y += (targetRotationRef.current.y - modelGroupRef.current.rotation.y) * 0.1;
                modelGroupRef.current.rotation.x += (targetRotationRef.current.x - modelGroupRef.current.rotation.x) * 0.1;

                // Subtle breathing motion
                modelGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
            }

            // 2. Heart Pulsation (frequency driven by heartRateRef.current)
            if (heartMeshRef.current) {
                const currentHr = heartRateRef.current || 72;
                const bpmFreq = (currentHr / 60) * Math.PI * 2;
                const pulse = 1.0 + Math.pow(Math.sin(elapsedTime * bpmFreq), 4) * 0.3;
                heartMeshRef.current.scale.set(0.5 * pulse, 0.5 * pulse, 0.5 * pulse);

                if (heartLightRef.current) {
                    heartLightRef.current.intensity = 1.4 + Math.sin(elapsedTime * bpmFreq) * 1.5;
                }
            }

            // 3. Makankosappo Special Beam Cannon Ki Spiral
            if (beamSpiralRef.current) {
                beamSpiralRef.current.rotation.y += 0.08;
            }
            if (beamLightRef.current) {
                const kiPulse = Math.sin(elapsedTime * 5.0);
                beamLightRef.current.intensity = 2.8 + kiPulse * 1.2;
            }

            // 4. Ki Aura particles rising
            if (auraParticlesRef.current) {
                const pos = auraParticlesRef.current.geometry.attributes.position.array as Float32Array;
                for (let k = 1; k < pos.length; k += 3) {
                    pos[k] += 0.04;
                    if (pos[k] > 4.5) {
                        pos[k] = -2.0;
                    }
                }
                auraParticlesRef.current.geometry.attributes.position.needsUpdate = true;
            }

            // 5. Scanner laser sweep
            if (scannerPlaneRef.current) {
                scannerPlaneRef.current.position.y = Math.sin(elapsedTime * 1.8) * 4.2;
            }

            // 6. Floor ring rotation
            floorRing.rotation.z = elapsedTime * 0.15;
            innerRing.rotation.z = -elapsedTime * 0.25;

            renderer.render(scene, camera);
        };

        animate();

        // Resize handler
        const handleResize = () => {
            if (!container || !renderer || !camera) return;
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    // Update visibility based on ViewMode & CharacterModel
    useEffect(() => {
        if (!piccoloGroupRef.current || !frierenGroupRef.current || !luffyGroupRef.current || !wireframeGroupRef.current || !auraGroupRef.current) return;

        if (viewMode === 'wireframe') {
            piccoloGroupRef.current.visible = false;
            frierenGroupRef.current.visible = false;
            luffyGroupRef.current.visible = false;
            wireframeGroupRef.current.visible = true;
            auraGroupRef.current.visible = false;
            if (beamLightRef.current) beamLightRef.current.visible = false;
        } else if (viewMode === 'aura') {
            piccoloGroupRef.current.visible = characterModel === 'piccolo';
            frierenGroupRef.current.visible = characterModel === 'frieren';
            luffyGroupRef.current.visible = characterModel === 'luffy';
            wireframeGroupRef.current.visible = false;
            auraGroupRef.current.visible = true;
            if (beamLightRef.current) beamLightRef.current.visible = characterModel === 'piccolo';
        } else {
            piccoloGroupRef.current.visible = characterModel === 'piccolo';
            frierenGroupRef.current.visible = characterModel === 'frieren';
            luffyGroupRef.current.visible = characterModel === 'luffy';
            wireframeGroupRef.current.visible = false;
            auraGroupRef.current.visible = false;
            if (beamLightRef.current) beamLightRef.current.visible = characterModel === 'piccolo';
        }
    }, [viewMode, characterModel]);

    // Handle mouse drag to rotate 3D canvas
    const handleMouseDown = (e: React.MouseEvent) => {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;
        const deltaX = e.clientX - prevMousePosRef.current.x;
        const deltaY = e.clientY - prevMousePosRef.current.y;

        targetRotationRef.current.y += deltaX * 0.01;
        targetRotationRef.current.x += deltaY * 0.01;

        // Clamp vertical tilt
        targetRotationRef.current.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotationRef.current.x));

        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!cameraRef.current) return;
        const delta = e.deltaY * 0.01;
        cameraRef.current.position.z = Math.max(8, Math.min(24, cameraRef.current.position.z + delta));
    };

    // Zoom Controls
    const zoomIn = () => {
        if (!cameraRef.current) return;
        cameraRef.current.position.z = Math.max(8, cameraRef.current.position.z - 2);
    };

    const zoomOut = () => {
        if (!cameraRef.current) return;
        cameraRef.current.position.z = Math.min(24, cameraRef.current.position.z + 2);
    };

    const resetCamera = () => {
        if (!cameraRef.current || !modelGroupRef.current) return;
        cameraRef.current.position.set(0, 0, 16);
        targetRotationRef.current = { x: 0, y: 0 };
        setSelectedTarget('full');
    };

    // Camera focusing on anatomical target
    const handleTargetSelect = (target: BodyTarget) => {
        setSelectedTarget(target);
        if (!cameraRef.current || !modelGroupRef.current) return;

        if (target === 'head') {
            cameraRef.current.position.set(0, 3.4, 7);
        } else if (target === 'chest') {
            cameraRef.current.position.set(0, 1.8, 7.5);
        } else if (target === 'beam') {
            cameraRef.current.position.set(0.2, 3.5, 6.5);
        } else if (target === 'legs') {
            cameraRef.current.position.set(0, -2.4, 8.5);
        } else {
            cameraRef.current.position.set(0, 0, 16);
            targetRotationRef.current = { x: 0, y: 0 };
        }
    };

    const handleSwitchCharacter = (model: CharacterModel) => {
        setCharacterModel(model);
        onSelectCharacter?.(model);
    };

    return (
        <div className="relative w-full h-full min-h-[460px] border border-[#1a4b6c]/60 bg-gradient-to-b from-[#06121e]/90 via-[#0a1f2e]/40 to-[#030b14] flex flex-col justify-between overflow-hidden group select-none">
            {/* Tech Corner Brackets */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf] z-20 pointer-events-none"></span>
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf] z-20 pointer-events-none"></span>
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf] z-20 pointer-events-none"></span>
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf] z-20 pointer-events-none"></span>

            {/* Top Diagnostic Header inside 3D Canvas */}
            <div className="relative z-20 p-3 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-[#84cc16] animate-ping shrink-0" />
                    <span className="text-[11px] font-bold tracking-widest text-slate-200 uppercase truncate max-w-[170px]" title={astronautName}>
                        3D MODEL • {astronautName}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 border shrink-0 font-mono ${
                        characterModel === 'piccolo'
                            ? 'border-lime-500/50 bg-lime-950/60 text-lime-300'
                            : characterModel === 'frieren'
                            ? 'border-purple-500/50 bg-purple-950/60 text-purple-300'
                            : 'border-red-500/50 bg-red-950/60 text-red-300'
                    }`}>
                        {characterModel === 'piccolo' ? 'PICCOLO 3D' : characterModel === 'frieren' ? 'FRIEREN 3D' : 'LUFFY 3D'}
                    </span>
                </div>

                {/* Character Model & View Mode Switcher Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Character Avatar Switcher */}
                    <div className="flex items-center bg-[#06121e] border border-[#1a4b6c] p-0.5 text-[10px]">
                        <button
                            type="button"
                            onClick={() => handleSwitchCharacter('piccolo')}
                            className={`px-2 py-0.5 transition-colors cursor-pointer flex items-center gap-1 ${
                                characterModel === 'piccolo'
                                    ? 'bg-lime-600 text-black font-bold'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                            title="Render 3D Master Piccolo character"
                        >
                            <Zap className="w-2.5 h-2.5 text-yellow-300" /> PICCOLO
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSwitchCharacter('frieren')}
                            className={`px-2 py-0.5 transition-colors cursor-pointer flex items-center gap-1 ${
                                characterModel === 'frieren'
                                    ? 'bg-purple-600 text-white font-bold'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                            title="Render 3D Mage Frieren character"
                        >
                            <Sparkles className="w-2.5 h-2.5 text-purple-300" /> FRIEREN
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSwitchCharacter('luffy')}
                            className={`px-2 py-0.5 transition-colors cursor-pointer flex items-center gap-1 ${
                                characterModel === 'luffy'
                                    ? 'bg-red-600 text-white font-bold'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                            title="Render 3D Monkey D. Luffy character"
                        >
                            <Flame className="w-2.5 h-2.5 text-yellow-300" /> LUFFY
                        </button>
                    </div>

                    {/* View Mode Layer Pills & Ref Sheet Button */}
                    <div className="flex items-center gap-1 bg-[#06121e] border border-[#1a4b6c] p-0.5 text-[10px]">
                        <button
                            type="button"
                            onClick={() => setViewMode('character')}
                            className={`px-2 py-0.5 transition-colors cursor-pointer ${
                                viewMode === 'character' ? 'bg-[#5cdbdf] text-[#030b14] font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Render full color 3D character"
                        >
                            3D
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('wireframe')}
                            className={`px-2 py-0.5 transition-colors cursor-pointer ${
                                viewMode === 'wireframe' ? 'bg-[#5cdbdf] text-[#030b14] font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Holographic NASA wireframe mesh"
                        >
                            WIREFRAME
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('aura')}
                            className={`px-2 py-0.5 transition-colors cursor-pointer flex items-center gap-1 ${
                                viewMode === 'aura' ? 'bg-lime-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Radiant Ki Aura / Mana particles"
                        >
                            <Sparkles className="w-2.5 h-2.5" /> AURA
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowRefSheetModal(true)}
                            className="px-1.5 py-0.5 border border-[#1a4b6c] text-[#5cdbdf] hover:border-[#5cdbdf] transition-colors cursor-pointer flex items-center gap-1 ml-1"
                            title={`View ${characterModel === 'piccolo' ? 'Piccolo' : characterModel === 'frieren' ? 'Frieren' : 'Luffy'} Turnaround Model Sheet Reference`}
                        >
                            <ImageIcon className="w-2.5 h-2.5" />
                            <span className="hidden sm:inline">REF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Status / Alert Pill */}
            {(isHighHr || isElevatedTemp) && (
                <div className="absolute top-12 right-3 z-20 flex items-center gap-1.5 px-2 py-1 bg-red-950/70 border border-red-500/70 text-red-400 text-[10px] animate-pulse">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{characterModel === 'piccolo' ? 'KI SURGE • MAKANKOSAPPO PEAK' : 'METABOLIC OVERHEAT'}</span>
                </div>
            )}

            {/* Main Interactive Three.js WebGL Canvas Mount */}
            <div
                ref={mountRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing z-10"
                style={{ touchAction: 'none' }}
            />

            {/* Anatomical Target Quick Inspector (Bottom Overlay) */}
            <div className="relative z-20 px-3 pb-2 flex flex-col gap-2 pointer-events-auto">
                {/* Floating anatomical target readout */}
                {selectedTarget !== 'full' && (
                    <div className="bg-[#06121e]/90 border border-[#5cdbdf]/50 p-2 text-[10px] flex items-center justify-between animate-in fade-in duration-150">
                        <div className="flex items-center gap-2">
                            <Crosshair className="w-3.5 h-3.5 text-[#5cdbdf]" />
                            <span className="text-white font-bold uppercase">TARGET: {selectedTarget}</span>
                            <span className="text-slate-400">
                                {characterModel === 'piccolo' ? (
                                    <>
                                        {selectedTarget === 'head' && 'White Turban & Purple Crown • Forehead Antennae & Pointed Namekian Ears'}
                                        {selectedTarget === 'chest' && `Weighted White Cowl & Flared Pauldrons • Heart Rate ${heartRate} bpm (Ki Balance)`}
                                        {selectedTarget === 'beam' && 'Special Beam Cannon (Makankosappo) • Spiraling Golden Ki Energy Helix'}
                                        {selectedTarget === 'legs' && 'Baggy Purple Gi Pants • Pointed Brown Namekian Shoes with Creases'}
                                    </>
                                ) : (
                                    <>
                                        {selectedTarget === 'head' && 'Cranial calm telemetry and sensory baseline'}
                                        {selectedTarget === 'chest' && `Vascular and pulmonary cardiac telemetry: ${heartRate} bpm`}
                                        {selectedTarget === 'beam' && 'Primary focal equipment and kinetic posture'}
                                        {selectedTarget === 'legs' && 'Musculoskeletal stability and zero-g alignment'}
                                    </>
                                )}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleTargetSelect('full')}
                            className="text-[#5cdbdf] hover:underline text-[9px] cursor-pointer"
                        >
                            Reset Focus
                        </button>
                    </div>
                )}

                {/* Bottom Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1a4b6c]/60 pt-2 text-[10px]">
                    {/* Anatomical Zone Selectors */}
                    <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[9px]">FOCUS:</span>
                        {(['head', 'chest', 'beam', 'legs'] as BodyTarget[]).map((tgt) => (
                            <button
                                key={tgt}
                                type="button"
                                onClick={() => handleTargetSelect(tgt)}
                                className={`px-1.5 py-0.5 border text-[9px] uppercase transition-colors cursor-pointer ${
                                    selectedTarget === tgt
                                        ? 'border-[#5cdbdf] bg-[#5cdbdf]/20 text-[#5cdbdf] font-bold'
                                        : 'border-[#1a4b6c] bg-[#0a1f2e] text-slate-400 hover:text-white'
                                }`}
                            >
                                {tgt === 'beam' ? (characterModel === 'piccolo' ? 'MAKANKO' : 'GEAR') : tgt}
                            </button>
                        ))}
                    </div>

                    {/* Camera Control Buttons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setIsAutoRotate(!isAutoRotate)}
                            title={isAutoRotate ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
                            className={`p-1.5 border transition-colors cursor-pointer ${
                                isAutoRotate ? 'border-[#5cdbdf] bg-[#5cdbdf]/20 text-[#5cdbdf]' : 'border-[#1a4b6c] text-slate-400 hover:text-white'
                            }`}
                        >
                            {isAutoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                        <button
                            type="button"
                            onClick={zoomIn}
                            title="Zoom In"
                            className="p-1.5 border border-[#1a4b6c] text-slate-400 hover:text-white hover:border-[#5cdbdf] transition-colors cursor-pointer"
                        >
                            <ZoomIn className="w-3 h-3" />
                        </button>
                        <button
                            type="button"
                            onClick={zoomOut}
                            title="Zoom Out"
                            className="p-1.5 border border-[#1a4b6c] text-slate-400 hover:text-white hover:border-[#5cdbdf] transition-colors cursor-pointer"
                        >
                            <ZoomOut className="w-3 h-3" />
                        </button>
                        <button
                            type="button"
                            onClick={resetCamera}
                            title="Reset 3D Orientation"
                            className="p-1.5 border border-[#1a4b6c] text-slate-400 hover:text-white hover:border-[#5cdbdf] transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Instruction tooltip overlay */}
            <div className="absolute bottom-11 right-3 z-10 text-[9px] text-slate-500 font-mono pointer-events-none hidden sm:block">
                Drag to rotate 360° • Scroll to zoom • {characterModel === 'piccolo' ? 'Makankosappo Charging & Weighted Cowl' : 'Interactive 3D Model'}
            </div>

            {/* Reference Sheet Lightbox Modal */}
            {showRefSheetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
                    <div className="relative max-w-4xl w-full bg-[#06121e] border border-[#1a4b6c] shadow-[0_0_50px_rgba(0,0,0,0.9)] p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-[#1a4b6c] pb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                    3D MODEL REFERENCE SHEET • {characterModel === 'piccolo' ? 'DRAGON BALL - PICCOLO' : characterModel === 'frieren' ? 'FRIEREN' : 'MONKEY D. LUFFY'}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 border font-mono ${
                                    characterModel === 'piccolo'
                                        ? 'border-lime-500/40 bg-lime-950 text-lime-300'
                                        : characterModel === 'frieren'
                                        ? 'border-purple-500/40 bg-purple-950 text-purple-300'
                                        : 'border-red-500/40 bg-red-950 text-red-300'
                                }`}>
                                    {characterModel === 'piccolo' ? 'NAMEKIAN SUPER WARRIOR' : characterModel === 'frieren' ? 'ELVEN MAGE' : 'STRAW HAT COMMANDER'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowRefSheetModal(false)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative rounded overflow-hidden border border-[#1a4b6c]/60 bg-[#030b14] flex justify-center">
                            <img
                                src={
                                    characterModel === 'piccolo'
                                        ? '/images/piccolo-model.jpg'
                                        : characterModel === 'frieren'
                                        ? '/images/frieren-model.jpg'
                                        : '/images/luffy-model.jpg'
                                }
                                alt={`${characterModel} 3D Character Model Sheet`}
                                className="max-h-[75vh] w-auto object-contain"
                            />
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                            <span>Turnaround views: Front, Side, Back, Expressions, Wireframe, Scale & Color Palette</span>
                            <button
                                type="button"
                                onClick={() => setShowRefSheetModal(false)}
                                className="px-3 py-1 border border-[#5cdbdf] text-[#5cdbdf] hover:bg-[#5cdbdf]/15 text-xs font-bold cursor-pointer"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
