<template lang="pug">
  b-table(responsive='', bordered='', outlined='', hover='', small='', :items='sItems', :fields='sFields')
    template(slot='ballot', slot-scope='data')
      input.form-control-sm(type='number', style='width:5em', v-model.lazy='data.item.ballot', @change="onBallotChange($event,data.item)")
    template(v-for="item in cNumSplit", v-bind:slot="item", slot-scope='data')
      .d-flex.justify-content-between
        b-badge(v-if="data.value.position <= cRanks", variant='primary', v-html="data.value.position_display")
        div(v-else='')
        | {{data.value.value}}
</template>

<script>
import {ConfigRepository} from "@/resources/js/repositories/config-repository";


export default {
  name: "ChairPrediction",
  data () {
    return {
      items: [],
      fields: [],
      numSplit: 0,
      ranks: 0,
    }
  },
  created () {
    this.fetch()
  },
  methods: {
    async fetch () {
      const {parties, num_ranks, total_ranks} = await ConfigRepository.get();
      this.numSplit = num_ranks;
      this.ranks = total_ranks;
      this.mergeFields(num_ranks);
      this.createParties(parties, num_ranks);
    },
    mergeFields (ranks) {
      let vm = this;
      let fields = [{
        key: 'no',
        label: 'No',
        thStyle: {width: '50px'}
      }, {
        key: 'party',
        label: 'Partai',
        thStyle: {width: '150px'},
        tdClass: ['text-uppercase', 'bg-party']
      }, {
        key: 'ballot',
        label: 'Suara',
        thStyle: {width: '100px'},
        tdClass: ['bg-ballot']
      }
      ];
      window._.forEach(window._.range(1, ranks + 1), (value) => {
        fields.push({
          key: `c.r${value}`,
          label: `${value * 2 - 1}`,
          thStyle: {width: '80px'},
          tdClass: ['text-left'],
          thClass: ['text-center']
        })
      });
      while (vm.fields.length > 0) {
        vm.fields.pop();
      }
      window._.forEach(fields, (value) => {
        vm.fields.push(value);
      })
    },
    createParties (parties, ranks) {
      let vm = this;
      const max = parties.length * ranks * 10;
      while (vm.items.length > 0) {
        vm.items.pop();
      }
      window._.forEach(parties, (v, k) => {
        let item = {
          no: k + 1,
          party: v,
          ballot: 0,
          c: {}
        };
        window._.forEach(window._.range(1, ranks + 1), (value) => {
          item.c[`r${value}`] = {
            rank: value,
            position: max,
            position_display: max,
            value: 0,
          };
        });
        vm.items.push(item)
      })
    },
    onRanksChange () {
      //store value
      let process = [];
      window._.forEach(this.sItems, (v, k) => {
        let x = -1;
        window._.forEach(v.c, (v1, k1) => process.push({
          b: v1.value,
          s0: k,
          s1: ++x,
          s2: k1,
        }))
      });
      //sort value
      let dr = 0, vr = Number.MIN_SAFE_INTEGER;
      window._.forEach(window._.sortBy(process, x => -x.b, x => x.s1, x => x.s0), (v, k) => {
        if (v.b !== vr) {
          vr = v.b;
          dr = k + 1
        }
        this.items[v.s0]['c'][v.s2]['position'] = k + 1;
        this.items[v.s0]['c'][v.s2]['position_display'] = dr;
      });
      while (process.length > 0) {
        process.pop()
      }
    },
    onBallotChange (e, v) {
      window._.forEach(v.c, (v1) => {
        v1.value = Number(Math.round(v.ballot / (v1.rank * 2 - 1)));
      });
      this.onRanksChange();
    },
  },
  computed: {
    sFields () {
      return this.fields
    },
    sItems () {
      return this.items
    },
    cNumSplit () {
      return window._.map(window._.range(1, this.numSplit + 1), x => `c.r${x}`);
    },
    cRanks () {
      return this.ranks;
    }
  },
}

</script>

<style scoped>

</style>
