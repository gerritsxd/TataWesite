// Timeline data for the houses
const timelineEvents = [
    {
        title: "Foundation",
        content: "In 1920, the first factory was established on this island, marking the beginning of industrial development in the region."
    },
    {
        title: "Expansion",
        content: "By 1935, the factory had doubled in size, employing over 200 workers from neighboring communities."
    },
    {
        title: "War Effort",
        content: "During World War II (1939-1945), the factory was converted to produce essential supplies for the military."
    },
    {
        title: "Post-War Boom",
        content: "The 1950s saw unprecedented growth as consumer demand skyrocketed in the post-war economy."
    },
    {
        title: "Modernization",
        content: "In 1968, the factory underwent major renovations to implement automated production lines."
    },
    {
        title: "Environmental Concerns",
        content: "The 1970s brought new challenges as environmental regulations required significant changes to reduce pollution."
    },
    {
        title: "Economic Downturn",
        content: "The recession of the 1980s hit hard, forcing layoffs and production cutbacks to survive."
    },
    {
        title: "Technological Revolution",
        content: "In the 1990s, computer systems transformed operations, increasing efficiency by over 40%."
    },
    {
        title: "Global Competition",
        content: "The early 2000s brought intense competition from overseas manufacturers, requiring strategic pivots."
    },
    {
        title: "Sustainability Initiative",
        content: "In 2010, the factory launched a comprehensive sustainability program, including solar panels and waste reduction."
    },
    {
        title: "Digital Transformation",
        content: "Recent years have seen the implementation of IoT sensors and AI-driven analytics to optimize production."
    },
    {
        title: "Future Vision",
        content: "Today, the factory stands as a model of innovation, with plans to become carbon-neutral by 2030."
    }
];

// Get loading screen elements
const loadingScreen = document.getElementById('loading-screen');
const loadingProgress = document.getElementById('loading-progress');

// Get info panel elements
const infoPanel = document.getElementById('info-panel');
const eventTitle = document.getElementById('event-title');
const eventDescription = document.getElementById('event-description');

// Get navigation buttons
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

// Current timeline index
let currentTimelineIndex = 0;

// Simulate loading progress
let loadingPercentage = 0;
const loadingInterval = setInterval(() => {
    loadingPercentage += 5;
    if (loadingProgress) {
        loadingProgress.style.width = `${loadingPercentage}%`;
    }

    if (loadingPercentage >= 100) {
        clearInterval(loadingInterval);
        // Wait a moment before hiding the loading screen
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 500);
    }
}, 100);

// Initialize the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// Initialize the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 20, 20);

// Initialize the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 10;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI / 2;

