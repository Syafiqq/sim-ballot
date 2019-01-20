<template lang="pug">
  #app
    component(:is='layout')
      transition
        router-view
</template>

<script>
const defaultLayout = 'plain-container';

export default {
  name: 'app',
  components: {},
  data () {
    return {}
  },
  methods: {},
  computed: {
    layout () {
      return (this.$route.meta.layout || defaultLayout)
    }
  },

  mounted () {
  },

  created () {
    // nothing defined here (when this.$route.path is other than "/")
    // console.log({ route: this.$route, meta: this.$route.meta.layout })
  },

  updated () {
    // something defined here whatever the this.$route.path
    // console.log({ route: this.$route, meta: this.$route.meta.layout })
  }
}
</script>


<style lang="scss">

</style>

