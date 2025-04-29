# Super Aggressive GLB Optimization Script
# This script applies multiple techniques in sequence to achieve 50%+ reduction

$inputFile = "..\models\GloomyDoomy2.glb"
$outputDir = "."
$outputFile = "$outputDir\super-reduced.glb"

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

# Create temp files for each step
$tempFile1 = "$outputDir\temp-step1.glb"
$tempFile2 = "$outputDir\temp-step2.glb"
$tempFile3 = "$outputDir\temp-step3.glb"

# Step 1: Extreme simplification (reduce polygons)
Write-Host "Step 1: Extreme simplification..." -ForegroundColor Green
$cmd = "gltf-transform simplify $inputFile $tempFile1 --ratio 0.01 --error 0.01"
Write-Host "Command: $cmd" -ForegroundColor Green
Invoke-Expression $cmd

# Check file size after step 1
$step1Size = Get-FileSizeMB $tempFile1
$step1Reduction = [Math]::Round(100 * (1 - ($step1Size / $originalSize)), 2)
Write-Host "After Step 1: $step1Size MB (reduced by $step1Reduction%)" -ForegroundColor Cyan

# Step 2: Apply Draco compression
Write-Host "Step 2: Applying Draco compression..." -ForegroundColor Green
$cmd = "gltf-transform draco $tempFile1 $tempFile2 --quantize-position 8 --quantize-normal 8 --quantize-texcoord 8"
Write-Host "Command: $cmd" -ForegroundColor Green
Invoke-Expression $cmd

# Check file size after step 2
$step2Size = Get-FileSizeMB $tempFile2
$step2Reduction = [Math]::Round(100 * (1 - ($step2Size / $originalSize)), 2)
Write-Host "After Step 2: $step2Size MB (reduced by $step2Reduction%)" -ForegroundColor Cyan

# Step 3: Apply MeshOpt compression
Write-Host "Step 3: Applying MeshOpt compression..." -ForegroundColor Green
$cmd = "gltf-transform meshopt $tempFile2 $outputFile"
Write-Host "Command: $cmd" -ForegroundColor Green
Invoke-Expression $cmd

# Clean up temp files
Remove-Item $tempFile1 -ErrorAction SilentlyContinue
Remove-Item $tempFile2 -ErrorAction SilentlyContinue
Remove-Item $tempFile3 -ErrorAction SilentlyContinue

# Check if final file was created
if (Test-Path $outputFile) {
    # Get optimized file size
    $finalSize = Get-FileSizeMB $outputFile
    $finalReduction = [Math]::Round(100 * (1 - ($finalSize / $originalSize)), 2)
    
    Write-Host "Final optimized file size: $finalSize MB (reduced by $finalReduction%)" -ForegroundColor Cyan
    
    # Create a results file
    $resultsFile = "$outputDir\super-aggressive-results.md"
    "# Super Aggressive GLB Optimization Results" | Out-File $resultsFile
    "" | Out-File $resultsFile -Append
    "Original file: $inputFile" | Out-File $resultsFile -Append
    "Original size: $originalSize MB" | Out-File $resultsFile -Append
    "" | Out-File $resultsFile -Append
    "| Step | Description | File Size | Reduction |" | Out-File $resultsFile -Append
    "|------|-------------|-----------|-----------|" | Out-File $resultsFile -Append
    "| 1 | Extreme simplification (ratio 0.01) | $step1Size MB | $step1Reduction% |" | Out-File $resultsFile -Append
    "| 2 | Draco compression | $step2Size MB | $step2Reduction% |" | Out-File $resultsFile -Append
    "| 3 | MeshOpt compression | $finalSize MB | $finalReduction% |" | Out-File $resultsFile -Append
    
    Write-Host "Results saved to $resultsFile" -ForegroundColor Green
    
    # Create a modified version of dual-islands.html that uses the super-reduced model
    $originalHtml = "..\dual-islands.html"
    $optimizedHtml = "..\dual-islands-optimized.html"
    
    if (Test-Path $originalHtml) {
        Write-Host "Creating optimized version of dual-islands.html..." -ForegroundColor Green
        
        # Read the original file
        $content = Get-Content $originalHtml -Raw
        
        # Replace the model paths with optimized versions
        $content = $content -replace './models/GloomyDoomy2.glb', './optimization-tests/super-reduced.glb'
        
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
        
        Write-Host "Created optimized version of dual-islands.html at $optimizedHtml" -ForegroundColor Green
    } else {
        Write-Host "Could not find $originalHtml to create optimized version" -ForegroundColor Red
    }
} else {
    Write-Host "Failed to create optimized file: $outputFile" -ForegroundColor Red
}

Write-Host "`nSuper aggressive optimization completed." -ForegroundColor Green