// Create enhanced low-poly island
function createLowPolyIsland() {
    const island = new THREE.Group();

    // BIGGER island base with more segments for detail
    const segments = 16;
    const baseGeometry = new THREE.CylinderGeometry(15, 12, 3, segments);

    // Get vertices and make them irregular for low-poly look
    const positionAttribute = baseGeometry.getAttribute('position');
    const vertex = new THREE.Vector3();

    // Modify vertices to create more dramatic terrain
    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);

        // Only modify outer vertices (not top/bottom center)
        if (vertex.y === 1 || vertex.y === -1) {
            if (Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z) > 2) {
                // Add more dramatic height variation
                vertex.y += (Math.random() - 0.5) * 1.5;

                // Add more variation to x and z for more irregular shape
                if (vertex.y === 1) { // Only modify top vertices
                    vertex.x += (Math.random() - 0.5) * 2.5;
                    vertex.z += (Math.random() - 0.5) * 2.5;
                }

                // Update the position
                positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
            }
        }
    }

    // Update normals
    baseGeometry.computeVertexNormals();

    // Create materials with different shades for more visual interest
    const baseMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        flatShading: true
    });

    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.receiveShadow = true;
    island.add(baseMesh);

    // Add grass top with enhanced low-poly style
    const grassGeometry = new THREE.CylinderGeometry(14.5, 14.5, 0.8, segments);

    // Make grass more irregular
    const grassPositionAttribute = grassGeometry.getAttribute('position');

    for (let i = 0; i < grassPositionAttribute.count; i++) {
        vertex.fromBufferAttribute(grassPositionAttribute, i);

        if (Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z) > 2) {
            // Add more height variation
            vertex.y += (Math.random() - 0.5) * 0.6;

            // Add more variation to x and z
            vertex.x += (Math.random() - 0.5) * 2;
            vertex.z += (Math.random() - 0.5) * 2;

            // Update the position
            grassPositionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
    }

    // Update normals
    grassGeometry.computeVertexNormals();

    // Create grass with flat shading for low-poly look
    const grassMaterial = new THREE.MeshPhongMaterial({
        color: 0x7CFC00,
        flatShading: true
    });

    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.position.y = 1.5;
    grass.receiveShadow = true;
    island.add(grass);

    // Add beach around the edges
    const beachGeometry = new THREE.CylinderGeometry(16, 15.5, 0.5, segments);

    // Make beach irregular
    const beachPositionAttribute = beachGeometry.getAttribute('position');

    for (let i = 0; i < beachPositionAttribute.count; i++) {
        vertex.fromBufferAttribute(beachPositionAttribute, i);

        if (Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z) > 2) {
            // Add height variation
            vertex.y += (Math.random() - 0.5) * 0.3;

            // Add variation to x and z
            vertex.x += (Math.random() - 0.5) * 1;
            vertex.z += (Math.random() - 0.5) * 1;

            // Update the position
            beachPositionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
    }

    // Update normals
    beachGeometry.computeVertexNormals();

    const beachMaterial = new THREE.MeshPhongMaterial({
        color: 0xf0e68c, // Khaki color for sand
        flatShading: true
    });

    const beach = new THREE.Mesh(beachGeometry, beachMaterial);
    beach.position.y = -0.5;
    beach.receiveShadow = true;
    island.add(beach);

    // Add rocks around the island
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const distance = 14 + Math.random() * 2;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        // Create rock
        const rockGeometry = new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.7, 0);
        const rockMaterial = new THREE.MeshPhongMaterial({
            color: 0x808080,
            flatShading: true
        });

        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, -0.5 + Math.random() * 0.5, z);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.scale.set(
            1 + Math.random() * 0.5,
            0.8 + Math.random() * 0.4,
            1 + Math.random() * 0.5
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        island.add(rock);
    }

    // Add trees
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
        const distance = 10 + Math.random() * 3;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        // Create tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 5);
        const trunkMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            flatShading: true
        });

        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 1.5, z);
        trunk.castShadow = true;

        // Create tree top
        const topGeometry = new THREE.ConeGeometry(1, 2, 6);
        const topMaterial = new THREE.MeshPhongMaterial({
            color: 0x228B22,
            flatShading: true
        });

        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 1.5;
        top.castShadow = true;

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(top);
        island.add(tree);
    }

    return island;
}

