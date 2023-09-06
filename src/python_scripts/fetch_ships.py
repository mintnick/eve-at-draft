import os
import json

current_dir = os.path.dirname(os.path.abspath(__file__))
input_dir = os.path.abspath(os.path.join(current_dir, "..", "assets", "icons", "Ship"))
output_file = os.path.abspath(os.path.join(current_dir, "..", "assets", "ships.json"))

data = {}

for root, dirs, files in os.walk(input_dir):
  for filename in files:
    ship_name = filename.split('.')[0]
    hull_type = os.path.basename(root)

    ship_data = {
      "points": "",
      "hull type": hull_type,
    }

    # Battleship can be flagship except...
    if hull_type == "Battleship" and ship_name not in ["Leshak", "Bhaalgorn", "Rattlesnake", "Widow"]:
      ship_data["flagship"] = True
    
    # Logistics
    if hull_type == "Logistics":
      ship_data["logistics"] = True

    data[ship_name] = ship_data

# Write the JSON data to the output file
with open(output_file, "w") as json_file:
  json.dump(data, json_file, indent=2)

print(f"JSON data written to {output_file}")