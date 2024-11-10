import * as THREE from "three";
import AudioManager from "./static/managers/audiomanager.js";
import BPMManager from "./static/managers/bpmmanager.js";
// Import TSL (Three Shader Language) utilities for GPU computations
import {
    Fn,
    uniform,
    texture,
    instanceIndex,
    float,
    hash,
    vec3,
    storage,
    If,
} from "three/tsl";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const particleCount = 8300000;
// attractors buffer size + other stuff
// Keep as low as possible bc it loops this many times on the particle shader

const gravity = uniform(vec3(0, 0, 0));
const damping = uniform(0.9);
const size = uniform(0.1);

// temp attractor values
const attractorPosition = uniform(vec3(0, 0, 0));
const attractorRadius = uniform(10000.0);
const attractorStrength = uniform(0.0);

let camera, scene, renderer;
let stats, controls;
let computeParticles, updateAttractor;

let audioManager = null;

function init() {
    /* #region  Basic Scene */
    const { innerWidth, innerHeight } = window;
    camera = new THREE.PerspectiveCamera(
        50,
        innerWidth / innerHeight,
        0.1,
        1000
    );
    camera.position.set(40, 50, 25);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    /* #endregion */

    // create storage buffer,
    // used to store particle properties
    // eg position, velocity, etc
    const createBuffer = (count, size) => {
        // storage is from three - webgpu
        return storage(
            // storage buffer is from three - renderers - https://github.com/mrdoob/three.js/blob/dev/src/renderers/common/StorageInstancedBufferAttribute.js#L3
            new THREE.StorageInstancedBufferAttribute(count, size),
            size === 3 ? "vec3" : "float",
            count
        );
    };

    /* #region  Buffer Inits */
    // initialize buffers for position, velocity
    const positionBuffer = createBuffer(particleCount, 3);
    const velocityBuffer = createBuffer(particleCount, 3);
    const colorBuffer = createBuffer(particleCount, 3);
    // Attractor buffers
    const attractorPositionBuffer = createBuffer(1, 3);
    const attractorRadiusBuffer = createBuffer(1, 1);
    const attractorStrengthBuffer = createBuffer(1, 1);
    /* #endregion */

    // Particle Init Compute Shader
    const computeInit = Fn(() => {
        // storage has an method "element" that returns the element at the given index
        // at each index we have a storage instanced buffer attribute
        // so we can set the value of the buffer attribute at that index
        const position = positionBuffer.element(instanceIndex);
        const color = colorBuffer.element(instanceIndex);
        //const velocity = velocityBuffer.element(instanceIndex);

        const radius = hash(instanceIndex)
            .pow(1 / 3)
            .mul(50);
        const theta = hash(instanceIndex.add(1)).mul(Math.PI * 2); // 0 to 2PI
        const phi = hash(instanceIndex.add(2)).mul(2).sub(1).acos(); // 0 to PI

        position.x = radius.mul(phi.sin()).mul(theta.cos());
        position.y = radius.mul(phi.sin()).mul(theta.sin());
        position.z = radius.mul(phi.cos());

        color.assign(vec3(1, 1, 1));
    })().compute(particleCount);

    // Particle Update Compute Shader
    const computeUpdate = Fn(() => {
        // retrieve position and velocity from storage
        const position = positionBuffer.element(instanceIndex);
        const velocity = velocityBuffer.element(instanceIndex);
        const color = colorBuffer.element(instanceIndex);

        const attractorPositionB = attractorPositionBuffer.element(0);
        const attractorRadiusB = attractorRadiusBuffer.element(0);
        const attractorStrengthB = attractorStrengthBuffer.element(0);

        const toAttractor = attractorPositionB.sub(position);
        const distance = toAttractor.length();

        let magnitude = float(999999).pow(attractorRadiusB.sub(distance));
        magnitude = magnitude.clamp(0, 1);

        const direction = toAttractor.div(distance);
        const force = direction.mul(
            attractorStrengthB
                .div(distance.pow(2).clamp(20, 999999))
                .mul(magnitude)
        );

        velocity.addAssign(force);

        // apply gravity
        velocity.addAssign(gravity);

        // apply damping
        velocity.mulAssign(damping);

        position.addAssign(velocity);

        color.assign(vec3(
            force.length().add(position.length().div(50)), 
            attractorStrengthB.mul(position.length()).div(1000), 
            velocity.length().add(hash(instanceIndex))
        ));
    });

    // Update Attractor Compute Shader
    const updateAttractorShader = Fn(() => {
        const attractorPositionB = attractorPositionBuffer.element(0);
        attractorPositionB.x = attractorPosition.x;
        attractorPositionB.y = attractorPosition.y;
        attractorPositionB.z = attractorPosition.z;

        const attractorRadiusB = attractorRadiusBuffer.element(0);
        attractorRadiusB.x = attractorRadius;

        const attractorStrengthB = attractorStrengthBuffer.element(0);
        attractorStrengthB.x = attractorStrength;
    });

    /* #region  init compute shaders */
    // create compute shaders
    computeParticles = computeUpdate().compute(particleCount);
    // create add attractor compute shader
    updateAttractor = updateAttractorShader().compute(1);
    /* #endregion */

    /* #region  Particle Material */
    const particleMaterial = new THREE.SpriteNodeMaterial();
    particleMaterial.colorNode = colorBuffer.element(instanceIndex);
    particleMaterial.positionNode = positionBuffer.toAttribute();
    particleMaterial.scaleNode = size;
    particleMaterial.depthWrite = false;
    particleMaterial.depthTest = true;
    particleMaterial.transparent = true;
    /* #endregion */

    /* #region  Particle Mesh */
    // create particle mesh
    const particles = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.5),
        particleMaterial
    );
    //const particles = new THREE.Mesh(new THREE.SphereGeometry(0.5, 2, 2), particleMaterial);
    particles.count = particleCount;
    particles.frustumCulled = false;
    scene.add(particles);
    /* #endregion */

    // visual helpers
    const helper = new THREE.GridHelper(60, 40, 0x303030, 0x303030);
    scene.add(helper);

    /* #region  Renderer */
    renderer = new THREE.WebGPURenderer({
        antialias: true,
        trackTimestamp: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);
    /* #endregion */

    /* #region  FPS Counter */
    stats = new Stats();
    document.body.appendChild(stats.dom);
    /* #endregion */

    /* #region  Controls */
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
    /* #endregion */
    
    renderer.computeAsync(computeInit);
}

