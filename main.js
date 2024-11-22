import * as THREE from "three/webgpu";
import AudioManager from "./static/managers/audiomanager.js";

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
//import { Stats } from "three/addons/libs/stats.module.js";
import { parseBlob } from "music-metadata";
//import { MusicBrainzApi } from "musicbrainz-api";

let particleCount = 300000;
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


const colorPreset = uniform(0);

let camera, scene, renderer, postProcessing, pass1, pass2;
let stats;
let computeParticles, updateAttractor;
let psychoticMode = false;

let audioManager = null;
let songLoaded = false;
let doingProcessEffect = false;
async function init() {
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
        If(colorPreset.equal(0), () => {
            color.assign(
                vec3(
                    force.length().add(position.length().div(50)),
                    attractorStrengthB.mul(position.length()).div(1000),
                    velocity.length().add(hash(instanceIndex))
                )
            );
        }).ElseIf(colorPreset.equal(1), () => {
            color.assign(
                vec3(
                    //attractorStrengthB.div(float(1).add(attractorStrengthB.abs()).add(attractorStrengthB)).abs().div(2),
                    force.length().add(position.length().div(50)).mul(attractorStrengthB).div(75),
                    attractorStrengthB.div(80).mul(position.length().div(2).pow(2)).clamp(0, 1),
                    velocity.length().mul(1.5).clamp(0, 1).add(hash(instanceIndex).mul(0.5))
                )
            );
        }).ElseIf(colorPreset.equal(2), () => {
            color.assign(
                vec3(
                    velocity.length().sin().add(0.1).mul(attractorStrengthB).clamp(0, 3),
                    attractorStrengthB.mul(velocity.length().div(30)),
                    attractorStrengthB.mul(velocity.length().div(300)).clamp(0, 0.8)
                )
            );
        }).ElseIf(colorPreset.equal(3), () => {
            color.assign(
                vec3(
                    velocity.length().sin().add(0.1).mul(attractorStrengthB.div(position.length().mul(5))).clamp(0, 2),
                    attractorStrengthB.mul(velocity.length().div(300)).clamp(0, 2),
                    velocity.length().add(hash(instanceIndex)).mul(2)
                )
            );
        });
        
        
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
    particles.count = particleCount;
    particles.frustumCulled = false;
    scene.add(particles);
    /* #endregion */

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
    //stats = new Stats();
    //document.body.appendChild(stats.dom);
    /* #endregion */

    renderer.computeAsync(computeInit);
    if (!psychoticMode) {
        const scenePass = pass(scene, camera);
        const bloomMult = -particleCount / 1000000 + 1.8;
        const processPass = bloom(scenePass, 1 * bloomMult, 0, 0.25);
        pass1 = scenePass.add(processPass);

        pass2 = scenePass.add(processPass);

        postProcessing = new THREE.PostProcessing(renderer);
        postProcessing.outputNode = pass1;
    } else {
        const scenePass = pass(scene, camera);
        const bloomMult = -particleCount / 1000000 + 1.8;
        const processPass = bloom(scenePass, 0.8 * bloomMult, 0.1, 0.25);
        pass1 = scenePass.add(processPass);
        // Str, Rad, Thr
        const processPass2 = bloom(scenePass, 500 * bloomMult, 5, 0.1);

        pass2 = scenePass.add(processPass2);

        postProcessing = new THREE.PostProcessing(renderer);
        postProcessing.outputNode = pass1;
    }
}

