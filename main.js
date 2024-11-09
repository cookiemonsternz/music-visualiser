import * as THREE from 'three';
// Import TSL (Three Shader Language) utilities for GPU computations
import { Fn, uniform, texture, instanceIndex, float, hash, vec3, storage, If } from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const particleCount = 8300000;
// attractors buffer size + other stuff
// Keep as low as possible bc it loops this many times on the particle shader
const maxAttractors = 10;

const gravity = uniform(vec3(0, 0, 0));
const damping = uniform(0.99);
const size = uniform(0.05);
const activeAttractorCount = uniform(0); // Number of active attractors

// temp attractor values
let attractorPosition = vec3(0, 0, 0);
let attractorRadius = 100.0;
let attractorStrength = 2.0;



let camera, scene, renderer;
let stats, controls;
let computeParticles, addAttractor;

function init() {
    // basic scene
    const { innerWidth, innerHeight } = window;
    camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000);
    camera.position.set(40, 50, 25);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // create storage buffer, 
    // used to store particle properties
    // eg position, velocity, etc
    const createBuffer = (count, size) => {
        // storage is from three - webgpu
        return storage(
            // storage buffer is from three - renderers - https://github.com/mrdoob/three.js/blob/dev/src/renderers/common/StorageInstancedBufferAttribute.js#L3
            new THREE.StorageInstancedBufferAttribute(count, size),
            size === 3 ? 'vec3' : 'float',
            count
        );
    }

    // initialize buffers for position, velocity
    const positionBuffer = createBuffer(particleCount, 3);
    const velocityBuffer = createBuffer(particleCount, 3);
    const colorBuffer = createBuffer(particleCount, 3);
    // Attractor buffers
    const attractorPositionBuffer = createBuffer(maxAttractors, 3);
    const attractorRadiusBuffer = createBuffer(maxAttractors, 1);
    const attractorStrengthBuffer = createBuffer(maxAttractors, 1);


    // compute shader for initializing particles
    const computeInit = Fn(() => {
        // storage has an method "element" that returns the element at the given index
        // at each index we have a storage instanced buffer attribute
        // so we can set the value of the buffer attribute at that index
        const position = positionBuffer.element(instanceIndex);
        const color = colorBuffer.element(instanceIndex);
        //const velocity = velocityBuffer.element(instanceIndex);

        const radius = hash(instanceIndex).pow(1/3).mul(50);
        const theta = hash(instanceIndex.add(1)).mul(Math.PI * 2); // 0 to 2PI
        const phi = hash(instanceIndex.add(2)).mul(2).sub(1).acos(); // 0 to PI

        position.x = radius.mul(phi.sin()).mul(theta.cos());
        position.y = radius.mul(phi.sin()).mul(theta.sin());
        position.z = radius.mul(phi.cos());

        color.assign(vec3(hash(instanceIndex), hash(instanceIndex.add(1)), hash(instanceIndex.add(2))));
    })().compute(particleCount);

    // create update compute shader
    const computeUpdate = Fn(() => {
        // retrieve position and velocity from storage
        const position = positionBuffer.element(instanceIndex);
        const velocity = velocityBuffer.element(instanceIndex);


        let i = 0;
        for (i; i < maxAttractors; i++) {
            //const isActiveAttractor = float(i).lessThan(float(activeAttractorCount));
            const attractorPositionB = attractorPositionBuffer.element(i);
            const attractorRadiusB = attractorRadiusBuffer.element(i);
            const attractorStrengthB = attractorStrengthBuffer.element(i);

            const toAttractor = attractorPositionB.sub(position);
            const distance = toAttractor.length();

            let magnitude = float(999999).pow(attractorRadiusB.sub(distance))
            magnitude = magnitude.clamp(0, 1);

            const direction = toAttractor.div(distance);
            const force = direction.mul(attractorStrengthB.div(distance.pow(2).clamp(50, 999999)).mul(magnitude))
            velocity.addAssign(force);
        }

        // apply forces
        //velocity.addAssign(totalForce);
        velocity.addAssign(gravity);
        //velocity.mulAssign(damping);

        position.addAssign(velocity);

    });

    const addAttractorShader = Fn(() => {
        const index = float(activeAttractorCount);
        If(index.lessThan(maxAttractors), () => {
            const attractorPositionB = attractorPositionBuffer.element(index);
            attractorPositionB.x = attractorPosition.x;
            attractorPositionB.y = attractorPosition.y;
            attractorPositionB.z = attractorPosition.z;
    
            const attractorRadiusB = attractorRadiusBuffer.element(index);
            attractorRadiusB.x = attractorRadius;
    
            const attractorStrengthB = attractorStrengthBuffer.element(index);
            attractorStrengthB.x = attractorStrength;
            //console.log("ADDed ATTRACTOR");
        });
    });

    // create compute shader
    computeParticles = computeUpdate().compute(particleCount);

    // create add attractor compute shader
    addAttractor = addAttractorShader().compute(1);

    const particleMaterial = new THREE.SpriteNodeMaterial();
    particleMaterial.colorNode = colorBuffer.element(instanceIndex);
    particleMaterial.positionNode = positionBuffer.toAttribute();
    particleMaterial.scaleNode = size;
    particleMaterial.depthWrite = false;
    particleMaterial.depthTest = true;
    particleMaterial.transparent = true;
    // create particle mesh
    const particles = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), particleMaterial);
    //const particles = new THREE.Mesh(new THREE.SphereGeometry(0.5, 2, 2), particleMaterial);
    particles.count = particleCount;
    particles.frustumCulled = false;
    scene.add(particles);

    // visual helpers
    const helper = new THREE.GridHelper(60, 40, 0x303030, 0x303030);
    scene.add(helper);

    // renderer
    renderer = new THREE.WebGPURenderer({ antialias: true, trackTimestamp: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    renderer.setAnimationLoop(animate);

    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    renderer.computeAsync(computeInit);

    //renderer.computeAsync(addAttractor);

    
    // controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 5;
    controls.maxDistance = 200;
    controls.target.set(0, 0, 0);
    controls.update();
}

async function animate() {
    stats.update();
    // compute particles
    await renderer.computeAsync(computeParticles);

    // render
    await renderer.renderAsync(scene, camera);
}

init();

document.addEventListener('click', () => {
    //console.log("ADDING ATTRACTOR");
    attractorPosition = vec3(Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50);
    renderer.computeAsync(addAttractor);
    activeAttractorCount.value++;
});