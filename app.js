import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-three';

const startButton = document.getElementById("startAR");
const introScreen = document.getElementById("intro-screen");
const arContainer = document.getElementById("ar-container");
const captureBtn = document.getElementById("captureBtn");

let renderer, scene, camera, model, mixer;
let clock = new THREE.Clock();

startButton.addEventListener("click", async () => {

  introScreen.classList.add("hidden");
  arContainer.classList.remove("hidden");
  captureBtn.classList.remove("hidden");

  const mindarThree = new MindARThree({
    container: arContainer,
    uiLoading: "yes",
    uiScanning: "no",
    uiError: "yes"
  });

  renderer = mindarThree.renderer;
  scene = mindarThree.scene;
  camera = mindarThree.camera;

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.5);
  scene.add(light);

  const loader = new GLTFLoader();

  loader.load("./stpatrick.glb", (gltf) => {

    model = gltf.scene;

    model.scale.set(1.2, 1.2, 1.2);
    model.position.set(0, 0, -2);

    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });

  });

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    if (mixer) mixer.update(clock.getDelta());
    renderer.render(scene, camera);
  });

});

captureBtn.addEventListener("click", () => {
  const dataURL = renderer.domElement.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "stpatrick-photo.png";
  link.click();
});
