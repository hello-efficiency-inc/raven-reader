<template>
  <div class="article-detail px-5">
    <div class="content-wrapper">
      <div class="article-toolbar">
        <div class="article-buttons">
          <div class="wrap">
            <button class="btn btn-toolbar">
              <feather-icon name="star"></feather-icon>
            </button>
          </div>
          <div class="wrap">
            <button class="btn btn-toolbar">
              <feather-icon name="circle"></feather-icon>
            </button>
          </div>
          <div class="wrap">
            <button class="btn btn-toolbar">
              <feather-icon name="external-link"></feather-icon>
            </button>
          </div>
        </div>
      </div>
      <div class="article-content">
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.article-detail {
  position: relative;
  flex-grow: 1;
  height: 100%;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 30px;
    background: linear-gradient(
    rgba(255, 255, 255, 0.001),
    white
    ); /* transparent keyword is broken in Safari */
    pointer-events: none;
    z-index: 3;
  }
}

.content-wrapper {
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.article-toolbar {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 100%;
  border-bottom: 1px solid #e3e3e3;
  height: 41px;
}

.article-buttons {
  display: block;
  position: absolute;
  top: 0;
  right:0 ;
  width: 270px;
  height: 40px;
  z-index: 1;
  background-image: linear-gradient(to right, rgba(255,255,255,0) 0%, #fff 10%);

  .wrap {
    float: right;
  }
}

.article-content {
  background-color: #fff;
  display: block;
  position: absolute;
  height: auto;
  bottom: 0;
  left: 0;
  right: 0;
  top: 41px;
  margin: 0;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 2;
  padding: 15px;
}

.btn-toolbar {
  display: block;
  z-index: 2;
  background: transparent;
  border: none;
  border-radius: 0;
  width: 44px;
  height: 40px;
  padding: 0;
  position: relative;
}
</style>
