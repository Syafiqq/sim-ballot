<template lang="pug">
  b-table(responsive='', bordered='', outlined='', hover='', :items='sItems', :fields='sFields')
</template>

<script>
import {ConfigRepository} from "@/resources/js/repositories/config-repository";


export default {
  name: "ChairPrediction",
  data () {
    return {
      items: [],
      fields: []
    }
  },
  created () {
    this.fetch()
  },
  methods: {
    async fetch () {
      const {parties, num_ranks} = await ConfigRepository.get();
      this.mergeFields(num_ranks);
      this.createParties(parties);
    },
    mergeFields (ranks) {
      let vm = this;
      let fields = [
        {key: 'no', label: 'No', thStyle: {width: '50px'}},
        {key: 'party', label: 'Partai', thStyle: {width: '150px'}},
        {key: 'ballot', label: 'Suara', thStyle: {width: '100px'}}
      ];
      window._.forEach(window._.range(1, ranks + 1), (value) => {
        fields.push({key: `r.${value}`, label: `R${value * 2 - 1}`, thStyle: {width: '80px'}})
      });
      while (vm.fields.length > 0) {
        vm.fields.pop();
      }
      window._.forEach(fields, (value) => {
        vm.fields.push(value);
      })
    },
    createParties (parties) {
      let vm = this;
      while (vm.items.length > 0) {
        vm.items.pop();
      }
      window._.forEach(parties, (v, k) => {
        vm.items.push({
          no: k + 1,
          party: v,
          ballot: 0
        })
      })
    }
  },
  computed: {
    sFields () {
      return this.fields
    },
    sItems () {
      return this.items
    }
  },
}

</script>

<style scoped>

</style>
