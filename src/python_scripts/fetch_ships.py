import os
import json
import csv
from collections import defaultdict
import requests

current_dir = os.path.dirname(os.path.abspath(__file__))
input_file = os.path.abspath(os.path.join(current_dir, "points.csv"))
output_file = os.path.abspath(os.path.join(current_dir, "..", "assets", "ships.json"))

at_flagships = ["Cybele", "Shapash", "Bestla", "Geri", "Raiju", "Laelaps", "Cobra", "Sidewinder"]
data = {
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

with open(input_file, 'r') as points:
  csv_reader = csv.reader(points, delimiter='\t')
  csv_reader = sorted(csv_reader, key= lambda row: int(row[2]), reverse=True)
  for row in csv_reader:
    ship_name, points, hull_type = row[0], row[2], row[3]
    obj = json.dumps([ship_name])

    response = requests.post('https://esi.evetech.net/latest/universe/ids/?datasource=tranquility&language=en', data=obj)

    ship_id = 0
    if (response.ok):
      response = response.json()
      if ('inventory_types' in response):
        ship_id = response['inventory_types'][0]['id']

    if ship_name in at_flagships or hull_type == "Battleship":
      data["Flagship"][ship_name] = {
        "points": int(points),
        "ship_id": int(ship_id),
      }
      print(ship_name, data["Flagship"][ship_name])

    data[hull_type][ship_name] = {
      "ship_id": int(ship_id),
      "points": int(points),
    }

    if hull_type == "Logistics":
      if ship_name in ["Augoror", "Osprey", "Exequror", "Scythe", "Guardian", "Basilisk", "Oneiros", "Scimitar", "Rodiva", "Zarmazd"]:
        data[hull_type][ship_name]["logistics"] = 1
      else:
        data[hull_type][ship_name]["logistics"] = 0.5
    
    print(ship_name, data[hull_type][ship_name])

data["Flagship"]["Shapash"] = data["Frigate"]["Shapash"] = {
  "points": 30,
  "ship_id": 78414,
}
data["Flagship"]["Thunderchild"] = data["Battleship"]["Thunderchild"] = {
  "points": 40,
  "ship_id": 54733,
}

with open(output_file, "w+") as json_file:
  json.dump(data, json_file, indent=2)
  print(f"JSON data written to {output_file}")