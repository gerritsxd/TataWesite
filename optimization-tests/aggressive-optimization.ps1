# Aggressive GLB Optimization Script
# This script applies multiple optimization techniques to achieve at least 50% reduction

$inputFile = "..\models\GloomyDoomy2.glb"
$outputDir = "."

# Create test versions with different aggressive optimization techniques
$testCases = @(
    @{
        Name = "reduced-50";
        Description = "50% reduction target";
        Commands = @(
            "gltf-transform draco $inputFile $outputDir\temp-1.glb --quantize-position 14 --quantize-normal 10 --quantize-texcoord 12",
            "gltf-transform simplify $outputDir\temp-1.glb $outputDir\temp-2.glb --ratio 0.5 --error 0.001",
            "gltf-transform prune $outputDir\temp-2.glb $outputDir\reduced-50.glb --materials"
        );
    },
    @{
        Name = "reduced-60";
        Description = "60% reduction target";
        Commands = @(
            "gltf-transform draco $inputFile $outputDir\temp-1.glb --quantize-position 14 --quantize-normal 10 --quantize-texcoord 12",
            "gltf-transform simplify $outputDir\temp-1.glb $outputDir\temp-2.glb --ratio 0.4 --error 0.002",
            "gltf-transform prune $outputDir\temp-2.glb $outputDir\reduced-60.glb --materials"
        );
    },
    @{
        Name = "reduced-70";
        Description = "70% reduction target";
        Commands = @(
            "gltf-transform draco $inputFile $outputDir\temp-1.glb --quantize-position 12 --quantize-normal 8 --quantize-texcoord 10",
            "gltf-transform simplify $outputDir\temp-1.glb $outputDir\temp-2.glb --ratio 0.3 --error 0.003",
            "gltf-transform prune $outputDir\temp-2.glb $outputDir\reduced-70.glb --materials"
        );
    },
    @{
        Name = "reduced-extreme";
        Description = "Maximum possible reduction";
        Commands = @(
            "gltf-transform draco $inputFile $outputDir\temp-1.glb --quantize-position 10 --quantize-normal 8 --quantize-texcoord 8",
            "gltf-transform simplify $outputDir\temp-1.glb $outputDir\temp-2.glb --ratio 0.1 --error 0.005",
            "gltf-transform prune $outputDir\temp-2.glb $outputDir\reduced-extreme.glb --materials --textures"
        );
    }
)

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

# Create a results file
$resultsFile = "$outputDir\aggressive-optimization-results.md"
"# Aggressive GLB Optimization Test Results" | Out-File $resultsFile
"" | Out-File $resultsFile -Append
"Original file: $inputFile" | Out-File $resultsFile -Append
"Original size: $originalSize MB" | Out-File $resultsFile -Append
"" | Out-File $resultsFile -Append
"| Test | Description | File Size | Size Reduction | Commands |" | Out-File $resultsFile -Append
"|-----|-------------|-----------|----------------|----------|" | Out-File $resultsFile -Append

# Run each test case
foreach ($test in $testCases) {
    $outputFile = "$outputDir\$($test.Name).glb"
    
    Write-Host "`nRunning test: $($test.Name) - $($test.Description)" -ForegroundColor Yellow
    
    # Run each command in sequence
    $success = $true
    foreach ($cmd in $test.Commands) {
        Write-Host "Command: $cmd" -ForegroundColor Green
        Invoke-Expression $cmd
        
        # Check for errors
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Command failed with exit code $LASTEXITCODE" -ForegroundColor Red
            $success = $false
            break
        }
    }
    
    # Remove temp files if they exist
    Remove-Item "$outputDir\temp-*.glb" -ErrorAction SilentlyContinue
    
    # Check if file was created and optimization was successful
    if ($success -and (Test-Path $outputFile)) {
        # Get optimized file size
        $optimizedSize = Get-FileSizeMB $outputFile
        $reduction = [Math]::Round(100 * (1 - ($optimizedSize / $originalSize)), 2)
        
        Write-Host "Optimized file size: $optimizedSize MB (reduced by $reduction%)" -ForegroundColor Cyan
        
        # Add to results
        $commandsText = $test.Commands -join " | "
        "| $($test.Name) | $($test.Description) | $optimizedSize MB | $reduction% | Multiple steps |" | Out-File $resultsFile -Append
    } else {
        Write-Host "Failed to create optimized file: $outputFile" -ForegroundColor Red
        "| $($test.Name) | $($test.Description) | Failed | - | Multiple steps |" | Out-File $resultsFile -Append
    }
}

Write-Host "`nAll aggressive optimization tests completed. Results saved to $resultsFile" -ForegroundColor Green
