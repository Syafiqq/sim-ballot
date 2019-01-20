<template lang="pug">
  b-table(responsive='', bordered='', outlined='', fixed='', footClone='', hover='', :items='items')
</template>

<script>
const items = [
  {isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald'},
  {isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw'},
];

export default {
  name: "ChairPrediction",
  data () {
    return {
      items: items
    }
  }
}

</script>

<style scoped>

</style>
