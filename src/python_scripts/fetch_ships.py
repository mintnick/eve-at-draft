import os
import json
import csv
from collections import defaultdict
import requests

current_dir = os.path.dirname(os.path.abspath(__file__))
input_file = os.path.abspath(os.path.join(current_dir, "points.csv"))
output_file = os.path.abspath(os.path.join(current_dir, "..", "assets", "ships.json"))

data = {}

with open(input_file, 'r') as points:
  csv_reader = csv.reader(points, delimiter='\t')
  for row in csv_reader:
    ship_name, points = row[0], row[2]
    # obj = json.dumps([ship_name])
    # response = requests.post('https://esi.evetech.net/latest/universe/ids/?datasource=tranquility&language=en', data=obj)

    # ship_id = 0
    # if (response.ok):
    #   response = response.json()
    #   if ('inventory_types' in response):
    #     ship_id = response['inventory_types'][0]['id']
      
    data[ship_name] = int(points)

data['Shapash'] = 33
print(data['Bhaalgorn'])
output_data = {}
with open(output_file, "r+") as output:
  output_data = json.load(output)

  for hull_type, ships in output_data.items():
    for ship_name, attributes in ships.items():
      attributes["points"] = data[ship_name]

with open(output_file, "w+") as json_file:
  json.dump(output_data, json_file, indent=2)


# obj = json.dumps(names)
# response = requests.post('https://esi.evetech.net/latest/universe/ids/?datasource=tranquility&language=en', data=obj)
# response = response.json()
# ship_ids = response['inventory_types']

# print(ship_ids)

# for i in range(len(data)):
  # if (data[i][1] != ship_ids[i]['name']):
  #   print(data[i][1], ship_ids[i]['name'])
  # data[i].append(ship_ids[i].id)

# print(data)


# json_data = {
#   "Flagship": {},
#   "Logistics": {},
#   "Battleship": {},
#   "Battlecruiser": {},
#   "Cruiser": {},
#   "Destroyer": {},
#   "Frigate": {},
#   "Industrial": {},
#   "Corvette": {}
# }

# at_flagships = ["Cybele", "Shapash", "Bestla", "Geri", "Raiju", "Laelaps"]
# non_flagships = ["Widow"]

# data = sorted(data, key=lambda x: x[2], reverse=True)

# for ship in data:
#   [hull_type, ship_name, points, ship_id] = ship
#   json_data[hull_type][ship_name] = { "points" : points, "ship_id": ship_id}

#   if ship_name in at_flagships or (hull_type == "Battleship" and ship_name not in non_flagships):
#     json_data["Flagship"][ship_name] = { "points" : points , "ship_id": ship_id}
#   elif hull_type == "Logistics":
#     if ship_name in ["Augoror", "Osprey", "Exequror", "Scythe", "Guardian", "Basilisk", "Oneiros", "Scimitar", "Rodiva", "Zarmazd"]:
#       json_data[hull_type][ship_name]["logistics"] = 1
#     else:
#       json_data[hull_type][ship_name]["logistics"] = 0.5

# # Write the JSON data to the output file
# with open(output_file, "w+") as json_file:
#   json.dump(json_data, json_file, indent=2)

# print(f"JSON data written to {output_file}")