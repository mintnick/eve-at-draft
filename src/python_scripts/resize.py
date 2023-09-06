'''
Resize the images to 32*32
'''

from PIL import Image
import os

target_size = (32, 32)

input_dir = "../assets/icon"
output_dir = "../assets/out"

if not os.path.exists(output_dir):
  os.makedirs(output_dir)
