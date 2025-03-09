import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(0, 25, 75);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.maxDistance = 100;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 0, 0);
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
light.castShadow = true;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambientLight);

light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.bias = -0.002;

const geo = new THREE.PlaneGeometry(10000, 10000),
  mat = new THREE.MeshLambertMaterial(),
  mesh = new THREE.Mesh(geo, mat);
mesh.position.set(0, -0.1, 0);
mesh.rotation.set(Math.PI / -2, 0, 0);
scene.add(mesh);

const path = window.location.pathname,
  parts = path.split("/"),
  lastPart = parts[parts.length - 1];

const loader = new GLTFLoader().setPath("./public/" + lastPart + "/");
loader.load(
  "scene.gltf",
  (gltf) => {
    console.log("loading model");
    const mesh = gltf.scene;

    mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    mesh.position.set(0, 0, 0);
    scene.add(mesh);

    document.getElementById("progress-container").style.display = "none";
  },
  (xhr) => {
    document.getElementById("progress").innerHTML =
      "Loading " + (xhr.loaded / xhr.total) * 100 + "%";
  },
  (error) => {
    document.getElementById("progress").innerHTML = "Not found " + lastPart;
  }
);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (camera.position.y < 1) camera.position.y = 1;
  if (controls.target.y < 1) controls.target.y = 1;

  renderer.render(scene, camera);
}

animate();
