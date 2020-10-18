<template>
  <b-modal
    id="importfeed"
    ref="importFeed"
    title="Import Subscriptions from OPML file"
    centered
    @hidden="onHidden"
  >
    <b-form-file
      v-model="file"
      placeholder="Choose a file..."
      accept=".xml, .opml"
    />
    <b-form-text id="inputLiveHelp">
      OPML is a standard format to import or export feed subscriptions. You can export OPML files from other readers and import it.
    </b-form-text>
    <div slot="modal-footer">
      <button
        type="button"
        class="btn btn-secondary mr-3"
        @click="hideModal"
      >
        Close
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="disableImport"
        @click="importFeed"
      >
        Import
      </button>
    </div>
  </b-modal>
</template>
<script>
import { parseOPML } from '../services/opml'
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
      this.$parent.$refs.topProgress.start()
      window.fs.readFile(this.file.path, 'utf8', (err, data) => {
        if (err) {
          this.$toasted.show('Oops! something went wrong', {
            theme: 'outline',
            position: 'top-center',
            duration: 3000
          })
        }
        const parsedData = parseOPML(data).filter(item => item !== null)
        helper.subscribe(parsedData, null, false, true).then(() => {
          this.$parent.$refs.topProgress.done()
        })
      })

      this.file = null
      this.hideModal()
    }
  }
}
</script>
