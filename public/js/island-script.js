// Load the GLB model
const loader = new THREE.GLTFLoader();
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('./js/libs/draco/'); // Use relative path
loader.setDRACOLoader(dracoLoader);

loader.load(
    './models/island.glb', // Use relative path
    function (gltf) {
        // Hide loading screen and navigation buttons
        hideLoadingScreen();
        hideNavigationButtons();
        
        // Debug: Log original model size
        const originalBox = new THREE.Box3().setFromObject(gltf.scene);
        const originalSize = originalBox.getSize(new THREE.Vector3());
        console.log('Original model dimensions:', originalSize);
        
        // Scale the model much larger (10000x)
        gltf.scene.scale.set(10000, 10000, 10000);
        
        // Center the model
        gltf.scene.position.set(0, 0, 0);
        
        // Add the loaded model to the island group
        islandGroup.add(gltf.scene);
        
        // Enable shadows for all meshes in the model
        gltf.scene.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        
        // Debug: Log scaled model size
        const scaledBox = new THREE.Box3().setFromObject(gltf.scene);
        const scaledSize = scaledBox.getSize(new THREE.Vector3());
        console.log('Scaled model dimensions:', scaledSize);
        
        console.log('GLB model loaded successfully!');
        
        // Create character and add to scene
        character = createCharacter();
        character.scale.set(100, 100, 100); // Scale character to match
        
        // Position character on the island surface
        // Adjust the Y position to place character on the ground
        character.position.set(0, 2 * 100, 0); // Increased Y position to be on the island surface
        scene.add(character);
    },
    // Called while loading is progressing
    function (xhr) {
        updateLoadingProgress(xhr);
    },
    // Called when loading has errors
    function (error) {
        console.error('An error happened while loading the GLB model:', error);
    }
);