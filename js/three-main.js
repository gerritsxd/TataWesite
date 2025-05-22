import { getCurrentLanguage } from './ui-language.js';
import { checkAndUpdateSection, getActiveSectionName } from './ui-sections.js';
import { registerAnimations, updateMixers, getMixers, clearAnimations } from './animation-handler.js';

// --- Constants ---
const MAX_SPEED_WAYPOINTS = 0.002; // Max speed for waypoint navigation
const ACCELERATION_WAYPOINTS = 0.0001;
const DECELERATION_WAYPOINTS = 0.0002;
// SHOW_OVERLAY_DISTANCE_THRESHOLD removed
// Note: Other constants like MIN_ZOOM_DISTANCE, MAX_ZOOM_DISTANCE are defined further down or as needed.

let scene, camera, renderer;
let mainScene, carModel; // GLTF model of the island and car
let videoPlaneMesh = null; // Make videoPlaneMesh globally accessible
let raycaster; // Make raycaster global
let mouse;     // Make mouse global
let waypoints = [];
let cameraPoints = []; // Added for new camera points
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

// Camera Zoom State
let isZoomedToPlane = false;
let originalCameraPosition = null;
let originalCameraQuaternion = null;
let targetPlaneCenter = null;
let targetPlaneCameraPosition = null;

// For dynamic positioning of controls-info div
let controlsInfoDivElement = null; // To store the #controls-info div
const videoPlaneWorldCenter = new THREE.Vector3(); // Center of the video plane in world coords
let videoPlaneInitialized = false; // Flag to check if video plane center is set

// Helper function to create a sky gradient texture
function createSkyGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2; // Small width is fine for a vertical gradient
    canvas.height = 256; // Taller for smoother gradient

    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    
    // Sunrise gradient
    gradient.addColorStop(0, '#2C3E50');    // Dark blue/grey (top)
    gradient.addColorStop(0.4, '#5D6D7E');  // Muted mid blue
    gradient.addColorStop(0.7, '#E74C3C');  // Muted red/orange
    gradient.addColorStop(0.9, '#F39C12');  // Orange
    gradient.addColorStop(1, '#FAD7A0');    // Pale yellow/orange (horizon)

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
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xFAD7A0, side: THREE.DoubleSide }); 
    
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
    scene.background = createSkyGradientTexture(); // Sunrise gradient background
    
    // Adjust fog for sunrise
    scene.fog = new THREE.FogExp2(0xFAD7A0, 0.012); // Fog matches horizon, slightly less dense

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

    // Initialize raycaster and mouse for global use
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Add click listener for general scene clicks (NO LONGER FOR VIDEO PLANE ZOOM)
    const sceneContainer = document.getElementById('scene-container');
    sceneContainer.addEventListener('click', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        // const intersects = raycaster.intersectObject(videoPlaneMesh, true);
        // console.log(`Scene Click Listener: Fired. Intersects count: ${intersects.length}`);
        
        // Existing video plane click logic for zoom is REMOVED from here.
        // If you need to detect clicks on other 3D objects, that logic could go here.

    }, false);

    // Add lights for sunrise
    const ambientLight = new THREE.AmbientLight(0xFFEBCD, 0.15); // Warmer, slightly brighter ambient
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFF8C00, 0.5); // Warm orange sun, moderate intensity
    directionalLight.position.set(100, 20, 0); // Sun low on the horizon (adjust x,y,z for desired angle)
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
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

