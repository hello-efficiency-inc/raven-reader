<template>
    <div class="modal-mask" v-show="show" transition="modal">
        <div class="modal-wrapper">
            <div class="modal-container">
                <div class="modal-header">
                    <slot name="header">
                        default header
                    </slot>
                </div>
                <div class="modal-body">
                    <slot name="body">
                        default body
                    </slot>
                </div>
                <div class="modal-footer">
                    <slot name="footer">
                        <button class="modal-default-button" @click="show = false"> Ok </button>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
      twoWay: true
    }
  }
}
</script>
