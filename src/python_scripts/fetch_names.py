import os
import json
import requests

current_dir = os.path.dirname(os.path.abspath(__file__))
ships_file = os.path.abspath(os.path.join(current_dir, "..", "assets", "ships.json"))
output_dir = os.path.abspath(os.path.join(current_dir, "..", "assets", 'locales'))

ids = set()
with open(ships_file, 'r') as ships:
  data = json.load(ships)
  for (ship_type, ship_list) in data.items():
    for (ship_name, ship_data) in ship_list.items():
      ids.add(ship_data['ship_id'])

msg = {
  "messages": {
    "title": "",
    "rules": "",
    "clear": ""
  },
  "types": {
    "Flagship": "",
    "Logistics": "",
    "Battleship": "",
    "Battlecruiser": "",
    "Cruiser": "",
    "Destroyer": "",
    "Frigate": "",
    "Industrial": "",
    "Corvette": "",
  },
  "ships": {
  }
}
for id in ids:
  msg['ships'][id] = ""

ids = list(ids)
data = json.dumps(ids)

# en
url = "https://esi.evetech.net/latest/universe/names/?datasource=tranquility"
response = requests.post(url, data=data)
response = response.json()
for ship in response:
  msg["ships"][ship["id"]] = ship["name"]

output_file = os.path.join(output_dir, 'en.json')
with open(output_file, "w+") as json_file:
  json.dump(msg, json_file, indent=2)

# zh
# 2024-06-29, ships not in serenity: 81046, 81008
ids.remove(81046)
ids.remove(81008)
data = json.dumps(ids)
url = "https://ali-esi.evepc.163.com/latest/universe/names/?datasource=serenity"
response = requests.post(url, data=data)
response = response.json()
for ship in response:
  msg["ships"][ship["id"]] = ship["name"]

output_file = os.path.join(output_dir, 'zh.json')
with open(output_file, "w+") as json_file:
  json.dump(msg, json_file, indent=2, ensure_ascii=False)