<template>
  <b-modal id="importfeed" ref="importFeed" title="Import Feeds">
    <b-form-file v-model="file" :state="Boolean(file)" placeholder="Choose a file..." accept=".xml"></b-form-file>
    <div slot="modal-footer">
      <button type="button" class="btn btn-secondary" @click="hideModal">Close</button>
      <button type="button" class="btn btn-primary" @click="importFeed">Import</button>
    </div>
  </b-modal>
</template>
<script>
import fs from 'fs'
import xml2js from 'xml2js'
import helper from '../services/helpers'

export default {
  data () {
    return {
      file: null
    }
  },
  methods: {
    hideModal () {
      this.$refs.importFeed.hide()
    },
    importFeed () {
      const parser = new xml2js.Parser()
      fs.readFile(this.file.path, 'utf8', (err, data) => {
        if (err) {
          this.$toast('Oops! something went wrong', {
            className: 'et-alert',
            horizontalPosition: 'center'
          })
        }
        parser.parseString(data, (err, data) => {
          if (err) {
            this.$toast('Oops! something went wrong', {
              className: 'et-alert',
              horizontalPosition: 'center'
            })
          }
          const feeds = data.opml.body[0].outline
          helper.subscribe(feeds)
        })
      })

      this.hideModal()
    }
  }
}
</script>
