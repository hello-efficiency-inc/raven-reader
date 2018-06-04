<template>
  <div class="app-wrapper">
    <nav class="bg-light sidebar">
      <div class="subscribe-toolbar">
        <button class="btn btn-subscribe" v-b-modal.addfeed>
          <svg class="feather">
            <use xlink:href="static/feather-sprite.svg#plus"/>
          </svg>
          Add
        </button>
        <b-modal id="addfeed" hide-header hide-footer size="lg">
          <p class="my-4">Hello from modal!</p>
        </b-modal>
      </div>
      <div class="sidebar-sticky">
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" href="#">
              <svg class="feather">
                <use xlink:href="static/feather-sprite.svg#list"/>
              </svg>
              All Feeds <span class="sr-only">(current)</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <svg class="feather">
                <use xlink:href="static/feather-sprite.svg#star"/>
              </svg>
              Favourites
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <svg class="feather">
                <use xlink:href="static/feather-sprite.svg#archive"/>
              </svg>
              Archives
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <svg class="feather">
                <use xlink:href="static/feather-sprite.svg#circle"/>
              </svg>
              Unread Articles
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <svg class="feather feather-filled">
                <use xlink:href="static/feather-sprite.svg#circle"/>
              </svg>
              Recently Read
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <svg class="feather">
                <use xlink:href="static/feather-sprite.svg#settings"/>
              </svg>
              Settings
            </a>
          </li>
        </ul>
        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Categories</span>
          <a class="d-flex align-items-center text-muted" href="#">
            <svg class="feather">
              <use xlink:href="static/feather-sprite.svg#plus-circle"/>
            </svg>
          </a>
        </h6>
        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Subscriptions</span>
          <a class="d-flex align-items-center text-muted" href="#">
            <svg class="feather">
              <use xlink:href="static/feather-sprite.svg#plus-circle"/>
            </svg>
          </a>
        </h6>
      </div>
    </nav>
    <div class="articles-list">
      <div class="articles-inner">
        <form class="search-form">
          <div class="search-input input-group mb-0">
            <div class="input-group-prepend">
              <span class="input-group-text" id="basic-addon1">
                <svg class="feather">
                  <use xlink:href="static/feather-sprite.svg#search"/>
                </svg>
              </span>
            </div>
            <input type="text" class="form-control" placeholder="Search" aria-label="Search" aria-describedby="basic-addon1">
          </div>
        </form>
        <div class="articles">
          <div class="list-group">
            <a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
              <div class="d-flex w-100 justify-content-between mb-3">
                <small><img src="https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png?w=32" width="16" height="16"> Techcrunch</small>
                <small>3 days ago</small>
              </div>
              <h6><strong>Looks like macOS 10.14 will have a new dark mode and an Apple News app</strong></h6>
              <p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
            </a>
            <a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
              <div class="d-flex w-100 justify-content-between mb-3">
                <small><img src="https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png?w=32" width="16" height="16"> Techcrunch</small>
                <small>3 days ago</small>
              </div>
              <h6><strong>Looks like macOS 10.14 will have a new dark mode and an Apple News app</strong></h6>
              <p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
            </a>
            <a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
              <div class="d-flex w-100 justify-content-between mb-3">
                <small><img src="https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png?w=32" width="16" height="16"> Techcrunch</small>
                <small>3 days ago</small>
              </div>
              <h6><strong>Looks like macOS 10.14 will have a new dark mode and an Apple News app</strong></h6>
              <p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="article-detail px-5">
      <div class="content-wrapper">
        <div class="article-toolbar">
          <div class="article-buttons">
            <div class="wrap">
              <button class="btn btn-toolbar">
                <svg class="feather">
                  <use xlink:href="static/feather-sprite.svg#star"/>
                </svg>
              </button>
            </div>
            <div class="wrap">
              <button class="btn btn-toolbar">
                <svg class="feather">
                  <use xlink:href="static/feather-sprite.svg#circle"/>
                </svg>
              </button>
            </div>
            <div class="wrap">
              <button class="btn btn-toolbar">
                <svg class="feather">
                  <use xlink:href="static/feather-sprite.svg#external-link"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="article-content">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc finibus rutrum nisi sed condimentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris interdum est ut massa euismod, eget molestie ligula aliquam. Nullam libero orci, gravida eget augue ut, tempus ornare lectus. Morbi suscipit lorem sit amet sem fermentum sollicitudin. Vivamus sagittis, nisl sed vestibulum placerat, arcu orci mattis mauris, sollicitudin sollicitudin est massa sed purus. Suspendisse id libero et sem ultricies placerat.

          Curabitur non felis nisl. Etiam justo lorem, mattis non nisi sed, varius ultricies lectus. Curabitur quis nulla imperdiet, sodales lorem nec, iaculis dui. Donec mollis odio viverra nunc interdum condimentum. Vivamus consequat efficitur gravida. Aenean ornare enim eu velit luctus tempor. Nunc fringilla orci consectetur eleifend viverra. Vestibulum luctus faucibus diam, id scelerisque mauris dictum eget. Suspendisse id dictum diam, ac malesuada mauris. Suspendisse molestie, mi eget varius pharetra, justo arcu pulvinar lorem, placerat vehicula ante nunc vel lorem. Donec ac neque molestie, mattis risus sed, lacinia libero. Sed porta nulla ac purus ullamcorper tempor at quis dui. Quisque pharetra bibendum elit, vitae hendrerit dui pellentesque ut. Integer faucibus molestie rutrum. Proin fermentum, leo hendrerit commodo sagittis, tellus velit luctus urna, quis rutrum nibh ex pharetra felis. Suspendisse quis egestas orci.

          Morbi ut tellus ut tortor venenatis mattis at ut dolor. Maecenas sed sapien mauris. Suspendisse et elementum velit. Aenean aliquet sagittis ex vitae efficitur. Aenean cursus vel erat eu auctor. Nulla facilisi. Etiam ultrices nibh ac porta dignissim. Mauris rutrum mi eget massa iaculis efficitur. Phasellus rutrum sem vestibulum, pretium diam sit amet, pretium mi. Praesent ultrices nunc ut dictum lobortis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis magna eros, ullamcorper in massa eget, egestas tempus diam. Aliquam venenatis nunc a neque auctor dignissim. Cras metus erat, vehicula id urna venenatis, tempor vehicula diam. Nullam tincidunt, risus eget placerat porta, tellus arcu condimentum neque, vel ultricies eros eros sit amet eros.

          Phasellus rhoncus, orci eu pellentesque eleifend, felis mi tempus purus, in luctus tortor magna et nulla. In hac habitasse platea dictumst. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla lacinia, dolor vitae mollis vulputate, ipsum ex rutrum quam, ut maximus dui risus sed nisl. Vivamus dui neque, sollicitudin eget maximus ut, venenatis id orci. Etiam sodales, eros sit amet suscipit semper, quam sem ultricies lorem, nec egestas diam libero ut quam. Sed sagittis augue non quam rhoncus, ac tincidunt urna imperdiet. Vestibulum nunc neque, scelerisque condimentum ante scelerisque, tempor suscipit odio. Proin et sapien eget ante tincidunt aliquam. In hendrerit lacinia tempus.

          Maecenas id neque quam. Cras in interdum purus. Integer tincidunt id justo nec convallis. Aliquam dapibus id eros ut rhoncus. Cras in ligula tincidunt, iaculis mi eget, volutpat arcu. Ut dignissim mi vel molestie pharetra. Ut faucibus nisi nec quam feugiat, quis commodo est varius. Aliquam diam velit, egestas nec hendrerit et, interdum in ex. Curabitur molestie metus quis massa congue, sed ornare est fringilla. Suspendisse lobortis interdum leo non efficitur. Sed vel nunc sodales, pulvinar elit id, consequat dolor. Quisque pellentesque sodales leo. Etiam elit ipsum, porttitor at congue a, convallis vitae est. Nam eros elit, tempor et laoreet vitae, maximus id odio.

          Aliquam erat volutpat. Donec a tellus finibus, imperdiet nulla sit amet, auctor nisi. Sed auctor hendrerit velit eu condimentum. Praesent efficitur id nibh non gravida. Morbi faucibus, elit vel sodales fermentum, nisi tellus porta nisl, sit amet rhoncus mi augue nec libero. Nulla ultricies ullamcorper sagittis. Curabitur orci nibh, pellentesque nec tempus ac, rutrum sed leo. In nunc dolor, consectetur ac rutrum et, porta vel mi. Fusce ac magna finibus, mattis enim sed, placerat risus.

          Morbi pharetra, velit sed bibendum rhoncus, mauris quam efficitur turpis, non tincidunt arcu augue sed eros. Vestibulum eu felis sed diam dapibus dignissim. Morbi aliquam commodo risus, eget ultrices orci imperdiet a. Vivamus mollis eget augue ut euismod. Nam nec magna vehicula, dictum odio ut, euismod nisi. Nunc nec quam id purus tincidunt interdum et eget nibh. Aliquam bibendum tellus sit amet leo volutpat mollis. Mauris id porta purus. Suspendisse gravida rhoncus augue, nec congue arcu egestas sit amet. Donec tincidunt sapien in mi scelerisque dictum. Donec laoreet lorem vel orci viverra, et ultrices sapien porttitor. Aenean vel massa purus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mollis tincidunt diam rutrum tincidunt. Vestibulum luctus accumsan nisi vel dictum.

          Donec non blandit justo, vitae aliquam odio. Nam molestie rutrum sodales. Fusce consequat auctor urna quis fringilla. Nullam bibendum vulputate sapien ac aliquet. Aenean id eros vestibulum, aliquam leo nec, euismod mi. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin a facilisis urna. Aliquam in congue odio, et ullamcorper sapien. Sed urna purus, sodales eget arcu sed, suscipit accumsan lacus. Phasellus tincidunt aliquet diam quis viverra. Morbi ligula massa, auctor ut porta sit amet, aliquet eu elit. Duis ornare vitae urna sit amet scelerisque. Proin id quam eget ipsum tincidunt vestibulum venenatis non tortor. Donec rutrum lectus eu nunc consectetur bibendum. Quisque tempus mollis egestas. Quisque et nisl non enim sodales pharetra vel id mauris.

          Nulla facilisi. Mauris ut sem ipsum. Etiam est velit, mollis id enim a, mattis dapibus nulla. Nulla facilisi. Phasellus feugiat lorem id erat pretium ultricies. Suspendisse nec auctor magna. Vivamus auctor at sapien at tempor. Curabitur ac tristique diam, pretium congue justo. Duis facilisis malesuada velit.

          Quisque varius dui in elit aliquam, ut lobortis nisl laoreet. Cras congue, dolor a molestie malesuada, erat mauris aliquet justo, in imperdiet lectus purus quis enim. Mauris ornare accumsan dui eu sodales. Phasellus dictum odio eu justo mollis, volutpat scelerisque turpis suscipit. Nunc sit amet lorem urna. Proin nibh sem, vulputate in gravida non, dictum et augue. Nam egestas pharetra tincidunt.
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.app-wrapper {
  display: flex;
  height: 100%;
  align-items: flex-start;
}

.articles-inner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow:hidden;
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
}

.articles-list {
  position: relative;
  flex-grow: 0;
  width: 350px;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  height: 100%;
}

.articles-list:after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 25px;
  background: linear-gradient(
  rgba(255, 255, 255, 0.001),
  white
  ); /* transparent keyword is broken in Safari */
  pointer-events: none;
}

.articles {
  position: absolute;
  top: 41px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto;
  background: #fff;
  overflow-x: hidden;
}

.search-input {
  position: absolute;
  top: 0;
  bottom: 0;
}

.search-form {
  .form-control {
    border-radius: 0;
    border: 0;
  }
}

.search-input .input-group-text {
  background: none;
  border: 0;
}

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
  text-align:left;
  padding: 0 0 0 16px;
  background: transparent;
  color: #3399FF;
  font-weight: 700;

  .feather {
    margin-right: 5px;
  }
}
</style>
