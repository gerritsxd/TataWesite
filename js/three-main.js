import { getCurrentLanguage } from './ui-language.js';
import { checkAndUpdateSection } from './ui-sections.js';
import { registerAnimations, updateMixers, getMixers, clearAnimations } from './animation-handler.js';

let scene, camera, renderer;
let mainScene, carModel; // GLTF model of the island and car
let waypoints = [];
let currentWaypointIndex = 0;

let clock = new THREE.Clock();

// Path and car movement
let pathCurve;
let pathProgress = 0;
let targetWaypointIndex = 1; // Not actively used in current path logic, but good for reference

// Camera settings
const cameraHeight = 1.5;
let baseCameraDistance = 4; // Base distance for calculations
let currentCameraDistance = baseCameraDistance; // Current distance, adjusted by zoom
const MIN_CAMERA_DISTANCE_FACTOR = 0.9; // 10% closer
const MAX_CAMERA_DISTANCE_FACTOR = 1.5; // 50% further
const MIN_ZOOM_DISTANCE = baseCameraDistance * MIN_CAMERA_DISTANCE_FACTOR;
const MAX_ZOOM_DISTANCE = baseCameraDistance * MAX_CAMERA_DISTANCE_FACTOR;
const ZOOM_SENSITIVITY = 0.2; // How much distance changes per scroll tick

// Mouse panning settings
const PATH_SENSITIVITY = 0.0005; // Sensitivity for car movement along path
const CAMERA_PITCH_SENSITIVITY = 0.002; // Sensitivity for camera pitch
const MIN_CAMERA_PITCH = -Math.PI / 4; // Min camera look down
const MAX_CAMERA_PITCH = Math.PI / 6;   // Max camera look up
const CAMERA_LERP_FACTOR = 0.1; // Smoothness for camera following car
let cameraPitch = 0; // Current camera pitch angle

// Constants for swipe detection
const SWIPE_THRESHOLD_X = 40; // Min horizontal distance for a swipe (pixels)
const SWIPE_THRESHOLD_Y_SINGLE_FINGER = 75; // Max vertical distance for a horizontal swipe (to distinguish from vertical scroll)
const SWIPE_VERTICAL_THRESHOLD_FOR_ZOOM = 30; // Min vertical distance for a two-finger zoom swipe
const SWIPE_HORIZONTAL_MAX_FOR_ZOOM = 75; // Max horizontal distance for a two-finger zoom swipe
const SWIPE_TIME_LIMIT = 500; // Max time in ms for a swipe gesture
const SIMULATED_KEY_PRESS_DURATION = 200; // ms for simulated key press
const TWO_FINGER_ZOOM_SENSITIVITY_FACTOR = 0.03; // Adjust how much two-finger swipe affects zoom

// Car movement physics
const maxSpeed = 0.001; // Max speed along path
const acceleration = 0.00002; // Acceleration rate
const deceleration = 0.00001; // Deceleration rate

// Key state tracking
const keys = { ArrowLeft: false, ArrowRight: false };
let currentSpeed = 0;

// Touch state variables
let touchStartX = 0, touchStartY = 0;
let touchStartTime = 0;
let twoFingerInitialMidY = 0;
let twoFingerLastMidY = 0;
let isTwoFingerActive = false;

let onModelsLoadedCallback = null;

// Helper function to create a sky gradient texture
function createSkyGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2; // Small width is fine for a vertical gradient
    canvas.height = 256; // Taller for smoother gradient

    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    
    // Example gradient: Light blue at top, fading to a slightly darker/hazier blue
    gradient.addColorStop(0, '#87CEEB'); // Light sky blue (top)
    gradient.addColorStop(0.7, '#ADD8E6'); // Lighter blue (middle)
    gradient.addColorStop(1, '#B0E0E6'); // Powder blue / hazy (bottom) - this will be fog color too

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Helper function to create a horizon plane
function createHorizonPlane() {
    const horizonSize = 2000; // Make it very large
    const planeGeometry = new THREE.PlaneGeometry(horizonSize, horizonSize);
    // Color should match the bottom of the sky gradient for a seamless blend
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xB0E0E6, side: THREE.DoubleSide }); 
    
    const horizonPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    horizonPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    horizonPlane.position.y = -10; // Position it below the main content, adjust as needed
                                   // This value might need tweaking based on your island's y-position and scale.
    horizonPlane.renderOrder = -1; // Render it first to avoid z-fighting with transparent objects if any
    return horizonPlane;
}

