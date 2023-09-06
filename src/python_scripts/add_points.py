import os
import json
import csv

current_dir = os.path.dirname(os.path.abspath(__file__))
input_file = os.path.abspath(os.path.join(current_dir, "points.csv"))
output_file = os.path.abspath(os.path.join(current_dir, "..", "assets", "ships.json"))

with open(output_file, 'r+') as json_file:
  data = json.load(json_file)

  with open(input_file) as points:
    csv_reader = csv.reader(points, delimiter='\t')
    for row in csv_reader:
      ship_name, points, hull_type = row[0], row[2], row[3]
      ship_name = row[0].replace(' ', '_')
      if ship_name not in data:
        print(f"{ship_name} is not in file!")
        data[ship_name] = {}
        data[ship_name]["roles"] = []
      data[ship_name]["points"] = points
      data[ship_name]["size"] = hull_type
      if "faction" in data[ship_name]:
        del data[ship_name]['faction']

  json_file.seek(0)
  json_file.truncate()
  json.dump(data, json_file, indent=2)
