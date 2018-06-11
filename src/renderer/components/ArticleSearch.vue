<template>
  <form class="search-form">
    <div class="search-input input-group mb-0">
      <div class="input-group-prepend">
        <span class="input-group-text">
          <feather-icon name="search"></feather-icon>
        </span>
      </div>
      <input type="text" class="form-control" placeholder="Search" aria-label="Search">
    </div>
  </form>
</template>
<style lang="scss">
.search-input {
  position: absolute;
  top: 0;
  bottom: 0;

  .input-group-text {
    background: none;
    border: 0;
  }
}

.search-form {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  margin: 0;
  border-bottom: 1px solid transparent;
  border-color: #dcdee0;
  background-color: #FFFFFF;
  height: 41px;

  .form-control {
    border-radius: 0;
    border: 0;

    &:focus {
      box-shadow: none;
      outline: 0;
    }
  }
}
</style>
