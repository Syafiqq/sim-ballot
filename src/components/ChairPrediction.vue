<template lang="pug">
  b-table(responsive='', bordered='', outlined='', footClone='', hover='', :items='items', :fields='sFields')
</template>

<script>
const items = [];

export default {
  name: "ChairPrediction",
  data () {
    return {
      items: items,
      fields: [
        {key: 'no', label: 'No', thStyle: {width: '50px'}},
        {key: 'party', label: 'Partai', thStyle: {width: '150px'}},
        {key: 'ballot', label: 'Suara', thStyle: {width: '100px'}}
      ]
    }
  },
  computed: {
    sFields () {
      return this.fields
    }
  },
}

</script>

<style scoped>

</style>