export function initThreeScene(callback) {
    onModelsLoadedCallback = callback;
    // Create scene
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x87CEEB); // Old sky blue background
    scene.background = createSkyGradientTexture(); // New gradient background
    
    // Adjust fog to match the bottom of the gradient
    scene.fog = new THREE.FogExp2(0xB0E0E6, 0.01); // Fog color matches gradient bottom

    // Add horizon plane
    const horizon = createHorizonPlane();
    scene.add(horizon);

    // Create camera
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Create renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        precision: 'highp'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.gammaFactor = 2.2;
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('wheel', onMouseWheel, { passive: false }); // Add mouse wheel listener

    setupMouseControls();
    loadModels();
    animate();
}

export function getThreeJSComponents() {
    return { scene, camera, renderer, mainScene, carModel, waypoints, pathCurve, clock, mixers: getMixers() };
}


function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

function loadModels() {
    const loadingManager = new THREE.LoadingManager();
    const gltfLoader = new THREE.GLTFLoader(loadingManager);
    clearAnimations(); // Clear any previous animations if reloading

    let modelsToLoad = 2;
    let modelsLoaded = 0;

    loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
        // This onProgress is per-model. We need a global progress.
        // The landing.js updateLoadingProgress will be called manually for aggregate.
        console.log(`Loading file: ${url} (${itemsLoaded}/${itemsTotal})`);
    };

    loadingManager.onLoad = function () {
        // This onLoad is tricky with multiple models if not handled carefully
        // It fires when ALL models under THIS manager are loaded.
    };
    
    const checkAllModelsLoaded = () => {
        modelsLoaded++;
        // Call updateLoadingProgress from landing.js
        const landingModule = import('./landing.js');
        landingModule.then(mod => mod.updateLoadingProgress((modelsLoaded / modelsToLoad) * 100));

        if (modelsLoaded === modelsToLoad) {
            console.log('All models loaded successfully!');
            if (waypoints.length > 0 && carModel) {
                positionCarAtWaypoint(0); // Initial position
                updateCarPosition(); // Ensure camera and section text update
            }
            if (onModelsLoadedCallback) {
                onModelsLoadedCallback();
            }
        }
    };


    gltfLoader.load('./models/Safespacecopy.glb', (gltf) => {
        mainScene = gltf.scene;
        mainScene.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                if (node.material) {
                    if (node.material.map) node.material.map.encoding = THREE.sRGBEncoding;
                    if (node.material.emissiveMap) node.material.emissiveMap.encoding = THREE.sRGBEncoding;
                    node.material.side = THREE.DoubleSide;
                    node.material.needsUpdate = true;
                }
            }
        });
        scene.add(mainScene);
        console.log('Main scene loaded.');
        registerAnimations(gltf, mainScene, 'island'); // Register animations from island model
        extractWaypoints(gltf);
        checkAllModelsLoaded();
    }, undefined, (error) => console.error('Error loading island model:', error));

    gltfLoader.load('./models/Car.glb', (gltf) => {
        carModel = gltf.scene;
        carModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                if (node.material) {
                    if (node.material.map) node.material.map.encoding = THREE.sRGBEncoding;
                    if (node.material.emissiveMap) node.material.emissiveMap.encoding = THREE.sRGBEncoding;
                    node.material.needsUpdate = true;
                }
            }
        });
        carModel.scale.set(0.28125, 0.28125, 0.28125);
        scene.add(carModel);
        console.log('Car model loaded.');
        registerAnimations(gltf, carModel, 'car'); // Register animations from car model
        checkAllModelsLoaded();
    }, undefined, (error) => console.error('Error loading car model:', error));
}

