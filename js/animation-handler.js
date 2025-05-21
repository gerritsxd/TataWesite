let animations = []; // Stores { id, name, clip, mixer, model }
let activeAnimations = new Map(); // Stores { animId: AnimationAction }
let mixers = []; // Stores all AnimationMixer instances

// Called from three-main.js when models are loaded
export function registerAnimations(gltf, modelRoot, modelName) {
    if (gltf.animations && gltf.animations.length > 0) {
        console.log(`Found ${gltf.animations.length} animations in ${modelName} model`);
        const modelMixer = new THREE.AnimationMixer(modelRoot);
        mixers.push(modelMixer);

        gltf.animations.forEach((clip, index) => {
            const animId = `${modelName}-anim-${index}`;
            animations.push({
                id: animId,
                name: clip.name || `${modelName} Animation ${index + 1}`,
                clip: clip,
                mixer: modelMixer,
                model: modelName
            });
            // Auto-play specific animations if needed (e.g., airbus)
            if (clip.name.toLowerCase().includes('airbus') || clip.name.toLowerCase().includes('320')) {
                setTimeout(() => { // Delay slightly to ensure UI is ready if it depends on this
                    playAnimation(animId);
                    console.log(`Auto-playing airbus animation: ${clip.name}`);
                }, 1000);
            }
        });
    } else {
        console.log(`No GLTF animations found in ${modelName} model. Searching for objects to animate.`);
        let foundAnimatedObjects = false;
        modelRoot.traverse((node) => {
            if (node.name && (node.name.toLowerCase().includes('plane') ||
                node.name.toLowerCase().includes('fly') ||
                node.name.toLowerCase().includes('anim') ||
                node.name.toLowerCase().includes('airbus') ||
                node.name.toLowerCase().includes('320'))) {
                console.log(`Found potential object for custom animation: ${node.name}`);
                createCustomAnimationForObject(node, modelName);
                foundAnimatedObjects = true;
            }
        });
        if (!foundAnimatedObjects) {
            console.log(`No specific objects for custom animation found in ${modelName}.`);
        }
    }
    updateAnimationListUI(); // Update UI if it exists
}

export function clearAnimations() {
    animations = [];
    activeAnimations.forEach(action => action.stop());
    activeAnimations.clear();
    mixers = [];
}


function createCustomAnimationForObject(object, modelName) {
    const objectMixer = new THREE.AnimationMixer(object);
    mixers.push(objectMixer);
    const objectIdName = object.name.replace(/[^a-zA-Z0-9]/g, '') || 'CustomObj';

    // Example: Simple float animation
    const times = [0, 1, 2]; // Keyframe times in seconds
    const values = [
        object.position.y, // Start at current y
        object.position.y + 0.5, // Float up
        object.position.y  // Return to start
    ];
    const trackName = `${object.uuid}.position[y]`; // Animate y-component of position
    // Note: THREE.KeyframeTrack expects a full vector for position, not just y.
    // For simplicity, this example is conceptual. A real implementation would be:
    const posKFValues = [
        object.position.x, object.position.y, object.position.z,
        object.position.x, object.position.y + 0.2, object.position.z,
        object.position.x, object.position.y, object.position.z,
    ];
    const positionTrack = new THREE.KeyframeTrack(`${object.name}.position`, times, posKFValues);


    const clip = new THREE.AnimationClip(`CustomFloat_${objectIdName}`, 2, [positionTrack]);
    const animId = `custom-${modelName}-${objectIdName}-${animations.length}`;
    animations.push({
        id: animId,
        name: `${object.name} Float`,
        clip: clip,
        mixer: objectMixer,
        model: modelName
    });

    playAnimation(animId); // Auto-play custom animation
    console.log(`Created and auto-playing custom float animation for ${object.name}`);
    updateAnimationListUI();
}


export function initAnimationHandler() {
    // Setup event listeners for any global animation controls if they exist in HTML
    const playAllBtn = document.getElementById('play-all');
    if (playAllBtn) playAllBtn.addEventListener('click', playAllAnimations);

    const stopAllBtn = document.getElementById('stop-all');
    if (stopAllBtn) stopAllBtn.addEventListener('click', stopAllAnimations);

    const speedSlider = document.getElementById('animation-speed');
    if (speedSlider) speedSlider.addEventListener('input', (e) => updateAnimationSpeed(parseFloat(e.target.value)));
    
    updateAnimationListUI(); // Initial population of the list
}

