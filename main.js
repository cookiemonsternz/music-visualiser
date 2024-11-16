import * as THREE from "three/webgpu";
import AudioManager from "./static/managers/audiomanager.js";
//import BPMManager from "./static/managers/bpmmanager.js";
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
    pass,
} from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { Stats } from "three/addons/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { parseBlob } from "music-metadata";
import { MusicBrainzApi } from "musicbrainz-api";
import { cover } from "three/src/extras/TextureUtils.js";
//import { lensflare } from 'three/addons/tsl/display/LensflareNode.js';

//import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const particleCount = 300000;
// attractors buffer size + other stuff
// Keep as low as possible bc it loops this many times on the particle shader

const gravity = uniform(vec3(0, 0, 0));
const damping = uniform(0.9);
const size = uniform(0.5);

const timeScale = uniform(1.0);

// temp attractor values
const attractorPosition = uniform(vec3(0, 0, 0));
const attractorRadius = uniform(1000.0);
const attractorStrength = uniform(0.0);

let camera, scene, renderer, postProcessing;
let stats, controls;
let computeParticles, updateAttractor;

let audioManager = null;

async function init() {
    //await document.body.requestFullscreen();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    /* #region  Basic Scene */
    const { innerWidth, innerHeight } = window;
    camera = new THREE.PerspectiveCamera(
        50,
        innerWidth / innerHeight,
        0.1,
        1000
    );
    camera.position.set(10, 0, 10);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    /* #endregion */

    // Load particle texture
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load("./static/particle.png");

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
    const transparentBuffer = createBuffer(particleCount, 1);
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
        const transparent = transparentBuffer.element(instanceIndex);
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
        transparent.x = float(1);
    })().compute(particleCount);

    // Particle Update Compute Shader
    const computeUpdate = Fn(() => {
        // retrieve position and velocity from storage
        const position = positionBuffer.element(instanceIndex);
        const velocity = velocityBuffer.element(instanceIndex);
        const color = colorBuffer.element(instanceIndex);
        const transparent = transparentBuffer.element(instanceIndex);

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

        position.addAssign(velocity.mul(timeScale));

        transparent.x = float(1).sub(position.length().div(55));

        //transparent.x = position.sub(camera.position).length().div(30);

        color.assign(
            vec3(
                force.length().add(position.length().div(50)),
                attractorStrengthB.mul(position.length()).div(1000),
                velocity.length().add(hash(instanceIndex))
            )
        );
        If(attractorStrengthB.lessThan(float(0)), () => {
            color.assign(vec3(1, 1, 1));
        });
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
    const textureNode = texture(map);
    const particleMaterial = new THREE.SpriteNodeMaterial();
    particleMaterial.colorNode = textureNode.mul(
        colorBuffer.element(instanceIndex)
    );
    particleMaterial.positionNode = positionBuffer.toAttribute();
    particleMaterial.scaleNode = size;
    particleMaterial.depthWrite = false;
    particleMaterial.depthTest = true;
    particleMaterial.transparent = true;
    particleMaterial.opacityNode = transparentBuffer.element(instanceIndex);
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
    //const helper = new THREE.GridHelper(60, 40, 0x303030, 0x303030);
    //scene.add(helper);

    /* #region  Renderer */
    renderer = new THREE.WebGPURenderer({
        antialias: true,
        trackTimestamp: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = "-1";
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

    const scenePass = pass(scene, camera);
    // ( node, strength, radius, threshold )
    //const dofPass = dof( scenePass.getTextureNode(), scenePass.getViewZNode(), 5, 1000.7, 0.01 );
    const processPass = bloom(scenePass, 1, 0.5, 0.4);
    //const process2Pass = scenePass.add( lensflare( scenePass ) );
    const mergedPass = scenePass.add(processPass);

    postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputNode = mergedPass;
}

async function onHit() {
    let scenePass = pass(scene, camera);
    // depth buffer
    const scenePassColor = scenePass.getTextureNode();
    const scenePassViewZ = scenePass.getViewZNode();

    const processPass = dof(scenePassColor, scenePassViewZ, 1, 0.01, 0.1);
    postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputNode = processPass;
    // // wait 3 sec
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    // console.log("done");
    // // remove dof
    // postProcessing = new THREE.PostProcessing( renderer );
    // scenePass = pass( scene, camera );
    // postProcessing.outputNode = scenePass;
}

async function animate() {
    stats.update();

    // update attractor
    await renderer.computeAsync(updateAttractor);

    // compute particles
    await renderer.computeAsync(computeParticles);

    // render
    await postProcessing.renderAsync();

    if (audioManager !== null) {
        audioManager.update();
        //console.log(audioManager.frequencyData);
        // update strength
        //console.log(audioManager.frequencyData.low);
        if (
            audioManager.frequencyData.low * 100 >
            audioManager.thresholds.highest
        ) {
            //console.log("highest");
            attractorStrength.value = -Math.round(
                audioManager.frequencyData.low * 300
            );
            cameraUp();
            audioManager.onHit("highest");
        } else if (
            audioManager.frequencyData.low * 100 >
            audioManager.thresholds.high
        ) {
            //console.log("high");
            attractorStrength.value = Math.round(
                audioManager.frequencyData.low * 100
            );
            audioManager.onHit("high");
        } else if (
            audioManager.frequencyData.low * 100 >
            audioManager.thresholds.medium
        ) {
            //console.log("medium");
            attractorStrength.value = Math.round(
                audioManager.frequencyData.low * 40
            );
            audioManager.onHit("medium");
        } else {
            attractorStrength.value = Math.round(
                audioManager.frequencyData.low * 20
            );
        }
        attractorStrength.value += Math.round(
            audioManager.frequencyData.mid *
                40 *
                (255 / (audioManager.frequencyData.low, 1, 255).clamp(1, 255))
        );
    }
    if (camera.fov < 70) {
        camera.fov += 0.25;
        camera.updateProjectionMatrix();
    }
    // orbit camera
    //console.log(audioManager.frequencyData.low);
    camera.position.x =
        Math.sin(
            performance.now() *
                ((audioManager.frequencyData.low, 0.01) / 100).clamp(0, 1)
        ) * 60;
    camera.position.z =
        Math.cos(
            performance.now() *
                ((audioManager.frequencyData.low, 0.01) / 100).clamp(0, 1)
        ) * 60;
    camera.lookAt(0, 0, 0);
}

/*
document.body.addEventListener("keydown", async () => {
    if (audioManager !== null) {
        if (audioManager.isPlaying) {
            audioManager.pause();
        } else {
            audioManager.play();
        }
    } else {
        init();
        
        audioManager.play();
    }
});
*/

async function loadSong() {
    audioManager = new AudioManager();
    await audioManager.loadAudio();
    document.getElementById("songTitle").innerText = audioManager.song.title;
    document.getElementById("songArtist").innerText = audioManager.song.artist;
    document.getElementById("songAlbum").innerText = audioManager.song.album;
    document.getElementById("albumCover").src = audioManager.song.albumCover;
    document.getElementById("songDuration").innerText =
        audioManager.song.duration;
}

function cameraUp() {
    camera.fov = 25;
    camera.updateProjectionMatrix();
}

async function readFile(file) {
    var url = window.URL.createObjectURL(file);
    audioManager = new AudioManager();
    await audioManager.loadAudio(url);
    await setSongDetails(file);
    await init();
    audioManager.play();
    document.getElementById("app").style.opacity = 0.5;
    document.getElementById("app").style.brightness = 0.5;
}

async function openDialogCommand(fileTypes) {
    var theDialog = $(
        '<input type="file" accept="' + fileTypes + '" style="display: none;">'
    );
    $(theDialog).change(function (event) {
        if (this.files.length > 0) {
            audioManager = null;
            readFile(this.files[0]);
        }
    });
    $("body").append(theDialog);
    $(theDialog).trigger("click");
}

async function loadLocalFile() {
    if (audioManager !== null) {
        audioManager.pause();
    }
    openDialogCommand(".mp3,.wav,.flac,.m4a,.aac,.ogg,.aiff,.alac,.wma,.opus");
}

async function setSongDetails(file) {
    console.log(file);

    const metadata = await parseBlob(file);
    console.log(metadata);
    console.log(metadata.common.isrc);

    /* #region  Music Cover Art */
    let coverResult = await getCoverArt(metadata);
    console.log(coverResult);
    /* #endregion */

    document.getElementById("songTitle").innerText = metadata.common.title
        ? metadata.common.title.toTitleCase()
        : "Unknown";
    document.getElementById("songArtist").innerText = metadata.common.artist
        ? metadata.common.artist.toTitleCase()
        : "Unknown";
    document.getElementById("songAlbum").innerText = metadata.common.album
        ? metadata.common.album.toTitleCase()
        : "Unknown";
    document.getElementById("albumCover").src = coverResult
        ? coverResult.url
        : "./static/defaultAlbumCover.jpg";
    document.getElementById("songDuration").innerText = metadata.format.duration
        ? String(
              Math.floor(metadata.format.duration / 60) +
                  ":" +
                  Math.floor(metadata.format.duration % 60)
          )
        : "Unknown";
    //}
}
//init();

async function getCoverArt(metadata) {
    // Get song from MusicBrainz
    let searchResults, coverResult;
    if (metadata.common.artist ? true : false) {
        const query = `query="${metadata.common.title}" + artistname:${metadata.common.artist} + recording:${metadata.common.title} + release:${metadata.common.album}`;
        searchResults = await mbApi.search("recording", { query });
    }

    // Filter search results for official version
    //let coverResult = null;

    // First pass: Filter recordings
    let filteredRecordings = [];
    for (const recording of searchResults.recordings) {
        if (recording.disambiguation) continue;
        if (
            recording["artist-credit"][0].name.toLowerCase() !==
            metadata.common.artist.toLowerCase()
        )
            continue;
        if (recording.releases[0].status !== "Official") continue;

        filteredRecordings.push(recording);
    }

    if (filteredRecordings.length) {
        const tempResult = filteredRecordings[0];
        filteredRecordings = [];

        // Second pass: Filter releases
        let filteredReleases = [];
        for (const release of tempResult.releases) {
            if (release.disambiguation) continue;
            if (release.status !== "Official") continue;
            if (
                !release.title
                    .toLowerCase()
                    .includes(metadata.common.album.toLowerCase())
            )
                continue;

            filteredReleases.push(release);
        }

        if (filteredReleases.length) {
            // Get cover art from coverartarchive
            if (filteredReleases[0].id) {
                for (let i = 0; i < 5; i++) {
                    const id = filteredReleases[i].id;
                    coverResult = await fetch(
                        `https://coverartarchive.org/release/${id}/front`,
                        { method: "GET" }
                    );
                    if (coverResult.ok) {
                        break;
                    }
                }
            }
        }
    }
    return coverResult;
}

document.getElementById("loadLocalButton").addEventListener("click", () => {
    loadLocalFile();
});

/* #region MusicBrainz API */
const mbApi = new MusicBrainzApi({
    appName: "Three.js Music Visualizer",
    appVersion: "0.1.0",
    appContactInfo: "christopherbbody@gmail.com",
});

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
Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