function extractWaypoints(gltf) {
    waypoints = []; // Reset waypoints
    gltf.scene.traverse((node) => {
        if (node.name && (node.name.toLowerCase().includes('waypoint') || node.name.includes('Empty'))) {
            waypoints.push(node);
        }
    });

    if (waypoints.length < 2) {
        console.error(`Error: Found only ${waypoints.length} waypoints. Need at least 2 for a path.`);
        // Create dummy waypoints if none are found to prevent errors
        if (waypoints.length === 0) {
            const wp1 = new THREE.Object3D(); wp1.position.set(0,0,0); wp1.name = "Empty.000";
            const wp2 = new THREE.Object3D(); wp2.position.set(5,0,0); wp2.name = "Empty.001";
            waypoints.push(wp1, wp2);
            console.log("Created dummy waypoints.");
        } else if (waypoints.length === 1) {
             const wp2 = new THREE.Object3D(); wp2.position.copy(waypoints[0].position).x += 5; wp2.name = "Empty.001";
             waypoints.push(wp2);
             console.log("Created a second dummy waypoint.");
        }
    }

    waypoints.sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+$/)?.[0]);
        const numB = parseInt(b.name.match(/\d+$/)?.[0]);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.name.localeCompare(b.name);
    });

    const points = waypoints.map(wp => wp.position);
    if (points.length >= 2) {
        pathCurve = new THREE.CatmullRomCurve3(points, true); // true = closed loop
         // visualizePath(); // Optional: for debugging
    } else {
        console.error("Not enough points to create a CatmullRomCurve3.");
        // Create a simple line segment path if only two points exist from dummy creation
        if (points.length === 2) {
            pathCurve = new THREE.LineCurve3(points[0], points[1]);
        }
    }
    console.log(`Found and sorted ${waypoints.length} waypoints.`);
    if(carModel) positionCarAtWaypoint(0);
}

function visualizePath() {
    if (!pathCurve || !(pathCurve instanceof THREE.CatmullRomCurve3)) return; // Only for CatmullRom
    const points = pathCurve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const pathLine = new THREE.Line(geometry, material);
    scene.add(pathLine);
    console.log("Path visualized.");
}

function updateCamera() {
    if (!carModel || !camera) return;

    const carPosition = carModel.position.clone();
    
    // Target camera position: behind and slightly above the car, looking at the car.
    // For side view, calculate offset based on car's orientation.
    const offset = new THREE.Vector3();
    carModel.getWorldDirection(offset); // Gets car's forward vector (-Z local)
    
    // To get a side view, we need the car's right or left vector.
    // Assuming car's local +X is its right.
    const sideOffset = new THREE.Vector3(-1, 0, 0); // Local -X direction (to view the car's right side)
    sideOffset.applyQuaternion(carModel.quaternion); // Transform to world space
    sideOffset.normalize();

    const targetCameraPosition = carPosition.clone()
        .add(sideOffset.multiplyScalar(currentCameraDistance)) // Use currentCameraDistance for zoom
        .add(new THREE.Vector3(0, cameraHeight, 0)); // Elevate

    // Apply camera pitch (pan up/down)
    // This needs to rotate around an axis perpendicular to both camera's view and up vector
    // For simplicity, let's adjust target position directly based on pitch for now
    // A more robust solution would involve quaternion rotations or lookAt adjustments.
    // We want to tilt the camera view, not move its base position up/down with pitch.
    
    camera.position.lerp(targetCameraPosition, CAMERA_LERP_FACTOR);

    // Camera looks at a point slightly in front of the car for better framing
    const lookAtPoint = carModel.position.clone();
    // lookAtPoint.add(offset.multiplyScalar(1)); // Look slightly ahead
    
    camera.lookAt(lookAtPoint);
    
    // Adjust for cameraPitch around the car's side axis
    // Create a quaternion for the pitch rotation
    const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(sideOffset, cameraPitch);
    // Apply this rotation to the vector from the car to the camera
    const cameraToCarVector = new THREE.Vector3().subVectors(camera.position, carModel.position);
    cameraToCarVector.applyQuaternion(pitchQuaternion);
    camera.position.copy(carModel.position).add(cameraToCarVector);

    camera.lookAt(carModel.position); // Re-apply lookAt after pitching
    camera.up.set(0, 1, 0); // Ensure world up is maintained
}

