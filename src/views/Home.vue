<template lang="pug">
  .home
    chair-prediction
</template>

<script>
// @ is an alias to /src
import ChairPrediction from '@/components/ChairPrediction.vue'

export default {
  name: 'home',
  components: {
    ChairPrediction
  }
}
</script>
