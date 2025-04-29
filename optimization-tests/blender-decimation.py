import bpy
import sys
import os
import time

# Get command line arguments
argv = sys.argv
argv = argv[argv.index("--") + 1:]  # Get all args after "--"

if len(argv) < 3:
    print("Usage: blender -b -P blender-decimation.py -- <input_file> <output_file> <ratio>")
    sys.exit(1)

input_file = argv[0]
output_file = argv[1]
ratio = float(argv[2])  # Decimation ratio (0.1 = reduce to 10% of original)

print(f"Input file: {input_file}")
print(f"Output file: {output_file}")
print(f"Decimation ratio: {ratio}")

# Start timing
start_time = time.time()

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Import the GLB file
print(f"Importing {input_file}...")
bpy.ops.import_scene.gltf(filepath=input_file)

# Get all mesh objects
mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
print(f"Found {len(mesh_objects)} mesh objects")

# Apply decimation to each mesh
for i, obj in enumerate(mesh_objects):
    print(f"Processing object {i+1}/{len(mesh_objects)}: {obj.name}")
    
    # Select only this object
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    
    # Add decimation modifier
    modifier = obj.modifiers.new(name="Decimate", type='DECIMATE')
    modifier.ratio = ratio
    
    # Apply the modifier
    bpy.ops.object.modifier_apply(modifier="Decimate")
    
    print(f"  Original faces: {obj.original_faces if hasattr(obj, 'original_faces') else 'unknown'}")
    print(f"  Decimated faces: {len(obj.data.polygons)}")

# Select all objects for export
bpy.ops.object.select_all(action='SELECT')

# Export as GLB
print(f"Exporting to {output_file}...")
bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=10,  # Maximum compression
    export_tangents=False,  # Reduce file size
    export_materials='EXPORT',
    export_colors=True,
    export_cameras=False,
    export_lights=False
)

# Calculate time taken
end_time = time.time()
time_taken = end_time - start_time
print(f"Processing completed in {time_taken:.2f} seconds")

# Get file sizes
input_size = os.path.getsize(input_file) / (1024 * 1024)  # MB
output_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
reduction_percent = (1 - (output_size / input_size)) * 100

print(f"Input file size: {input_size:.2f} MB")
print(f"Output file size: {output_size:.2f} MB")
print(f"Size reduction: {reduction_percent:.2f}%")

# Exit Blender
sys.exit(0)