// Create factory building
function createFactory() {
    const factory = new THREE.Group();

    // Main building
    const buildingGeometry = new THREE.BoxGeometry(6, 8, 6);
    const buildingMaterial = new THREE.MeshPhongMaterial({
        color: 0x808080,
        flatShading: true
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 5;
    building.castShadow = true;
    building.receiveShadow = true;
    factory.add(building);

    // Roof
    const roofGeometry = new THREE.BoxGeometry(7, 1, 7);
    const roofMaterial = new THREE.MeshPhongMaterial({
        color: 0x505050,
        flatShading: true
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 9.5;
    roof.castShadow = true;
    factory.add(roof);

    // Chimney 1
    const chimney1Geometry = new THREE.CylinderGeometry(0.6, 0.6, 4, 8); // Fewer segments for low-poly
    const chimney1Material = new THREE.MeshPhongMaterial({
        color: 0x8B0000,
        flatShading: true
    });
    const chimney1 = new THREE.Mesh(chimney1Geometry, chimney1Material);
    chimney1.position.set(2, 12, 2);
    chimney1.castShadow = true;
    factory.add(chimney1);

    // Chimney 2
    const chimney2Geometry = new THREE.CylinderGeometry(0.8, 0.8, 5, 8); // Fewer segments for low-poly
    const chimney2Material = new THREE.MeshPhongMaterial({
        color: 0x8B0000,
        flatShading: true
    });
    const chimney2 = new THREE.Mesh(chimney2Geometry, chimney2Material);
    chimney2.position.set(-2, 12.5, -2);
    chimney2.castShadow = true;
    factory.add(chimney2);

    // Windows
    const windowMaterial = new THREE.MeshPhongMaterial({
        color: 0x87CEFA,
        transparent: true,
        opacity: 0.7
    });

    // Front windows
    for (let i = -1.5; i <= 1.5; i += 1.5) {
        for (let j = 3; j <= 6; j += 3) {
            const windowGeometry = new THREE.PlaneGeometry(1, 1);
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(i, j, 3.01);
            windowMesh.rotation.y = Math.PI;
            factory.add(windowMesh);
        }
    }

    // Side windows
    for (let i = -1.5; i <= 1.5; i += 1.5) {
        for (let j = 3; j <= 6; j += 3) {
            const windowGeometry = new THREE.PlaneGeometry(1, 1);
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(3.01, j, i);
            windowMesh.rotation.y = -Math.PI / 2;
            factory.add(windowMesh);

            const windowMesh2 = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh2.position.set(-3.01, j, i);
            windowMesh2.rotation.y = Math.PI / 2;
            factory.add(windowMesh2);
        }
    }

    // Door
    const doorGeometry = new THREE.PlaneGeometry(1.5, 2.5);
    const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2.25, 3.01);
    door.rotation.y = Math.PI;
    factory.add(door);

    // Add smoke particles
    const smokeParticles = [];
    const smokeGeometry = new THREE.SphereGeometry(0.4, 6, 6); // Fewer segments for low-poly
    const smokeMaterial = new THREE.MeshBasicMaterial({
        color: 0xDDDDDD,
        transparent: true,
        opacity: 0.7,
        flatShading: true
    });

    // Add smoke to both chimneys
    for (let i = 0; i < 10; i++) {
        const smoke1 = new THREE.Mesh(smokeGeometry, smokeMaterial.clone());
        smoke1.position.set(
            2 + Math.random() * 0.5 - 0.25,
            14 + i * 0.5,
            2 + Math.random() * 0.5 - 0.25
        );
        smoke1.scale.set(
            0.8 + Math.random() * 0.4,
            0.8 + Math.random() * 0.4,
            0.8 + Math.random() * 0.4
        );
        smoke1.userData = {
            offsetY: 14 + i * 0.5,
            speed: 0.01 + Math.random() * 0.01
        };
        factory.add(smoke1);
        smokeParticles.push(smoke1);

        const smoke2 = new THREE.Mesh(smokeGeometry, smokeMaterial.clone());
        smoke2.position.set(
            -2 + Math.random() * 0.5 - 0.25,
            14.5 + i * 0.5,
            -2 + Math.random() * 0.5 - 0.25
        );
        smoke2.scale.set(
            0.8 + Math.random() * 0.4,
            0.8 + Math.random() * 0.4,
            0.8 + Math.random() * 0.4
        );
        smoke2.userData = {
            offsetY: 14.5 + i * 0.5,
            speed: 0.01 + Math.random() * 0.01
        };
        factory.add(smoke2);
        smokeParticles.push(smoke2);
    }

    factory.position.y = 1.5;
    factory.userData = { smokeParticles };
    return factory;
}

// Create houses
function createHouse(x, z, angle, index) {
    const house = new THREE.Group();

    // House base - use fewer segments for low-poly look
    const baseGeometry = new THREE.BoxGeometry(2, 2, 2);
    const baseMaterial = new THREE.MeshPhongMaterial({
        color: 0xD2B48C,
        flatShading: true
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    base.receiveShadow = true;
    house.add(base);

    // Roof - fewer segments for low-poly look
    const roofGeometry = new THREE.ConeGeometry(1.5, 1.5, 4);
    const roofMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B0000,
        flatShading: true
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 1.75;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Window
    const windowGeometry = new THREE.PlaneGeometry(0.6, 0.6);
    const windowMaterial = new THREE.MeshPhongMaterial({
        color: 0x87CEFA,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(0, 0.2, 1.01);
    house.add(window1);

    // Door
    const doorGeometry = new THREE.PlaneGeometry(0.6, 1);
    const doorMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        side: THREE.DoubleSide
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0.5, -0.5, 1.01);
    house.add(door);

    house.position.set(x, 2, z);

    // Make houses face the center
    house.rotation.y = angle + Math.PI;

    // Store the timeline index with the house
    house.userData = { timelineIndex: index };

    return house;
}

// Add enhanced water with more dramatic waves
function enhanceWater() {
    // Create a low-poly water surface with more dramatic waves
    const waterGeometry = new THREE.CircleGeometry(60, 32);

    // Add more dramatic height variation to water vertices
    const positionAttribute = waterGeometry.getAttribute('position');
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);

        // Only modify vertices outside the island
        if (Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z) > 18) {
            // Add more dramatic waves
            vertex.z += Math.sin(vertex.x * 0.2) * 0.5;
            vertex.z += Math.cos(vertex.y * 0.2) * 0.5;

            // Update the position
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
    }

    // Update normals
    waterGeometry.computeVertexNormals();

    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x0077be,
        transparent: true,
        opacity: 0.7,
        flatShading: true
    });

    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1;
    water.userData = { isWater: true };
    scene.add(water);
}

// Add enhanced low-poly clouds
function addClouds() {
    const cloudMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        flatShading: true
    });

    // Create several cloud clusters
    for (let i = 0; i < 12; i++) {
        const cloudCluster = new THREE.Group();

        // Create a cluster of low-poly shapes for each cloud
        for (let j = 0; j < 5; j++) {
            // Use tetrahedron for low-poly look
            const cloudGeometry = new THREE.TetrahedronGeometry(1 + Math.random() * 0.5, 0);
            const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial.clone());
            const scale = 0.5 + Math.random() * 0.5;
            cloudPart.scale.set(scale, scale * 0.6, scale);
            cloudPart.position.set(
                j * 0.8 - 1.5 + Math.random() * 0.3,
                Math.random() * 0.2,
                Math.random() * 0.3
            );
            cloudPart.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            cloudCluster.add(cloudPart);
        }

        // Position the cloud cluster
        cloudCluster.position.set(
            Math.random() * 60 - 30,
            15 + Math.random() * 5,
            Math.random() * 60 - 30
        );

        // Add random rotation to the cloud
        cloudCluster.rotation.y = Math.random() * Math.PI * 2;

        // Store original position for animation
        cloudCluster.userData = {
            originalX: cloudCluster.position.x,
            speed: 0.01 + Math.random() * 0.01
        };

        scene.add(cloudCluster);
    }
}

