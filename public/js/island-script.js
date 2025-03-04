// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 25);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // Controls setup - enable drag to move camera
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controls.enablePan = true; // Enable panning
    controls.panSpeed = 0.5; // Adjust panning speed
    controls.screenSpacePanning = true; // Pan parallel to the screen
    controls.rotateSpeed = 0.7; // Increase rotation speed for better control

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    scene.add(directionalLight);

    // Create the island base
    const islandRadius = 15;
    const islandGeometry = new THREE.CylinderGeometry(islandRadius, islandRadius * 0.8, 3, 64);
    const islandMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Brown
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.castShadow = true;
    island.receiveShadow = true;
    scene.add(island);

    // Add grass on top
    const grassGeometry = new THREE.CylinderGeometry(islandRadius, islandRadius, 0.5, 64);
    const grassMaterial = new THREE.MeshPhongMaterial({ color: 0x7CFC00 }); // Lawn green
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.position.y = 1.75; // Adjusted for taller island
    grass.castShadow = true;
    grass.receiveShadow = true;
    scene.add(grass);

    // Add more trees and features for the larger island
    function addTree(x, y, z, scale = 1) {
        const trunkGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.2 * scale, 1.5 * scale, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, y + 0.75 * scale, z);
        trunk.castShadow = true;
        scene.add(trunk);

        const leavesGeometry = new THREE.ConeGeometry(1 * scale, 2 * scale, 8);
        const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, y + (2.5 * scale), z);
        leaves.castShadow = true;
        scene.add(leaves);
    }

    function addHouse(x, y, z, scale = 1) {
        const baseGeometry = new THREE.BoxGeometry(1.5 * scale, 1 * scale, 1.5 * scale);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xD2B48C });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(x, y + (0.5 * scale), z);
        base.castShadow = true;
        scene.add(base);

        const roofGeometry = new THREE.ConeGeometry(1.2 * scale, 1 * scale, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(x, y + (1.5 * scale), z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        scene.add(roof);
    }

    // Add rocks
    function addRock(x, y, z, scale = 1) {
        const rockGeometry = new THREE.DodecahedronGeometry(scale, 0);
        const rockMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, y, z);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
    }

    // Add many trees, houses, and rocks around the island
    // Forest area
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (islandRadius * 0.8 - 2) + 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const scale = 0.5 + Math.random() * 1;
        addTree(x, 2, z, scale);
    }

    // Village area
    for (let i = 0; i < 5; i++) {
        const angle = Math.PI / 2 + (Math.random() * Math.PI / 2);
        const radius = Math.random() * (islandRadius * 0.6 - 3) + 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const scale = 0.8 + Math.random() * 0.4;
        addHouse(x, 2, z, scale);
    }

    // Rocky area
    for (let i = 0; i < 15; i++) {
        const angle = Math.PI + (Math.random() * Math.PI / 2);
        const radius = Math.random() * (islandRadius * 0.7 - 1) + 1;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const scale = 0.3 + Math.random() * 0.7;
        addRock(x, 2 + scale/2, z, scale);
    }

    // Add water
    const waterGeometry = new THREE.CircleGeometry(100, 64);
    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x0077be,
        transparent: true,
        opacity: 0.7,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1;
    scene.add(water);

    // Create a simple character using cylinder and sphere
    function createCharacter() {
        const character = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.7, 16);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x1E90FF }); // Blue
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        character.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 }); // Gold
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.1;
        character.add(head);
        
        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0x1E90FF });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(0.3, 0.5, 0);
        leftArm.rotation.z = -Math.PI / 6;
        character.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(-0.3, 0.5, 0);
        rightArm.rotation.z = Math.PI / 6;
        character.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x1E90FF });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(0.15, 0, 0);
        character.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(-0.15, 0, 0);
        character.add(rightLeg);
        
        // Add shadow
        character.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
            }
        });
        
        // Position the character on the island
        character.position.y = 2; // Adjusted for taller island
        
        return character;
    }
    
    const character = createCharacter();
    scene.add(character);
    
    // Define timeline stops around the island
    const timelineStops = [
        {
            position: new THREE.Vector3(islandRadius - 1, 2, 0),
            rotation: Math.PI / 2,
            title: "Beginning",
            content: "This is where our journey begins..."
        },
        {
            position: new THREE.Vector3(islandRadius * 0.7, 2, islandRadius * 0.7),
            rotation: Math.PI / 4,
            title: "Early Progress",
            content: "The first steps of development..."
        },
        {
            position: new THREE.Vector3(0, 2, islandRadius - 1),
            rotation: 0,
            title: "Milestone",
            content: "A significant achievement was reached..."
        },
        {
            position: new THREE.Vector3(-islandRadius * 0.7, 2, islandRadius * 0.7),
            rotation: -Math.PI / 4,
            title: "Challenges",
            content: "Overcoming obstacles along the way..."
        },
        {
            position: new THREE.Vector3(-islandRadius + 1, 2, 0),
            rotation: -Math.PI / 2,
            title: "Innovation",
            content: "Breaking new ground with innovative ideas..."
        },
        {
            position: new THREE.Vector3(-islandRadius * 0.7, 2, -islandRadius * 0.7),
            rotation: -3 * Math.PI / 4,
            title: "Expansion",
            content: "Growing and expanding our horizons..."
        },
        {
            position: new THREE.Vector3(0, 2, -islandRadius + 1),
            rotation: Math.PI,
            title: "Transformation",
            content: "Transforming the landscape of possibilities..."
        },
        {
            position: new THREE.Vector3(islandRadius * 0.7, 2, -islandRadius * 0.7),
            rotation: 3 * Math.PI / 4,
            title: "Present Day",
            content: "Where we stand today, looking toward the future..."
        }
    ];
    
    // Create markers for timeline stops
    const markers = [];
    timelineStops.forEach((stop, index) => {
        const markerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const markerMaterial = new THREE.MeshPhongMaterial({ color: 0xFF4500 }); // Orange-red
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(stop.position);
        marker.position.y = 1.8; // Slightly below character level
        marker.userData = { stopIndex: index };
        scene.add(marker);
        markers.push(marker);
    });
    
    // Create info panel for displaying timeline information
    const infoPanel = document.createElement('div');
    infoPanel.style.position = 'absolute';
    infoPanel.style.bottom = '20px';
    infoPanel.style.left = '20px';
    infoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    infoPanel.style.color = 'white';
    infoPanel.style.padding = '15px';
    infoPanel.style.borderRadius = '10px';
    infoPanel.style.maxWidth = '300px';
    infoPanel.style.display = 'none';
    document.body.appendChild(infoPanel);
    
    // Create a single instruction message with fade-out effect
    const instructionsPanel = document.createElement('div');
    instructionsPanel.style.position = 'absolute';
    instructionsPanel.style.top = '80px';
    instructionsPanel.style.left = '50%';
    instructionsPanel.style.transform = 'translateX(-50%)';
    instructionsPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    instructionsPanel.style.color = 'white';
    instructionsPanel.style.padding = '15px';
    instructionsPanel.style.borderRadius = '10px';
    instructionsPanel.style.textAlign = 'center';
    instructionsPanel.style.transition = 'opacity 1s ease-in-out';
    instructionsPanel.style.opacity = '1';
    instructionsPanel.style.zIndex = '1000';
    instructionsPanel.innerHTML = `
        <div style="margin-bottom: 10px"><strong>Controls:</strong></div>
        <div style="margin-bottom: 5px">• Use arrow keys to move the character</div>
        <div style="margin-bottom: 5px">• Left-click + drag to rotate the view</div>
        <div style="margin-bottom: 5px">• Right-click + drag to pan the camera</div>
        <div>• Scroll to zoom in/out</div>
    `;
    document.body.appendChild(instructionsPanel);
    
    // Fade out instructions after 5 seconds
    setTimeout(() => {
        instructionsPanel.style.opacity = '0';
        // Remove from DOM after fade completes
        setTimeout(() => {
            instructionsPanel.remove();
        }, 1000);
    }, 5000);
    
    // Character movement variables
    let moveForward = false;
    let moveBackward = false;
    let turnLeft = false;
    let turnRight = false;
    const moveSpeed = 0.1;
    const turnSpeed = 0.05;
    
    // Function to display information at current position
    function displayNearestStopInfo() {
        // Find the nearest marker
        let nearestIndex = 0;
        let minDistance = Infinity;
        
        markers.forEach((marker, index) => {
            const distance = character.position.distanceTo(marker.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = index;
            }
        });
        
        // If close enough to a marker, show info
        if (minDistance < 1) {
            const stop = timelineStops[nearestIndex];
            infoPanel.innerHTML = `<h3>${stop.title}</h3><p>${stop.content}</p>`;
            infoPanel.style.display = 'block';
        } else {
            infoPanel.style.display = 'none';
        }
    }
    
    // Keyboard event listeners for arrow key controls
    document.addEventListener('keydown', function(event) {
        switch(event.code) {
            case 'ArrowUp':
                moveForward = true;
                break;
            case 'ArrowDown':
                moveBackward = true;
                break;
            case 'ArrowLeft':
                turnLeft = true;
                break;
            case 'ArrowRight':
                turnRight = true;
                break;
        }
    });
    
    document.addEventListener('keyup', function(event) {
        switch(event.code) {
            case 'ArrowUp':
                moveForward = false;
                break;
            case 'ArrowDown':
                moveBackward = false;
                break;
            case 'ArrowLeft':
                turnLeft = false;
                break;
            case 'ArrowRight':
                turnRight = false;
                break;
        }
    });
    
    // Add mobile control buttons
    const mobileControls = document.createElement('div');
    mobileControls.style.position = 'absolute';
    mobileControls.style.bottom = '20px';
    mobileControls.style.right = '20px';
    mobileControls.style.display = 'grid';
    mobileControls.style.gridTemplateColumns = 'repeat(3, 1fr)';
    mobileControls.style.gridTemplateRows = 'repeat(3, 1fr)';
    mobileControls.style.gap = '5px';
    mobileControls.style.width = '150px';
    mobileControls.style.height = '150px';
    document.body.appendChild(mobileControls);
    
    // Helper function to create mobile control buttons
    function createMobileButton(text, gridArea, action) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.gridArea = gridArea;
        button.style.backgroundColor = 'rgba(76, 175, 80, 0.7)';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '20px';
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.addEventListener('mousedown', () => action(true));
        button.addEventListener('mouseup', () => action(false));
        button.addEventListener('mouseleave', () => action(false));
        button.addEventListener('touchstart', (e) => { action(true); e.preventDefault(); });
        button.addEventListener('touchend', () => action(false));
        return button;
    }
    
    // Create and add mobile control buttons
    const upButton = createMobileButton('↑', '1 / 2 / 2 / 3', (state) => moveForward = state);
    const leftButton = createMobileButton('←', '2 / 1 / 3 / 2', (state) => turnLeft = state);
    const rightButton = createMobileButton('→', '2 / 3 / 3 / 4', (state) => turnRight = state);
    const downButton = createMobileButton('↓', '3 / 2 / 4 / 3', (state) => moveBackward = state);
    
    mobileControls.appendChild(upButton);
    mobileControls.appendChild(leftButton);
    mobileControls.appendChild(rightButton);
    mobileControls.appendChild(downButton);
    
    // Position character at first stop
    character.position.copy(timelineStops[0].position);
    character.rotation.y = timelineStops[0].rotation;
    displayNearestStopInfo();
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Island floating animation
        const floatY = Math.sin(Date.now() * 0.001) * 0.2;
        island.position.y = floatY;
        grass.position.y = 1.75 + floatY;
        
        // Update character position and rotation based on arrow key input
        if (moveForward) {
            // Move in the direction the character is facing
            character.position.x += Math.sin(character.rotation.y) * moveSpeed;
            character.position.z += Math.cos(character.rotation.y) * moveSpeed;
            
            // Animate legs while walking
            const walkCycle = Math.sin(Date.now() * 0.01) * 0.2;
            character.children[4].rotation.x = walkCycle; // Left leg
            character.children[5].rotation.x = -walkCycle; // Right leg
            character.children[2].rotation.x = -walkCycle * 0.5; // Left arm
            character.children[3].rotation.x = walkCycle * 0.5; // Right arm
        }
        
        if (moveBackward) {
            // Move opposite to the direction the character is facing
            character.position.x -= Math.sin(character.rotation.y) * moveSpeed;
            character.position.z -= Math.cos(character.rotation.y) * moveSpeed;
            
            // Animate legs while walking
            const walkCycle = Math.sin(Date.now() * 0.01) * 0.2;
            character.children[4].rotation.x = -walkCycle; // Left leg
            character.children[5].rotation.x = walkCycle; // Right leg
            character.children[2].rotation.x = walkCycle * 0.5; // Left arm
            character.children[3].rotation.x = -walkCycle * 0.5; // Right arm
        }
        
        if (turnLeft) {
            character.rotation.y += turnSpeed;
        }
        
        if (turnRight) {
            character.rotation.y -= turnSpeed;
        }
        
        // Keep character on the island
        const distanceFromCenter = Math.sqrt(
            character.position.x * character.position.x + 
            character.position.z * character.position.z
        );
        
        if (distanceFromCenter > islandRadius - 1) {
            // Move character back toward center
            const angle = Math.atan2(character.position.x, character.position.z);
            character.position.x = (islandRadius - 1) * Math.sin(angle);
            character.position.z = (islandRadius - 1) * Math.cos(angle);
        }
        
        // Update info panel based on character position
        displayNearestStopInfo();
        
        // Update controls
        controls.update();
        
        // Render scene
        renderer.render(scene, camera);
    }

    // Handle window resize
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize, false);

    // Start animation
    animate();
    
    console.log("Enhanced Three.js scene with improved instructions initialized!");
});