async function onHit() {
    if (doingProcessEffect) return;
    doingProcessEffect = true;
    postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputNode = pass2;
    if (psychoticMode) {
        timeScale.value = 0.1;
    } else {
        timeScale.value = 0.85;
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    if(!psychoticMode) {
        timeScale.value = 1.0;
    } else {
        timeScale.value = 1.25;
    }
    postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputNode = pass1;
    doingProcessEffect = false;
}

async function animate() {
    //stats.update();

    // update attractor
    await renderer.computeAsync(updateAttractor);

    // compute particles
    await renderer.computeAsync(computeParticles);

    // render
    await postProcessing.renderAsync();

    let strMultiplier = 1;
    if (psychoticMode) {
        strMultiplier = Math.sin(performance.now() / 1000) * 0.5 + 1;
    }

    if (audioManager !== null) {
        if (audioManager.audio !== null && audioManager.audioContext !== null) {
            audioManager.update();
            if(!doingProcessEffect) {
                timeScale.value = audioManager.frequencyData.low + 0.5;
                console.log(timeScale.value);     
            }
            
            if (
                audioManager.frequencyData.low * 100 >
                audioManager.thresholds.highest
            ) {
                attractorStrength.value = -Math.round(
                    audioManager.frequencyData.low * 150
                );
                cameraUp();
                audioManager.onHit("highest");
            } else if (
                audioManager.frequencyData.low * 100 >
                audioManager.thresholds.high
            ) {
                attractorStrength.value = Math.round(
                    audioManager.frequencyData.low * 100
                );
                audioManager.onHit("high");
            } else if (
                audioManager.frequencyData.low * 100 >
                audioManager.thresholds.medium
            ) {
                attractorStrength.value = Math.round(
                    audioManager.frequencyData.low * 40 * strMultiplier
                );
                audioManager.onHit("medium");
            } else {
                attractorStrength.value = Math.round(
                    audioManager.frequencyData.low * 20 * strMultiplier
                );
            }
            attractorStrength.value += Math.round(
                audioManager.frequencyData.mid *
                    40 *
                    (255 /
                        (audioManager.frequencyData.low, 1, 255).clamp(
                            1,
                            255
                        )) *
                    strMultiplier
            );
            // orbit camera
            camera.position.x =
                Math.sin(
                    performance.now() *
                        (
                            (audioManager.getFrequencyBand(125, 500) - 0.5,
                            0.03) / 100
                        ).clamp(-1, 1)
                ) * 60;
            camera.position.z =
                Math.cos(
                    performance.now() *
                        (
                            (audioManager.getFrequencyBand(125, 500) - 0.5,
                            0.03) / 100
                        ).clamp(-1, 1)
                ) * 60;
            camera.lookAt(0, 0, 0);
        }
    } else {
        // orbit camera
        camera.position.x = Math.sin(performance.now() * 0.0003) * 60;
        camera.position.z = Math.cos(performance.now() * 0.0003) * 60;
        camera.lookAt(0, 0, 0);
    }
    if (camera.fov < 70) {
        if (!psychoticMode) {
            camera.fov += 0.5;
        } else {
            camera.fov += Math.random() * 2;
        }
        camera.updateProjectionMatrix();
    }
}

function cameraUp() {
    if (!psychoticMode) {
        camera.fov = 60;
    } else {
        camera.fov = 10;
    }
    camera.updateProjectionMatrix();
    onHit();
}

async function readFile(file) {
    var url = window.URL.createObjectURL(file);
    audioManager = new AudioManager();
    await audioManager.loadAudio(url);
    await setSongDetails(file);
    await init();
    audioManager.play();
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
    songLoaded = true;
    if (audioManager !== null) {
        audioManager.pause();
    }
    document.getElementById("songTitle").innerText = "Loading...";
    document.getElementById("songArtist").innerText = "Loading...";
    document.getElementById("songAlbum").innerText = "Loading...";
    document.getElementById("albumCover").src =
        "./static/defaultAlbumCover.jpg";
    document.getElementById("songDuration").innerText = "Loading...";
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
    //let coverResult = null;
    /* #endregion */

    document.getElementById("songTitle").innerText = metadata.common.title
        ? metadata.common.title
        : "Unknown";
    document.getElementById("songArtist").innerText = metadata.common.artist
        ? metadata.common.artist.toTitleCase()
        : "Unknown";
    document.getElementById("songAlbum").innerText = metadata.common.album
        ? metadata.common.album
        : "Unknown";
    document.getElementById("albumCover").src = coverResult
        ? coverResult.url
        : "./static/defaultAlbumCover.jpg";
    document.getElementById("songDuration").innerText = metadata.format.duration
        ? Math.round(metadata.format.duration / 60) + ":" + Math.round(metadata.format.duration % 60).toString().padStart(2, "0")
        : "Unknown";
    //}
}
//init();

async function getCoverArt(metadata) {
    if (
        !metadata.common.album ||
        !metadata.common.artist ||
        !metadata.common.title
    ) {
        return null;
    }
    // Get song from MusicBrainz
    let searchResults, coverResult;
    if (metadata.common.artist ? true : false) {
        //const query = `query="${metadata.common.title}" + artistname:${metadata.common.artist} + recording:${metadata.common.title} + release:${metadata.common.album}`;
        //searchResults = await mbApi.search("recording", { query });
        searchResults = await fetch(constructQuery(metadata), {
            method: "GET",
            headers: {
                "User-Agent":
                    "Three.js Music Visualizer/0.1.0 (Christopherbbody@gmail.com)",
            },
        }).then((response) => response.json());
        //console.log(searchResults);
    }

    if (!searchResults || !searchResults.recordings) {
        return coverResult;
    }
    // Filter search results for official versions
    // First pass: Filter recordings
    let filteredRecordings = [];
    for (const recording of searchResults.recordings) {
        if (!recording.releases) continue;
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

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

/* #region  Event Listeners */
document.getElementById("loadLocalButton").addEventListener("click", () => {
    loadLocalFile();
});

document.getElementById("loadLocalButton").addEventListener("mouseover", () => {
    brightenApp();
});

document.getElementById("loadLocalButton").addEventListener("mouseout", () => {
    dimApp();
});

document.getElementById("playPause").addEventListener("click", async () => {
    if (audioManager !== null) {
        if (audioManager.isPlaying) {
            audioManager.pause();
        } else {
            audioManager.play();
        }
    } else {
        // if no song has been loaded, load the default
        if (!songLoaded) {
            audioManager = new AudioManager();
            audioManager.loadAudio(
                "./static/songDemo/07 - Linkin Park - By Myself.mp3"
            );
            await init();
            await new Promise((resolve) => setTimeout(resolve, 500));
            audioManager.play();
            songLoaded = true;
        }
    }
});

document.getElementById("songInfo").addEventListener("mouseover", () => {
    brightenApp();
});

document.getElementById("songInfo").addEventListener("mouseout", () => {
    dimApp();
});

document.getElementById("timeSlider").addEventListener("mouseover", () => {
    if (audioManager !== null) {
        audioManager.updatingSlider = true;
    }
});

document.getElementById("timeSlider").addEventListener("mouseout", () => {
    if (audioManager !== null) {
        audioManager.updatingSlider = false;
    }
});

document.getElementById("timeSlider").addEventListener("change", () => {
    if (audioManager !== null) {
        audioManager.setTime(document.getElementById("timeSlider").value);
    }
});

document.getElementById("particleCount").addEventListener("input", () => {
    particleCount = document.getElementById("particleCount").value;
    document.getElementById(
        "particleCountDisplay"
    ).innerHTML = `<b>${formatNumber(
        document.getElementById("particleCount").value
    )}</b>`;
});

document.getElementById("volumeSlider").addEventListener("input", () => {
    if (audioManager !== null) {
        audioManager.audio.setVolume(document.getElementById("volumeSlider").value / 100);
    }
});

/*
document.getElementById("sliderContainer").addEventListener("mouseover", () => {
    brightenApp();
});

document.getElementById("sliderContainer").addEventListener("mouseout", () => {
    dimApp();
});
*/

document.getElementById("fullscreenButton").addEventListener("click", () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
});

document
    .getElementById("topRightContainer")
    .addEventListener("mouseover", () => {
        brightenApp();
    });

document.getElementById("topRightContainer").addEventListener("mouseout", () => {
    dimApp();
});

document.getElementById("psychoticModeSwitch").addEventListener("click", () => {
    psychoticMode = !psychoticMode;
    if (!psychoticMode) {
        const scenePass = pass(scene, camera);
        const bloomMult = -particleCount / 1000000 + 1.8;
        const processPass = bloom(scenePass, 1 * bloomMult, 0, 0.25);
        pass1 = scenePass.add(processPass);

        pass2 = scenePass.add(processPass);

        postProcessing = new THREE.PostProcessing(renderer);
        postProcessing.outputNode = pass1;
        timeScale.value = 1.0;
    } else {
        const scenePass = pass(scene, camera);
        const bloomMult = -particleCount / 1000000 + 1.8;
        const processPass = bloom(scenePass, 0.8 * bloomMult, 0.1, 0.25);
        pass1 = scenePass.add(processPass);
        // Str, Rad, Thr
        const processPass2 = bloom(scenePass, 500 * bloomMult, 5, 0.1);

        pass2 = scenePass.add(processPass2);

        postProcessing = new THREE.PostProcessing(renderer);
        postProcessing.outputNode = pass1;
        timeScale.value = 1.25;
    }
});

document
    .getElementById("psychoticModeContainer")
    .addEventListener("mouseover", () => {
        brightenApp();
    });

document
    .getElementById("psychoticModeContainer")
    .addEventListener("mouseout", () => {
        dimApp();
    });

document.getElementById("colorPresetLeft").addEventListener("click", () => {
    if(colorPreset.value == 0) {
        colorPreset.value = 3;
    } else {
        colorPreset.value = colorPreset.value - 1;
    }
    document.getElementById("colorPresetLabel").innerText = colorPreset.value;
});

document.getElementById("colorPresetRight").addEventListener("click", () => {
    if(colorPreset.value == 3) {
        colorPreset.value = 0;
    } else {
        colorPreset.value = colorPreset.value + 1;
    }
    document.getElementById("colorPresetLabel").innerText = colorPreset.value;
});


window.addEventListener("resize", () => {
    const { innerWidth, innerHeight } = window;
    if (!renderer) return;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});


function dimApp() {
    if (audioManager == null) {
        return;
    } 
    if (!audioManager.isPlaying) {
        return;
    }
    document.getElementById("app").style.opacity = 0.1;
    document.getElementById("app").style.filter = "brightness(0.3)";
}

function brightenApp() {
    document.getElementById("app").style.opacity = 1;
    document.getElementById("app").style.filter = "brightness(1)";
}
/* #endregion */

/* #region MusicBrainz API */
/*
const mbApi = new MusicBrainzApi({
    appName: "Three.js Music Visualizer",
    appVersion: "0.1.0",
    appContactInfo: "christopherbbody@gmail.com",
});
*/

const constructQuery = (metadata) => {
    //https://musicbrainz.org/ws/2/recording?query=%22we%20will%20rock%20you%22%20AND%20arid:0383dadf-2a4e-4d10-a46a-e9e041da8eb3
    let query = "https://musicbrainz.org/ws/2/recording?";
    if (metadata.common.title) {
        query += `query="${metadata.common.title}"`;
    }
    if (metadata.common.artist) {
        query += ` + artistname:${metadata.common.artist}`;
    }
    if (metadata.common.album) {
        query += ` + release:${metadata.common.album}`;
    }
    query += "&fmt=json";
    return query;
};

document.getElementById("songTitle").innerText = "By Myself";
document.getElementById("songArtist").innerText = "Linkin Park";
document.getElementById("songAlbum").innerText = "Hybrid Theory";
document.getElementById("albumCover").src =
    "https://ia801909.us.archive.org/1/items/mbid-95e96595-d34d-440e-be29-2c3c02895f0b/mbid-95e96595-d34d-440e-be29-2c3c02895f0b-27469140357_thumb250.jpg";
document.getElementById("songDuration").innerText = "3:09";


