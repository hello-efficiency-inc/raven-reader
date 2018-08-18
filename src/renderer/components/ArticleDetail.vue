<template>
  <div class="article-detail">
    <div class="content-wrapper">
      <article-toolbar :article="article"></article-toolbar>
      <div class="article-contentarea  px-4" v-if="article !== null && article.content !== null && !emptyState">
        <h2>
          <strong>{{ article.title }}</strong><br/>
          <small><span v-if="article.date_published">{{ article.date_published }} </span> <span v-if="article.author">by {{ article.author }}</span>  <strong v-if="article.date_published || article.date_published">&#183;</strong> {{ article.readtime }}</small>
        </h2>
        <div class="article-detail" v-html="article.content"></div>
      </div>
      <div class="article-contentarea  px-4" v-if="article !== null && article.content === null && emptyState">
        <div class="article-detail d-flex flex-column justify-content-center align-items-center
">
          <h3 class="mb-4">Whoops! not able to load content.</h3>
          <a :href="article.url" class="btn btn-primary btn-outline-primary js-external-link">
            View it on web
          </a>
        </div>
      </div>
      <div class="article-contentarea loading-state px-4" v-if="loading">
        <loader v-if="loading"></loader>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    id: {
      type: String
    },
    article: {
      type: Object
    },
    emptyState: {
      type: Boolean
    },
    loading: {
      type: Boolean
    }
  }
}
</script>
<style lang="scss">
.article-detail {
  position: relative;
  flex-grow: 1;
  height: 100%;
}

.content-wrapper {
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.article-contentarea {
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

  h2 {
    small {
      font-size: 14px;
    }
  }
}

.article-detail {
  img {
    display: block;
    max-width: 100%;
    margin-bottom: 15px;
  }

  h2 {
    margin-bottom: 25px;
  }

  h3 {
    font-size: 22px;
    margin-top: 15px;
    line-height: 29px;
    font-weight: 700;
  }

  iframe {
    display:block;
    width: 100%;
    height: 500px;
    border: 0;
  }

  .col {
    padding-left: 0;
    padding-right: 0;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
