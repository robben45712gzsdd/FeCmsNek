<template>
  <a-modal
    :visible="visible"
    :title="$t('fileDetailTitle')"
    @cancel="close"
    :footer="null"
    width="600px"
    class="file-detail-modal"
  >
    <div v-if="loading" class="flex justify-center items-center py-8">
      <a-spin :tip="$t('loadingDetail')" />
    </div>

    <div v-else-if="file" class="file-detail-body">
      <a-descriptions bordered :column="1" class="custom-desc">
        <a-descriptions-item :label="$t('fileName')">
          <span class="file-name">
            <i class="fas fa-file-alt text-blue-500 mr-2"></i>{{ file.name }}
          </span>
        </a-descriptions-item>

        <a-descriptions-item :label="$t('folderName')">
          <span class="text-gray-700">{{ file.folderName }}</span>
        </a-descriptions-item>

        <a-descriptions-item :label="$t('fileExtension')">
          <a-tag color="geekblue">{{ file.fileExtension }}</a-tag>
        </a-descriptions-item>

        <a-descriptions-item :label="$t('createdTime')">
          <span class="text-gray-700">{{ formatDate(file.createdTime) }}</span>
        </a-descriptions-item>

        <a-descriptions-item :label="$t('download')">
          <a
            :href="file.fileUrl"
            target="_blank"
          >
            <i class="fas fa-download mr-1"></i> {{ $t('openFile') }}
          </a>
        </a-descriptions-item>
      </a-descriptions>
    </div>
    
    <div v-else class="text-center text-gray-500 py-4 italic">
      {{ $t('noData') }}
    </div>
  </a-modal>
</template>

<script>
import { getDetailFile } from "../../../apis/files";
import moment from "moment";

export default {
  name: "FileDetail",
  props: {
    visible: Boolean,
    refId: String,
  },
  data() {
    return {
      file: null,
      loading: false,
    };
  },
  watch: {
    visible(val) {
      if (val && this.refId) {
        this.fetchDetail();
      }
    },
  },
  methods: {
    fetchDetail() {
      this.loading = true;
      getDetailFile(this.refId)
        .then((res) => {
          if (res?.responseCode === 1) {
            this.file = res.data;
          } else {
            this.$message.error(this.$t("loadError"));
          }
        })
        .catch(() => {
          this.$message.error(this.$t("fetchError"));
        })
        .finally(() => {
          this.loading = false;
        });
    },
    close() {
      this.$emit("close");
    },
    formatDate(date) {
      return date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : "-";
    },
  },
};
</script>

<style scoped>
.file-detail-modal >>> .ant-modal-content {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}
.file-detail-modal >>> .ant-modal-header {
  background: #f3f6fb;
  border-bottom: none;
}
.file-detail-modal >>> .ant-modal-title {
  font-weight: 600;
  color: #1e293b;
}
.custom-desc >>> .ant-descriptions-item-label {
  background: #f9fafb !important;
  font-weight: 600;
  color: #334155;
}
.custom-desc >>> .ant-descriptions-item-content {
  background: white;
  padding: 10px 12px !important;
  color: #1f2937;
}
.file-name {
  font-weight: 500;
  color: #1e40af;
}
</style>
