import * as THREE from 'https://esm.sh/three@0.160.0';
import { ARButton } from 'https://esm.sh/three@0.160.0/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const enterBtn = document.getElementById("enterAR");
const modelViewer = document.getElementById("iosAR");

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

enterBtn.addEventListener("click", () => {

  if (isIOS) {
    // iPhone → usar AR nativo
    modelViewer.style.display = "block";
    modelViewer.activateAR();
    return;
  }

  // Android/Desktop → usar WebXR
  if (!navigator.xr) {
    alert("WebXR não suportado.");
    return;
  }

  initWebXR();
});

function initWebXR(){

  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  let renderer = new THREE.WebGLRenderer({alpha:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(
    ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] })
  );

  const light = new THREE.HemisphereLight(0xffffff,0xbbbbff,1);
  scene.add(light);

  const loader = new GLTFLoader();
  loader.load("modelo.glb", (gltf) => {
    scene.add(gltf.scene);
  });

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

}
