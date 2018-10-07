<template>
  <b-modal id="importfeed" ref="importFeed" title="Import Subscriptions from OPML file" centered @hidden="onHidden">
    <b-form-file v-model="file" placeholder="Choose a file..." accept=".xml, .opml"></b-form-file>
    <b-form-text id="inputLiveHelp">
      OPML is a standard format to import or export feed subscriptions. You can export OPML files from other readers and import it.
    </b-form-text>
    <div slot="modal-footer">
      <button type="button" class="btn btn-secondary" @click="hideModal">Close</button>
      <button type="button" class="btn btn-primary" @click="importFeed" :disabled="disableImport">Import</button>
    </div>
  </b-modal>
</template>
<script>
import fs from 'fs'
import opmlParser from 'node-opml-parser'
import helper from '../services/helpers'

export default {
  data () {
    return {
      file: null
    }
  },
  computed: {
    disableImport () {
      return this.$store.state.Setting.offline
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
      fs.readFile(this.file.path, 'utf8', (err, data) => {
        if (err) {
          this.$toast('Oops! something went wrong', {
            className: 'et-alert',
            horizontalPosition: 'center'
          })
        }

        opmlParser(data, (err, data) => {
          if (err) {
            this.$toast('Oops! something went wrong', {
              className: 'et-alert',
              horizontalPosition: 'center'
            })
          }
          helper.subscribe(data, null, false, true)
        })
      })

      this.file = null
      this.hideModal()
    }
  }
}
</script>