async function animate() {
    stats.update();

    // update attractor
    await renderer.computeAsync(updateAttractor);

    // compute particles
    await renderer.computeAsync(computeParticles);

    // render
    await renderer.renderAsync(scene, camera);

    if (audioManager !== null) {
        audioManager.update();
        //console.log(audioManager.frequencyData);
        // update strength
        //console.log(audioManager.frequencyData.low);
        if (audioManager.frequencyData.low*100 > 90) {
            console.log("highest");
            attractorStrength.value = Math.round((audioManager.frequencyData.low) * 300);
        } else if (audioManager.frequencyData.low*100 > 85) {
            console.log("high");
            attractorStrength.value = Math.round((audioManager.frequencyData.low) * 100);
        } else if (audioManager.frequencyData.low*100  > 80) {
            console.log("medium");
            attractorStrength.value = Math.round((audioManager.frequencyData.low) * 40);
        } else {
            attractorStrength.value = Math.round((audioManager.frequencyData.low) * 20);
        }

        attractorStrength.value += Math.round((audioManager.frequencyData.mid) * 25 * (255/(audioManager.frequencyData.low, 1, 255).clamp(1, 255)));
    }
}


document.body.addEventListener("auxclick", async () => {
    if (audioManager !== null) {
    if (audioManager.isPlaying) {
        audioManager.pause();
    } else {
        audioManager.play();
    }
    } else {
        audioManager = new AudioManager();
        await audioManager.loadAudio();
        audioManager.play();
    }
});

init();

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};