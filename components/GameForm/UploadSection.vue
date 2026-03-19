<template>
  <div class="upload-section">
    <div class="upload-box" :class="{ 'has-image': !!previewUrl }">
      <!-- Nếu chưa có ảnh -->
      <div
        v-if="!previewUrl"
        class="upload-placeholder"
        @click="$refs.fileInput.click()"
      >
        <a-icon type="cloud-upload" class="upload-icon" />
        <p class="upload-text">{{ $t("clickToUpload") }}</p>
        <small>({{ $t("acceptFormats") }})</small>
      </div>

      <!-- Nếu đã có ảnh -->
      <div v-else class="upload-preview">
        <img :src="previewUrl" class="upload-preview-img" />
        <div class="upload-overlay">
          <a-button
            type="primary"
            size="small"
            class="change-btn"
            @click.stop="$refs.fileInput.click()"
          >
            {{ $t("changeImage") }}
          </a-button>
        </div>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="onFileChange"
    />
  </div>
</template>

<script>
export default {
  data() {
    return { file: null, previewUrl: "" };
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.file = file;
        this.previewUrl = URL.createObjectURL(file);
        this.$emit("selected-file", { file, previewUrl: this.previewUrl });
      }
    },
  },
};
</script>

<style scoped>
.upload-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-box {
  position: relative;
  width: 340px;
  height: 180px;
  border: 2px dashed #ccc;
  border-radius: 14px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
}

.upload-box:hover {
  border-color: #409eff;
  background: #f5faff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
}

.upload-placeholder {
  text-align: center;
}

.upload-icon {
  font-size: 32px;
  color: #409eff;
  margin-bottom: 8px;
}

.upload-text {
  font-weight: 500;
  color: #666;
  margin: 0;
}

.upload-placeholder small {
  font-size: 12px;
  color: #aaa;
}

.upload-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.upload-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.upload-preview:hover .upload-overlay {
  opacity: 1;
}

.change-btn {
  background: #409eff;
  border: none;
  font-weight: 500;
  width: 120px;
  height: 32px;
  border-radius: 6px;
  transition: 0.25s;
}

.change-btn:hover {
  background: #66b1ff;
}
</style>
