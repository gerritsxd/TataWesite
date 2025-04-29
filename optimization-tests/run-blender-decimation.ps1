# Script to run Blender decimation with different ratios
# Adjust the path to your Blender executable as needed

$blenderPath = "C:\Program Files\Blender Foundation\Blender 3.6\blender.exe"
$scriptPath = ".\blender-decimation.py"
$inputFile = "..\models\GloomyDoomy2.glb"
$outputDir = "."

# Test different decimation ratios
$testCases = @(
    @{
        Name = "blender-50";
        Ratio = 0.5;
        Description = "50% of original geometry";
    },
    @{
        Name = "blender-25";
        Ratio = 0.25;
        Description = "25% of original geometry";
    },
    @{
        Name = "blender-10";
        Ratio = 0.1;
        Description = "10% of original geometry";
    },
    @{
        Name = "blender-05";
        Ratio = 0.05;
        Description = "5% of original geometry";
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
$resultsFile = "$outputDir\blender-decimation-results.md"
"# Blender Decimation Test Results" | Out-File $resultsFile
"" | Out-File $resultsFile -Append
"Original file: $inputFile" | Out-File $resultsFile -Append
"Original size: $originalSize MB" | Out-File $resultsFile -Append
"" | Out-File $resultsFile -Append
"| Test | Description | Ratio | File Size | Size Reduction |" | Out-File $resultsFile -Append
"|-----|-------------|-------|-----------|----------------|" | Out-File $resultsFile -Append

# Check if Blender exists
if (-not (Test-Path $blenderPath)) {
    Write-Host "Blender not found at $blenderPath" -ForegroundColor Red
    Write-Host "Please edit this script to specify the correct path to Blender" -ForegroundColor Red
    exit 1
}

# Run each test case
foreach ($test in $testCases) {
    $outputFile = "$outputDir\$($test.Name).glb"
    
    Write-Host "`nRunning test: $($test.Name) - $($test.Description)" -ForegroundColor Yellow
    
    # Run Blender with our script
    $blenderCmd = "& '$blenderPath' -b -P $scriptPath -- '$inputFile' '$outputFile' $($test.Ratio)"
    Write-Host "Command: $blenderCmd" -ForegroundColor Green
    
    # Execute the command
    Invoke-Expression $blenderCmd
    
    # Check if file was created
    if (Test-Path $outputFile) {
        # Get optimized file size
        $optimizedSize = Get-FileSizeMB $outputFile
        $reduction = [Math]::Round(100 * (1 - ($optimizedSize / $originalSize)), 2)
        
        Write-Host "Optimized file size: $optimizedSize MB (reduced by $reduction%)" -ForegroundColor Cyan
        
        # Add to results
        "| $($test.Name) | $($test.Description) | $($test.Ratio) | $optimizedSize MB | $reduction% |" | Out-File $resultsFile -Append
    } else {
        Write-Host "Failed to create optimized file: $outputFile" -ForegroundColor Red
        "| $($test.Name) | $($test.Description) | $($test.Ratio) | Failed | - |" | Out-File $resultsFile -Append
    }
}

Write-Host "`nAll Blender decimation tests completed. Results saved to $resultsFile" -ForegroundColor Green

# Create an alternative approach using gltf-transform with extreme settings
Write-Host "`nTrying alternative approach with gltf-transform..." -ForegroundColor Yellow

$outputFile = "$outputDir\extreme-custom.glb"
$tempFile1 = "$outputDir\temp-custom-1.glb"
$tempFile2 = "$outputDir\temp-custom-2.glb"

# Step 1: Weld vertices
Write-Host "Step 1: Welding vertices..." -ForegroundColor Green
$cmd = "gltf-transform weld $inputFile $tempFile1"
Write-Host "Command: $cmd" -ForegroundColor Green
Invoke-Expression $cmd

# Step 2: Simplify with extreme settings
Write-Host "Step 2: Simplifying with extreme settings..." -ForegroundColor Green
$cmd = "gltf-transform simplify $tempFile1 $tempFile2 --ratio 0.01 --error 0.01"
Write-Host "Command: $cmd" -ForegroundColor Green
Invoke-Expression $cmd

# Step 3: Apply Draco compression
Write-Host "Step 3: Applying Draco compression..." -ForegroundColor Green
$cmd = "gltf-transform draco $tempFile2 $outputFile --quantize-position 10 --quantize-normal 8 --quantize-texcoord 8"
Write-Host "Command: $cmd" -ForegroundColor Green
Invoke-Expression $cmd

# Clean up temp files
Remove-Item $tempFile1 -ErrorAction SilentlyContinue
Remove-Item $tempFile2 -ErrorAction SilentlyContinue

# Check if file was created
if (Test-Path $outputFile) {
    # Get optimized file size
    $optimizedSize = Get-FileSizeMB $outputFile
    $reduction = [Math]::Round(100 * (1 - ($optimizedSize / $originalSize)), 2)
    
    Write-Host "Extreme custom optimization file size: $optimizedSize MB (reduced by $reduction%)" -ForegroundColor Cyan
    
    # Add to results
    "| extreme-custom | Custom extreme optimization pipeline | 0.01 | $optimizedSize MB | $reduction% |" | Out-File $resultsFile -Append
} else {
    Write-Host "Failed to create optimized file: $outputFile" -ForegroundColor Red
    "| extreme-custom | Custom extreme optimization pipeline | 0.01 | Failed | - |" | Out-File $resultsFile -Append
}

Write-Host "`nAll optimization tests completed. Results saved to $resultsFile" -ForegroundColor Green
