import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, mixer;
let arScene, arCamera, arRenderer, arMixer;
let arModel;
let clock = new THREE.Clock();

/* ========================= */
/* INTRO 3D */
/* ========================= */

initIntro();

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
    model.scale.set(1,1,1);
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
/* ATIVAR AR */
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
    arModel.scale.set(1,1,1);
    arModel.visible = false;
    arScene.add(arModel);

    arMixer = new THREE.AnimationMixer(arModel);
    gltf.animations.forEach((clip) => {
      arMixer.clipAction(clip).play();
    });

  });

  // Clique posiciona modelo 2m à frente da câmera
  window.addEventListener("click", () => {

    if (!arModel) return;

    const direction = new THREE.Vector3();
    arCamera.getWorldDirection(direction);

    const position = arCamera.position.clone().add(direction.multiplyScalar(2));

    arModel.position.copy(position);
    arModel.visible = true;

  });

  function renderAR() {
    requestAnimationFrame(renderAR);
    if (arMixer) arMixer.update(clock.getDelta());
    arRenderer.render(arScene, arCamera);
  }

  renderAR();
}

/* ========================= */
/* CAPTURA FOTO */
/* ========================= */

document.getElementById("captureBtn").addEventListener("click", () => {

  const canvas3D = document.getElementById("ar-canvas");
  const video = document.getElementById("camera");

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = window.innerWidth;
  tempCanvas.height = window.innerHeight;

  const ctx = tempCanvas.getContext("2d");

  ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
  ctx.drawImage(canvas3D, 0, 0, tempCanvas.width, tempCanvas.height);

  const image = tempCanvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = image;
  link.download = "stpatrick-photo.png";
  link.click();
});
