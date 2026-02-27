<template>
  <div>
    <!-- Ô tìm kiếm -->
    <a-input-search
      v-model="searchKeyword"
      :placeholder="$t('searchImage')"
      class="search-input"
    />

    <!-- Lưới ảnh -->
    <div class="image-grid">
      <div
        v-for="img in filteredImages"
        :key="img.id"
        class="image-item"
        :class="{ selected: selectedImage === img }"
        @click="selectedImage = img"
      >
        <img :src="img.url" class="image-thumb" />

        <!-- Overlay + icon phóng to -->
        <div class="overlay">
          <a-icon
            type="zoom-in"
            class="zoom-icon"
            @click.stop="previewImage(img)"
          />
        </div>

        <p class="image-name">{{ img.name }}</p>
      </div>
    </div>

    <!-- Phân trang -->
    <div class="pagination-wrapper">
      <a-pagination
        :current="currentPage"
        :pageSize="recordPerPage"
        :total="totalRecords"
        @change="handlePageChange"
      />
    </div>

    <!-- Modal xem ảnh to -->
    <a-modal
      :visible="previewVisible"
      @cancel="previewVisible = false"
      centered
      width="auto"
    >
      <template #footer>
        <a-button @click="previewVisible = false">{{
          $t("close") || "Đóng"
        }}</a-button>
      </template>

      <img
        :src="previewUrl"
        style="max-width: 100%; max-height: 80vh; display: block; margin: auto"
      />
    </a-modal>
  </div>
</template>

<script>
import { GetListFile } from "../../apis/files";

export default {
  data() {
    return {
      searchKeyword: "",
      images: [],
      selectedImage: null,
      currentPage: 1,
      recordPerPage: 12,
      totalRecords: 0,
      previewVisible: false,
      previewUrl: "",
    };
  },
  computed: {
    filteredImages() {
      if (!this.searchKeyword) return this.images;
      return this.images.filter((img) =>
        img.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    },
  },
  mounted() {
    this.fetchImages();
  },
  methods: {
    fetchImages() {
      const params = {
        currentPage: this.currentPage,
        recordPerPage: this.recordPerPage,
      };
      const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

      GetListFile(params)
        .then((res) => {
          this.images =
            res?.data?.records
              ?.filter((f) =>
                allowed.includes(f.fileExtension?.toLowerCase() || "")
              )
              .map((f) => ({
                id: f.id,
                refId: f.refId,
                name: f.name,
                url: f.fileUrl,
              })) || [];
          this.totalRecords = res?.data?.totalRecord || 0;
        })
        .catch((err) => {
          console.error("Lỗi tải ảnh:", err);
          this.$message.error(this.$t("loadImageError"));
        });
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchImages();
    },
    previewImage(img) {
      this.previewUrl = img.url;
      this.previewVisible = true;
    },
  },
  watch: {
    selectedImage(val) {
      if (val) this.$emit("selected-image", val);
    },
  },
};
</script>

<style scoped>
.search-input {
  margin-bottom: 16px;
  width: 60%;
  max-width: 400px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 10px;
  max-height: 65vh;
  overflow-y: auto;
}


.image-item {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
}
.image-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}
.image-item.selected {
  outline: 3px solid #1890ff;
}

.image-thumb {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}


.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.image-item:hover .overlay {
  opacity: 1;
}


.zoom-icon {
  font-size: 24px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
}
.zoom-icon:hover {
  transform: scale(1.2);
  color: #1890ff;
}


.image-name {
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  padding: 8px;
  color: #444;
  background: #fafafa;
  border-top: 1px solid #eee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination-wrapper {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
