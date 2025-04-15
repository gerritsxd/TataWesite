import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Timeline events data
const timelineEvents = [
    {
        title: "1991 - Stofregen in Wijk aan Zee",
        description: "Zesde keer in drie maanden tijd een stofregen op het dorp Wijk aan Zee terecht komt (NOS Journaal)",
        fullDescription: `
            <p>In a dystopian turn of events, the toxic dust rain that plagued Wijk aan Zee marked the beginning of environmental deterioration. The steel factory's emissions cast a dark shadow over the coastal village, turning the once pristine beaches into a wasteland of industrial residue.</p>
            <p>The frequency of these incidents - six times in just three months - foreshadowed the grim future that awaited the region, as the balance between industry and nature tilted irreversibly.</p>
        `,
        position: { angle: 0, distance: 500 }
    },
    {
        title: "2014 - BREF Implementatie",
        description: "Implementeren BREF IJzer- en staalproductie door OD. Is dat al klaar? In 2020 nog niet.",
        fullDescription: `
            <p>The failed implementation of BREF standards cast a long shadow over the region. As regulations were delayed and ignored, the factory's emissions continued to darken the skies, creating an ever-present toxic haze that became the new normal for residents.</p>
            <p>The bureaucratic nightmare of incomplete implementation stretched into years, while the environment continued to degrade under the weight of unchecked industrial processes.</p>
        `,
        position: { angle: Math.PI * 0.5, distance: 500 }
    },
    {
        title: "2020 - ILT Beroep",
        description: "ILT twee keer in beroep bij de rechter tegen besluiten van de provincie Noord-Holland",
        fullDescription: `
            <p>In the darkness of regulatory failure, the ILT's appeals to the court highlighted the desperate struggle against industrial dominance. Twice they fought, and twice they witnessed the slow grinding of bureaucratic gears while toxic emissions continued to paint the sky in shades of industrial decay.</p>
            <p>The requirement for a feasibility study on NOx emissions control became lost in a maze of corporate resistance and administrative inertia.</p>
        `,
        position: { angle: Math.PI, distance: 500 }
    },
    {
        title: "2024 - Expertgroep Rapport",
        description: "Gezondheid geborgd - Expertgroep Gezondheid IJmond",
        fullDescription: `
            <p>The expert group's report emerged from the toxic fog like a beacon of truth, illuminating the dark reality of health impacts in the IJmond region. Their findings painted a grim picture of environmental degradation and its toll on human life.</p>
            <p>The data spoke of a future where clean air became a luxury, and the industrial skyline continued to dominate the horizon, a testament to the price of progress.</p>
        `,
        position: { angle: Math.PI * 1.5, distance: 500 }
    }
];

let currentEventIndex = 0;
let isAnimating = false;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.FogExp2(0x330000, 0.001);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 300, 600);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('scene-container').appendChild(renderer.domElement);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting setup
const ambientLight = new THREE.AmbientLight(0x331111, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff3333, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const toxicLight = new THREE.PointLight(0xff0000, 2, 1000);
toxicLight.position.set(0, 200, 0);
scene.add(toxicLight);

// Create island group
const islandGroup = new THREE.Group();
scene.add(islandGroup);

// Create event markers
function createEventMarkers() {
    const markerGroup = new THREE.Group();
    
    timelineEvents.forEach((event, index) => {
        const markerGeometry = new THREE.SphereGeometry(10, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: index === currentEventIndex ? 0xff0000 : 0x666666,
            emissive: 0x330000,
            emissiveIntensity: 0.5
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        
        const x = Math.cos(event.position.angle) * event.position.distance;
        const z = Math.sin(event.position.angle) * event.position.distance;
        marker.position.set(x, 100, z);
        
        markerGroup.add(marker);
    });
    
    scene.add(markerGroup);
    return markerGroup;
}

const eventMarkers = createEventMarkers();

// Load the GLB model
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(dracoLoader);

loader.load(
    '/models/IslandCopyTest.glb',
    function (gltf) {
        document.querySelector('.loading').style.display = 'none';
        
        gltf.scene.scale.set(10000, 10000, 10000);
        gltf.scene.position.set(0, 0, 0);
        islandGroup.add(gltf.scene);
        
        gltf.scene.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                
                if (node.material) {
                    const dystopianMaterial = node.material.clone();
                    dystopianMaterial.color.multiplyScalar(0.6);
                    dystopianMaterial.roughness = Math.min(dystopianMaterial.roughness + 0.4, 1.0);
                    dystopianMaterial.metalness = Math.min(dystopianMaterial.metalness + 0.3, 1.0);
                    dystopianMaterial.emissive = new THREE.Color(0x330000);
                    dystopianMaterial.emissiveIntensity = 0.2;
                    node.material = dystopianMaterial;
                }
            }
        });

        // Initialize the first event
        updateEventContent(currentEventIndex);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened while loading the GLB model:', error);
    }
);

// Event content management
function updateEventContent(index, expanded = false) {
    const event = timelineEvents[index];
    const content = document.querySelector('.event-content');
    
    // Update title and descriptions
    content.querySelector('.event-title').textContent = event.title;
    content.querySelector('.event-description').textContent = event.description;
    content.querySelector('.event-details').innerHTML = event.fullDescription;
    
    // Update marker colors
    eventMarkers.children.forEach((marker, i) => {
        marker.material.color.setHex(i === index ? 0xff0000 : 0x666666);
    });
    
    // Handle expansion state
    if (expanded) {
        content.classList.add('expanded');
    } else {
        content.classList.remove('expanded');
    }
}

// Camera animation
function animateCamera(targetX, targetY, targetZ) {
    if (isAnimating) return;
    isAnimating = true;
    
    const startPosition = camera.position.clone();
    const endPosition = new THREE.Vector3(targetX, targetY, targetZ);
    const duration = 1000;
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing
        const t = progress < .5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        
        camera.position.lerpVectors(startPosition, endPosition, t);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            isAnimating = false;
        }
    }
    
    update();
}

// Event listeners
document.querySelector('.prev-btn').addEventListener('click', () => {
    if (currentEventIndex > 0) {
        currentEventIndex--;
        const event = timelineEvents[currentEventIndex];
        const x = Math.cos(event.position.angle) * event.position.distance;
        const z = Math.sin(event.position.angle) * event.position.distance;
        animateCamera(x, 300, z);
        updateEventContent(currentEventIndex);
    }
});

document.querySelector('.next-btn').addEventListener('click', () => {
    if (currentEventIndex < timelineEvents.length - 1) {
        currentEventIndex++;
        const event = timelineEvents[currentEventIndex];
        const x = Math.cos(event.position.angle) * event.position.distance;
        const z = Math.sin(event.position.angle) * event.position.distance;
        animateCamera(x, 300, z);
        updateEventContent(currentEventIndex);
    }
});

const eventContent = document.querySelector('.event-content');
eventContent.addEventListener('click', function() {
    if (!this.classList.contains('expanded')) {
        this.classList.add('expanding');
        setTimeout(() => {
            this.classList.remove('expanding');
            updateEventContent(currentEventIndex, true);
        }, 300);
    }
});

document.querySelector('.close-expanded').addEventListener('click', (e) => {
    e.stopPropagation();
    const content = document.querySelector('.event-content');
    content.classList.add('expanding');
    setTimeout(() => {
        content.classList.remove('expanding');
        updateEventContent(currentEventIndex, false);
    }, 300);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Animate toxic light
    toxicLight.intensity = 2 + Math.sin(Date.now() * 0.001) * 0.5;
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
