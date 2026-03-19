<template>
  <div class="news-page">
    <div class="news-header">
      <h2>�Y"� Quản lý Tin tức</h2>
      <a-button class="bt-add-new" type="primary" @click="openCreate">
        + Thêm tin tức
      </a-button>
    </div>

    <!-- Grid danh sách -->
    <div class="news-grid">
      <a-card
        v-for="item in newsList"
        :key="item.id"
        class="news-card"
        :hoverable="true"
        :body-style="{ padding: '0' }"
      >
        <!-- Ảnh -->
        <div class="card-thumb">
          <img
            :src="
              item.thumbnail ||
              'https://via.placeholder.com/400x200?text=No+Image'
            "
            alt="thumbnail"
          />
          <div class="card-actions">
            <a-tooltip title="Xem chi tiết">
              <a-button
                shape="circle"
                size="small"
                icon="eye"
                @click="preview(item)"
              />
            </a-tooltip>
            <a-tooltip title="Sửa">
              <a-button
                shape="circle"
                size="small"
                icon="edit"
                @click="editItem(item)"
              />
            </a-tooltip>
            <a-tooltip title="Xóa">
              <a-popconfirm
                title="Xóa tin này?"
                ok-text="Có"
                cancel-text="Không"
                @confirm="deleteItem(item)"
              >
                <a-button shape="circle" size="small" icon="delete" />
              </a-popconfirm>
            </a-tooltip>
          </div>
        </div>

        <!-- N�Ti dung -->
        <div class="card-content">
          <h3>{{ item.title }}</h3>
          <p class="desc">{{ item.description }}</p>
          <div class="footer">
            <span class="date">ðŸ•“ {{ item.createdAt }}</span>
          </div>
        </div>
      </a-card>
    </div>

    <!-- Modal Form -->
    <news-form-modal
      v-if="showForm"
      :visible="showForm"
      :item="editingItem"
      @close="closeForm"
      @saved="saveItem"
      @preview="previewDraft"
    />

    <!-- Modal Preview -->
    <news-preview-modal
      v-if="previewItem"
      :visible="!!previewItem"
      :item="previewItem"
      :isDraft="isDraftPreview"
      @close="closePreview"
    />
  </div>
</template>

<script>
import NewsFormModal from "./components/NewsFormModal.vue";
import NewsPreviewModal from "./components/NewsPreviewModal.vue";

export default {
  components: { NewsFormModal, NewsPreviewModal },
  layout: "adminLayout",
  data() {
    return {
      newsList: [
        {
          id: 1,
          title: "Ra mat game moi: Legends of Valor",
          description: "Game nhap vai the gioi mo voi do hoa 3D dep mat.",
          content:
            "<p>Legends of Valor la tua game nhap vai phieu luu voi cot truyen sau sac.</p><p>Ban phat hanh du kien vao <strong>15/11/2025</strong>.</p>",
          createdAt: "2025-10-29",
          thumbnail: "https://picsum.photos/seed/game7/600/360",
        },
        {
          id: 2,
          title: "Cap nhat su kien Halloween 2025",
          description: "Tham gia de nhan skin dac quyen va qua thuong.",
          content:
            "<p>Su kien Halloween nam nay mang den nhieu hoat dong hap dan.</p><p>Dang nhap moi ngay de nhan qua.</p>",
          createdAt: "2025-10-25",
          thumbnail: "https://picsum.photos/seed/halloween2025/600/360",
        },
      ],
      showForm: false,
      editingItem: null,
      previewItem: null,
      isDraftPreview: false,
    };
  },
  methods: {
    openCreate() {
      this.editingItem = null;
      this.showForm = true;
    },
    editItem(item) {
      this.editingItem = { ...item };
      this.showForm = true;
    },
    saveItem(item) {
      if (item.id) {
        const index = this.newsList.findIndex((n) => n.id === item.id);
        if (index !== -1) this.newsList.splice(index, 1, item);
      } else {
        item.id = Date.now();
        item.createdAt = new Date().toISOString().slice(0, 10);
        this.newsList.push(item);
      }
      this.closeForm();
    },
    deleteItem(item) {
      this.newsList = this.newsList.filter((n) => n.id !== item.id);
    },
    closeForm() {
      this.showForm = false;
    },
    preview(item) {
      this.previewItem = item;
      this.isDraftPreview = false;
    },
    previewDraft(draft) {
      this.previewItem = draft;
      this.isDraftPreview = true;
    },
    closePreview() {
      this.previewItem = null;
      this.isDraftPreview = false;
    },
  },
};
</script>

<style scoped>
.news-page {
  padding: 28px;
  background: #f9fafc;
  min-height: 100vh;
  font-family: "Inter", "Segoe UI", sans-serif;
}

.news-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.news-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #2f3640;
}

.bt-add-new {
  border-radius: 8px;
  font-weight: 500;
}

/* Grid */
.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-gap: 22px;
}

/* Card */
.news-card {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: all 0.25s ease;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.news-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

/* Ảnh */
.card-thumb {
  position: relative;
  height: 180px;
  overflow: hidden;
  border-bottom: 1px solid #f0f0f0;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.news-card:hover .card-thumb img {
  transform: scale(1.05);
}


.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.card-actions >button{
  display: flex;
  align-items: center;
  justify-content: center;
}
.news-card:hover .card-actions {
  opacity: 1;
}

/* N�Ti dung */
.card-content {
  padding: 16px;
}

.card-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
  line-height: 1.3;
}

.card-content .desc {
  font-size: 14px;
  color: #666;
  min-height: 40px;
  margin-bottom: 10px;
}

.card-content .footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content .date {
  font-size: 12px;
  color: #999;
}
</style>
