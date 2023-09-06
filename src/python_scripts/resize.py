'''
Resize the images to 32*32
'''

from PIL import Image
import os

target_size = (32, 32)

current_dir = os.path.dirname(os.path.abspath(__file__))
input_dir = os.path.abspath(os.path.join(current_dir, "..", "assets", "icons"))
output_dir = os.path.abspath(os.path.join(current_dir, "..", "assets", "resize"))

# Function to create directories if they don't exist
def ensure_directory_exists(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

for root, dirs, files in os.walk(input_dir):
  for file in files:
    if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
      try:
        # Create the corresponding output directory structure
        relative_path = os.path.relpath(root, input_dir)
        output_subdir = os.path.join(output_dir, relative_path)
        ensure_directory_exists(output_subdir)

        # Open the image
        img = Image.open(os.path.join(root, file))
        
        # Resize the image to the target size
        img = img.resize(target_size, Image.ANTIALIAS)
        
        # Save the resized image to the output directory
        output_path = os.path.join(output_subdir, file)
        img.save(output_path)
        print(f"Resized and saved: {output_path}")
      
      except Exception as e:
        print(f"Error processing {file}: {str(e)}")