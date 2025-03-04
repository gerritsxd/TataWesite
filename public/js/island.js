import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js';

// Initialize the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// Initialize the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Initialize the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// Add the renderer to the DOM
document.getElementById('scene-container').appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 5;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI / 2;

// Create a simple floating island
function createIsland() {
    // Island base (ground)
    const islandGeometry = new THREE.CylinderGeometry(5, 3, 2, 32);
    const islandMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Brown
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.position.y = 0;
    island.castShadow = true;
    island.receiveShadow = true;
    scene.add(island);

    // Grass top
    const grassGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 32);
    const grassMaterial = new THREE.MeshPhongMaterial({ color: 0x7CFC00 }); // Lawn green
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.position.y = 1.25;
    grass.castShadow = true;
    grass.receiveShadow = true;
    scene.add(grass);

    // Add trees
    addTree(2, 1.5, 2);
    addTree(-2, 1.5, -1);
    addTree(0, 1.5, -3);
    
    // Add a small house
    addHouse(-1, 1.5, 0);
}

// Function to create a simple tree
function addTree(x, y, z) {
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Brown
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, y + 0.75, z);
    trunk.castShadow = true;
    scene.add(trunk);

    // Tree leaves
    const leavesGeometry = new THREE.ConeGeometry(1, 2, 8);
    const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 }); // Forest green
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(x, y + 2.5, z);
    leaves.castShadow = true;
    scene.add(leaves);
}

// Function to create a simple house
function addHouse(x, y, z) {
    // House base
    const baseGeometry = new THREE.BoxGeometry(1.5, 1, 1.5);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xD2B48C }); // Tan
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(x, y + 0.5, z);
    base.castShadow = true;
    scene.add(base);

    // House roof
    const roofGeometry = new THREE.ConeGeometry(1.2, 1, 4);
    const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 }); // Dark red
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(x, y + 1.5, z);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
}

// Add lighting
function setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    
    // Set up shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    
    scene.add(directionalLight);
}

// Add clouds
function addClouds() {
    const cloudGeometry = new THREE.SphereGeometry(1, 16, 16);
    const cloudMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the island slightly
    scene.rotation.y += 0.001;
    
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

// Initialize the scene
function init() {
    createIsland();
    setupLights();
    addClouds();
    addWater();
    
    window.addEventListener('resize', onWindowResize, false);
    
    animate();
}

// Start the scene
init();