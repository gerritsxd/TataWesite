# Advanced GLB Optimization Test Results

Original file: ..\models\GloomyDoomy2.glb
Original size: 272.06 MB

| Test | Description | File Size | Size Reduction | Command |
|-----|-------------|-----------|----------------|---------|
| optimized-draco | Draco compression | 249.93 MB | 8.13% | `gltf-transform draco ..\models\GloomyDoomy2.glb .\optimized-draco.glb` |
| optimized-meshopt | MeshOpt compression | 252.25 MB | 7.28% | `gltf-transform meshopt ..\models\GloomyDoomy2.glb .\optimized-meshopt.glb` |
| optimized-full | Full optimization pipeline | 263.71 MB | 3.07% | `gltf-transform draco ..\models\GloomyDoomy2.glb .\temp-full.glb; gltf-transform simplify .\temp-full.glb .\optimized-full.glb --ratio 0.3 --error 0.001` |
| optimized-mobile | Mobile-friendly optimization | 262.09 MB | 3.66% | `gltf-transform draco ..\models\GloomyDoomy2.glb .\temp-mobile.glb; gltf-transform simplify .\temp-mobile.glb .\optimized-mobile.glb --ratio 0.2 --error 0.002` |
