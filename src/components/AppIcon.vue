<template>
  <svg
    class="feather"
    :class="{ 'feather-small': size === 'sm', 'feather-filled': filled, 'feather-success': success }"
  >
    <use :xlink:href="`/feather-sprite.svg#${name}`" />
  </svg>
</template>
<script>
export default {
  props: {
    name: {
      type: String,
      required: true
    },
    filled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: null
    },
    success: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<style lang="scss">
.feather {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  vertical-align: text-bottom;
}

.feather-success {
  color: green;
}

.feather-small {
  width: 15px;
  height: 15px;
}

.feather-filled {
  fill: #000;
}
</style>