// Add island, factory and houses
const island = createLowPolyIsland();
scene.add(island);

const factory = createFactory();
scene.add(factory);

// Add houses in a circle
const houseCount = timelineEvents.length;
const radius = 12; // Bigger radius to match bigger island
const houses = [];

for (let i = 0; i < houseCount; i++) {
    const angle = (i / houseCount) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const house = createHouse(x, z, angle, i);
    scene.add(house);
    houses.push(house);
}

// Add enhanced water and clouds
enhanceWater();
addClouds();

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

// Function to display timeline information
function displayTimelineInfo(index) {
    if (index >= 0 && index < timelineEvents.length) {
        const event = timelineEvents[index];
        if (eventTitle && eventDescription) {
            eventTitle.textContent = event.title;
            eventDescription.textContent = event.content;
            infoPanel.style.display = 'block';
        }
    }
}

// Function to move to a specific timeline stop
function moveToTimelineStop(index) {
    if (index >= 0 && index < houses.length) {
        currentTimelineIndex = index;

        // Update camera to focus on the selected house
        const house = houses[index];
        const housePosition = house.position.clone();

        // Position camera to look at the house from a good angle
        const cameraDistance = 15;
        const cameraHeight = 10;
        const angle = (index / houses.length) * Math.PI * 2;

        // Calculate camera position based on the house position
        const cameraX = housePosition.x + Math.cos(angle) * cameraDistance;
        const cameraZ = housePosition.z + Math.sin(angle) * cameraDistance;

        // Animate camera movement
        const startPosition = camera.position.clone();
        const endPosition = new THREE.Vector3(cameraX, cameraHeight, cameraZ);
        const duration = 1000; // 1 second
        const startTime = Date.now();

        function animateCamera() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Use easing function for smoother animation
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out

            camera.position.lerpVectors(startPosition, endPosition, easeProgress);
            controls.target.set(housePosition.x, housePosition.y, housePosition.z);

            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        }

        animateCamera();

        // Display timeline information
        displayTimelineInfo(index);
    }
}

