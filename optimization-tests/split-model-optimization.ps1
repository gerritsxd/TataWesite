# Split Model Optimization Script
# This script attempts to achieve 50%+ reduction by splitting the model into parts

$inputFile = "..\models\GloomyDoomy2.glb"
$outputDir = "."
$finalOutput = "$outputDir\split-optimized.glb"

# Function to get file size in MB
function Get-FileSizeMB($filePath) {
    if (Test-Path $filePath) {
        $size = (Get-Item $filePath).Length / 1MB
        return [Math]::Round($size, 2)
    } else {
        return 0
    }
}

# Display original file size
$originalSize = Get-FileSizeMB $inputFile
Write-Host "Original file size: $originalSize MB" -ForegroundColor Cyan

# Create a new approach: extreme decimation + texture compression
Write-Host "Attempting extreme optimization with multiple techniques..." -ForegroundColor Yellow

# Step 1: Create a version with only 1% of the original geometry
$step1Output = "$outputDir\extreme-decimated.glb"
Write-Host "Step 1: Extreme decimation (1% of original)..." -ForegroundColor Green
$cmd = "gltf-transform simplify $inputFile $step1Output --ratio 0.01 --error 0.01"
Write-Host "Command: $cmd" -ForegroundColor Green
Invoke-Expression $cmd

# Check file size after step 1
if (Test-Path $step1Output) {
    $step1Size = Get-FileSizeMB $step1Output
    $step1Reduction = [Math]::Round(100 * (1 - ($step1Size / $originalSize)), 2)
    Write-Host "After Step 1: $step1Size MB (reduced by $step1Reduction%)" -ForegroundColor Cyan
} else {
    Write-Host "Step 1 failed" -ForegroundColor Red
    exit 1
}

# Step 2: Try a completely different approach - create a low-poly version
Write-Host "`nTrying alternative approach..." -ForegroundColor Yellow
$lowPolyOutput = "$outputDir\low-poly.glb"

# Create a simple low-poly placeholder model using Three.js
Write-Host "Creating a low-poly placeholder model..." -ForegroundColor Green

# Create an HTML file that will generate a low-poly model
$htmlGenerator = "$outputDir\generate-low-poly.html"
@"
<!DOCTYPE html>
<html>
<head>
    <title>Low-Poly Model Generator</title>
    <script src="../node_modules/three/build/three.min.js"></script>
    <script src="../node_modules/three/examples/js/exporters/GLTFExporter.js"></script>
</head>
<body>
    <div id="info">Generating low-poly model...</div>
    <script>
        // Create a scene
        const scene = new THREE.Scene();
        
        // Create a simple island-like mesh
        const geometry = new THREE.CylinderGeometry(50, 60, 10, 32, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const island = new THREE.Mesh(geometry, material);
        scene.add(island);
        
        // Add some trees
        function createTree(x, y, z) {
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.8, 5, 8),
                new THREE.MeshStandardMaterial({ color: 0x5D4037 })
            );
            trunk.position.set(x, y + 2.5, z);
            
            const leaves = new THREE.Mesh(
                new THREE.ConeGeometry(3, 6, 8),
                new THREE.MeshStandardMaterial({ color: 0x2E7D32 })
            );
            leaves.position.set(x, y + 8, z);
            
            const tree = new THREE.Group();
            tree.add(trunk);
            tree.add(leaves);
            return tree;
        }
        
        // Add some trees
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const radius = 30 + Math.random() * 15;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const tree = createTree(x, 5, z);
            scene.add(tree);
        }
        
        // Add some rocks
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const radius = 20 + Math.random() * 25;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const rock = new THREE.Mesh(
                new THREE.DodecahedronGeometry(1 + Math.random() * 2, 0),
                new THREE.MeshStandardMaterial({ color: 0x757575 })
            );
            rock.position.set(x, 5.5, z);
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            scene.add(rock);
        }
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        scene.add(directionalLight);
        
        // Export as GLB
        const exporter = new THREE.GLTFExporter();
        exporter.parse(scene, function(gltf) {
            const output = JSON.stringify(gltf);
            
            // Create a download link
            const blob = new Blob([output], { type: 'application/json' });
            const link = document.createElement('a');
            link.style.display = 'none';
            document.body.appendChild(link);
            link.href = URL.createObjectURL(blob);
            link.download = 'low-poly-island.gltf';
            link.click();
            
            document.getElementById('info').textContent = 'Low-poly model generated! Download should start automatically.';
        }, { binary: false });
    </script>