// Unified Pan Handlers
function setupMouseControls() {
    const container = document.getElementById('scene-container');
    if (!container) return;

    let isMousePanning = false;
    let mousePanStartX = 0, mousePanStartY = 0;
    let currentMousePanX = 0, currentMousePanY = 0;

    container.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left mouse button
            isMousePanning = true;
            mousePanStartX = e.clientX; 
            mousePanStartY = e.clientY;
            currentMousePanX = e.clientX; 
            currentMousePanY = e.clientY;
            container.classList.add('grabbing');
        }
    });

    container.addEventListener('mousemove', (e) => {
        if (!isMousePanning) return;
        const deltaX = e.clientX - currentMousePanX;
        const deltaY = e.clientY - currentMousePanY;

        pathProgress += deltaX * PATH_SENSITIVITY;
        pathProgress = (pathProgress % 1 + 1) % 1;

        cameraPitch -= deltaY * CAMERA_PITCH_SENSITIVITY;
        cameraPitch = Math.max(MIN_CAMERA_PITCH, Math.min(MAX_CAMERA_PITCH, cameraPitch));

        currentMousePanX = e.clientX; 
        currentMousePanY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
        if (isMousePanning) {
            isMousePanning = false;
            container.classList.remove('grabbing');
        }
    });
    
    container.addEventListener('mouseleave', () => {
        if (isMousePanning) {
            isMousePanning = false;
            container.classList.remove('grabbing');
        }
    });

    // --- Touch Controls: Swipe for Arrows, Two-finger swipe for Zoom ---
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isTwoFingerActive = false;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        } else if (e.touches.length === 2) {
            isTwoFingerActive = true;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            twoFingerInitialMidY = (touch1.clientY + touch2.clientY) / 2;
            twoFingerLastMidY = twoFingerInitialMidY;
            e.preventDefault(); // Prevent default actions like page zoom/scroll for two fingers
        }
    }, { passive: false });

    container.addEventListener('touchmove', (e) => {
        if (isTwoFingerActive && e.touches.length === 2) {
            e.preventDefault(); // Continue to prevent default during two-finger move
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentMidY = (touch1.clientY + touch2.clientY) / 2;
            const deltaMidY = currentMidY - twoFingerLastMidY;

            // Apply zoom based on deltaMidY
            if (deltaMidY > 0) { // Swipe Down (zoom out)
                currentCameraDistance += Math.abs(deltaMidY) * ZOOM_SENSITIVITY * TWO_FINGER_ZOOM_SENSITIVITY_FACTOR;
            } else if (deltaMidY < 0) { // Swipe Up (zoom in)
                currentCameraDistance -= Math.abs(deltaMidY) * ZOOM_SENSITIVITY * TWO_FINGER_ZOOM_SENSITIVITY_FACTOR;
            }
            currentCameraDistance = Math.max(MIN_ZOOM_DISTANCE, Math.min(MAX_ZOOM_DISTANCE, currentCameraDistance));
            
            twoFingerLastMidY = currentMidY; // Update for next move event
        } else if (!isTwoFingerActive && e.touches.length === 1) {
             // If single finger is moving, could be a swipe or a drag for other purposes.
             // For now, only allow horizontal scroll to be prevented if it's part of a swipe gesture.
             // More aggressive preventDefault here might block vertical page scrolling.
        }
    }, { passive: false });

    container.addEventListener('touchend', (e) => {
        if (!isTwoFingerActive && e.changedTouches.length === 1) { // Single finger swipe ended
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const deltaX = endX - touchStartX;
            const deltaY = endY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;
            const orientation = window.screen && window.screen.orientation ? window.screen.orientation.type : 'N/A';

            console.log(`Swipe End Debug: Orientation: ${orientation}`);
            console.log(`  Start: (${touchStartX.toFixed(2)}, ${touchStartY.toFixed(2)})`);
            console.log(`  End:   (${endX.toFixed(2)}, ${endY.toFixed(2)})`);
            console.log(`  Delta: (${deltaX.toFixed(2)}, ${deltaY.toFixed(2)}), Time: ${deltaTime}ms`);

            if (deltaTime < SWIPE_TIME_LIMIT) {
                console.log(`  Attempting swipe detection: abs(deltaX) > ${SWIPE_THRESHOLD_X} (${Math.abs(deltaX) > SWIPE_THRESHOLD_X}), abs(deltaY) < ${SWIPE_THRESHOLD_Y_SINGLE_FINGER} (${Math.abs(deltaY) < SWIPE_THRESHOLD_Y_SINGLE_FINGER})`);
                // Check for primarily horizontal swipe
                if (Math.abs(deltaX) > SWIPE_THRESHOLD_X && Math.abs(deltaY) < SWIPE_THRESHOLD_Y_SINGLE_FINGER) {
                    e.preventDefault(); // Prevent any click or other action after a recognized swipe
                    if (deltaX < 0) { // Swipe Left
                        console.log("  --> Swipe Left Detected (Attempting ArrowLeft)");
                        keys.ArrowLeft = true;
                        setTimeout(() => { keys.ArrowLeft = false; }, SIMULATED_KEY_PRESS_DURATION);
                    } else { // Swipe Right
                        console.log("  --> Swipe Right Detected (Attempting ArrowRight)");
                        keys.ArrowRight = true;
                        setTimeout(() => { keys.ArrowRight = false; }, SIMULATED_KEY_PRESS_DURATION);
                    }
                } else {
                    console.log("  Swipe did not meet horizontal swipe criteria.");
                }
            } else {
                console.log("  Swipe time too long, not a swipe.");
            }
        }

        // Reset two-finger state if touches are ending
        if (e.touches.length < 2) {
            isTwoFingerActive = false;
            twoFingerInitialMidY = 0;
            twoFingerLastMidY = 0;
        }
    }, { passive: false });

    container.addEventListener('touchcancel', () => {
        isTwoFingerActive = false;
        twoFingerInitialMidY = 0;
        twoFingerLastMidY = 0;
    }, { passive: false });
}

