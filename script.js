import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';

import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

import { setupLights } from "./modules/lights.js";
import { pick, randomAroundZero } from "./modules/random.js"

//import { dumpObjectToConsoleAsString } from "./modules/debug.js";


function setupCamera() {
    // The camera
    const camera = new THREE.PerspectiveCamera(
        30,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );
    // Make the camera further from the models so we can see them better
    camera.position.x = -150;
    camera.position.z = 300;
    camera.position.y = 150;
    return camera;
}

async function loadModel(url) {
    const loader = new GLTFLoader();
    try {
        console.log('loading', url)
        const loadedGLTF = await loader.loadAsync(url);
        const model = loadedGLTF.scene;
        return model;
    } catch (err) {
        console.error(`ERROR loading ${url}`, err)
        return null;
    }
}
async function setupAsync() {

    // The three.js scene: the 3D world where you put objects
    const scene = new THREE.Scene();

    const camera = setupCamera();

    const canvas = document.querySelector('canvas');

    let mouseX = 0;
    let mouseY = 0;
    canvas.addEventListener('mousemove', (ev) => {
        //normalise mouseX to be between -0.5 and 0.5
        mouseX = -0.5 + ev.clientX / canvas.clientWidth;
        mouseY = -0.5 + ev.clientY / canvas.clientHeight;
    })


    function makeCycler(arr) {
        let ix = 0;
        return function () {
            const ixToReturn = ix;
            ix = (ix + 1) % arr.length;
            return arr[ixToReturn];
        }
    }
    let camInfo;

    function makeCycleCamera() {

        const cam1Static = {
            update: (time) => {
                camera.position.x = 10 * Math.sin(time * 0.001);
                // camera.lookAt(octopusModel.position)
            }
        };
        const cam2 = {
            update: (time) => {
                const newCamPos = submarineModel.localToWorld(new THREE.Vector3(0, 0, -5));
                const camLookatPos = submarineModel.localToWorld(new THREE.Vector3(0, 0, 10));
                camera.position.copy(newCamPos);
                camera.lookAt(camLookatPos)
            }
        }

        const cam3 = {
            update: (time) => {
                const newCamPos = submarineModel.localToWorld(new THREE.Vector3(-10, 4, 0));
                const camLookatPos = submarineModel.localToWorld(new THREE.Vector3(0, 0, 0));
                camera.position.copy(newCamPos);
                camera.lookAt(camLookatPos)
            }
        }

        const cam4BabyCam = {
            update: (time) => {
                const newCamPos = submarineModel.localToWorld(new THREE.Vector3(-3, 1, 2));
                const camLookatPos = submarineModel.localToWorld(new THREE.Vector3(0, 0, 0));
                camera.position.copy(newCamPos);
                camera.lookAt(camLookatPos)
            }
        }

        const cam5Chase = {
            update: (time) => {
                const xOffset = Math.sin(time / 1000) * 1;
                const newCamPos = submarineModel.localToWorld(new THREE.Vector3(xOffset, 1, 10));
                const camLookatPos = submarineModel.localToWorld(new THREE.Vector3(0, 0, -100));
                camera.position.copy(newCamPos);
                camera.lookAt(camLookatPos)
            }
        }
        const cam6Octo = {
            update: (time) => {
                const newCamPos = submarineModel.localToWorld(new THREE.Vector3(5, 3, 1));
                newCamPos.y = 50;
                const camLookatPos = submarineModel.localToWorld(new THREE.Vector3(0, 0, 1));
                camera.position.copy(newCamPos);
                camera.lookAt(camLookatPos)
            }
        }
        const cycler = makeCycler([cam1Static, cam2, cam3, cam4BabyCam, cam5Chase, cam6Octo]);

        return function () {
            camInfo = cycler();
            return camInfo;
        }
    }

    const cycleCamera = makeCycleCamera();
    cycleCamera();
    canvas.addEventListener('keypress', (ev) => {
        if (ev.key === 'c') {
            cycleCamera();
        }
    })
    // The renderer: something that draws 3D objects onto the canvas
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xaaaaaa, 1);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 10, 0);
    controls.update();

    setupLights(scene);

    scene.add(new THREE.GridHelper(100))

    const submarineModel = await loadModel('./models/submarine_june2024.glb')
    scene.add(submarineModel);
    submarineModel.scale.set(10, 10, 10)

    const propeller = submarineModel.getObjectByName('sub_body').getObjectByName('sub_prop');
    const periscope = submarineModel.getObjectByName('sub_body').getObjectByName('sub_periscope');


    const octopusModel = await loadModel('./models/octopus.glb')
    scene.add(octopusModel);
    octopusModel.scale.set(30, 30, 30)
    octopusModel.rotation.y = Math.PI / 2;


    function render(timeMs) {

        const radius = 70;
        const angle = timeMs / 3000;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        submarineModel.position.x = x;
        submarineModel.position.z = z;


        const pitchAngle = -mouseY * Math.PI * 0.5;
        const steerAngle = Math.PI - angle + (Math.PI / 10);// -mouseX * Math.PI;
        const rollAngle = Math.sin(timeMs / 200) * 0.03;

        const myEuler = new THREE.Euler(pitchAngle, steerAngle, rollAngle, 'YXZ');
        submarineModel.setRotationFromEuler(myEuler)
        if (camInfo) {
            camInfo.update(timeMs);
        }
        //camera.lookAt(submarineModel.position)
        propeller.rotation.y += 0.1;
        periscope.rotation.z = Math.cos(timeMs / 1000) * Math.PI * 0.5;

        submarineModel.position.y += -mouseY;
        submarineModel.position.y = Math.min(submarineModel.position.y, 80)
        submarineModel.position.y = Math.max(submarineModel.position.y, 40)


        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    render();
}

setupAsync();

