# GLB Optimization Test Script
# This script creates 5 different optimized versions of a GLB file and measures file sizes

$inputFile = "..\models\GloomyDoomy2.glb"
$outputDir = "."

# Create test versions with different optimization levels
$testCases = @(
    @{
        Name = "test1-light";
        Ratio = 0.5;
        Error = 0.001;
        Description = "Light optimization (50% reduction)";
    },
    @{
        Name = "test2-medium";
        Ratio = 0.3;
        Error = 0.001;
        Description = "Medium optimization (70% reduction)";
    },
    @{
        Name = "test3-heavy";
        Ratio = 0.2;
        Error = 0.001;
        Description = "Heavy optimization (80% reduction)";
    },
    @{
        Name = "test4-extreme";
        Ratio = 0.1;
        Error = 0.001;
        Description = "Extreme optimization (90% reduction)";
    },
    @{
        Name = "test5-ultra";
        Ratio = 0.05;
        Error = 0.002;
        Description = "Ultra optimization (95% reduction with higher error tolerance)";
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
$resultsFile = "$outputDir\optimization-results.md"
"# GLB Optimization Test Results" | Out-File $resultsFile
"" | Out-File $resultsFile -Append
"Original file: $inputFile" | Out-File $resultsFile -Append
"Original size: $originalSize MB" | Out-File $resultsFile -Append
"" | Out-File $resultsFile -Append
"| Test | Description | Ratio | Error | File Size | Size Reduction | Command |" | Out-File $resultsFile -Append
"|-----|-------------|-------|-------|-----------|----------------|---------|" | Out-File $resultsFile -Append

# Run each test case
foreach ($test in $testCases) {
    $outputFile = "$outputDir\$($test.Name).glb"
    
    Write-Host "`nRunning test: $($test.Name) - $($test.Description)" -ForegroundColor Yellow
    
    # Simplify mesh directly (without welding first)
    Write-Host "Simplifying mesh..." -ForegroundColor Green
    $simplifyCommand = "gltf-transform simplify $inputFile $outputFile --ratio $($test.Ratio) --error $($test.Error)"
    Write-Host $simplifyCommand
    Invoke-Expression $simplifyCommand
    
    # Check if file was created
    if (Test-Path $outputFile) {
        # Get optimized file size
        $optimizedSize = Get-FileSizeMB $outputFile
        $reduction = [Math]::Round(100 * (1 - ($optimizedSize / $originalSize)), 2)
        
        Write-Host "Optimized file size: $optimizedSize MB (reduced by $reduction%)" -ForegroundColor Cyan
        
        # Add to results
        $command = "simplify (ratio: $($test.Ratio), error: $($test.Error))"
        "| $($test.Name) | $($test.Description) | $($test.Ratio) | $($test.Error) | $optimizedSize MB | $reduction% | $command |" | Out-File $resultsFile -Append
    } else {
        Write-Host "Failed to create optimized file: $outputFile" -ForegroundColor Red
        "| $($test.Name) | $($test.Description) | $($test.Ratio) | $($test.Error) | Failed | - | - |" | Out-File $resultsFile -Append
    }
}

Write-Host "`nAll optimization tests completed. Results saved to $resultsFile" -ForegroundColor Green
