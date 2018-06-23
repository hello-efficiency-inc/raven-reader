<template>
  <div class="subscribe-toolbar">
    <button class="btn btn-subscribe" v-b-modal.addfeed>
      <feather-icon name="plus"></feather-icon>
      Add
    </button>
    <subscribe-modal></subscribe-modal>
  </div>
</template>
<style lang="scss">
.subscribe-toolbar {
  height: 41px;
  border-bottom: 1px solid #e3e3e3;
}

.btn-subscribe {
  border-radius: 0;
  user-select: none;
  line-height: 41px;
  cursor: pointer;
  position: relative;
  display: block;
  width: 100%;
  text-align: left !important;
  padding: 0 0 0 16px;
  background: transparent;
  color: #3399FF;
  font-weight: 700 !important;

  &:focus {
    outline: 0 !important;
    box-shadow: none !important;
  }

  .feather {
    margin-right: 5px;
  }
}
</style>
