<template>
  <a-modal
    :visible="visible"
    :title="$t('chooseImage')"
    @cancel="$emit('close')"
    @ok="confirmSelection"
    width="700px"
  >
    <a-tabs v-model="activeTab">
      <a-tab-pane key="upload" :tab="$t('uploadFromDevice')">
        <UploadSection @selected-file="onFileSelected" />
      </a-tab-pane>
      <a-tab-pane key="library" :tab="$t('chooseFromLibrary')">
        <LibrarySection @selected-image="onImageSelected" />
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script>
import UploadSection from "./UploadSection.vue";
import LibrarySection from "./LibrarySection.vue";

export default {
  components: { UploadSection, LibrarySection },
  props: { visible: Boolean },
  data() {
    return {
      activeTab: "upload",
      selectedPayload: null,
    };
  },
  methods: {
    onFileSelected(payload) {
      this.selectedPayload = payload;
    },
    onImageSelected(payload) {
      this.selectedPayload = payload;
    },
    confirmSelection() {
      if (this.selectedPayload) this.$emit("selected", this.selectedPayload);
      this.$emit("close");
    },
  },
};
</script>