</body>
</html>
"@ | Out-File -FilePath $htmlGenerator -Encoding utf8

Write-Host "Created HTML generator at $htmlGenerator" -ForegroundColor Green
Write-Host "Please open this file in a browser to generate a low-poly model" -ForegroundColor Yellow

# Create a results file
$resultsFile = "$outputDir\split-model-results.md"
"# Split Model Optimization Results" | Out-File $resultsFile
"" | Out-File $resultsFile -Append
"Original file: $inputFile" | Out-File $resultsFile -Append
"Original size: $originalSize MB" | Out-File $resultsFile -Append
"" | Out-File $resultsFile -Append
"## Optimization Results" | Out-File $resultsFile -Append
"" | Out-File $resultsFile -Append
"| Approach | File Size | Size Reduction | Notes |" | Out-File $resultsFile -Append
"|----------|-----------|----------------|-------|" | Out-File $resultsFile -Append
"| Extreme Decimation | $step1Size MB | $step1Reduction% | Simplify with ratio 0.01 |" | Out-File $resultsFile -Append
"| Low-Poly Placeholder | N/A | N/A | Generated with Three.js |" | Out-File $resultsFile -Append

Write-Host "`nResults saved to $resultsFile" -ForegroundColor Green

# Create a dual islands HTML that uses the extremely decimated model
$originalHtml = "..\dual-islands.html"
$optimizedHtml = "..\dual-islands-extreme-optimized.html"

if (Test-Path $originalHtml) {
    Write-Host "Creating extremely optimized version of dual-islands.html..." -ForegroundColor Green
    
    # Read the original file
    $content = Get-Content $originalHtml -Raw
    
    # Replace the model paths with optimized versions
    $content = $content -replace './models/GloomyDoomy2.glb', './optimization-tests/extreme-decimated.glb'
    
    # Add a loading progress indicator
    $loadingIndicator = @"
<div id="loading-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999;">
    <h2 style="color: white; margin-bottom: 20px;">Loading Optimized Model</h2>
    <div style="width: 80%; max-width: 400px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden;">
        <div id="loading-progress" style="width: 0%; height: 100%; background: linear-gradient(to right, #4a9eff, #9b4aff); transition: width 0.3s;"></div>
    </div>
    <div id="loading-text" style="color: white; margin-top: 10px;">Preparing...</div>
</div>

<script>
    // Update the loading indicator
    function updateLoadingProgress(progress) {
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        if (progressBar && loadingText) {
            progressBar.style.width = progress + '%';
            loadingText.textContent = Math.round(progress) + '% loaded';
            
            if (progress >= 100) {
                setTimeout(() => {
                    document.getElementById('loading-overlay').style.display = 'none';
                }, 500);
            }
        }
    }
    
    // Add loading manager to track overall progress
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
        const progress = (itemsLoaded / itemsTotal) * 100;
        updateLoadingProgress(progress);
    };
    
    // Override the loader creation to use our loading manager
    const originalLoaderCreation = THREE.GLTFLoader;
    THREE.GLTFLoader = function() {
        const loader = new originalLoaderCreation(loadingManager);
        return loader;
    };
</script>
"@

    # Insert loading indicator after the opening <body> tag
    $content = $content -replace '<body>', "<body>`n$loadingIndicator"
    
    # Add mobile optimizations
    $mobileOptimizations = @"

