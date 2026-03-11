import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, mixer;
let arScene, arCamera, arRenderer;
let arModel;
let clock = new THREE.Clock();

initIntro();

/* ========================= */
/* INTRO 3D */
/* ========================= */

function initIntro() {

  const container = document.getElementById("canvas-container");

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  camera.position.set(0, 1.5, 3);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.4);
  scene.add(light);

  const loader = new GLTFLoader();

  loader.load("./stpatrick.glb", (gltf) => {

    const model = gltf.scene;
    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });

  });

  animateIntro();
}

function animateIntro() {
  requestAnimationFrame(animateIntro);
  if (mixer) mixer.update(clock.getDelta());
  renderer.render(scene, camera);
}

/* ========================= */
/* BOTÃO → ATIVA AR */
/* ========================= */

document.getElementById("startAR").addEventListener("click", async () => {

  document.getElementById("intro-screen").classList.add("hidden");
  document.getElementById("ar-screen").classList.remove("hidden");

  const video = document.getElementById("camera");

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });

  video.srcObject = stream;
  video.play();

  initAR();
});

/* ========================= */
/* AR MODE */
/* ========================= */

function initAR() {

  const canvas = document.getElementById("ar-canvas");

  arScene = new THREE.Scene();

  arCamera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  arCamera.position.set(0, 1.6, 0);

  arRenderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });

  arRenderer.setSize(window.innerWidth, window.innerHeight);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.4);
  arScene.add(light);

  const loader = new GLTFLoader();

  loader.load("./stpatrick.glb", (gltf) => {

    arModel = gltf.scene;
    arModel.visible = false;
    arScene.add(arModel);

    mixer = new THREE.AnimationMixer(arModel);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });

  });

  // Plano invisível para detectar toque
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ visible: false })
  );

  plane.rotation.x = -Math.PI / 2;
  arScene.add(plane);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  window.addEventListener("click", (event) => {

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, arCamera);

    const intersects = raycaster.intersectObject(plane);

    if (intersects.length > 0 && arModel) {

      arModel.position.copy(intersects[0].point);
      arModel.visible = true;

    }

  });

  function renderAR() {
    requestAnimationFrame(renderAR);
    if (mixer) mixer.update(clock.getDelta());
    arRenderer.render(arScene, arCamera);
  }

  renderAR();
}

/* ========================= */
/* CAPTURA FOTO */
/* ========================= */

document.getElementById("captureBtn").addEventListener("click", () => {

  const canvas = document.getElementById("ar-canvas");
  const video = document.getElementById("camera");

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = window.innerWidth;
  tempCanvas.height = window.innerHeight;

  const ctx = tempCanvas.getContext("2d");

  ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
  ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

  const image = tempCanvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = image;
  link.download = "stpatrick-photo.png";
  link.click();
});
