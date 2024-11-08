import * as THREE from 'three';
// Import TSL (Three Shader Language) utilities for GPU computations
import { Fn, uniform, texture, instanceIndex, float, hash, vec3, storage, If } from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import Stats from 'three/addons/libs/stats.module.js';
//import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const particleCount = 1000000;

const gravity = uniform(vec3(0, -0.001, 0));
const bounce = uniform(0.8);
const size = uniform(0.05);


let camera, scene, renderer;
let computeParticles;

function init() {
    // basic scene
    const { innerWidth, innerHeight } = window;
    camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000);
    camera.position.set(15, 30, 15);
    scene = new THREE.Scene();

    // create storage buffer, 
    // used to store particle properties
    // eg position, velocity, etc
    const createBuffer = (type) => {
        // storage is from three - webgpu
        return storage(
            // storage buffer is from three - renderers - https://github.com/mrdoob/three.js/blob/dev/src/renderers/common/StorageInstancedBufferAttribute.js#L3
            new THREE.StorageInstancedBufferAttribute(particleCount, 3),
            'vec3',
            particleCount
        );
    }

    // initialize buffers for position, velocity
    const positionBuffer = createBuffer('vec3');
    const velocityBuffer = createBuffer('vec3');

    // compute shader for initializing particles
    const computeInit = Fn(() => {
        // storage has an method "element" that returns the element at the given index
        // at each index we have a storage instanced buffer attribute
        // so we can set the value of the buffer attribute at that index
        const position = positionBuffer.element(instanceIndex);
        const velocity = velocityBuffer.element(instanceIndex);

        const randX = hash(instanceIndex);
        const randY = hash(instanceIndex.add(1));
        const randZ = hash(instanceIndex.add(2));

        position.x = randX.mul(100).add(-50);
        position.y = randY.mul(100).add(-50);
        position.z = randZ.mul(100).add(-50);

        velocity.x = randX.mul(2).add(-1).mul(0.1);
        velocity.y = randY.mul(2).add(-1).mul(0.1);
        velocity.z = randZ.mul(2).add(-1).mul(0.1);
    })().compute(particleCount);

    // create update compute shader
    const computeUpdate = Fn(() => {
        // retrieve position and velocity from storage
        const position = positionBuffer.element(instanceIndex);
        const velocity = velocityBuffer.element(instanceIndex);

        // apply gravity
        velocity.addAssign(gravity);
        position.addAssign(velocity);

        // handle floor collision
        If(position.y.lessThan(0), () => {
            position.y = 0;
            velocity.y = velocity.y.negate().mul(bounce);
        });
    });

    // create compute shader
    computeParticles = computeUpdate().compute(particleCount);

    const particleMaterial = new THREE.SpriteNodeMaterial();
    particleMaterial.colorNode = vec3(1, 0, 0);
    particleMaterial.positionNode = positionBuffer.toAttribute();
    particleMaterial.scaleNode = size;
    particleMaterial.depthWrite = false;
    particleMaterial.depthTest = true;
    particleMaterial.transparent = true;

    // create particle mesh
    const particles = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), particleMaterial);
    particles.count = particleCount;
    particles.frustumCulled = true;
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

    renderer.computeAsync(computeInit);

    
    // controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 5;
    controls.maxDistance = 200;
    controls.target.set(0, 0, 0);
    controls.update();
}

async function animate() {
    // compute particles
    await renderer.computeAsync(computeParticles);

    // render
    await renderer.renderAsync(scene, camera);
}

init();