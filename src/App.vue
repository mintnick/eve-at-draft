<script setup>
import { ref, reactive, computed, watch } from 'vue'
import data from './assets/ships.json'
import Ship from './components/Ship.vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

// vars
const i18n = useI18n();
// const langs = {
//   'en': 'English',
//   'zh': '简体中文'
// }
const langs = [
  {
    label: 'English',
    value: 'en'
  },
  {
    label: '简体中文',
    value: 'zh'
  }
]
const lang_model = ref(null);

const $q = useQuasar();

const rule_link = "https://www.eveonline.com/news/view/alliance-tournament-xix-rules-and-registration";
const max_number = {
  "Flagship": 1,
  "Logistics": 1,
  "Battleship": 4,
  "Battlecruiser": 4,
  "Cruiser": 4,
  "Destroyer": 4,
  "Frigate": 4,
  "Industrial": 4,
  "Corvette": 4
}
const pick = reactive({
    "Flagship": [],
    "Logistics": [],
    "Battleship": [],
    "Battlecruiser": [],
    "Cruiser": [],
    "Destroyer": [],
    "Frigate": [],
    "Industrial": [],
    "Corvette": []
  }),
  ban = reactive({
    "Flagship": [],
    "Logistics": [],
    "Battleship": [],
    "Battlecruiser": [],
    "Cruiser": [],
    "Destroyer": [],
    "Frigate": [],
    "Industrial": [],
    "Corvette": []
  });

const tab = ref('Flagship');

// computed
const total_points = computed(() => {
  let points = 0;
  for (const [k, v] of Object.entries(pick)) {
    if (v.length == 0) continue;
    for (const ship of v) points += ship.property.points;
  }
  return points;
});

const logi_count = computed(() => {
  let total_logi = 0;
  for (const logi of pick.Logistics) total_logi += data.Logistics[logi.ship_name].logistics;
  return total_logi;
})

const pick_list = computed(() => {
  let list = [];
  for (const [_, ships] of Object.entries(pick)) for (const ship of ships) list.push(ship);
  list.sort((a, b) => (b.property.points - a.property.points));
  return list;
})

const ban_list = computed(() => {
  let list = [];
  for (const [_, ships] of Object.entries(ban)) for (const ship of ships) list.push(ship);
  list.sort((a, b) => (b.property.points - a.property.points));
  return list;
})

// functions
function add_ship(hull_type, ship_name, property) {
  // same ship +1 point
  const original_points = property.points;
  let points = property.points;
  for (const ship of pick[hull_type]) {
    if (ship.ship_name == ship_name) {
      ship.property.points += 1;
      points += 1;
    }
  }

  pick[hull_type].push({
    "hull_type": hull_type,
    "ship_name": ship_name,
    "property": {
      "original_points": original_points,
      "points": points,
      "ship_id": property.ship_id
    }
  })
}

function remove_ship(hull_type, ship_name) {
  let index = pick[hull_type].findIndex(x => x.ship_name == ship_name);
  pick[hull_type].splice(index, 1);

  // remove +1 points
  for (const ship of pick[hull_type]) if (ship.ship_name == ship_name) ship.property.points -= 1;
}

function ban_ship(hull_type, ship_name, property) {
  ban[hull_type].push({
    "hull_type": hull_type,
    "ship_name": ship_name,
    "property": {
      "points": property.points,
      "ship_id": property.ship_id,
    },
  })
}

function unban_ship(hull_type, ship_name) {
  let index = ban[hull_type].findIndex(x => x.ship_name == ship_name);
  ban[hull_type].splice(index, 1);
}

function not_pickable(hull_type, ship_name, property) {
  // points >= 100
  if (total_points.value >= 100) return true;

  // 1 flagship allowed
  if (hull_type == "Flagship") return pick["Flagship"].length > 0;

  // banned?
  for (const ship of ban[hull_type]) {
    if (ship.ship_name == ship_name) return true;
  }
  
  // 1 cruiser logi or 2 frigate logis
  if (hull_type == "Logistics") {
    return logi_count.value + property.logistics > max_number.Logistics;
  } 

  // 4 for each hull
  return pick[hull_type].length >= max_number[hull_type];
}

function not_bannable(hull_type, ship_name) {
  // picked?
  for (const ship of pick[hull_type]) {
    if (hull_type == "Flagship") continue;
    if (ship.ship_name == ship_name) return true;
  }

  // already banned
  for (const ship of ban[hull_type]) {
    if (ship.ship_name == ship_name) return true;
  }

  // 3 bans for each hull type
  // return ban[hull_type].length >= 3;
}

function clear_pick() {
  for(const [k, v] of Object.entries(pick)) {
    v.length = 0;
  }
}

