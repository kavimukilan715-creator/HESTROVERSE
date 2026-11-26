import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

type ArtifactId = 'hammurabi-stele' | 'justinian-scales' | 'leopoldina-codex';

interface ArtifactSpec {
  id: ArtifactId;
  accession: string;
  title: string;
  year: string;
  region: string;
  material: string;
  dimensions: string;
  description: string;
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
}

const ARTIFACT_SPECS: ArtifactSpec[] = [
  {
    id: 'hammurabi-stele',
    accession: 'HV-3D-01',
    title: 'Basalt Stele of Hammurabi',
    year: 'c. 1750 BCE',
    region: 'Babylon · Mesopotamia',
    material: 'Carved black diorite on stepped limestone plinth',
    dimensions: '2.25 m monument scale',
    description:
      'Monolithic law pillar topped by a relief of Hammurabi receiving the rod and ring of justice, with horizontal cuneiform registers recording 282 talion and restitution statutes.',
    cameraPos: [3.2, 2.2, 3.8],
    targetPos: [0, 1.35, 0],
  },
  {
    id: 'justinian-scales',
    accession: 'HV-3D-02',
    title: 'Sovereign Balance of Justinian',
    year: '534 CE',
    region: 'Constantinople · Byzantine Empire',
    material: 'Cast bronze, fluted column, obsidian-marble base',
    dimensions: 'Codified judicial emblem',
    description:
      'Architectural judicial balance symbolizing Corpus Juris Civilis statutory proof weighing corroborated testimony against ranked civic status (honestiores vs. humiliores).',
    cameraPos: [3.0, 2.15, 3.6],
    targetPos: [0, 1.35, 0],
  },
  {
    id: 'leopoldina-codex',
    accession: 'HV-3D-03',
    title: '1786 Leopoldina Charter & Severed Shackle',
    year: '1786 CE',
    region: 'Florence · Grand Duchy of Tuscany',
    material: 'Rubricated vellum folio, walnut lectern, forged iron',
    dimensions: 'Abolition memorial',
    description:
      'Open printed folio of Grand Duke Pietro Leopoldo’s penal code abolishing judicial torture and capital punishment, paired with severed iron judicial restraint links.',
    cameraPos: [2.7, 2.1, 3.1],
    targetPos: [0, 0.95, 0],
  },
];

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.78)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function createDioriteTexture(maxAniso: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const albedo = document.createElement('canvas');
  albedo.width = 512;
  albedo.height = 1024;
  const ctx = albedo.getContext('2d')!;

  const bump = document.createElement('canvas');
  bump.width = 512;
  bump.height = 1024;
  const bctx = bump.getContext('2d')!;

  ctx.fillStyle = '#1c1e22';
  ctx.fillRect(0, 0, 512, 1024);
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 512, 1024);

  // Subtle crystalline speckle
  for (let i = 0; i < 4200; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(i * 78.233) * 19341.123) % 1;
    const px = Math.abs(x) * 512;
    const py = Math.abs(y) * 1024;
    const shade = 22 + ((i * 7) % 24);
    ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 4})`;
    ctx.fillRect(px, py, 2, 2);
  }

  // Horizontal cuneiform inscription bands on lower two-thirds
  for (let row = 360; row < 940; row += 18) {
    ctx.fillStyle = 'rgba(212, 180, 131, 0.22)';
    ctx.fillRect(36, row, 440, 2);
    bctx.fillStyle = '#383838';
    bctx.fillRect(36, row, 440, 3);

    for (let col = 44; col < 464; col += 14) {
      const wedgeLen = 4 + ((row + col) % 7);
      ctx.fillStyle = 'rgba(225, 210, 182, 0.34)';
      ctx.fillRect(col, row + 5, wedgeLen, 2);
      ctx.fillRect(col + 2, row + 4, 2, 6);
      bctx.fillStyle = '#202020';
      bctx.fillRect(col, row + 5, wedgeLen, 3);
    }
  }

  const map = new THREE.CanvasTexture(albedo);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = maxAniso;

  const bumpMap = new THREE.CanvasTexture(bump);
  bumpMap.anisotropy = maxAniso;

  return { map, bumpMap };
}

function createVellumPageTexture(maxAniso: number, side: 'left' | 'right'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ded4be';
  ctx.fillRect(0, 0, 512, 640);

  // Subtle parchment shading along spine edge
  const spineGrad =
    side === 'left'
      ? ctx.createLinearGradient(420, 0, 512, 0)
      : ctx.createLinearGradient(0, 0, 92, 0);
  if (side === 'left') {
    spineGrad.addColorStop(0, 'rgba(0,0,0,0)');
    spineGrad.addColorStop(1, 'rgba(30,22,14,0.28)');
  } else {
    spineGrad.addColorStop(0, 'rgba(30,22,14,0.28)');
    spineGrad.addColorStop(1, 'rgba(0,0,0,0)');
  }
  ctx.fillStyle = spineGrad;
  ctx.fillRect(0, 0, 512, 640);

  // Crimson rubricated header & border rule
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, 440, 568);

  ctx.fillStyle = '#991b1b';
  ctx.fillRect(58, 66, side === 'left' ? 280 : 240, 12);
  ctx.fillStyle = '#3b2f24';
  ctx.fillRect(58, 92, 180, 6);

  // Simulated engraved legal articles
  for (let y = 132; y < 564; y += 22) {
    const isParagraphBreak = y % 110 === 22;
    const width = isParagraphBreak ? 220 : 370 - ((y * 13) % 46);
    ctx.fillStyle = y % 110 === 0 ? '#7f1d1d' : '#2a241d';
    ctx.fillRect(58, y, width, 5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createGalleryFloorTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#14161b';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(212, 180, 131, 0.08)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 128) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.anisotropy = maxAniso;
  return tex;
}

export function ArtifactStage3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<ArtifactId>('hammurabi-stele');
  const [autoOrbit, setAutoOrbit] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  // Refs synced into the animation loop without rebuilding the WebGL scene
  const selectedIdRef = useRef<ArtifactId>(selectedId);
  const autoOrbitRef = useRef<boolean>(autoOrbit);
  const wireframeRef = useRef<boolean>(wireframe);
  const resetCameraTriggerRef = useRef<(() => void) | null>(null);

  const activeSpec = ARTIFACT_SPECS.find((a) => a.id === selectedId) ?? ARTIFACT_SPECS[0];

  useEffect(() => {
    selectedIdRef.current = selectedId;
    resetCameraTriggerRef.current?.();
  }, [selectedId]);

  useEffect(() => {
    autoOrbitRef.current = autoOrbit;
  }, [autoOrbit]);

  useEffect(() => {
    wireframeRef.current = wireframe;
  }, [wireframe]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      setWebglError('WebGL hardware acceleration is unavailable in this browser context.');
      return;
    }

    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererString = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? '')
      : '';
    const isSoftwareGl = /swiftshader|llvmpipe|software/i.test(rendererString);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0b0d);
    scene.fog = new THREE.FogExp2(0x0a0b0d, 0.042);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.72;
    roomEnv.dispose();
    pmremGenerator.dispose();
    track(envRT);

    const camera = new THREE.PerspectiveCamera(
      40,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      60
    );
    camera.position.set(...ARTIFACT_SPECS[0].cameraPos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.8;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI * 0.485;
    controls.target.set(...ARTIFACT_SPECS[0].targetPos);
    controls.update();

    // Three-point museum lighting
    const hemiLight = new THREE.HemisphereLight(0xa3b7d4, 0x161311, 0.75);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe6c7, 2.65);
    keyLight.position.set(4.2, 6.4, 3.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(isSoftwareGl ? 1024 : 2048, isSoftwareGl ? 1024 : 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.camera.left = -3.8;
    keyLight.shadow.camera.right = 3.8;
    keyLight.shadow.camera.top = 3.8;
    keyLight.shadow.camera.bottom = -3.8;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xb91c1c, 0.95);
    rimLight.position.set(-4.0, 3.2, -3.5);
    scene.add(rimLight);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // Gallery floor
    const floorTex = track(createGalleryFloorTexture(maxAniso));
    const floorMat = track(
      new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: 0.78,
        metalness: 0.08,
      })
    );
    const floorGeo = track(new THREE.CircleGeometry(14, 64));
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Shared materials & textures
    const contactShadowTex = track(createContactShadowTexture());
    const contactShadowMat = track(
      new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        depthWrite: false,
      })
    );

    const limestoneMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x3b3832,
        roughness: 0.86,
        metalness: 0.04,
      })
    );

    const obsidianMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x16181d,
        roughness: 0.34,
        metalness: 0.25,
      })
    );

    const bronzeMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xc29b61,
        roughness: 0.32,
        metalness: 0.86,
      })
    );

    const crimsonWaxMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x8f1d1d,
        roughness: 0.42,
        metalness: 0.08,
      })
    );

    const ironMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x3b4048,
        roughness: 0.54,
        metalness: 0.82,
      })
    );

    const { map: dioriteMap, bumpMap: dioriteBump } = createDioriteTexture(maxAniso);
    track(dioriteMap);
    track(dioriteBump);
    const dioriteMat = track(
      new THREE.MeshStandardMaterial({
        map: dioriteMap,
        bumpMap: dioriteBump,
        bumpScale: 0.015,
        roughness: 0.46,
        metalness: 0.14,
      })
    );

    const allMaterials: THREE.MeshStandardMaterial[] = [
      limestoneMat,
      obsidianMat,
      bronzeMat,
      crimsonWaxMat,
      ironMat,
      dioriteMat,
    ];

    const addShadowPlane = (parent: THREE.Group, radius: number) => {
      const geo = track(new THREE.PlaneGeometry(radius * 2, radius * 2));
      const mesh = new THREE.Mesh(geo, contactShadowMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.004;
      parent.add(mesh);
    };

    // 1. Code of Hammurabi Stele Group (9 parts)
    const steleGroup = new THREE.Group();
    addShadowPlane(steleGroup, 1.55);

    const plinthLower = new THREE.Mesh(track(new THREE.BoxGeometry(1.75, 0.16, 1.35)), limestoneMat);
    plinthLower.position.y = 0.08;
    plinthLower.castShadow = true;
    plinthLower.receiveShadow = true;
    steleGroup.add(plinthLower);

    const plinthUpper = new THREE.Mesh(track(new THREE.BoxGeometry(1.42, 0.22, 1.06)), obsidianMat);
    plinthUpper.position.y = 0.27;
    plinthUpper.castShadow = true;
    plinthUpper.receiveShadow = true;
    steleGroup.add(plinthUpper);

    const steleShaft = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.42, 0.54, 1.95, 28)),
      dioriteMat
    );
    steleShaft.scale.set(1.0, 1.0, 0.58);
    steleShaft.position.y = 1.355;
    steleShaft.castShadow = true;
    steleShaft.receiveShadow = true;
    steleGroup.add(steleShaft);

    const steleCrown = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.42, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2)),
      dioriteMat
    );
    steleCrown.scale.set(1.0, 0.88, 0.58);
    steleCrown.position.y = 2.325;
    steleCrown.castShadow = true;
    steleGroup.add(steleCrown);

    // Carved upper relief medallion frame & twin sovereign figures
    const reliefFrame = new THREE.Mesh(track(new THREE.BoxGeometry(0.56, 0.42, 0.06)), dioriteMat);
    reliefFrame.position.set(0, 2.02, 0.25);
    reliefFrame.castShadow = true;
    steleGroup.add(reliefFrame);

    const figureKing = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.055, 0.18, 6, 12)), bronzeMat);
    figureKing.position.set(-0.12, 2.01, 0.285);
    steleGroup.add(figureKing);

    const figureDeity = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.06, 0.2, 6, 12)), bronzeMat);
    figureDeity.position.set(0.12, 2.02, 0.285);
    steleGroup.add(figureDeity);

    const rodRing = new THREE.Mesh(track(new THREE.TorusGeometry(0.045, 0.01, 10, 24)), bronzeMat);
    rodRing.position.set(0.0, 2.05, 0.3);
    steleGroup.add(rodRing);

    const plaque = new THREE.Mesh(track(new THREE.BoxGeometry(0.52, 0.12, 0.03)), bronzeMat);
    plaque.position.set(0, 0.27, 0.54);
    steleGroup.add(plaque);

    scene.add(steleGroup);

    // 2. Sovereign Balance of Justinian Group (11 parts)
    const scalesGroup = new THREE.Group();
    scalesGroup.visible = false;
    addShadowPlane(scalesGroup, 1.5);

    const scaleBase = new THREE.Mesh(track(new THREE.CylinderGeometry(0.75, 0.85, 0.16, 36)), obsidianMat);
    scaleBase.position.y = 0.08;
    scaleBase.castShadow = true;
    scaleBase.receiveShadow = true;
    scalesGroup.add(scaleBase);

    const scaleCollar = new THREE.Mesh(track(new THREE.CylinderGeometry(0.32, 0.48, 0.22, 32)), limestoneMat);
    scaleCollar.position.y = 0.27;
    scaleCollar.castShadow = true;
    scalesGroup.add(scaleCollar);

    const scaleColumn = new THREE.Mesh(track(new THREE.CylinderGeometry(0.085, 0.11, 1.68, 24)), bronzeMat);
    scaleColumn.position.y = 1.22;
    scaleColumn.castShadow = true;
    scalesGroup.add(scaleColumn);

    const scaleFinial = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.11, 0)), bronzeMat);
    scaleFinial.position.y = 2.16;
    scaleFinial.castShadow = true;
    scalesGroup.add(scaleFinial);

    // Pivoting crossbeam assembly
    const beamPivot = new THREE.Group();
    beamPivot.position.y = 2.02;
    scalesGroup.add(beamPivot);

    const crossBeam = new THREE.Mesh(track(new THREE.CylinderGeometry(0.028, 0.028, 1.92, 16)), bronzeMat);
    crossBeam.rotation.z = Math.PI / 2;
    crossBeam.castShadow = true;
    beamPivot.add(crossBeam);

    const createPanAssembly = (xOffset: number, payloadType: 'stone' | 'scroll') => {
      const panGroup = new THREE.Group();
      panGroup.position.set(xOffset, 0, 0);

      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const rod = new THREE.Mesh(track(new THREE.CylinderGeometry(0.009, 0.009, 0.84, 8)), bronzeMat);
        rod.position.set(Math.cos(angle) * 0.13, -0.42, Math.sin(angle) * 0.13);
        rod.rotation.z = Math.cos(angle) * 0.29;
        rod.rotation.x = -Math.sin(angle) * 0.29;
        panGroup.add(rod);
      }

      const dish = new THREE.Mesh(
        track(new THREE.CylinderGeometry(0.3, 0.18, 0.08, 28)),
        bronzeMat
      );
      dish.position.y = -0.82;
      dish.castShadow = true;
      panGroup.add(dish);

      if (payloadType === 'stone') {
        const weight = new THREE.Mesh(track(new THREE.CylinderGeometry(0.09, 0.11, 0.16, 16)), obsidianMat);
        weight.position.y = -0.71;
        weight.castShadow = true;
        panGroup.add(weight);
      } else {
        const scroll = new THREE.Mesh(track(new THREE.CylinderGeometry(0.055, 0.055, 0.34, 16)), crimsonWaxMat);
        scroll.rotation.z = Math.PI / 2.2;
        scroll.position.y = -0.74;
        scroll.castShadow = true;
        panGroup.add(scroll);
      }

      return panGroup;
    };

    const leftPan = createPanAssembly(-0.88, 'stone');
    const rightPan = createPanAssembly(0.88, 'scroll');
    beamPivot.add(leftPan);
    beamPivot.add(rightPan);
    scene.add(scalesGroup);

    // 3. 1786 Leopoldina Charter & Severed Shackle Group (11 parts)
    const codexGroup = new THREE.Group();
    codexGroup.visible = false;
    addShadowPlane(codexGroup, 1.6);

    const galleryPedestal = new THREE.Mesh(track(new THREE.BoxGeometry(1.85, 0.56, 1.35)), obsidianMat);
    galleryPedestal.position.y = 0.28;
    galleryPedestal.castShadow = true;
    galleryPedestal.receiveShadow = true;
    codexGroup.add(galleryPedestal);

    const woodMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x3b261c,
        roughness: 0.62,
        metalness: 0.08,
      })
    );
    allMaterials.push(woodMat);

    const lecternBase = new THREE.Mesh(track(new THREE.BoxGeometry(1.18, 0.18, 0.82)), woodMat);
    lecternBase.position.set(-0.08, 0.65, -0.05);
    lecternBase.rotation.x = 0.22;
    lecternBase.castShadow = true;
    codexGroup.add(lecternBase);

    const leftPageTex = track(createVellumPageTexture(maxAniso, 'left'));
    const rightPageTex = track(createVellumPageTexture(maxAniso, 'right'));
    const leftPageMat = track(
      new THREE.MeshStandardMaterial({ map: leftPageTex, roughness: 0.85, metalness: 0.02 })
    );
    const rightPageMat = track(
      new THREE.MeshStandardMaterial({ map: rightPageTex, roughness: 0.85, metalness: 0.02 })
    );
    allMaterials.push(leftPageMat, rightPageMat);

    const bookCover = new THREE.Mesh(track(new THREE.BoxGeometry(0.98, 0.05, 0.68)), crimsonWaxMat);
    bookCover.position.set(-0.08, 0.76, -0.04);
    bookCover.rotation.x = 0.22;
    bookCover.castShadow = true;
    codexGroup.add(bookCover);

    const leftPage = new THREE.Mesh(track(new THREE.BoxGeometry(0.45, 0.035, 0.62)), leftPageMat);
    leftPage.position.set(-0.31, 0.79, -0.035);
    leftPage.rotation.set(0.22, 0, 0.07);
    leftPage.castShadow = true;
    codexGroup.add(leftPage);

    const rightPage = new THREE.Mesh(track(new THREE.BoxGeometry(0.45, 0.035, 0.62)), rightPageMat);
    rightPage.position.set(0.15, 0.79, -0.035);
    rightPage.rotation.set(0.22, 0, -0.07);
    rightPage.castShadow = true;
    codexGroup.add(rightPage);

    const waxSeal = new THREE.Mesh(track(new THREE.CylinderGeometry(0.075, 0.085, 0.022, 24)), crimsonWaxMat);
    waxSeal.position.set(0.24, 0.815, 0.14);
    waxSeal.rotation.x = 0.22;
    codexGroup.add(waxSeal);

    // Severed judicial iron shackle & broken links resting on pedestal right corner
    const shackleRing = new THREE.Mesh(
      track(new THREE.TorusGeometry(0.12, 0.026, 12, 28, Math.PI * 1.45)),
      ironMat
    );
    shackleRing.position.set(0.56, 0.59, 0.25);
    shackleRing.rotation.set(Math.PI / 2, 0.2, 0.5);
    shackleRing.castShadow = true;
    codexGroup.add(shackleRing);

    for (let i = 0; i < 3; i++) {
      const link = new THREE.Mesh(track(new THREE.TorusGeometry(0.052, 0.014, 10, 20)), ironMat);
      link.position.set(0.64 - i * 0.08, 0.585, 0.42 + (i % 2) * 0.03);
      link.rotation.set(i % 2 === 0 ? Math.PI / 2 : 0.4, 0.3, i * 0.45);
      link.castShadow = true;
      codexGroup.add(link);
    }

    scene.add(codexGroup);

    const groups: Record<ArtifactId, THREE.Group> = {
      'hammurabi-stele': steleGroup,
      'justinian-scales': scalesGroup,
      'leopoldina-codex': codexGroup,
    };

    // Pre-allocated camera lerp state (zero allocations inside animate)
    const desiredCamPos = new THREE.Vector3(...ARTIFACT_SPECS[0].cameraPos);
    const desiredTarget = new THREE.Vector3(...ARTIFACT_SPECS[0].targetPos);
    let transitioningCamera = false;

    resetCameraTriggerRef.current = () => {
      const spec = ARTIFACT_SPECS.find((a) => a.id === selectedIdRef.current) ?? ARTIFACT_SPECS[0];
      desiredCamPos.set(...spec.cameraPos);
      desiredTarget.set(...spec.targetPos);
      transitioningCamera = true;
    };

    const handleUserInteract = () => {
      transitioningCamera = false;
    };
    controls.addEventListener('start', handleUserInteract);

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let rafId = 0;
    let lastWireframe = false;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      const currentId = selectedIdRef.current;
      (Object.keys(groups) as ArtifactId[]).forEach((id) => {
        groups[id].visible = id === currentId;
      });

      if (wireframeRef.current !== lastWireframe) {
        lastWireframe = wireframeRef.current;
        allMaterials.forEach((mat) => {
          mat.wireframe = lastWireframe;
        });
      }

      if (autoOrbitRef.current && !transitioningCamera) {
        groups[currentId].rotation.y += dt * 0.24;
      }

      if (currentId === 'justinian-scales') {
        const tilt = Math.sin(elapsed * 0.9) * 0.045;
        beamPivot.rotation.z = tilt;
        leftPan.rotation.z = -tilt;
        rightPan.rotation.z = -tilt;
      }

      if (transitioningCamera) {
        const dampFactor = 1 - Math.exp(-5 * dt);
        camera.position.lerp(desiredCamPos, dampFactor);
        controls.target.lerp(desiredTarget, dampFactor);
        if (camera.position.distanceTo(desiredCamPos) < 0.02) {
          transitioningCamera = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleUserInteract);
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
    };
  }, []);

  const handleResetView = useCallback(() => {
    resetCameraTriggerRef.current?.();
  }, []);

  return (
    <section
      id="chamber-3d"
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen bg-[#0A0B0D]'
          : 'relative w-full h-[76vh] min-h-[560px] max-h-[820px] border-b border-[#252830] bg-[#0A0B0D] overflow-hidden'
      }
      aria-label="Interactive 3D Legal Artifact Chamber"
    >
      {/* Isolated WebGL Mount */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* WebGL Error or Context Lost Fallback */}
      {(webglError || contextLost) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-[#0A0B0D]">
          <div className="max-w-md bg-[#121418] border border-[#2A2E37] p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-[#D4B483]">
              3D Gallery Notice
            </p>
            <h3 className="mt-2 font-serif text-2xl font-semibold text-[#ECEAE4]">
              {activeSpec.title}
            </h3>
            <p className="mt-2 text-sm text-[#A3A7B0]">
              {webglError || 'WebGL graphics context paused. Attempting automatic restoration.'}
            </p>
          </div>
        </div>
      )}

      {/* Top-Left Curatorial Placard (Solid/Semi-opaque — no backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 sm:right-auto sm:max-w-sm z-10">
        <div className="pointer-events-auto bg-[#0E1014]/92 border border-[#2A2E37] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#D4B483]">
              07 · 3D Relic Vault · {activeSpec.accession}
            </span>
            <span className="font-mono text-[11px] text-[#F87171] tabular-nums">
              {activeSpec.year}
            </span>
          </div>
          <h2 className="mt-1.5 font-serif text-xl sm:text-2xl font-semibold text-[#ECEAE4] leading-snug">
            {activeSpec.title}
          </h2>
          <p className="mt-1 font-mono text-[11px] text-[#9CA3AF]">
            {activeSpec.region} · {activeSpec.material}
          </p>
          <p className="mt-2.5 text-xs leading-relaxed text-[#A3A7B0]">
            {activeSpec.description}
          </p>
        </div>
      </div>

      {/* Top-Right Fullscreen Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          type="button"
          onClick={() => setIsFullscreen((prev) => !prev)}
          aria-label={isFullscreen ? 'Exit fullscreen 3D chamber' : 'Expand 3D chamber fullscreen'}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#0E1014]/92 border border-[#2A2E37] text-[#ECEAE4] hover:border-[#DC2626] transition-colors"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              Inspect Fullscreen
            </>
          )}
        </button>
      </div>

      {/* Compact Collapsible Bottom Control Dock (No backdrop-filter, <= 15% height) */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-center pointer-events-none">
        <div className="pointer-events-auto max-w-4xl w-full sm:w-auto bg-[#0E1014]/94 border border-[#2A2E37] px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {ARTIFACT_SPECS.map((spec) => {
                const active = spec.id === selectedId;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setSelectedId(spec.id)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#991B1B] text-[#FBF9F5] border-[#991B1B]'
                        : 'bg-[#14171C] text-[#A3A7B0] border-[#252830] hover:text-[#ECEAE4]'
                    }`}
                  >
                    {spec.title.split(' of ')[0].replace('1786 ', '')}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setDockCollapsed((prev) => !prev)}
              aria-label={dockCollapsed ? 'Expand 3D controls' : 'Collapse 3D controls'}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-[#9CA3AF] hover:text-[#ECEAE4]"
            >
              {dockCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {!dockCollapsed && (
            <div className="mt-2 pt-2 border-t border-[#252830] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoOrbit((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] hover:border-[#6B7280]"
                >
                  {autoOrbit ? <Pause className="w-3.5 h-3.5 text-[#F87171]" /> : <Play className="w-3.5 h-3.5" />}
                  {autoOrbit ? 'Pause Rotation' : 'Auto-Rotate'}
                </button>
                <button
                  type="button"
                  onClick={() => setWireframe((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 border ${
                    wireframe
                      ? 'bg-[#991B1B] text-[#FBF9F5] border-[#991B1B]'
                      : 'bg-[#14171C] border-[#2A2E37] text-[#ECEAE4] hover:border-[#6B7280]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Mesh Wireframe
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] hover:border-[#6B7280]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Camera
                </button>
              </div>
              <span className="font-mono text-[11px] text-[#9CA3AF] hidden sm:inline">
                Drag to orbit · Scroll to zoom · Right-drag to pan
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
