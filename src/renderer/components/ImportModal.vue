<template>
  <b-modal id="importfeed" ref="importFeed" title="Import Subscriptions from OPML file" centered @hidden="onHidden">
    <b-form-file v-model="file" placeholder="Choose a file..." accept=".xml, .opml"></b-form-file>
    <b-form-text id="inputLiveHelp">
      OPML is a standard format to import or export feed subscriptions. You can export OPML files from other readers and import it.
    </b-form-text>
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
    onHidden () {
      this.file = null
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
            console.log(err)
            this.$toast('Oops! something went wrong', {
              className: 'et-alert',
              horizontalPosition: 'center'
            })
          }
          data.opml.body[0].outline.forEach((item) => {
            if (item.$.xmlUrl) {
              console.log(item)
              helper.subscribe(data.opml.body[0].outline)
            } else {
              helper.subscribe(item.outline)
            }
          })
        })
      })

      this.file = null
      this.hideModal()
    }
  }
}
</script>
