import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import {
    RotateCcw, Eye, Play, Pause, ZoomIn, ZoomOut,
    Flame, Activity, Shield, Crosshair, Sparkles
} from 'lucide-react';

interface Astronaut3DModelProps {
    heartRate: number; // e.g. 135 bpm
    coreTemp: number; // e.g. 38.2 C
    evaStatus: string; // e.g. "ON-GOING"
    astronautName?: string;
}

type ViewMode = 'skeleton' | 'thermal' | 'suit';
type BodyTarget = 'full' | 'head' | 'chest' | 'spine' | 'arms' | 'legs';

export default function Astronaut3DModel({
    heartRate,
    coreTemp,
    evaStatus,
    astronautName = 'CDR. Elena Rovani',
}: Astronaut3DModelProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const modelGroupRef = useRef<THREE.Group | null>(null);
    const heartMeshRef = useRef<THREE.Mesh | null>(null);
    const heartLightRef = useRef<THREE.PointLight | null>(null);
    const thermalGroupRef = useRef<THREE.Group | null>(null);
    const skeletonGroupRef = useRef<THREE.Group | null>(null);
    const suitGroupRef = useRef<THREE.Group | null>(null);
    const scannerPlaneRef = useRef<THREE.Mesh | null>(null);

    // State for interactive UI controls
    const [isAutoRotate, setIsAutoRotate] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('skeleton');
    const [selectedTarget, setSelectedTarget] = useState<BodyTarget>('full');

    // Drag-to-rotate interaction refs
    const isDraggingRef = useRef(false);
    const prevMousePosRef = useRef({ x: 0, y: 0 });
    const targetRotationRef = useRef({ x: 0, y: 0 });
    const autoRotateSpeedRef = useRef(0.008);

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
        const ambientLight = new THREE.AmbientLight(0x1a4b6c, 1.2);
        scene.add(ambientLight);

        const cyanSpot = new THREE.DirectionalLight(0x5cdbdf, 2.5);
        cyanSpot.position.set(5, 10, 7);
        scene.add(cyanSpot);

        const blueBackLight = new THREE.DirectionalLight(0x0b3d91, 3.0);
        blueBackLight.position.set(-5, -5, -8);
        scene.add(blueBackLight);

        // Pulsing Point light inside the heart
        const heartPointLight = new THREE.PointLight(0xef4444, 2.0, 6);
        heartPointLight.position.set(0.35, 1.5, 0.4);
        scene.add(heartPointLight);
        heartLightRef.current = heartPointLight;

        // 5. Root Model Group
        const modelGroup = new THREE.Group();
        scene.add(modelGroup);
        modelGroupRef.current = modelGroup;

        // Subgroups for togglable view modes
        const skeletonGroup = new THREE.Group();
        const thermalGroup = new THREE.Group();
        const suitGroup = new THREE.Group();
        modelGroup.add(skeletonGroup);
        modelGroup.add(thermalGroup);
        modelGroup.add(suitGroup);
        skeletonGroupRef.current = skeletonGroup;
        thermalGroupRef.current = thermalGroup;
        suitGroupRef.current = suitGroup;

        // --- Materials ---
        const boneMat = new THREE.MeshStandardMaterial({
            color: 0x5cdbdf,
            emissive: 0x144c5c,
            roughness: 0.3,
            metalness: 0.8,
            wireframe: true,
        });

        const spineMat = new THREE.MeshStandardMaterial({
            color: 0x7dd3fc,
            emissive: 0x0284c7,
            roughness: 0.4,
            metalness: 0.6,
        });

        const jointMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x5cdbdf,
            emissiveIntensity: 0.6,
            roughness: 0.2,
            metalness: 0.9,
        });

        // ---------------------------------------------
        // SKELETON: Anatomical 3D Bones & Spine
        // ---------------------------------------------

        // Cranium / Skull
        const skullGeo = new THREE.SphereGeometry(0.85, 16, 12);
        skullGeo.scale(0.85, 1.1, 0.95);
        const skullMesh = new THREE.Mesh(skullGeo, boneMat);
        skullMesh.position.set(0, 3.6, 0);
        skeletonGroup.add(skullMesh);

        // Jaw / Mandible
        const jawGeo = new THREE.BoxGeometry(0.65, 0.35, 0.6);
        const jawMesh = new THREE.Mesh(jawGeo, boneMat);
        jawMesh.position.set(0, 2.75, 0.15);
        skeletonGroup.add(jawMesh);

        // Spine (Cervical, Thoracic, Lumbar discs)
        for (let i = 0; i < 14; i++) {
            const discGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.12, 10);
            const discMesh = new THREE.Mesh(discGeo, spineMat);
            discMesh.position.set(0, 2.4 - i * 0.25, -0.05 + Math.sin(i * 0.4) * 0.08);
            skeletonGroup.add(discMesh);
        }

        // Ribcage: Sternum & 7 pairs of 3D curved ribs
        const sternumGeo = new THREE.CylinderGeometry(0.08, 0.06, 1.4, 8);
        const sternumMesh = new THREE.Mesh(sternumGeo, boneMat);
        sternumMesh.position.set(0, 1.5, 0.85);
        skeletonGroup.add(sternumMesh);

        for (let r = 0; r < 7; r++) {
            const y = 2.0 - r * 0.2;
            const radiusX = 1.05 - r * 0.05;
            const radiusZ = 0.8 - r * 0.04;

            // Left Rib
            const leftRibCurve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(0, y, -0.05),
                new THREE.Vector3(radiusX, y - 0.05, 0.3),
                new THREE.Vector3(0, y - 0.1, 0.85)
            );
            const leftRibGeo = new THREE.TubeGeometry(leftRibCurve, 12, 0.04, 6, false);
            const leftRibMesh = new THREE.Mesh(leftRibGeo, boneMat);
            skeletonGroup.add(leftRibMesh);

            // Right Rib
            const rightRibCurve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(0, y, -0.05),
                new THREE.Vector3(-radiusX, y - 0.05, 0.3),
                new THREE.Vector3(0, y - 0.1, 0.85)
            );
            const rightRibGeo = new THREE.TubeGeometry(rightRibCurve, 12, 0.04, 6, false);
            const rightRibMesh = new THREE.Mesh(rightRibGeo, boneMat);
            skeletonGroup.add(rightRibMesh);
        }

        // Clavicles (Shoulder bridge)
        const clavicleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8);
        clavicleGeo.rotateZ(Math.PI / 2);
        const clavicleMesh = new THREE.Mesh(clavicleGeo, boneMat);
        clavicleMesh.position.set(0, 2.35, 0.2);
        skeletonGroup.add(clavicleMesh);

        // Helper function for bone segment
        const createBone = (p1: THREE.Vector3, p2: THREE.Vector3, radius = 0.08) => {
            const dir = new THREE.Vector3().subVectors(p2, p1);
            const len = dir.length();
            const geo = new THREE.CylinderGeometry(radius * 0.8, radius, len, 8);
            geo.translate(0, len / 2, 0);
            geo.rotateX(Math.PI / 2);
            const mesh = new THREE.Mesh(geo, boneMat);
            mesh.position.copy(p1);
            mesh.lookAt(p2);
            return mesh;
        };

        // Helper for joint sphere
        const createJoint = (pos: THREE.Vector3, radius = 0.18) => {
            const geo = new THREE.SphereGeometry(radius, 12, 10);
            const mesh = new THREE.Mesh(geo, jointMat);
            mesh.position.copy(pos);
            return mesh;
        };

        // --- ARMS ---
        // Left Arm: Shoulder (1.4, 2.35, 0) -> Elbow (1.8, 1.0, 0.1) -> Wrist (2.1, -0.2, 0.2)
        const lShoulder = new THREE.Vector3(1.4, 2.35, 0);
        const lElbow = new THREE.Vector3(1.85, 1.05, 0.1);
        const lWrist = new THREE.Vector3(2.1, -0.15, 0.25);
        skeletonGroup.add(createJoint(lShoulder, 0.2));
        skeletonGroup.add(createBone(lShoulder, lElbow, 0.09));
        skeletonGroup.add(createJoint(lElbow, 0.16));
        skeletonGroup.add(createBone(lElbow, lWrist, 0.07));
        skeletonGroup.add(createJoint(lWrist, 0.14));

        // Right Arm: Shoulder (-1.4, 2.35, 0) -> Elbow (-1.8, 1.0, 0.1) -> Wrist (-2.1, -0.2, 0.2)
        const rShoulder = new THREE.Vector3(-1.4, 2.35, 0);
        const rElbow = new THREE.Vector3(-1.85, 1.05, 0.1);
        const rWrist = new THREE.Vector3(-2.1, -0.15, 0.25);
        skeletonGroup.add(createJoint(rShoulder, 0.2));
        skeletonGroup.add(createBone(rShoulder, rElbow, 0.09));
        skeletonGroup.add(createJoint(rElbow, 0.16));
        skeletonGroup.add(createBone(rElbow, rWrist, 0.07));
        skeletonGroup.add(createJoint(rWrist, 0.14));

        // --- PELVIS ---
        const pelvisGeo = new THREE.TorusGeometry(0.75, 0.22, 10, 16);
        pelvisGeo.rotateX(Math.PI / 2.3);
        const pelvisMesh = new THREE.Mesh(pelvisGeo, boneMat);
        pelvisMesh.position.set(0, -0.7, 0);
        skeletonGroup.add(pelvisMesh);

        // --- LEGS ---
        // Left Leg: Hip (0.7, -0.8, 0) -> Knee (0.85, -2.5, 0.1) -> Ankle (0.9, -4.3, 0)
        const lHip = new THREE.Vector3(0.7, -0.85, 0);
        const lKnee = new THREE.Vector3(0.85, -2.5, 0.1);
        const lAnkle = new THREE.Vector3(0.9, -4.3, 0);
        skeletonGroup.add(createJoint(lHip, 0.22));
        skeletonGroup.add(createBone(lHip, lKnee, 0.12));
        skeletonGroup.add(createJoint(lKnee, 0.19));
        skeletonGroup.add(createBone(lKnee, lAnkle, 0.09));
        skeletonGroup.add(createJoint(lAnkle, 0.15));

        // Right Leg: Hip (-0.7, -0.8, 0) -> Knee (-0.85, -2.5, 0.1) -> Ankle (-0.9, -4.3, 0)
        const rHip = new THREE.Vector3(-0.7, -0.85, 0);
        const rKnee = new THREE.Vector3(-0.85, -2.5, 0.1);
        const rAnkle = new THREE.Vector3(-0.9, -4.3, 0);
        skeletonGroup.add(createJoint(rHip, 0.22));
        skeletonGroup.add(createBone(rHip, rKnee, 0.12));
        skeletonGroup.add(createJoint(rKnee, 0.19));
        skeletonGroup.add(createBone(rKnee, rAnkle, 0.09));
        skeletonGroup.add(createJoint(rAnkle, 0.15));

        // ---------------------------------------------
        // PULSING 3D HEART
        // ---------------------------------------------
        const heartShape = new THREE.Shape();
        const x = 0, y = 0;
        heartShape.moveTo(x + 0.25, y + 0.25);
        heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
        heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
        heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
        heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
        heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
        heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

        const heartExtrude = new THREE.ExtrudeGeometry(heartShape, {
            depth: 0.3,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 2,
            bevelSize: 0.08,
            bevelThickness: 0.08,
        });
        heartExtrude.center();
        heartExtrude.rotateZ(Math.PI);
        heartExtrude.scale(0.55, 0.55, 0.55);

        const heartMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xdc2626,
            emissiveIntensity: 1.2,
            roughness: 0.2,
            metalness: 0.8,
        });
        const heartMesh = new THREE.Mesh(heartExtrude, heartMat);
        heartMesh.position.set(0.35, 1.5, 0.4);
        skeletonGroup.add(heartMesh);
        heartMeshRef.current = heartMesh;

        // ---------------------------------------------
        // THERMAL HEAT SIGNATURES (Heatmap Layer)
        // ---------------------------------------------
        const heatMatWarm = new THREE.MeshBasicMaterial({
            color: 0xf97316,
            transparent: true,
            opacity: 0.5,
            wireframe: false,
        });

        const heatMatHot = new THREE.MeshBasicMaterial({
            color: 0xef4444,
            transparent: true,
            opacity: 0.65,
            wireframe: false,
        });

        // Chest thermal cloud
        const chestHeatGeo = new THREE.SphereGeometry(1.05, 16, 14);
        const chestHeatMesh = new THREE.Mesh(chestHeatGeo, isElevatedTemp ? heatMatHot : heatMatWarm);
        chestHeatMesh.position.set(0, 1.4, 0.3);
        thermalGroup.add(chestHeatMesh);

        // Lower back thermal cloud
        const lumbarHeatGeo = new THREE.SphereGeometry(0.7, 12, 10);
        const lumbarHeatMesh = new THREE.Mesh(lumbarHeatGeo, heatMatWarm);
        lumbarHeatMesh.position.set(0, -0.3, -0.3);
        thermalGroup.add(lumbarHeatMesh);

        // Thigh thermal nodes
        const lThighGeo = new THREE.CylinderGeometry(0.35, 0.25, 1.6, 10);
        const lThighMesh = new THREE.Mesh(lThighGeo, heatMatWarm);
        lThighMesh.position.set(0.8, -1.8, 0.05);
        thermalGroup.add(lThighMesh);

        const rThighGeo = new THREE.CylinderGeometry(0.35, 0.25, 1.6, 10);
        const rThighMesh = new THREE.Mesh(rThighGeo, heatMatWarm);
        rThighMesh.position.set(-0.8, -1.8, 0.05);
        thermalGroup.add(rThighMesh);

        // ---------------------------------------------
        // SUIT WIREFRAME SILHOUETTE (Suit Layer)
        // ---------------------------------------------
        const suitTorsoGeo = new THREE.CylinderGeometry(1.3, 1.1, 3.2, 16);
        const suitTorsoMat = new THREE.MeshStandardMaterial({
            color: 0x5cdbdf,
            emissive: 0x0e3a47,
            wireframe: true,
            transparent: true,
            opacity: 0.45,
        });
        const suitTorso = new THREE.Mesh(suitTorsoGeo, suitTorsoMat);
        suitTorso.position.set(0, 1.1, 0.1);
        suitGroup.add(suitTorso);

        // Helmet bubble
        const helmetGeo = new THREE.SphereGeometry(1.25, 16, 16);
        const helmetMat = new THREE.MeshStandardMaterial({
            color: 0x5cdbdf,
            emissive: 0x0e3a47,
            wireframe: true,
            transparent: true,
            opacity: 0.35,
        });
        const helmet = new THREE.Mesh(helmetGeo, helmetMat);
        helmet.position.set(0, 3.5, 0.1);
        suitGroup.add(helmet);

        // ---------------------------------------------
        // HOLOGRAPHIC SCANNER & FLOOR TELEMETRY RINGS
        // ---------------------------------------------
        // Floor concentric rings
        const ringGeo = new THREE.RingGeometry(2.4, 2.5, 36);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x1a4b6c,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
        });
        const floorRing = new THREE.Mesh(ringGeo, ringMat);
        floorRing.position.set(0, -4.7, 0);
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
        innerRing.position.set(0, -4.7, 0);
        scene.add(innerRing);

        // Scanning Laser Plane
        const scanGeo = new THREE.PlaneGeometry(4.5, 0.1);
        scanGeo.rotateX(Math.PI / 2);
        const scanMat = new THREE.MeshBasicMaterial({
            color: 0x5cdbdf,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
        });
        const scannerPlane = new THREE.Mesh(scanGeo, scanMat);
        scannerPlane.position.set(0, 0, 0);
        scene.add(scannerPlane);
        scannerPlaneRef.current = scannerPlane;

        // Floating Dust Particles
        const particleCount = 60;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 8;
            positions[i + 1] = (Math.random() - 0.5) * 10;
            positions[i + 2] = (Math.random() - 0.5) * 6;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x5cdbdf,
            size: 0.08,
            transparent: true,
            opacity: 0.6,
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // ---------------------------------------------
        // ANIMATION LOOP
        // ---------------------------------------------
        let animationFrameId: number;
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // 1. Model Rotation (Auto-rotate or smooth drag interpolation)
            if (modelGroupRef.current) {
                if (isAutoRotate && !isDraggingRef.current) {
                    targetRotationRef.current.y += autoRotateSpeedRef.current;
                }
                modelGroupRef.current.rotation.y += (targetRotationRef.current.y - modelGroupRef.current.rotation.y) * 0.1;
                modelGroupRef.current.rotation.x += (targetRotationRef.current.x - modelGroupRef.current.rotation.x) * 0.1;

                // Subtle breathing / floating motion
                modelGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
            }

            // 2. Heart Pulsation (frequency dynamically driven by active astronaut's heartRate bpm)
            if (heartMeshRef.current) {
                const currentHr = heartRateRef.current || 75;
                const bpmFreq = (currentHr / 60) * Math.PI * 2;
                const pulse = 1.0 + Math.pow(Math.sin(elapsedTime * bpmFreq), 4) * 0.28;
                heartMeshRef.current.scale.set(0.55 * pulse, 0.55 * pulse, 0.55 * pulse);

                if (heartLightRef.current) {
                    heartLightRef.current.intensity = 1.5 + Math.sin(elapsedTime * bpmFreq) * 1.5;
                }
            }

            // 3. Scanner laser sweep (oscillates up and down)
            if (scannerPlaneRef.current) {
                scannerPlaneRef.current.position.y = Math.sin(elapsedTime * 1.8) * 4.2;
            }

            // 4. Floor ring rotation
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

    // Update visibility based on ViewMode
    useEffect(() => {
        if (!skeletonGroupRef.current || !thermalGroupRef.current || !suitGroupRef.current) return;

        if (viewMode === 'skeleton') {
            skeletonGroupRef.current.visible = true;
            thermalGroupRef.current.visible = false;
            suitGroupRef.current.visible = false;
        } else if (viewMode === 'thermal') {
            skeletonGroupRef.current.visible = true;
            thermalGroupRef.current.visible = true;
            suitGroupRef.current.visible = false;
        } else if (viewMode === 'suit') {
            skeletonGroupRef.current.visible = true;
            thermalGroupRef.current.visible = false;
            suitGroupRef.current.visible = true;
        }
    }, [viewMode]);

    // Handle mouse drag to rotate 3D canvas
    const handleMouseDown = (e: React.MouseEvent) => {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;
        const deltaX = e.clientX - prevMousePosRef.current.x;
        const deltaY = e.clientY - prevMousePosRef.current.y;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };

        targetRotationRef.current.y += deltaX * 0.01;
        targetRotationRef.current.x = Math.max(-0.6, Math.min(0.6, targetRotationRef.current.x + deltaY * 0.008));
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
            cameraRef.current.position.set(0, 2.5, 8);
        } else if (target === 'chest') {
            cameraRef.current.position.set(0, 1.2, 9);
        } else if (target === 'spine') {
            cameraRef.current.position.set(0, 0.5, 10);
            targetRotationRef.current.y = Math.PI; // Look at back
        } else if (target === 'legs') {
            cameraRef.current.position.set(0, -2.5, 9);
        } else {
            cameraRef.current.position.set(0, 0, 16);
            targetRotationRef.current = { x: 0, y: 0 };
        }
    };

    return (
        <div className="relative w-full h-full min-h-[460px] border border-[#1a4b6c]/60 bg-gradient-to-b from-[#06121e]/90 via-[#0a1f2e]/40 to-[#030b14] flex flex-col justify-between overflow-hidden group select-none">
            {/* Tech Corner Brackets */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf] z-20 pointer-events-none"></span>
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf] z-20 pointer-events-none"></span>
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf] z-20 pointer-events-none"></span>
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf] z-20 pointer-events-none"></span>

            {/* Top Diagnostic Header inside 3D Canvas */}
            <div className="relative z-20 p-3 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-[#5cdbdf] animate-ping shrink-0" />
                    <span className="text-[11px] font-bold tracking-widest text-slate-200 uppercase truncate" title={astronautName}>
                        3D SKELETON • {astronautName}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 shrink-0">
                        WEBGL 360°
                    </span>
                </div>

                {/* View Mode Layer Pills */}
                <div className="flex items-center gap-1 bg-[#06121e] border border-[#1a4b6c] p-0.5 text-[10px]">
                    <button
                        type="button"
                        onClick={() => setViewMode('skeleton')}
                        className={`px-2 py-0.5 transition-colors cursor-pointer ${viewMode === 'skeleton' ? 'bg-[#5cdbdf] text-[#030b14] font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        SKELETON
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('thermal')}
                        className={`px-2 py-0.5 transition-colors cursor-pointer flex items-center gap-1 ${viewMode === 'thermal' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Flame className="w-2.5 h-2.5" /> HEATMAP
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('suit')}
                        className={`px-2 py-0.5 transition-colors cursor-pointer ${viewMode === 'suit' ? 'bg-[#5cdbdf] text-[#030b14] font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        SUIT
                    </button>
                </div>
            </div>

            {/* Warning Beacon if Elevated HR or Temp */}
            {(isHighHr || isElevatedTemp) && (
                <div className="absolute top-12 right-3 z-20 flex items-center gap-1.5 px-2 py-1 bg-red-950/70 border border-red-500/70 text-red-400 text-[10px] animate-pulse">
                    <Activity className="w-3.5 h-3.5" />
                    <span>CARDIAC EXERTION ALERT</span>
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
                                {selectedTarget === 'head' && 'Cranial index nominal • O2 saturation optimal'}
                                {selectedTarget === 'chest' && `Thoracic Load: Heart Rate ${heartRate} bpm, Core Temp ${coreTemp}°C`}
                                {selectedTarget === 'spine' && 'Vertebral alignment verified • Micro-gravity spinal decompression'}
                                {selectedTarget === 'legs' && 'Bone Density Monitoring • Lower extremity circulation stable'}
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
                        {(['head', 'chest', 'spine', 'legs'] as BodyTarget[]).map((tgt) => (
                            <button
                                key={tgt}
                                type="button"
                                onClick={() => handleTargetSelect(tgt)}
                                className={`px-1.5 py-0.5 border text-[9px] uppercase transition-colors cursor-pointer ${selectedTarget === tgt
                                    ? 'border-[#5cdbdf] bg-[#5cdbdf]/20 text-[#5cdbdf] font-bold'
                                    : 'border-[#1a4b6c] bg-[#0a1f2e] text-slate-400 hover:text-white'
                                    }`}
                            >
                                {tgt}
                            </button>
                        ))}
                    </div>

                    {/* Camera Control Buttons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setIsAutoRotate(!isAutoRotate)}
                            title={isAutoRotate ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
                            className={`p-1.5 border transition-colors cursor-pointer ${isAutoRotate ? 'border-[#5cdbdf] bg-[#5cdbdf]/20 text-[#5cdbdf]' : 'border-[#1a4b6c] text-slate-400 hover:text-white'
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
                Drag to rotate 360° • Scroll to zoom
            </div>
        </div>
    );
}
