window.onerror = function(message, source, lineno) {
  alert("Erro: " + message + " Linha: " + lineno);
};
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { ARButton } from 'https://unpkg.com/three@0.160.0/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
let model, mixer;
let portal, logo;
let clock = new THREE.Clock();
let placed = false;

const enterBtn = document.getElementById("enterAR");
const photoBtn = document.getElementById("photoBtn");
const videoBtn = document.getElementById("videoBtn");
const controls = document.getElementById("controls");
const countdownEl = document.getElementById("countdown");

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

enterBtn.addEventListener("click", initAR);

function initAR(){
  alert("Botão clicado");

  if (!navigator.xr) {
    alert("WebXR não disponível");
  } else {
    alert("WebXR detectado");
  }
}

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 20);

  renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.xr.enabled=true;

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(ARButton.createButton(renderer,{requiredFeatures:['hit-test']}));

  const hemiLight = new THREE.HemisphereLight(0xffffff,0xbbbbff,1);
  scene.add(hemiLight);

  const loader = new GLTFLoader();
  loader.load('modelo.glb',gltf=>{
    model=gltf.scene;

    if(gltf.animations.length>0){
      mixer=new THREE.AnimationMixer(model);
      gltf.animations.forEach(clip=>mixer.clipAction(clip).play());
    }
  });

  renderer.setAnimationLoop(render);
}

function createPortal(position){

  const geo = new THREE.RingGeometry(0.4,1.2,64);
  const mat = new THREE.MeshBasicMaterial({
    color:0x00ff88,
    side:THREE.DoubleSide,
    transparent:true,
    opacity:0.9
  });

  portal = new THREE.Mesh(geo,mat);
  portal.position.set(position.x,position.y+2.2,position.z);
  portal.scale.set(0.1,0.1,0.1);
  portal.userData.growing=true;

  scene.add(portal);
}

function createLogo(position){

  const texture = new THREE.TextureLoader().load("logo.png");

  const geo = new THREE.PlaneGeometry(1.4,0.7);
  const mat = new THREE.MeshBasicMaterial({
    map:texture,
    transparent:true,
    opacity:0
  });

  logo = new THREE.Mesh(geo,mat);
  logo.position.set(position.x,position.y+2.2,position.z);

  scene.add(logo);
}

function render(timestamp,frame){

  if(frame && model && !placed){

    const refSpace=renderer.xr.getReferenceSpace();
    const session=renderer.xr.getSession();

    session.requestReferenceSpace('viewer').then(viewer=>{
      session.requestHitTestSource({space:viewer}).then(source=>{
        const hits=frame.getHitTestResults(source);

        if(hits.length>0){

          const hit=hits[0];
          const pose=hit.getPose(refSpace);

          const groundPos=new THREE.Vector3(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
          );

          const direction=new THREE.Vector3(0,0,-1);
          direction.applyQuaternion(camera.quaternion);

          const finalPos=groundPos.clone().add(direction.multiplyScalar(2.4));
          finalPos.y=groundPos.y;

          model.position.copy(finalPos);
          scene.add(model);

          createPortal(finalPos);
          createLogo(finalPos);

          controls.style.display="flex";
          placed=true;
        }
      });
    });
  }

  if(portal){
    portal.rotation.z+=0.05;

    if(portal.userData.growing){
      portal.scale.x+=0.05;
      portal.scale.y+=0.05;

      if(portal.scale.x>=1){
        portal.userData.growing=false;
        if(logo) logo.material.opacity=1;

        setTimeout(()=>{
          scene.remove(portal);
        },800);
      }
    }
  }

  if(logo && logo.material.opacity>0){
    logo.rotation.y+=0.01;
    logo.position.y+=Math.sin(Date.now()*0.002)*0.002;
  }

  if(mixer) mixer.update(clock.getDelta());
  renderer.render(scene,camera);
}


