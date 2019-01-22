<template lang="pug">
  b-table(responsive='', bordered='', outlined='', hover='', :items='sItems', :fields='sFields')
    template(slot='ballot', slot-scope='data')
      input.form-control-sm(type='number', style='width:5em', v-model.lazy='data.item.ballot', @change="onBallotChange($event,data.item)")
    template(v-for="(item) in cNumSplit", v-bind:slot='item', slot-scope='data' )
      | {{data.value+100}}
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
    }
  },
  created () {
    this.fetch()
  },
  methods: {
    async fetch () {
      const {parties, num_ranks} = await ConfigRepository.get();
      this.numSplit = num_ranks;
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
          key: `c.r${value}.value`,
          label: `R${value * 2 - 1}`,
          thStyle: {width: '80px'},
          tdClass: ['text-right'],
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
      const max = parties.length * ranks;
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
    onBallotChange (e, v) {
      window._.forEach(v.c, (v1) => {
        v1.value = Number(Math.round(v.ballot / (v1.rank * 2 - 1)));
      });
    }
  },
  computed: {
    sFields () {
      return this.fields
    },
    sItems () {
      return this.items
    },
    cNumSplit () {
      return window._.map(window._.range(1, this.numSplit + 1), x => `c.r${x}.value`);
    }
  },
}

</script>

<style scoped>

</style>
