# Script to update dual-islands.html to use optimized models
# This script creates a copy of dual-islands.html with optimized models

$originalFile = "..\dual-islands.html"
$optimizedFile = "..\dual-islands-optimized.html"

# Read the original file
$content = Get-Content $originalFile -Raw

# Replace the model paths with optimized versions
$content = $content -replace './models/GloomyDoomy2.glb', './optimization-tests/optimized-full.glb'
$content = $content -replace './models/IslandCopyTest2.glb', './optimization-tests/test3-heavy.glb'

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
$content | Out-File $optimizedFile -Encoding utf8

Write-Host "Created optimized version of dual-islands.html at $optimizedFile" -ForegroundColor Green