<!-- Mobile Optimizations -->
<style>
    @media (max-width: 768px) {
        .bottom-controls {
            display: none !important;
        }
        
        .info-panel {
            width: 90% !important;
            max-width: 300px !important;
            font-size: 0.9rem !important;
        }
        
        .location-indicator {
            font-size: 0.8rem !important;
            padding: 5px 8px !important;
        }
    }
</style>

<script>
    // Mobile swipe detection for timeline navigation
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeThreshold = 75; // Minimum swipe distance
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - go to next island
            document.getElementById('flyButton').click();
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - reset camera
            document.getElementById('resetButton').click();
        }
    }
</script>
"@

    # Insert mobile optimizations before the closing </body> tag
    $content = $content -replace '</body>', "$mobileOptimizations`n</body>"
    
    # Add performance monitoring
    $performanceMonitoring = @"
<div id="performance-overlay" style="position: fixed; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 10px; border-radius: 5px; font-family: monospace; z-index: 1000;">
    <div>FPS: <span id="fps-counter">0</span></div>
    <div>Load Time: <span id="load-time">0</span> ms</div>
    <div>Memory: <span id="memory-usage">0</span> MB</div>
    <button id="toggle-perf" style="margin-top: 5px; padding: 3px 8px; background: #333; color: white; border: 1px solid #555; border-radius: 3px;">Hide</button>
</div>

<script>
    // Performance monitoring
    let frameCount = 0;
    let lastTime = performance.now();
    let frameTime = 0;
    const fpsCounter = document.getElementById('fps-counter');
    const loadTimeDisplay = document.getElementById('load-time');
    const memoryUsageDisplay = document.getElementById('memory-usage');
    const togglePerfButton = document.getElementById('toggle-perf');
    const perfOverlay = document.getElementById('performance-overlay');
    
    // Track loading time
    const pageLoadStart = performance.now();
    window.addEventListener('load', () => {
        const loadTime = Math.round(performance.now() - pageLoadStart);
        loadTimeDisplay.textContent = loadTime;
    });
    
    // Update FPS counter
    function updatePerformance() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime >= lastTime + 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            fpsCounter.textContent = fps;
            
            // Update memory usage if available
            if (window.performance && window.performance.memory) {
                const memoryUsage = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
                memoryUsageDisplay.textContent = memoryUsage;
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(updatePerformance);
    }
    
    // Toggle performance overlay
    togglePerfButton.addEventListener('click', () => {
        if (perfOverlay.style.height === 'auto' || perfOverlay.style.height === '') {
            perfOverlay.style.height = '20px';
            perfOverlay.style.overflow = 'hidden';
            togglePerfButton.textContent = 'Show';
        } else {
            perfOverlay.style.height = 'auto';
            togglePerfButton.textContent = 'Hide';
        }
    });
    
    // Start performance monitoring
    requestAnimationFrame(updatePerformance);
</script>
"@

    # Insert performance monitoring before the closing </body> tag
    $content = $content -replace '</body>', "$performanceMonitoring`n</body>"
    
    # Write the updated content to the new file
    $content | Out-File $optimizedHtml -Encoding utf8
    
    Write-Host "Created extremely optimized version of dual-islands.html at $optimizedHtml" -ForegroundColor Green
} else {
    Write-Host "Could not find $originalHtml to create optimized version" -ForegroundColor Red
}

Write-Host "`nSplit model optimization completed." -ForegroundColor Green
Write-Host "For achieving a 50% reduction, consider these additional approaches:" -ForegroundColor Yellow
Write-Host "1. Use a 3D modeling tool like Blender to manually reduce the model complexity" -ForegroundColor Yellow
Write-Host "2. Split the model into separate parts and load them progressively" -ForegroundColor Yellow
Write-Host "3. Use level-of-detail (LOD) techniques to show simplified versions at a distance" -ForegroundColor Yellow
Write-Host "4. Consider replacing the model with a simpler version that captures the essential features" -ForegroundColor Yellow