// Function to move to next timeline stop
function moveToNextStop() {
    const nextIndex = (currentTimelineIndex + 1) % houses.length;
    moveToTimelineStop(nextIndex);
}

// Function to move to previous timeline stop
function moveToPrevStop() {
    const prevIndex = (currentTimelineIndex - 1 + houses.length) % houses.length;
    moveToTimelineStop(prevIndex);
}

// Add event listeners to navigation buttons
if (nextButton) {
    nextButton.addEventListener('click', moveToNextStop);
}

if (prevButton) {
    prevButton.addEventListener('click', moveToPrevStop);
}

// Raycaster for detecting house clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Add click event listener for house selection
renderer.domElement.addEventListener('click', function(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with houses
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
        let object = intersects[i].object;

        // Find the house parent if we hit a child object
        while (object.parent && !object.userData.hasOwnProperty('timelineIndex')) {
            object = object.parent;
        }

        // If we found a house with a timeline index, move to that stop
        if (object.userData && object.userData.hasOwnProperty('timelineIndex')) {
            moveToTimelineStop(object.userData.timelineIndex);
            break;
        }
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Make the island float up and down slightly
    const floatY = Math.sin(Date.now() * 0.001) * 0.2;
    island.position.y = floatY;
    factory.position.y = 1.5 + floatY;

    houses.forEach(house => {
        house.position.y = 2 + floatY;
    });

    // Animate water waves
    scene.children.forEach(child => {
        if (child.userData && child.userData.isWater) {
            child.rotation.z = Math.sin(Date.now() * 0.0005) * 0.05;
        }
    });

    // Animate smoke from factory chimneys
    if (factory.userData && factory.userData.smokeParticles) {
        factory.userData.smokeParticles.forEach(smoke => {
            smoke.position.y += smoke.userData.speed;
            smoke.position.x += (Math.random() - 0.5) * 0.01;
            smoke.position.z += (Math.random() - 0.5) * 0.01;
            smoke.material.opacity -= 0.002;

            // Reset smoke when it gets too high or too transparent
            if (smoke.position.y > smoke.userData.offsetY + 5 || smoke.material.opacity < 0.1) {
                smoke.position.y = smoke.userData.offsetY;
                smoke.material.opacity = 0.7;
            }
        });
    }

    // Animate clouds
    scene.children.forEach(child => {
        if (child.userData && child.userData.hasOwnProperty('originalX')) {
            child.position.x += child.userData.speed;

            // Reset cloud position when it moves too far
            if (child.position.x > child.userData.originalX + 30) {
                child.position.x = child.userData.originalX - 30;
            }
        }
    });

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

// Display the first timeline event after a short delay
setTimeout(() => {
    moveToTimelineStop(0);
}, 2000);