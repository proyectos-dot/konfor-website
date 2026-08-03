/* ════════════════════════════════════════════════════════════
   KONFOR · V4 — Tu cuerpo, por dentro (3D real)
   Torso + 5 órganos GLB locales. Vuelo de cámara por sistema.
   Adaptado del visor Konfor Health OS a la estética Obsidiana.
   Datos: chequeo prototipo 25 jun 2026 (ilustrativos).
   ════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';

const M = 'vendor/models/';
const TORSO_URL = M + 'ba99de61.glb';
const C = { pearl: 0xEDE7DB, gold: 0xC9A24B, goldL: 0xE8C87A, cyan: 0xE8C87A };
const COL = { green: 0x2E7D5B, amber: 0xDE7B2C, red: 0xB5484D, grey: 0x8790a6 };
const CHRONO = 52, H = 1.7;
const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ORGANS = [
  { id: 'tiroides', sys: 'metabolismo', url: M + '56e7d291.glb', status: 'amber', age: 53.2, pos: [0, 1.47, 0.05], scale: 0.085 },
  { id: 'corazon',  sys: 'corazon',     url: M + 'cdea4d64.glb', status: 'green', age: 46.1, pos: [0.03, 1.28, 0.05], scale: 0.17 },
  { id: 'higado',   sys: 'higado',      url: M + '0f30cf2d.glb', status: 'amber', age: 55.3, pos: [-0.08, 1.13, 0.05], scale: 0.26 },
  { id: 'pancreas', sys: 'metabolismo', url: M + 'fa503717.glb', status: 'amber', age: 53.2, pos: [0.02, 1.08, 0.0], scale: 0.20 },
  { id: 'rinones',  sys: 'rinones',     url: M + 'cb77bea0.glb', status: 'green', age: 48.0, pos: [0.0, 1.03, -0.06], scale: 0.20 }
];

const SYS = {
  panorama: { tag: 'LECTURA GENERAL', title: 'Tu cuerpo, por dentro', dato: '5 SISTEMAS · 41 BIOMARCADORES',
    narr: 'Cada estudio deja de ser un PDF frío: se convierte en tu propio cuerpo, que ves, giras y entiendes. Toca un órgano para volar hacia él.' },
  corazon: { tag: 'CORAZÓN Y VASCULAR', title: 'Corazón', dato: 'EN RANGO · EDAD BIO 46.1',
    narr: 'Tu corazón late joven: su edad biológica (46) va por delante de tus 52. Bombea bien — 118/78, 62 lpm. Lo que carga es la calidad de la sangre que le llega: LDL y triglicéridos altos.' },
  higado: { tag: 'HÍGADO', title: 'Hígado', dato: 'A VIGILAR · EDAD BIO 55.3',
    narr: 'El que más pide atención. Guarda grasa dentro (esteatosis grado II) y sus enzimas están en el límite. Es reversible: el primero que responde cuando baja la grasa visceral.' },
  metabolismo: { tag: 'METABOLISMO', title: 'Páncreas + Tiroides', dato: 'LÍMITE · HbA1c 5.82%',
    narr: 'Al filo: la HbA1c (5.82%) está en el borde de lo óptimo. El páncreas trabaja de más para mantener la glucosa a raya. Es la señal temprana — el mejor momento para actuar.' },
  rinones: { tag: 'RIÑONES', title: 'Riñones', dato: 'EN RANGO · eTFG 135',
    narr: 'Jóvenes y limpios (edad 48). Filtran de sobra: eTFG 135, creatinina 0.9. Buen colchón — se cuidan manteniendo presión e hidratación.' },
  sangre: { tag: 'SANGRE Y HIERRO', title: 'Sangre / médula', dato: 'PRIORIDAD · RUTA CLÍNICA',
    narr: 'Aquí hay una prioridad: hierro bajo (saturación 17.1%) y una prueba de sangre oculta positiva. No es de peso ni de grasa — es una ruta clínica aparte que conviene revisar con tu médico pronto.' }
};

const stage = document.getElementById('escena3d');
if (stage) {
  const canvas = document.getElementById('c3d');
  const loader = document.getElementById('c3d-loader');
  const fallback = document.getElementById('c3d-fallback');
  const elT = document.getElementById('cuerpo-titulo');
  const elX = document.getElementById('cuerpo-texto');
  const elD = document.getElementById('cuerpo-dato');
  const elK = document.getElementById('cuerpo-tag');

  let scene, camera, renderer, controls, raycaster, pointer;
  let torso, bloodGroup;
  const organMeshes = {};
  const hotspots = [];
  let selected = null, started = false;
  const clock = new THREE.Clock();
  let camTween = null, downXY = null, moved = 0;
  const curTarget = new THREE.Vector3(0, 1.12, 0);
  const need = 1 + ORGANS.length;
  let done = 0, ok = 0;
  const tmpV = new THREE.Vector3();

  try { initScene(); loadTorso(); ORGANS.forEach(loadOrgan); }
  catch (e) { mostrarFallback(); }

  function mostrarFallback() {
    if (loader) loader.style.display = 'none';
    if (fallback) fallback.style.display = 'grid';
  }

  function initScene() {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d0a06, 0.07);
    camera = new THREE.PerspectiveCamera(38, stage.clientWidth / stage.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, 2.7);
    scene.add(new THREE.AmbientLight(0xd8cfc0, 1.05));
    scene.add(new THREE.HemisphereLight(0xf2e8d8, 0x241a10, 0.8));
    const key = new THREE.DirectionalLight(0xfff2dc, 1.15); key.position.set(3, 6, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xE8C87A, 0.85); rim.position.set(-4, 3, -4); scene.add(rim);
    const fill = new THREE.PointLight(0xC9A24B, 0.5, 20); fill.position.set(0, 2, 4); scene.add(fill);
    raycaster = new THREE.Raycaster(); pointer = new THREE.Vector2();
    buildChamber(); buildBlood(); buildHotspots();
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.minDistance = 1.2; controls.maxDistance = 6; controls.enablePan = false;
    controls.target.copy(curTarget);
    canvas.addEventListener('pointerdown', (e) => { downXY = [e.clientX, e.clientY]; moved = 0; });
    canvas.addEventListener('pointermove', (e) => { if (downXY) moved += Math.abs(e.clientX - downXY[0]) + Math.abs(e.clientY - downXY[1]); });
    canvas.addEventListener('pointerup', (e) => { if (downXY && moved < 6) pick(e); downXY = null; });
    window.addEventListener('resize', onResize);
    animate();
  }

  function buildChamber() {
    const ringMat = new THREE.MeshBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.26, side: THREE.DoubleSide, depthWrite: false });
    const r1 = new THREE.Mesh(new THREE.RingGeometry(0.85, 0.92, 64), ringMat);
    r1.rotation.x = -Math.PI / 2; r1.position.y = 0.01; r1.renderOrder = -1; scene.add(r1);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 2.0, 40, 1, true),
      new THREE.MeshBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.04, side: THREE.DoubleSide, depthWrite: false }));
    cyl.position.y = 1.0; cyl.renderOrder = -1; scene.add(cyl);
    const pts = []; for (let i = 0; i < 150; i++) pts.push((Math.random() - 0.5) * 3, Math.random() * 2.4, (Math.random() - 0.5) * 3);
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const pm = new THREE.Points(pg, new THREE.PointsMaterial({ color: C.cyan, size: 0.012, transparent: true, opacity: 0.4, depthWrite: false }));
    pm.renderOrder = -1; scene.add(pm);
  }

  function buildBlood() {
    bloodGroup = new THREE.Group();
    const disc = new THREE.SphereGeometry(1, 18, 14); disc.scale(1, 0.42, 1);
    const mat = new THREE.MeshStandardMaterial({ color: COL.red, emissive: COL.red, emissiveIntensity: 0.5, roughness: 0.4, transparent: true, opacity: 0.95 });
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(disc, mat);
      m.position.set((Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.14, (Math.random() - 0.5) * 0.14);
      m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      m.scale.setScalar(0.018 + Math.random() * 0.012);
      m.userData.sys = 'sangre'; bloodGroup.add(m);
    }
    bloodGroup.position.set(0, 0.92, 0.0); bloodGroup.renderOrder = 2; scene.add(bloodGroup);
  }

  function buildHotspots() {
    const cont = document.getElementById('c3d-hotspots');
    const items = [
      { sys: 'corazon', label: 'Corazón', pos: new THREE.Vector3(0.03, 1.30, 0.06) },
      { sys: 'higado', label: 'Hígado', pos: new THREE.Vector3(-0.08, 1.14, 0.07) },
      { sys: 'metabolismo', label: 'Metabolismo', pos: new THREE.Vector3(0.05, 1.06, 0.05) },
      { sys: 'rinones', label: 'Riñones', pos: new THREE.Vector3(0.10, 1.03, -0.04) },
      { sys: 'sangre', label: 'Sangre / hierro', pos: new THREE.Vector3(0.0, 0.92, 0.08) }
    ];
    items.forEach((h) => {
      const el = document.createElement('div'); el.className = 'hs3d';
      el.innerHTML = '<span class="hs3d-core"></span><span class="hs3d-tip">' + h.label + '</span>';
      el.addEventListener('click', (ev) => { ev.stopPropagation(); selectSys(h.sys); });
      cont.appendChild(el); h.el = el; hotspots.push(h);
    });
  }

  function processUnit(root) {
    root.updateMatrixWorld(true);
    const geos = [];
    root.traverse((o) => { if (o.isMesh && o.geometry) { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
      for (const k of Object.keys(g.attributes)) if (!['position', 'normal'].includes(k)) g.deleteAttribute(k);
      g.morphAttributes = {}; geos.push(g); } });
    if (!geos.length) return null;
    let geo = geos.length > 1 ? BGU.mergeGeometries(geos, false) : geos[0]; if (!geo) geo = geos[0];
    if (!geo.attributes.normal) geo.computeVertexNormals();
    geo.computeBoundingBox(); const bb = geo.boundingBox; const s = new THREE.Vector3(); bb.getSize(s);
    const cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2, cz = (bb.min.z + bb.max.z) / 2;
    const maxd = Math.max(s.x, s.y, s.z) || 1;
    geo.translate(-cx, -cy, -cz); geo.scale(1 / maxd, 1 / maxd, 1 / maxd);
    geo.computeVertexNormals(); geo.computeBoundingBox(); geo.computeBoundingSphere();
    return geo;
  }

  function processTorso(root) {
    root.updateMatrixWorld(true);
    const geos = [];
    root.traverse((o) => { if (o.isMesh && o.geometry) { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
      for (const k of Object.keys(g.attributes)) if (!['position', 'normal'].includes(k)) g.deleteAttribute(k);
      g.morphAttributes = {}; geos.push(g); } });
    if (!geos.length) return null;
    let geo = geos.length > 1 ? BGU.mergeGeometries(geos, false) : geos[0]; if (!geo) geo = geos[0];
    if (!geo.attributes.normal) geo.computeVertexNormals();
    geo.computeBoundingBox(); let bb = geo.boundingBox; let s = new THREE.Vector3(); bb.getSize(s);
    if (s.y < s.z && s.z >= s.x) geo.rotateX(-Math.PI / 2); else if (s.y < s.x && s.x > s.z) geo.rotateZ(Math.PI / 2);
    geo.computeBoundingBox(); bb = geo.boundingBox; bb.getSize(s);
    const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2, sc = H / s.y;
    geo.translate(-cx, -bb.min.y, -cz); geo.scale(sc, sc, sc);
    geo.computeVertexNormals(); geo.computeBoundingBox(); geo.computeBoundingSphere();
    return geo;
  }

  function loadTorso() {
    new GLTFLoader().load(TORSO_URL, (g) => { const geo = processTorso(g.scene); if (geo) makeTorso(geo); finish(true); }, undefined, () => finish(false));
  }
  function makeTorso(geo) {
    const mat = new THREE.MeshStandardMaterial({ color: C.pearl, roughness: 0.7, metalness: 0.02, transparent: true, opacity: 0.10, side: THREE.DoubleSide, emissive: 0x3a3e48, emissiveIntensity: 0.1, depthWrite: false });
    torso = new THREE.Mesh(geo, mat); torso.renderOrder = 3; torso.frustumCulled = false; scene.add(torso);
  }
  function loadOrgan(o) {
    new GLTFLoader().load(o.url, (g) => { const geo = processUnit(g.scene); if (geo) makeOrgan(o, geo); finish(true); }, undefined, () => finish(false));
  }
  function makeOrgan(o, geo) {
    const mat = new THREE.MeshStandardMaterial({ color: COL[o.status], emissive: COL[o.status], emissiveIntensity: 0.5, roughness: 0.45, metalness: 0.0, transparent: true, opacity: 1 });
    const m = new THREE.Mesh(geo, mat);
    m.scale.setScalar(o.scale); m.position.set(o.pos[0], o.pos[1], o.pos[2]);
    m.frustumCulled = false; m.renderOrder = 2; m.userData.sys = o.sys; m.userData.id = o.id;
    organMeshes[o.id] = m; scene.add(m);
  }

  function finish(good) {
    done++; if (good) ok++;
    if (!started && ok >= 1) { started = true; if (loader) loader.style.display = 'none'; updatePanel('panorama'); }
    if (done >= need && ok === 0) mostrarFallback();
  }

  function flyToHome() { camTween = { fromP: camera.position.clone(), toP: new THREE.Vector3(0, 1.2, 2.7), fromT: controls.target.clone(), toT: new THREE.Vector3(0, 1.12, 0), d: 0, dur: quieto ? 0.01 : 1.0 }; }
  function flyToSys(sys) {
    let p;
    if (sys === 'sangre') p = new THREE.Vector3(0, 0.92, 0.0);
    else { const o = ORGANS.find((x) => x.sys === sys) || ORGANS[0]; p = new THREE.Vector3(o.pos[0], o.pos[1], o.pos[2]); }
    const cam = new THREE.Vector3(p.x * 1.2 + 0.15, p.y + 0.05, p.z + 1.05);
    camTween = { fromP: camera.position.clone(), toP: cam, fromT: controls.target.clone(), toT: p.clone(), d: 0, dur: quieto ? 0.01 : 1.0 };
  }

  function refreshDim() {
    const dim = !!selected;
    ORGANS.forEach((o) => { const me = organMeshes[o.id]; if (!me) return;
      const on = !dim || o.sys === selected;
      me.userData.targetOp = on ? 1.0 : 0.12;
      me.userData.targetEm = on ? (dim ? 0.85 : 0.5) : 0.15;
    });
    if (bloodGroup) bloodGroup.children.forEach((ch) => { const on = !dim || selected === 'sangre'; ch.userData.targetOp = on ? 0.95 : 0.12; });
  }

  function updatePanel(key) {
    const d = SYS[key] || SYS.panorama;
    if (elK) elK.textContent = d.tag;
    if (elT) elT.textContent = d.title;
    if (elX) elX.textContent = d.narr;
    if (elD) elD.textContent = d.dato;
  }

  function selectSys(sys) {
    selected = (sys === 'panorama') ? null : sys;
    if (selected) flyToSys(selected); else flyToHome();
    updatePanel(selected || 'panorama');
    refreshDim();
    document.querySelectorAll('[data-organo]').forEach((b) =>
      b.classList.toggle('activo', b.dataset.organo === sys));
  }

  function pick(e) {
    if (!started) return;
    const r = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const arr = [...Object.values(organMeshes), ...(bloodGroup ? bloodGroup.children : [])];
    const hit = raycaster.intersectObjects(arr, false)[0]; if (!hit) return;
    selectSys(hit.object.userData.sys);
  }

  function onResize() {
    camera.aspect = stage.clientWidth / stage.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
  }

  function updateHotspots() {
    if (!started) return;
    const el = renderer.domElement; const w = el.clientWidth, hh = el.clientHeight;
    const occ = [...Object.values(organMeshes)]; if (torso) occ.push(torso);
    hotspots.forEach((h) => {
      tmpV.copy(h.pos).project(camera);
      if (tmpV.z > 1) { h.el.style.display = 'none'; return; }
      const dir = h.pos.clone().sub(camera.position); const dist = dir.length(); dir.normalize();
      raycaster.set(camera.position, dir);
      const hit = raycaster.intersectObjects(occ, false)[0];
      if (hit && hit.distance < dist - 0.06) { h.el.style.display = 'none'; return; }
      h.el.style.display = 'flex';
      h.el.style.left = ((tmpV.x * 0.5 + 0.5) * w) + 'px';
      h.el.style.top = ((-tmpV.y * 0.5 + 0.5) * hh) + 'px';
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, clock.getDelta()); const t = clock.elapsedTime;
    ORGANS.forEach((o) => { const me = organMeshes[o.id]; if (!me) return;
      const to = me.userData.targetOp ?? 1, te = me.userData.targetEm ?? 0.5;
      me.material.opacity += (to - me.material.opacity) * Math.min(1, dt * 6);
      me.material.emissiveIntensity += (te - me.material.emissiveIntensity) * Math.min(1, dt * 6);
      if (!quieto) { const pulse = 1 + Math.sin(t * 2 + o.pos[1] * 4) * 0.015; me.scale.setScalar(o.scale * pulse); }
    });
    if (bloodGroup) { bloodGroup.rotation.y += dt * 0.25; bloodGroup.children.forEach((ch) => { const to = ch.userData.targetOp ?? 0.95; ch.material.opacity += (to - ch.material.opacity) * Math.min(1, dt * 6); }); }
    if (camTween) { camTween.d += dt; let k = Math.min(1, camTween.d / camTween.dur); const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      camera.position.lerpVectors(camTween.fromP, camTween.toP, e); controls.target.lerpVectors(camTween.fromT, camTween.toT, e); if (k >= 1) camTween = null; }
    controls.update(); updateHotspots();
    renderer.render(scene, camera);
  }

  /* Chips del panel → vuelo de cámara */
  document.querySelectorAll('[data-organo]').forEach((b) => {
    b.addEventListener('click', () => { if (started) selectSys(b.dataset.organo); });
  });
}
