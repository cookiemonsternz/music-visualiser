// READ ONLY NON FUNCTIONAL USING AS A REFERENCE - https://threejs.org/examples/?q=webgpu#webgpu_compute_particles
// https://github.com/mrdoob/three.js/blob/master/examples/webgpu_compute_particles.html

// Import required Three.js modules and utilities
import * as THREE from 'three';
// Import TSL (Three Shader Language) utilities for GPU computations
import { Fn, uniform, texture, instanceIndex, float, hash, vec3, storage, If } from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// Configuration constants
const particleCount = 1000000;  // Total number of particles to simulate

// Physics parameters as uniforms (can be modified at runtime)
const gravity = uniform(-0.0098);  // Downward force
const bounce = uniform(0.8);     // Bounce coefficient (energy retained after collision)
const friction = uniform(0.99);   // Air resistance
const size = uniform(0.12);      // Particle size

// Store click position for interactive forces
const clickPosition = uniform(new THREE.Vector3());

// Global Three.js variables
let camera, scene, renderer;
let controls, stats;
let computeParticles;

// Reference to DOM element for displaying performance metrics
const timestamps = document.getElementById('timestamps');

function init() {
    // Setup basic Three.js scene
    const { innerWidth, innerHeight } = window;
    camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000);
    camera.position.set(15, 30, 15);
    scene = new THREE.Scene();

    // Load particle texture
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load('textures/sprite1.png');

    // Create storage buffers for particle properties
    const createBuffer = () => storage(
        new THREE.StorageInstancedBufferAttribute(particleCount, 3),
        'vec3',
        particleCount
    );

    // Initialize buffers for position, velocity, and color
    const positionBuffer = createBuffer();
    const velocityBuffer = createBuffer();
    const colorBuffer = createBuffer();

    // Compute shader for initializing particles
    const computeInit = Fn(() => {
        const position = positionBuffer.element(instanceIndex);
        const color = colorBuffer.element(instanceIndex);

        // Generate random positions and colors using hash function
        const randX = hash(instanceIndex);
        const randY = hash(instanceIndex.add(2));
        const randZ = hash(instanceIndex.add(3));

        // Set initial positions (spread across X and Z, Y at 0)
        position.x = randX.mul(100).add(-50);
        position.y = 0;
        position.z = randZ.mul(100).add(-50);

        // Assign random colors
        color.assign(vec3(randX, randY, randZ));
    })().compute(particleCount);

    // Compute shader for particle physics updates
    const computeUpdate = Fn(() => {
        const position = positionBuffer.element(instanceIndex);
        const velocity = velocityBuffer.element(instanceIndex);

        // Apply gravity and update position
        velocity.addAssign(vec3(0.00, gravity, 0.00));
        position.addAssign(velocity);

        // Apply air friction
        velocity.mulAssign(friction);

        // Handle floor collision
        If(position.y.lessThan(0), () => {
            position.y = 0;
            velocity.y = velocity.y.negate().mul(bounce);

            // Apply floor friction
            velocity.x = velocity.x.mul(0.9);
            velocity.z = velocity.z.mul(0.9);
        });
    });

    computeParticles = computeUpdate().compute(particleCount);

    // Setup particle material and rendering
    const textureNode = texture(map);
    const particleMaterial = new THREE.SpriteNodeMaterial();
    particleMaterial.colorNode = textureNode.mul(colorBuffer.element(instanceIndex));
    particleMaterial.positionNode = positionBuffer.toAttribute();
    particleMaterial.scaleNode = size;
    particleMaterial.depthWrite = false;
    particleMaterial.depthTest = true;
    particleMaterial.transparent = true;

    // Create particle system mesh
    const particles = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), particleMaterial);
    particles.count = particleCount;
    particles.frustumCulled = false;
    scene.add(particles);

    // Add visual helpers
    const helper = new THREE.GridHelper(60, 40, 0x303030, 0x303030);
    scene.add(helper);

    // Add invisible plane for mouse interaction
    const geometry = new THREE.PlaneGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);
    const plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(plane);

    // Setup raycasting for mouse interaction
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // Initialize WebGPU renderer
    renderer = new THREE.WebGPURenderer({ antialias: true, trackTimestamp: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    // Add stats panel for performance monitoring
    stats = new Stats();
    document.body.appendChild(stats.dom);

    // Initialize particle system
    renderer.computeAsync(computeInit);

    // Compute shader for handling mouse interaction
    const computeHit = Fn(() => {
        const position = positionBuffer.element(instanceIndex);
        const velocity = velocityBuffer.element(instanceIndex);

        // Calculate force based on distance from click
        const dist = position.distance(clickPosition);
        const direction = position.sub(clickPosition).normalize();
        const distArea = float(6).sub(dist).max(0);

        // Apply force with random variation
        const power = distArea.mul(0.01);
        const relativePower = power.mul(hash(instanceIndex).mul(0.5).add(0.5));
        velocity.assign(velocity.add(direction.mul(relativePower)));
    })().compute(particleCount);

    // Handle mouse movement
    function onMove(event) {
        pointer.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects([plane], false);

        if (intersects.length > 0) {
            const { point } = intersects[0];
            clickPosition.value.copy(point);
            clickPosition.value.y = -1;
            renderer.computeAsync(computeHit);
        }
    }

    // Add event listeners
    renderer.domElement.addEventListener('pointermove', onMove);

    // Setup camera controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 5;
    controls.maxDistance = 200;
    controls.target.set(0, 0, 0);
    controls.update();

    // Handle window resizing
    window.addEventListener('resize', onWindowResize);

    // Setup GUI controls
    const gui = new GUI();
    gui.add(gravity, 'value', -0.0098, 0, 0.0001).name('gravity');
    gui.add(bounce, 'value', 0.1, 1, 0.01).name('bounce');
    gui.add(friction, 'value', 0.96, 0.99, 0.01).name('friction');
    gui.add(size, 'value', 0.12, 0.5, 0.01).name('size');
}

// Handle window resize events
function onWindowResize() {
    const { innerWidth, innerHeight } = window;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
}

// Animation loop
async function animate() {
    stats.update();

    // Update particle physics
    await renderer.computeAsync(computeParticles);

    // Render the scene
    await renderer.renderAsync(scene, camera);

    // Update performance timestamps (every 5 frames)
    if (renderer.hasFeature('timestamp-query')) {
        if (renderer.info.render.calls % 5 === 0) {
            timestamps.innerHTML = `
                Compute ${renderer.info.compute.frameCalls} pass in ${renderer.info.compute.timestamp.toFixed(6)}ms<br>
                Draw ${renderer.info.render.drawCalls} pass in ${renderer.info.render.timestamp.toFixed(6)}ms`;
        }
    } else {
        timestamps.innerHTML = 'Timestamp queries not supported';
    }
}

// Start the application
init();