function positionCarAtWaypoint(index) {
    if (!carModel || !pathCurve || waypoints.length === 0) return;
    currentWaypointIndex = index % waypoints.length; // Ensure index is within bounds
    
    // Calculate pathProgress based on waypoint index
    // This assumes waypoints are somewhat evenly distributed for CatmullRomCurve3
    // For LineCurve3 (dummy path), progress is 0 for first, 1 for last.
    if (pathCurve.points && pathCurve.points.length > 1) {
         pathProgress = currentWaypointIndex / (pathCurve.points.length -1); // For open curves
        if (pathCurve instanceof THREE.CatmullRomCurve3 && pathCurve.closed) {
             pathProgress = currentWaypointIndex / pathCurve.points.length; // For closed CatmullRom
        }
    } else {
        pathProgress = 0;
    }
    pathProgress = Math.max(0, Math.min(1, pathProgress)); // Clamp progress

    updateCarPosition(); // This will set position, orientation, and call checkAndUpdateSection
}

function updateCarPosition() {
    if (!pathCurve || !carModel) return;

    const point = pathCurve.getPointAt(pathProgress);
    carModel.position.copy(point);

    const tangent = pathCurve.getTangentAt(pathProgress).normalize();
    const lookAtPosition = point.clone().add(tangent);
    carModel.lookAt(lookAtPosition);
    
    // Determine current waypoint index based on path progress
    updateCurrentWaypointIndex();
    checkAndUpdateSection(currentWaypointIndex, getCurrentLanguage()); // Pass language
    updateCamera();
}

function updateCurrentWaypointIndex() {
    if (!waypoints.length || !pathCurve.points || pathCurve.points.length === 0) return;
    const totalPoints = pathCurve.points.length; // For CatmullRom, this is the number of control points
    
    // Estimate current index based on progress
    // This is an approximation. For precise section triggering, one might need
    // to check distances to waypoint positions along the curve.
    if (pathCurve.closed) {
        currentWaypointIndex = Math.floor(pathProgress * totalPoints) % totalPoints;
    } else {
        currentWaypointIndex = Math.min(Math.floor(pathProgress * totalPoints), totalPoints - 1);
    }
}

