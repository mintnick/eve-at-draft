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
    if hull_type not in data:
      data[hull_type] = {}
    data[hull_type][ship_name] = {
      "points": points
    }

    if hull_type == "Battleship" and ship_name not in ["Leshak", "Bhaalgorn", "Rattlesnake", "Widow"]:
      data[hull_type][ship_name]["flagship"] = True
    
    elif hull_type == "Logistics":
      if ship_name in ["Augoror", "Osprey", "Exequror", "Scythe", "Guardian", "Basilisk", "Onerios", "Scimitar", "Rodiva", "Zarmazd"]:
        data[hull_type][ship_name]["logistics"] = 1
      else:
        data[hull_type][ship_name]["logistics"] = 0.5

# Write the JSON data to the output file
with open(output_file, "w") as json_file:
  json.dump(data, json_file, indent=2)

print(f"JSON data written to {output_file}")