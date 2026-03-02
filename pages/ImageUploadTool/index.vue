<template>
  <div class="image-upload-tool">
    <h2 class="title">Upload Ảnh & Lấy Link</h2>

    <div class="container">
      <!-- Upload Section -->
      <div class="upload-section">
        <h3>Chọn ảnh để upload</h3>
        
        <!-- Drag & Drop Area -->
        <div
          class="drop-area"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
          :class="{ active: isDragOver }"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="file-input-hidden"
            @change="onFileChange"
          />
          
          <div class="drop-content">
            <a-icon type="inbox" style="font-size: 48px; color: #1890ff" />
            <p class="drop-text">Kéo thả ảnh vào đây hoặc</p>
            <a-button type="primary" @click="$refs.fileInput.click()">
              Chọn ảnh từ máy
            </a-button>
          </div>
        </div>

        <!-- File Info -->
        <div v-if="selectedFile" class="file-info">
          <div class="info-row">
            <span class="label">Tên file:</span>
            <span class="value">{{ selectedFile.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Kích thước:</span>
            <span class="value">{{ formatFileSize(selectedFile.size) }}</span>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="filePreview" class="preview-section">
          <h4>Preview</h4>
          <img :src="filePreview" alt="preview" class="preview-img" />
        </div>

        <!-- Upload Button -->
        <div class="action-buttons">
          <a-button
            v-if="selectedFile"
            type="primary"
            size="large"
            :loading="uploading"
            @click="handleUpload"
            class="upload-btn"
          >
            <a-icon type="cloud-upload" /> Upload ảnh
          </a-button>
          <a-button
            v-if="selectedFile && !uploading"
            @click="clearFile"
            class="clear-btn"
          >
            Xóa lựa chọn
          </a-button>
        </div>
      </div>

      <!-- Result Section -->
      <div v-if="uploadResult" class="result-section">
        <a-alert
          :message="uploadResult.success ? 'Upload thành công!' : 'Upload thất bại!'"
          :type="uploadResult.success ? 'success' : 'error'"
          show-icon
          closable
          @close="uploadResult = null"
          style="margin-bottom: 16px"
        />

        <div v-if="uploadResult.success" class="success-content">
          <div class="link-box">
            <h4>Link ảnh đã tải:</h4>
            <div class="link-display">
              <input
                type="text"
                :value="uploadResult.imageUrl"
                readonly
                class="link-input"
              />
              <a-button
                type="primary"
                icon="copy"
                @click="copyToClipboard(uploadResult.imageUrl)"
              >
                Copy
              </a-button>
            </div>
            <p class="copy-hint" v-if="copySuccess">
              ✓ Đã copy vào clipboard!
            </p>
          </div>

          <!-- Image Preview in Result -->
          <div class="result-preview">
            <h4>Xem ảnh:</h4>
            <img
              :src="uploadResult.imageUrl"
              alt="uploaded"
              class="result-img"
            />
          </div>
        </div>

        <div v-else class="error-content">
          <p>{{ uploadResult.error || 'Có lỗi trong quá trình upload' }}</p>
        </div>
      </div>

      <!-- Upload History -->
      <div v-if="uploadHistory.length" class="history-section">
        <h3>Lịch sử upload (phiên này)</h3>
        <div class="history-list">
          <div
            v-for="(item, idx) in uploadHistory"
            :key="idx"
            class="history-item"
          >
            <img :src="item.imageUrl" :alt="item.fileName" class="history-thumb" />
            <div class="history-info">
              <p class="history-name">{{ item.fileName }}</p>
              <p class="history-time">
                {{ formatDate(item.uploadedAt) }}
              </p>
            </div>
            <a-button
              type="link"
              icon="copy"
              @click="copyToClipboard(item.imageUrl)"
            >
              Copy link
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { uploadImageMedia } from "../../apis/files";

export default {
  name: "ImageUploadTool",
  layout: "adminLayout",
  middleware: "auth",
  data() {
    return {
      selectedFile: null,
      filePreview: null,
      uploading: false,
      uploadResult: null,
      isDragOver: false,
      uploadHistory: [],
      copySuccess: false,
    };
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.generatePreview(file);
      }
    },
    handleDrop(e) {
      this.isDragOver = false;
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        this.selectedFile = file;
        this.generatePreview(file);
      } else {
        this.$message.error("Vui lòng chọn file ảnh!");
      }
    },
    generatePreview(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    clearFile() {
      this.selectedFile = null;
      this.filePreview = null;
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";
      this.uploadResult = null;
    },
    async handleUpload() {
      if (!this.selectedFile) {
        this.$message.error("Vui lòng chọn ảnh!");
        return;
      }

      this.uploading = true;
      try {
        const res = await uploadImageMedia(this.selectedFile);
        
        if (res && res.responseCode === 200 && res.data && res.data.url) {
          const imageUrl = res.data.url.startsWith('http') 
            ? res.data.url 
            : (process.env.NUXT_ENV_FILE_API_URL || '').replace(/\/$/, '') + '/' + res.data.url.replace(/^\//, '');
          
          this.uploadResult = {
            success: true,
            imageUrl: imageUrl,
          };

          // Add to history
          this.uploadHistory.unshift({
            fileName: this.selectedFile.name,
            imageUrl: imageUrl,
            uploadedAt: new Date(),
          });

          // Clear file after successful upload
          setTimeout(() => {
            this.clearFile();
          }, 1500);
        } else {
          this.uploadResult = {
            success: false,
            error: res?.message || "Upload thất bại!",
          };
        }
      } catch (err) {
        this.uploadResult = {
          success: false,
          error: err.message || "Có lỗi khi upload ảnh!",
        };
      } finally {
        this.uploading = false;
      }
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.copySuccess = true;
        this.$message.success("Đã copy link!");
        setTimeout(() => {
          this.copySuccess = false;
        }, 2000);
      }).catch(() => {
        this.$message.error("Không thể copy!");
      });
    },
    formatFileSize(bytes) {
      if (!bytes) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    },
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleString("vi-VN");
    },
  },
};
</script>

<style scoped>
.image-upload-tool {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1e293b;
}

.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1200px) {
  .container {
    grid-template-columns: 1fr;
  }
}

/* Upload Section */
.upload-section {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upload-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.drop-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.drop-area:hover {
  border-color: #1890ff;
  background: #f0f5ff;
}

.drop-area.active {
  border-color: #1890ff;
  background: #e6f7ff;
  box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.1);
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.drop-text {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.file-input-hidden {
  display: none;
}

.file-info {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.info-row .label {
  font-weight: 500;
  color: #666;
}

.info-row .value {
  color: #333;
}

.preview-section {
  margin-top: 20px;
}

.preview-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.preview-img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.upload-btn,
.clear-btn {
  flex: 1;
}

/* Result Section */
.result-section {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.success-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.link-box {
  border: 1px solid #e0e0e0;
  padding: 16px;
  border-radius: 8px;
  background: #f9f9f9;
}

.link-box h4 {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #333;
}

.link-display {
  display: flex;
  gap: 8px;
}

.link-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  background: #fff;
  color: #333;
}

.link-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.copy-hint {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #52c41a;
  font-weight: 500;
}

.result-preview {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

.result-preview h4 {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #333;
}

.result-img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.error-content {
  padding: 16px;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  color: #ff4d4f;
  font-size: 14px;
}

/* History Section */
.history-section {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  grid-column: 1 / -1;
}

.history-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.history-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-name {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #999;
}
</style>
