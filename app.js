import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, mixer;
let clock = new THREE.Clock();

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

  loader.load("stpatrick.glb", (gltf) => {
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
/* TRANSIÇÃO PARA AR */
/* ========================= */

document.getElementById("startAR").addEventListener("click", async () => {

  document.getElementById("intro-screen").classList.add("hidden");
  document.getElementById("ar-screen").classList.remove("hidden");

  const video = document.getElementById("camera");

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: "environment" }
    },
    audio: false
  });

  video.srcObject = stream;
  video.play();

  initAR();
});

function initAR() {

  const canvas = document.getElementById("ar-canvas");

  const arScene = new THREE.Scene();

  const arCamera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  arCamera.position.set(0, 1.6, 3);

  const arRenderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });

  arRenderer.setSize(window.innerWidth, window.innerHeight);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.3);
  arScene.add(light);

  const loader = new GLTFLoader();

  loader.load("stpatrick.glb", (gltf) => {

    const model = gltf.scene;
    model.position.set(0, 0, -2);
    arScene.add(model);

    const arMixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
      arMixer.clipAction(clip).play();
    });

    function renderAR() {
      requestAnimationFrame(renderAR);
      arMixer.update(clock.getDelta());
      arRenderer.render(arScene, arCamera);
    }

    renderAR();
  });

}

/* ========================= */
/* CAPTURA FOTO */
/* ========================= */

document.getElementById("captureBtn").addEventListener("click", () => {

  const canvas = document.getElementById("ar-canvas");

  const image = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = image;
  link.download = "stpatrick-photo.png";
  link.click();
});