function onKeyDown(event) {
    if (event.key in keys) {
        keys[event.key] = true;
        event.preventDefault();
    }
}

function onKeyUp(event) {
    if (event.key in keys) {
        keys[event.key] = false;
        event.preventDefault();
    }
}

function onMouseWheel(event) {
    event.preventDefault(); // Prevent default page scrolling

    // Positive deltaY for scroll down (zoom out), negative for scroll up (zoom in)
    if (event.deltaY > 0) {
        currentCameraDistance += ZOOM_SENSITIVITY;
    } else if (event.deltaY < 0) {
        currentCameraDistance -= ZOOM_SENSITIVITY;
    }

    // Clamp the camera distance to the defined min/max zoom levels
    currentCameraDistance = Math.max(MIN_ZOOM_DISTANCE, Math.min(MAX_ZOOM_DISTANCE, currentCameraDistance));
    
    // The camera position will be updated in the main animate() loop via updateCamera()
}

function updateCarMovement() {
    if (!pathCurve) return;

    let targetSpeed = 0;
    if (keys.ArrowRight) targetSpeed = maxSpeed;
    if (keys.ArrowLeft) targetSpeed = -maxSpeed;

    if (targetSpeed !== 0) {
        currentSpeed = (targetSpeed > currentSpeed) ?
            Math.min(targetSpeed, currentSpeed + acceleration) :
            Math.max(targetSpeed, currentSpeed - acceleration);
    } else {
        currentSpeed = (currentSpeed > 0) ?
            Math.max(0, currentSpeed - deceleration) :
            Math.min(0, currentSpeed + deceleration);
    }

    if (currentSpeed !== 0) {
        pathProgress += currentSpeed;
        pathProgress = (pathProgress % 1 + 1) % 1; // Ensure pathProgress stays within [0, 1) and handles negative results
    }
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    updateCarMovement(); // Update speed and pathProgress based on keys
    
    // Only call updateCarPosition if pathProgress changed or panning
    // (keys or mouse panning modify pathProgress directly)
    updateCarPosition(); 


    updateMixers(delta); // Update all registered animation mixers

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

export function applyPreset(presetName) {
    const presets = {
        default: { skyColor: '#87CEEB', fogDensity: 0.01, ambientIntensity: 0.2, directionalIntensity: 0.5, lightColor: '#ffffff' },
        sunset: { skyColor: '#FF7F50', fogDensity: 0.015, ambientIntensity: 0.3, directionalIntensity: 0.7, lightColor: '#FF8C00' },
        night: { skyColor: '#0A1A2A', fogDensity: 0.03, ambientIntensity: 0.1, directionalIntensity: 0.2, lightColor: '#CCCCFF' },
        foggy: { skyColor: '#DCDCDC', fogDensity: 0.04, ambientIntensity: 0.4, directionalIntensity: 0.3, lightColor: '#FFFFFF' },
        dystopian: { skyColor: '#1A0A0A', fogDensity: 0.025, ambientIntensity: 0.15, directionalIntensity: 0.4, lightColor: '#A52A2A' }
    };
    const preset = presets[presetName] || presets.default;

    if (scene) {
        const skyColor = new THREE.Color(preset.skyColor);
        scene.background = skyColor;
        if (scene.fog) {
            scene.fog.color = skyColor;
            scene.fog.density = preset.fogDensity;
        }
    }
    const ambientLight = scene.children.find(child => child instanceof THREE.AmbientLight);
    const directionalLight = scene.children.find(child => child instanceof THREE.DirectionalLight);
    if (ambientLight) {
        ambientLight.intensity = preset.ambientIntensity;
        ambientLight.color = new THREE.Color(preset.lightColor);
    }
    if (directionalLight) {
        directionalLight.intensity = preset.directionalIntensity;
        directionalLight.color = new THREE.Color(preset.lightColor);
    }
    console.log(`Applied preset: ${presetName}`);
}