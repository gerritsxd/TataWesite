import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js';

// Initialize the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// Initialize the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(15, 15, 15);

// Initialize the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 5;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI / 2;

// Create island base
const islandGeometry = new THREE.CylinderGeometry(8, 6, 2, 32);
const islandMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
const island = new THREE.Mesh(islandGeometry, islandMaterial);
island.receiveShadow = true;
scene.add(island);

// Add grass top layer
const grassGeometry = new THREE.CylinderGeometry(7.5, 7.5, 0.5, 32);
const grassMaterial = new THREE.MeshPhongMaterial({ color: 0x90EE90 });
const grass = new THREE.Mesh(grassGeometry, grassMaterial);
grass.position.y = 1;
grass.receiveShadow = true;
scene.add(grass);

// Create factory building
function createFactory() {
    const factory = new THREE.Group();

    // Main building
    const buildingGeometry = new THREE.BoxGeometry(4, 6, 4);
    const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 4;
    building.castShadow = true;
    factory.add(building);

    // Chimney
    const chimneyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
    const chimneyMaterial = new THREE.MeshPhongMaterial({ color: 0x696969 });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(1, 8, 1);
    chimney.castShadow = true;
    factory.add(chimney);

    factory.position.y = 1;
    return factory;
}

// Create houses
function createHouse(x, z) {
    const house = new THREE.Group();

    // House base
    const baseGeometry = new THREE.BoxGeometry(2, 2, 2);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xD2B48C });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    house.add(base);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(1.5, 1.5, 4);
    const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 1.75;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    house.position.set(x, 2, z);
    return house;
}

// Add factory and houses
const factory = createFactory();
scene.add(factory);

// Add houses in a circle
const houseCount = 6;
const radius = 6;
for (let i = 0; i < houseCount; i++) {
    const angle = (i / houseCount) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const house = createHouse(x, z);
    scene.add(house);
}

// Add water around the island
function addWater() {
    const waterGeometry = new THREE.CircleGeometry(30, 64);
    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x0077be,
        transparent: true,
        opacity: 0.7,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1;
    scene.add(water);
}

// Add clouds
function addClouds() {
    const cloudGeometry = new THREE.SphereGeometry(1, 16, 16);
    const cloudMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.8 
    });
    
    // Create several cloud clusters
    for (let i = 0; i < 5; i++) {
        const cloudCluster = new THREE.Group();
        
        // Create a cluster of spheres for each cloud
        for (let j = 0; j < 5; j++) {
            const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
            const scale = 0.5 + Math.random() * 0.5;
            cloudPart.scale.set(scale, scale, scale);
            cloudPart.position.set(
                j * 0.8 - 1.5 + Math.random() * 0.3,
                Math.random() * 0.2,
                Math.random() * 0.3
            );
            cloudCluster.add(cloudPart);
        }
        
        // Position the cloud cluster
        cloudCluster.position.set(
            Math.random() * 30 - 15,
            10 + Math.random() * 5,
            Math.random() * 30 - 15
        );
        
        scene.add(cloudCluster);
    }
}

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 15, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
scene.add(directionalLight);

// Add water and clouds
addWater();
addClouds();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Make the island float up and down slightly
    scene.position.y = Math.sin(Date.now() * 0.001) * 0.2;
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

// Start the animation loop
animate();

// Functions to handle loading screen (from your original code)
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

function hideNavigationButtons() {
    const navButtons = document.getElementById('timeline-navigation');
    if (navButtons) {
        navButtons.style.display = 'none';
    }
}

function updateLoadingProgress(xhr) {
    if (xhr.lengthComputable) {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        const progressBar = document.getElementById('loading-progress');
        if (progressBar) {
            progressBar.style.width = percentComplete + '%';
        }
    }
}

// Hide loading screen since we're not loading external models
hideLoadingScreen();
hideNavigationButtons();