<template>
  <a-modal
    :visible="visible"
    :title="$t('uploadTitle')"
    @cancel="close"
    :footer="null"
    width="520px"
    class="upload-modal"
  >
    <a-form
      v-if="!uploadedFile"
      layout="vertical"
      @submit.prevent="handleUpload"
    >
      <a-form-item :label="$t('folderName')">
        <a-input
          v-model="folderName"
          :placeholder="$t('folderPlaceholder')"
          class="input-rounded"
        />
      </a-form-item>

      <a-form-item :label="$t('fileLabel')">
        <label class="upload-box" for="fileInput">
          <input
            id="fileInput"
            type="file"
            class="hidden-input"
            @change="handleFileChange"
          />
          <div class="upload-content">
            <template v-if="!file">
              <a-icon type="upload" class="icon-upload" />
              <p class="upload-text">{{ $t('selectFile') }}</p>
            </template>
            <template v-else>
              <a-icon type="file" class="icon-file" />
              <p class="file-name">{{ file.name }}</p>
            </template>
          </div>
        </label>
      </a-form-item>

      <div class="button-group">
        <a-button @click="close">{{ $t('cancel') }}</a-button>
        <a-button
          type="primary"
          :loading="loading"
          :disabled="!file || !folderName"
          @click="handleUpload"
        >
          <a-icon type="cloud-upload" />
          {{ $t('uploadButton') }}
        </a-button>
      </div>
    </a-form>

    <template v-else>
      <a-card class="result-card" :bordered="false">
        <template #title>
          ✅ <span class="result-title">{{ $t('uploadSuccessTitle') }}</span>
        </template>
        <p><strong>{{ $t('folder') }}:</strong> {{ uploadedFile.folderName }}</p>
        <p><strong>{{ $t('extension') }}:</strong> {{ uploadedFile.fileExtension }}</p>
        <p>
          <strong>{{ $t('link') }}:</strong>
          <a :href="uploadedFile.fileUrl" target="_blank" class="file-link">
            {{ uploadedFile.fileUrl }}
          </a>
        </p>
      </a-card>

      <div class="ok-button-container">
        <a-button type="primary" @click="handleOk">{{ $t('ok') }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script>
import { uploadFile } from "../../../apis/files";

export default {
  name: "UploadFile",
  props: {
    visible: Boolean,
  },
  data() {
    return {
      folderName: "string",
      file: null,
      uploadedFile: null,
      loading: false,
    };
  },
  methods: {
    handleFileChange(e) {
      this.file = e.target.files[0];
    },
    handleUpload() {
      if (!this.file || !this.folderName) {
        this.$message.warning(this.$t("uploadWarning"));
        return;
      }

      const formData = new FormData();
      formData.append("folderName", this.folderName);
      formData.append("file", this.file);
      this.loading = true;

      uploadFile(formData)
        .then((res) => {
          if (res?.responseCode === 1) {
            this.uploadedFile = res.data;
            this.$message.success(this.$t("uploadSuccessMessage"));
            this.$emit("uploaded", res.data);
          } else {
            this.$message.error(res.message || this.$t("uploadErrorMessage"));
          }
        })
        .catch((err) => {
          this.$message.error(this.$t("uploadErrorOccurred"));
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleOk() {
      this.close();
    },
    close() {
      this.folderName = "string";
      this.file = null;
      this.uploadedFile = null;
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.upload-modal {
  border-radius: 10px;
}

.input-rounded {
  border-radius: 6px;
}

.upload-box {
  display: block;
  border: 2px dashed #d9d9d9;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.upload-box:hover {
  border-color: #1890ff;
  background-color: #f0f7ff;
}

.hidden-input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
  z-index: -1;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-upload {
  font-size: 30px;
  color: #1890ff;
  margin-bottom: 6px;
}

.icon-file {
  font-size: 30px;
  color: #52c41a;
  margin-bottom: 6px;
}

.upload-text {
  color: #888;
  font-size: 14px;
}

.file-name {
  color: #555;
  font-weight: 500;
  word-break: break-all;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 8px;
}

.result-card {
  background-color: #fafafa;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.result-title {
  font-weight: 600;
  margin-left: 6px;
}

.file-link {
  color: #1890ff;
  text-decoration: none;
}

.file-link:hover {
  text-decoration: underline;
}

.ok-button-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