export function updateMixers(delta) {
    mixers.forEach(mixer => mixer.update(delta));
}

export function getMixers() {
    return mixers;
}

export function playAnimation(animId) {
    const anim = animations.find(a => a.id === animId);
    if (!anim) {
        console.warn(`Animation with ID ${animId} not found.`);
        return;
    }

    if (activeAnimations.has(animId)) {
        activeAnimations.get(animId).stop();
    }

    const action = anim.mixer.clipAction(anim.clip);
    action.reset().play();
    activeAnimations.set(animId, action);
    updateAnimationButtonStates();
    console.log(`Playing animation: ${anim.name} (ID: ${animId})`);
}

export function stopAnimation(animId) {
    if (activeAnimations.has(animId)) {
        activeAnimations.get(animId).stop();
        activeAnimations.delete(animId);
        updateAnimationButtonStates();
        const anim = animations.find(a => a.id === animId);
        console.log(`Stopped animation: ${anim ? anim.name : animId}`);
    }
}

export function playAllAnimations() {
    animations.forEach(anim => playAnimation(anim.id));
}

export function stopAllAnimations() {
    // Iterate over a copy of keys because stopAnimation modifies the map
    [...activeAnimations.keys()].forEach(id => stopAnimation(id));
}

export function updateAnimationSpeed(speed) {
    activeAnimations.forEach(action => {
        action.timeScale = speed;
    });
    const speedValueDisplay = document.getElementById('animation-speed-value');
    if (speedValueDisplay) speedValueDisplay.textContent = speed.toFixed(1);
    console.log(`Animation speed set to: ${speed}`);
}

// UI Update Functions (dependent on HTML elements existing)
function updateAnimationListUI() {
    const animationListDiv = document.getElementById('animation-list');
    if (!animationListDiv) return; // No UI element to update

    animationListDiv.innerHTML = ''; // Clear existing list

    if (animations.length === 0) {
        animationListDiv.innerHTML = '<p>No animations loaded.</p>';
        return;
    }

    const groupedAnimations = animations.reduce((acc, anim) => {
        (acc[anim.model] = acc[anim.model] || []).push(anim);
        return acc;
    }, {});

    for (const modelName in groupedAnimations) {
        const modelHeader = document.createElement('h5');
        modelHeader.textContent = `${modelName.charAt(0).toUpperCase() + modelName.slice(1)} Animations`;
        animationListDiv.appendChild(modelHeader);

        const groupDiv = document.createElement('div');
        groupDiv.className = 'animation-group';
        groupedAnimations[modelName].forEach(anim => {
            const row = document.createElement('div');
            row.className = 'animation-row';
            row.innerHTML = `
                <span class="animation-name" title="${anim.name}">${anim.name}</span>
                <div class="animation-controls">
                    <button class="play-btn" data-anim-id="${anim.id}">Play</button>
                    <button class="stop-btn" data-anim-id="${anim.id}" disabled>Stop</button>
                </div>
            `;
            groupDiv.appendChild(row);
        });
        animationListDiv.appendChild(groupDiv);
    }
    
    // Add event listeners to new buttons
    animationListDiv.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', () => playAnimation(btn.dataset.animId));
    });
    animationListDiv.querySelectorAll('.stop-btn').forEach(btn => {
        btn.addEventListener('click', () => stopAnimation(btn.dataset.animId));
    });
    updateAnimationButtonStates();
}

function updateAnimationButtonStates() {
    document.querySelectorAll('.play-btn').forEach(btn => {
        const animId = btn.dataset.animId;
        btn.disabled = activeAnimations.has(animId);
        btn.classList.toggle('active', activeAnimations.has(animId));
    });
    document.querySelectorAll('.stop-btn').forEach(btn => {
        btn.disabled = !activeAnimations.has(btn.dataset.animId);
    });
}