function clear_ban() {
  for(const [k, v] of Object.entries(ban)) {
    v.length = 0;
  }
}

function toggle_theme() {
  $q.dark.toggle();
  document.cookie=`theme=${$q.dark.mode}`;
}

function toggle_lang() {
  document.cookie=`lang=${i18n.locale.value}`
}
</script>

<template>
  <div class="row q-pt-md flex-center">
    <div class="col-3"></div>
    <div class="col-6 text-weight-bolder text-h4">{{ $t("messages.title") }}</div>
    <div class="col-3 row reverse q-px-md text-center items-center">
      <q-btn unelevated round icon="brightness_medium" @click.prevent="toggle_theme" class="q-mx-sm"></q-btn>
      <!-- <select v-model="$i18n.locale" @change="toggle_lang" class="text-center text-body1">
        <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="i">
          {{ lang }}
        </option>
      </select> -->
      <q-select
        outlined
        dense
        options-dense
        v-model="$i18n.locale"
        :options="langs"
        emit-value
        map-options
      />
    </div>
  </div>
  <a class="text-h6" :href="rule_link" target="_blank">{{ $t("messages.rules") }} : ATXIX(2023)</a>

  <!--Draft-->
  <div class="text-h4 text-weight-bolder q-my-md"
  :class="{ 'text-red-9': total_points > 100, 'text-green-9': total_points == 100 }">
    {{ total_points }} / 100
  </div>

  <div class="row">
    <div class="col-xs-12 col-sm-8 row no-wrap">
      <div class="col-xs-3 col-sm-4">
        <q-tabs
        v-model="tab"
        vertical
        class="text-weight-medium full-width"
        active-color="deep-orange-9">
          <q-tab v-for="(ships, hull_type) in data"
          :name="hull_type" no-caps
          :ripple="false"
          class="q-my-xs"
          content-class="full-width" >
          <div class="row items-center no-wrap justify-between full-width text-subtitle1 text-weight-bold">
            <img :src="`./hull/${hull_type}.png`" class="hull-icon" />
            <span class="gt-xs">{{ $t(`types.${hull_type}`) }}</span>
            <span v-if="hull_type=='Logistics'">{{ logi_count }} / {{ max_number.Logistics }}</span>
            <span v-else>{{ pick[hull_type].length }} / {{ max_number[hull_type] }}</span>
          </div>
          </q-tab>
        </q-tabs>
      </div>

      <div class="col-xs-9 col-sm-8">
        <q-tab-panels
        v-model="tab"
        animated
        swipeable
        vertical
        transition-prev="jump-right"
        transition-next="jump-right" >
          <q-tab-panel v-for="(ships, hull_type) in data"
          :name="hull_type"
          style="height: 510px;">
            <Ship v-for="(property, ship_name) in ships" 
            :hull_type = hull_type
            :ship_name = ship_name
            :property="property"
            :btns="['add', 'ban']"
            @add_ship="add_ship"
            :not_pickable="not_pickable(hull_type, ship_name, property)"
            @ban_ship="ban_ship"
            :not_bannable="not_bannable(hull_type, ship_name)" />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!--Pick list-->
    <div class="col-xs-12 col-sm-4">
      <div class="row flex-center q-ma-md">
        <div class="text-h5 text-green-9 text-weight-bold">{{ $t("messages.pick") }}</div>
        <q-btn @click="clear_pick" class="q-mx-md" color="lime-8"  icon="img:./icons/remove.svg">
          {{ $t("messages.clear") }}</q-btn>
      </div>
      <div class="row wrap">
        <Ship v-for="ship in pick_list"
          :hull_type="ship.hull_type"
          :ship_name="ship.ship_name"
          :property="ship.property"
          :btns="['remove']"
          @remove_ship="remove_ship"
          class="col-sm-11"
          />
      </div>
    </div>
  </div>

  <!--Ban list-->
  <div v-if="ban_list.length" class="q-mt-md">
    <div class="row flex-center q-ma-sm">
      <div class="text-h5 text-red-9 text-weight-bold">{{ $t("messages.ban") }}</div>
      <q-btn @click="clear_ban" class="q-mx-md" color="lime-8"  icon="img:./icons/remove.svg">
        {{ $t("messages.clear") }}</q-btn>
    </div>
    <div class="row" justify-start>
      <Ship v-for="ship in ban_list"
      :hull_type="ship.hull_type"
      :ship_name="ship.ship_name"
      :property="ship.property"
      :btns="['unban']"
      @unban_ship="unban_ship" />
    </div>
  </div>
</template>

<style scoped>
select {
  height: 35px;
  width: 90px;
}
</style>