// New exported function to receive the div from landing.js
export function setControlsInfoDiv(htmlElement) {
    controlsInfoDivElement = htmlElement;
    if (controlsInfoDivElement) {
        // Prepare the div for dynamic positioning
        controlsInfoDivElement.style.position = 'fixed'; // Ensure it's fixed
        controlsInfoDivElement.style.transform = 'translate(-50%, -50%)'; // Center the div on its (left, top)
        controlsInfoDivElement.style.opacity = '0'; // Start hidden, logic will show it
        controlsInfoDivElement.style.pointerEvents = 'none'; // Start non-interactive
        // Transition can be defined in CSS for #controls-info for opacity
        // controlsInfoDivElement.style.transition = 'opacity 0.3s ease-in-out'; 
    }
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
            createVideoPlane(); // Call to create the video plane
        }
    };


    gltfLoader.load('./models/WindMILLisTURNING.glb', (gltf) => {
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
    cameraPoints = []; // Reset camera points
    console.log('Traversing GLTF scene to find waypoints and camera points:');

    gltf.scene.traverse((node) => {
        if (node.name) {
            const isWaypoint = /^Empty\d+$/i.test(node.name);
            const isCameraPoint = /^cam\d$/i.test(node.name);
            // console.log(`Node found: '${node.name}', isWaypoint: ${isWaypoint}, isCameraPoint: ${isCameraPoint}`, node); // Cleaned up verbose log

            if (isWaypoint) {
                waypoints.push(node);
            }
            else if (isCameraPoint) {
                cameraPoints.push(node);
            }
        }
    });

    if (waypoints.length < 2) {
        console.error(`Error: Found only ${waypoints.length} waypoints. Need at least 2 for a path.`);
        // Create dummy waypoints if none are found to prevent errors
        if (waypoints.length === 0) {
            const wp1 = new THREE.Object3D(); wp1.position.set(0,0,0); wp1.name = "Empty000";
            const wp2 = new THREE.Object3D(); wp2.position.set(5,0,0); wp2.name = "Empty001";
            waypoints.push(wp1, wp2);
            console.log("Created dummy waypoints.");
        } else if (waypoints.length === 1) {
             const wp2 = new THREE.Object3D(); wp2.position.copy(waypoints[0].position).x += 5; wp2.name = "Empty001";
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

    cameraPoints.sort((a, b) => {
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
    console.log(`Found and sorted ${cameraPoints.length} camera points:`, cameraPoints.map(cp => cp.name));
    console.log('Full cameraPoints array:', cameraPoints); // Log the full array
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
    if (isZoomedToPlane || (originalCameraPosition && !isZoomedToPlane)) {
        // If zooming in/out or returning to original, let animate() handle camera exclusively
        return; 
    }

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
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const intersectsVideoPlane = videoPlaneMesh ? raycaster.intersectObject(videoPlaneMesh, false) : [];

            if (intersectsVideoPlane.length > 0) {
                container.style.cursor = 'pointer'; // Indicate clickable video plane
                console.log("Mousedown on video plane, preventing pan. Cursor: pointer.");
                // The 'click' event listener in initThreeScene will handle the interaction.
                // e.stopPropagation(); // May not be needed if we just return
                return; 
            }
            // If not on video plane, proceed with panning
            isMousePanning = true;
            mousePanStartX = e.clientX; 
            mousePanStartY = e.clientY;
            currentMousePanX = e.clientX; 
            currentMousePanY = e.clientY;
            container.style.cursor = 'grabbing'; // Set cursor for panning
            // container.classList.add('grabbing'); // Class might still be useful for other CSS effects
            console.log("Mousedown on scene, starting pan. Cursor: grabbing.");
        }
    });

    container.addEventListener('mousemove', (e) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        if (isMousePanning) {
            container.style.cursor = 'grabbing';
            const deltaX = e.clientX - currentMousePanX;
            const deltaY = e.clientY - currentMousePanY;
            currentMousePanX = e.clientX;
            currentMousePanY = e.clientY;
            
            if (camera && camera.isPerspectiveCamera) {
                // Adjust panning sensitivity as needed
                const panSpeed = 0.002;
                camera.translateX(-deltaX * panSpeed * (camera.position.distanceTo(scene.position) / 10)); 
                camera.translateY(deltaY * panSpeed * (camera.position.distanceTo(scene.position) / 10));
                camera.updateProjectionMatrix(); 
            }
            console.log("Mousemove during pan. Cursor: grabbing.");
        } else {
            // Not panning, just hovering. Check for video plane.
            const intersectsVideoPlane = videoPlaneMesh ? raycaster.intersectObject(videoPlaneMesh, false) : [];
            if (intersectsVideoPlane.length > 0) {
                container.style.cursor = 'pointer';
                // console.log("Hovering over video plane. Cursor: pointer.");
            } else {
                container.style.cursor = 'grab'; // Default pannable cursor
                // console.log("Hovering over scene. Cursor: grab.");
            }
        }
    });

    container.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            isMousePanning = false;
            // container.classList.remove('grabbing');
            console.log("Mouseup. Panning stopped.");
            // After mouseup, set cursor based on what's underneath
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersectsVideoPlane = videoPlaneMesh ? raycaster.intersectObject(videoPlaneMesh, false) : [];
            if (intersectsVideoPlane.length > 0) {
                container.style.cursor = 'pointer';
                console.log("Mouseup over video plane. Cursor: pointer.");
            } else {
                container.style.cursor = 'grab';
                console.log("Mouseup over scene. Cursor: grab.");
            }
        }
    });

    container.addEventListener('mouseleave', () => {
        isMousePanning = false;
        // container.classList.remove('grabbing');
        container.style.cursor = 'default'; // Reset cursor when mouse leaves container
        console.log("Mouse left scene container. Cursor: default.");
    });

    container.addEventListener('mouseenter', (e) => {
        // Set initial cursor based on what's underneath when mouse enters
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersectsVideoPlane = videoPlaneMesh ? raycaster.intersectObject(videoPlaneMesh, false) : [];
        if (intersectsVideoPlane.length > 0) {
            container.style.cursor = 'pointer';
        } else {
            container.style.cursor = 'grab';
        }
        console.log("Mouse entered scene container.");
    });

    window.addEventListener('resize', onWindowResize, false);
    
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
    updateMixers(delta); // Update GLTF animations

    // Update current section based on waypoint progress
    // Assuming currentWaypointIndex is updated reliably elsewhere (e.g., by updateCarPosition or similar)
    // If not, this needs to be based on pathProgress and waypoints array length.
    // For now, we'll assume currentWaypointIndex is available and correct.
    if (typeof currentWaypointIndex !== 'undefined') { // Check if currentWaypointIndex is defined
        checkAndUpdateSection(currentWaypointIndex, getCurrentLanguage());
    }

    // Camera Zoom/Unzoom Animation Logic
    const lerpFactor = 0.07; // Speed of interpolation, adjust as needed
    if (isZoomedToPlane && targetPlaneCameraPosition && targetPlaneCenter) {
        camera.position.lerp(targetPlaneCameraPosition, lerpFactor);
        
        // Create a temporary matrix to calculate target quaternion
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.lookAt(camera.position, targetPlaneCenter, camera.up);
        const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(tempMatrix);
        camera.quaternion.slerp(targetQuaternion, lerpFactor);

    } else if (!isZoomedToPlane && originalCameraPosition && originalCameraQuaternion) {
        camera.position.lerp(originalCameraPosition, lerpFactor);
        camera.quaternion.slerp(originalCameraQuaternion, lerpFactor);

        // If close enough to original state, stop zooming out and release control
        if (camera.position.distanceTo(originalCameraPosition) < 0.05 && 
            camera.quaternion.angleTo(originalCameraQuaternion) < 0.05) { 
            console.log("Camera returned to original state.");
            camera.position.copy(originalCameraPosition);
            camera.quaternion.copy(originalCameraQuaternion);
            originalCameraPosition = null;
            originalCameraQuaternion = null;
            targetPlaneCenter = null; 
            targetPlaneCameraPosition = null;
        }
    }
    // Only call updateCamera if not in a zoom transition
    if (!isZoomedToPlane && !originalCameraPosition) {
        updateCarMovement(); // Ensure car movement is updated
        updateCamera(); 
        updateCarPosition(); // Ensure car position is updated
    }

    // Update the controls-info div's position
    updateAttachedDivPosition();

    renderer.render(scene, camera);
}

