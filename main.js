import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { ARButton } from 'https://unpkg.com/three@0.160.0/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
let model, mixer;
let portal, logo;
let clock = new THREE.Clock();
let placed = false;

const enterBtn = document.getElementById("enterAR");

enterBtn.addEventListener("click", initAR);

function initAR() {

  if (!navigator.xr) {
    alert("WebXR não suportado neste dispositivo.");
    return;
  }

  enterBtn.style.display = "none";

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(
    ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] })
  );

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const loader = new GLTFLoader();
  loader.load("modelo.glb", (gltf) => {
    model = gltf.scene;

    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) =>
        mixer.clipAction(clip).play()
      );
    }
  });

  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {

  if (frame && model && !placed) {

    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    session.requestReferenceSpace("viewer").then((viewerSpace) => {
      session.requestHitTestSource({ space: viewerSpace }).then((source) => {

        const hits = frame.getHitTestResults(source);

        if (hits.length > 0) {

          const hit = hits[0];
          const pose = hit.getPose(referenceSpace);

          const groundPos = new THREE.Vector3(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
          );

          const direction = new THREE.Vector3(0, 0, -1);
          direction.applyQuaternion(camera.quaternion);

          const finalPos = groundPos.clone().add(
            direction.multiplyScalar(2.4)
          );

          finalPos.y = groundPos.y;

          model.position.copy(finalPos);
          scene.add(model);

          placed = true;
        }
      });
    });
  }

  if (mixer) mixer.update(clock.getDelta());

  renderer.render(scene, camera);
}
