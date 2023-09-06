import os
import json
import csv

current_dir = os.path.dirname(os.path.abspath(__file__))
input_file = os.path.abspath(os.path.join(current_dir, "points.csv"))
output_file = os.path.abspath(os.path.join(current_dir, "..", "assets", "ships.json"))

data = {}

with open(input_file, 'r') as points:
  csv_reader = csv.reader(points, delimiter='\t')
  for row in csv_reader:
    ship_name, points, hull_type = row[0], row[2], row[3]
    data[ship_name] = {
      "points": points,
      "hull type": hull_type
    }

    if hull_type == "Battleship" and ship_name not in ["Leshak", "Bhaalgorn", "Rattlesnake", "Widow"]:
      data[ship_name]["flagship"] = True
    
    elif hull_type == "Logistics":
      data[ship_name]["logistics"] = True

# Write the JSON data to the output file
with open(output_file, "w") as json_file:
  json.dump(data, json_file, indent=2)

print(f"JSON data written to {output_file}")