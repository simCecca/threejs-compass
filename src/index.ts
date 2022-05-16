import * as THREE from "three";
import Compass from "./utils/Compas";

const main = async () => {
  const canvas = document.querySelector("#c");
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const fov = 30;
  const z = 300;
  const aspectRatio = width / height;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 1, 55500);
  camera.position.set(0, 0, z);
  const compass = new Compass(camera, renderer);
  compass.setAllEvents();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  canvas.addEventListener("click", (event: any) => {
    event.preventDefault();
    const { clientX, clientY } = event;
    const { x, y } = compass.getWorldToCanvasCoordinates(clientX, clientY);
  });

  const render = (time) => {
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
};

main();
