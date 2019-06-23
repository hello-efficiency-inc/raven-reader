<template>
  <div class="article-detail">
    <div class="content-wrapper">
      <article-toolbar :article="article" ref="articleToolbar"></article-toolbar>
      <perfect-scrollbar class="article-contentarea  px-4" v-bind:class="{ 'offset-content': fontSettingsOn }" v-if="article !== null && article.content !== null && !emptyState" v-bind:style="{ fontSize: `${currentFontSize}% !important` }">
        <h2>
          <strong>{{ article.title }}</strong><br/>
          <small><span v-if="article.date_published">{{ article.date_published }} </span> <span v-if="article.author">by {{ article.author }}</span>  <strong v-if="article.date_published || article.date_published">&#183;</strong> {{ article.readtime }}</small>
        </h2>
        <div class="article-detail" v-if="article.content" v-html="article.content"></div>
        <div class="article-detail" v-if="!article.content">
          {{ article.description }}
        </div>
      </perfect-scrollbar>
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
  },
  computed: {
    currentFontSize () {
      return this.$store.state.Article.fontSize
    },
    fontSettingsOn () {
      return this.$store.state.Article.fontSettingOn
    }
  }
}
</script>
<style lang="scss">

.content-wrapper {
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

// Default color mode
:root {
  & .article-contentarea {
    --h2-color: inherit;
    --h2-small-color: inherit;
    --text-color: inherit;
    --paragraph-color: inherit;
  }
}

// Dark color mode
.app-darkmode {
  & .article-contentarea {
    --text-color-gray: #c8cacc;
    --h2-color: var(--text-color);
    --h2-small-color: var(--text-color-gray);
    --paragraph-color: var(--text-color-gray);
  }
}

.article-detail {
  position: relative;
  flex-grow: 1;
  height: 100%;

  background: var(--background-color);
}

.article-contentarea {

  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 41px;
  margin: 0;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 2;
  padding: 15px 15px 30px;
  height: calc(100% - 45px);

  background-color: var(--background-color);
  h1,
  h2 {
    font-size: 2em;
    color: var(--text-color);
    small {
      font-size: 14px;
      color: var(--h2-small-color);
    }
  }

  ul {
    color: var(--text-color);
  }

  address,
  figure,
  blockquote,
  h3,
  h4 {
    color: var(--text-color);
  }
  b {
    color: var(--text-color);
  }
  p {
    color: var(--paragraph-color);
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

.offset-content {
  padding-top: 60px;
}
</style>
