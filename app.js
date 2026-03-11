import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
