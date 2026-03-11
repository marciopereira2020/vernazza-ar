import * as THREE from 'https://esm.sh/three@0.160.0';
import { ARButton } from 'https://esm.sh/three@0.160.0/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const enterBtn = document.getElementById("enterAR");
const iosLink = document.getElementById("iosAR");

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

enterBtn.addEventListener("click", () => {

  // 🍎 iPhone → usar AR nativo
  if (isIOS) {
    iosLink.click();
    return;
  }

  // 🤖 Android → usar WebXR
  if (!navigator.xr) {
    alert("WebXR não suportado neste dispositivo.");
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

  let renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(
    ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] })
  );

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const loader = new GLTFLoader();
  let model;
  let placed = false;

  loader.load("modelo.glb", (gltf) => {
    model = gltf.scene;
  });

  renderer.setAnimationLoop((timestamp, frame) => {

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

    renderer.render(scene, camera);
  });
}
