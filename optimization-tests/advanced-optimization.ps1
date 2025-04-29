# Advanced GLB Optimization Script
# This script applies multiple optimization techniques to a GLB file

$inputFile = "..\models\GloomyDoomy2.glb"
$outputDir = "."

# Create test versions with different optimization techniques
$testCases = @(
    @{
        Name = "optimized-draco";
        Description = "Draco compression";
        Commands = @("gltf-transform draco $inputFile $outputDir\optimized-draco.glb");
    },
    @{
        Name = "optimized-meshopt";
        Description = "MeshOpt compression";
        Commands = @("gltf-transform meshopt $inputFile $outputDir\optimized-meshopt.glb");
    },
    @{
        Name = "optimized-full";
        Description = "Full optimization pipeline";
        Commands = @(
            "gltf-transform draco $inputFile $outputDir\temp-full.glb",
            "gltf-transform simplify $outputDir\temp-full.glb $outputDir\optimized-full.glb --ratio 0.3 --error 0.001"
        );
    },
    @{
        Name = "optimized-mobile";
        Description = "Mobile-friendly optimization";
        Commands = @(
            "gltf-transform draco $inputFile $outputDir\temp-mobile.glb",
            "gltf-transform simplify $outputDir\temp-mobile.glb $outputDir\optimized-mobile.glb --ratio 0.2 --error 0.002"
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
$resultsFile = "$outputDir\advanced-optimization-results.md"
"# Advanced GLB Optimization Test Results" | Out-File $resultsFile
"" | Out-File $resultsFile -Append
"Original file: $inputFile" | Out-File $resultsFile -Append
"Original size: $originalSize MB" | Out-File $resultsFile -Append
"" | Out-File $resultsFile -Append
"| Test | Description | File Size | Size Reduction | Command |" | Out-File $resultsFile -Append
"|-----|-------------|-----------|----------------|---------|" | Out-File $resultsFile -Append

# Run each test case
foreach ($test in $testCases) {
    $outputFile = "$outputDir\$($test.Name).glb"
    
    Write-Host "`nRunning test: $($test.Name) - $($test.Description)" -ForegroundColor Yellow
    
    # Run each command in sequence
    foreach ($cmd in $test.Commands) {
        Write-Host "Command: $cmd" -ForegroundColor Green
        Invoke-Expression $cmd
        
        # Check for errors
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Command failed with exit code $LASTEXITCODE" -ForegroundColor Red
            break
        }
    }
    
    # Remove temp files if they exist
    Remove-Item "$outputDir\temp-*.glb" -ErrorAction SilentlyContinue
    
    # Check if file was created
    if (Test-Path $outputFile) {
        # Get optimized file size
        $optimizedSize = Get-FileSizeMB $outputFile
        $reduction = [Math]::Round(100 * (1 - ($optimizedSize / $originalSize)), 2)
        
        Write-Host "Optimized file size: $optimizedSize MB (reduced by $reduction%)" -ForegroundColor Cyan
        
        # Add to results
        $commandsText = $test.Commands -join "; "
        "| $($test.Name) | $($test.Description) | $optimizedSize MB | $reduction% | ``$commandsText`` |" | Out-File $resultsFile -Append
    } else {
        Write-Host "Failed to create optimized file: $outputFile" -ForegroundColor Red
        $commandsText = $test.Commands -join "; "
        "| $($test.Name) | $($test.Description) | Failed | - | ``$commandsText`` |" | Out-File $resultsFile -Append
    }
}

Write-Host "`nAll advanced optimization tests completed. Results saved to $resultsFile" -ForegroundColor Green
