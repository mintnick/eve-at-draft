import os
import json
import csv
from collections import defaultdict

current_dir = os.path.dirname(os.path.abspath(__file__))
input_file = os.path.abspath(os.path.join(current_dir, "points.csv"))
output_file = os.path.abspath(os.path.join(current_dir, "..", "assets", "ships.json"))

data = []

with open(input_file, 'r') as points:
  csv_reader = csv.reader(points, delimiter='\t')
  for row in csv_reader:
    ship_name, points, hull_type = row[0], row[2], row[3]
    data.append([hull_type, ship_name, int(points)])

json_data = {
  "Flagship": {},
  "Logistics": {},
  "Battleship": {},
  "Battlecruiser": {},
  "Cruiser": {},
  "Destroyer": {},
  "Frigate": {},
  "Industrial": {},
  "Corvette": {}
}

data = sorted(data, key=lambda x: x[2], reverse=True)

for ship in data:
  [hull_type, ship_name, points] = ship
  json_data[hull_type][ship_name] = { "points" : points}

  if hull_type == "Battleship" and ship_name not in ["Leshak", "Bhaalgorn", "Rattlesnake", "Widow"]:
    json_data["Flagship"][ship_name] = { "points" : points}
  elif hull_type == "Logistics":
    if ship_name in ["Augoror", "Osprey", "Exequror", "Scythe", "Guardian", "Basilisk", "Onerios", "Scimitar", "Rodiva", "Zarmazd"]:
      json_data[hull_type][ship_name]["logistics"] = 1
    else:
      json_data[hull_type][ship_name]["logistics"] = 0.5

# Write the JSON data to the output file
with open(output_file, "w") as json_file:
  json.dump(json_data, json_file, indent=2)

print(f"JSON data written to {output_file}")