function updateAttachedDivPosition() {
    // Removed !carModel from condition as section logic doesn't directly need carModel here
    if (!controlsInfoDivElement || !videoPlaneInitialized || !camera || !renderer || !videoPlaneWorldCenter) {
        if (controlsInfoDivElement && controlsInfoDivElement.style.opacity !== '0') {
            controlsInfoDivElement.style.opacity = '0';
            controlsInfoDivElement.style.pointerEvents = 'none';
            controlsInfoDivElement.classList.remove('blinking-indicator'); // Ensure removed if div becomes invalid
        }
        return;
    }

    // Get current active section name
    const activeSection = getActiveSectionName();
    const inCameraSection = activeSection === "Camera";

    const screenPosition = videoPlaneWorldCenter.clone();
    screenPosition.project(camera); // Project 3D point to NDC

    // Check if the point is within the camera's view frustum
    const pointIsOnScreen = 
        screenPosition.x >= -1 && screenPosition.x <= 1 &&
        screenPosition.y >= -1 && screenPosition.y <= 1 &&
        screenPosition.z < 1; // z < 1 means in front of camera / not clipped by far plane

    // Determine visibility and blinking state
    const shouldBeVisible = pointIsOnScreen && (inCameraSection || isZoomedToPlane);
    const shouldBlink = pointIsOnScreen && inCameraSection && !isZoomedToPlane;

    if (shouldBeVisible) {
        const x = (screenPosition.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
        const y = (-screenPosition.y * 0.5 + 0.5) * renderer.domElement.clientHeight;

        controlsInfoDivElement.style.left = `${x}px`;
        controlsInfoDivElement.style.top = `${y}px`;
        controlsInfoDivElement.style.opacity = '1';
        controlsInfoDivElement.style.pointerEvents = 'auto'; // Make it clickable

        if (shouldBlink) {
            controlsInfoDivElement.classList.add('blinking-indicator');
        } else {
            controlsInfoDivElement.classList.remove('blinking-indicator');
        }
    } else {
        controlsInfoDivElement.style.opacity = '0';
        controlsInfoDivElement.style.pointerEvents = 'none';
        controlsInfoDivElement.classList.remove('blinking-indicator'); // Ensure removed when not visible
    }
}

export function toggleVideoZoom() {
    if (!videoPlaneMesh || !camera || cameraPoints.length < 4) { 
        console.warn("Video plane, camera, or cameraPoints not ready for zoom toggle.");
        return;
    }

    isZoomedToPlane = !isZoomedToPlane; // Toggle the zoom state

    if (isZoomedToPlane) {
        // Zoom IN
        console.log("UI Click: Zooming IN to video plane.");
        if (camera) {
            // Save current camera state if not already in a zoom-out transition being reverted
            if (!originalCameraPosition) { // Only save if not already set (e.g. mid-zoom-out)
                originalCameraPosition = camera.position.clone();
            }
            if (!originalCameraQuaternion) { // Only save if not already set
                originalCameraQuaternion = camera.quaternion.clone();
            }
        } else {
            console.error("Camera not initialized for zoom IN.");
            isZoomedToPlane = false; // Revert state
            return;
        }

        // targetPlaneCenter is effectively videoPlaneWorldCenter for looking at
        // videoPlaneWorldCenter is already calculated and stored.

        // Calculate the normal of the video plane to position camera in front of it.
        // We use the original points that defined the plane for robust normal calculation.
        const p1 = cameraPoints.find(p => p.name === 'cam1').position;
        const p2 = cameraPoints.find(p => p.name === 'cam2').position;
        // const p3 = cameraPoints.find(p => p.name === 'cam3').position; // Not needed for AB AC normal
        const p4 = cameraPoints.find(p => p.name === 'cam4').position;

        const vA = new THREE.Vector3().subVectors(p2, p1); // Edge vector p1 -> p2
        const vB = new THREE.Vector3().subVectors(p4, p1); // Edge vector p1 -> p4
        const planeNormal = new THREE.Vector3().crossVectors(vA, vB).normalize();
        
        // The cross product (p2-p1) x (p4-p1) should give a normal pointing out from the front face
        // if p1, p2, p4 are ordered counter-clockwise when viewed from the front.
        // We might need to negate it if it points away from the desired viewing direction.
        // Let's check its direction relative to the current camera's view of the plane's center.
        const viewDirection = new THREE.Vector3().subVectors(videoPlaneWorldCenter, camera.position).normalize();
        if (planeNormal.dot(viewDirection) > 0) { // If normal points towards camera rather than away from plane's front
            planeNormal.negate(); // We want normal to point from plane's back to its front
        }

        const zoomDistance = 0.75; // Adjust as needed for how close to zoom
        if (!targetPlaneCameraPosition) targetPlaneCameraPosition = new THREE.Vector3();
        targetPlaneCameraPosition.copy(videoPlaneWorldCenter).addScaledVector(planeNormal, zoomDistance);
        
        // The animate() function will handle tweening to targetPlaneCameraPosition
        // and looking at videoPlaneWorldCenter (which is also targetPlaneCenter).
        targetPlaneCenter = videoPlaneWorldCenter.clone(); // Explicitly set for animate loop logic

    } else {
        // Zoom OUT
        console.log("UI Click: Zooming OUT from video plane.");
        // The animate() function handles lerping back to originalCameraPosition/Quaternion
        // when isZoomedToPlane is false and originalCameraPosition is set.
        // targetPlaneCameraPosition and targetPlaneCenter will be (or should be) cleared 
        // in animate() once the camera returns to its original state.
    }
}

function createVideoPlane() {
    console.log("Attempting to create video plane...");
    if (cameraPoints.length < 4) {
        console.error("Not enough camera points to create video plane. Need 4, found:", cameraPoints.length);
        return;
    }

    console.log("Camera points for video plane:");
    for (let i = 0; i < 4; i++) {
        if (cameraPoints[i] && cameraPoints[i].position) {
            console.log(`  ${cameraPoints[i].name}: x=${cameraPoints[i].position.x.toFixed(2)}, y=${cameraPoints[i].position.y.toFixed(2)}, z=${cameraPoints[i].position.z.toFixed(2)}`);
        }
    }

    // 1. Create video element
    const video = document.createElement('video');
    video.src = 'video/tata.mp4'; // Path relative to index.html
    video.loop = true;
    video.muted = true; // Essential for autoplay in many browsers
    video.playsInline = true;
    video.crossOrigin = 'anonymous'; // If video is from another domain, or for certain operations
    // video.style.display = 'none'; // Keep it off-screen if not needed in DOM
    // document.body.appendChild(video); // Not strictly necessary if only used for texture

    video.play().then(() => {
        console.log("Video playback started for texture.");
    }).catch(error => {
        console.error("Error attempting to play video for texture:", error);
        // Add a click listener to play video if autoplay fails
        const playVideo = () => {
            video.play().then(() => {
                console.log("Video played after user interaction.");
                document.removeEventListener('click', playVideo);
            }).catch(e => console.error("Still failed to play video:", e));
        };
        document.addEventListener('click', playVideo, { once: true });
        console.log("Video autoplay failed. Click anywhere on the page to attempt to start it.");
    });

    // 2. Create video texture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat; // Or RGBAFormat if video has alpha
    videoTexture.flipY = true; // Corrects upside-down video

    // 3. Define plane geometry vertices from cameraPoints, with a slight offset forward
    const p1_orig = cameraPoints.find(p => p.name === 'cam1').position.clone(); // cam1
    const p2_orig = cameraPoints.find(p => p.name === 'cam2').position.clone(); // cam2
    const p3_orig = cameraPoints.find(p => p.name === 'cam3').position.clone(); // cam3
    const p4_orig = cameraPoints.find(p => p.name === 'cam4').position.clone(); // cam4

    // Calculate and store the world center of the video plane (using original points)
    videoPlaneWorldCenter.addVectors(p1_orig, p3_orig).multiplyScalar(0.5);
    videoPlaneInitialized = true;
    console.log("Video plane world center calculated:", videoPlaneWorldCenter);

    // Calculate the plane normal (points 'out' from the front face if vertices are ordered correctly for front view)
    const vA_geom = new THREE.Vector3().subVectors(p2_orig, p1_orig);
    const vB_geom = new THREE.Vector3().subVectors(p4_orig, p1_orig);
    const planeNormal_geom = new THREE.Vector3().crossVectors(vA_geom, vB_geom).normalize();
    planeNormal_geom.negate(); // Ensure it points towards the typical viewing direction (front of video)

    const planeOffsetDistance = 0.1; // How much to move the plane forward. Adjust as needed.

    const p1 = p1_orig.clone().addScaledVector(planeNormal_geom, planeOffsetDistance);
    const p2 = p2_orig.clone().addScaledVector(planeNormal_geom, planeOffsetDistance);
    const p3 = p3_orig.clone().addScaledVector(planeNormal_geom, planeOffsetDistance);
    const p4 = p4_orig.clone().addScaledVector(planeNormal_geom, planeOffsetDistance);

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        p1.x, p1.y, p1.z, // Vertex 0 (cam1 offset)
        p2.x, p2.y, p2.z, // Vertex 1 (cam2 offset)
        p4.x, p4.y, p4.z, // Vertex 2 (cam4 offset) - for first triangle (cam1, cam2, cam4)

        p2.x, p2.y, p2.z, // Vertex 3 (cam2 offset) - for second triangle (cam2, cam3, cam4)
        p3.x, p3.y, p3.z, // Vertex 4 (cam3 offset)
        p4.x, p4.y, p4.z  // Vertex 5 (cam4 offset)
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    // 4. Define UV coordinates
    // Assuming p1=bottom-left, p2=bottom-right, p3=top-right, p4=top-left for standard quad UVs
    // If video appears upside down or mirrored, these UVs or vertex order might need adjustment.
    const uvs = new Float32Array([
        0, 1, // UV for p1 (cam1)
        1, 1, // UV for p2 (cam2)
        0, 0, // UV for p4 (cam4) 

        1, 1, // UV for p2 (cam2)
        1, 0, // UV for p3 (cam3)
        0, 0  // UV for p4 (cam4)
    ]);
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    geometry.computeVertexNormals(); // For lighting, if needed, though MeshBasicMaterial doesn't use them

    // 5. Create material
    const material = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.DoubleSide,
        // transparent: true, // If video has alpha and you use RGBAFormat
    });

    // 6. Create mesh
    const newVideoPlaneMesh = new THREE.Mesh(geometry, material);
    newVideoPlaneMesh.name = "TataVideoPlane";
    videoPlaneMesh = newVideoPlaneMesh; // Assign to global variable

    // 7. Add to scene
    if (scene) {
        scene.add(videoPlaneMesh);
        console.log("Video plane added to scene.");
    } else {
        console.error("Scene object not found, cannot add video plane.");
    }
}