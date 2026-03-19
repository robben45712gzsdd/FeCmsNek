<template>
  <div class="news-page">
    <div class="news-header">
      <h2>📰 Quản lý Tin tức</h2>
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

        <!-- Nội dung -->
        <div class="card-content">
          <h3>{{ item.title }}</h3>
          <p class="desc">{{ item.description }}</p>
          <div class="footer">
            <span class="date">🕓 {{ item.createdAt }}</span>
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
          title: "🎮 Ra mắt game mới: Legends of Valor",
          description: "Game nhập vai thế giới mở với nền đồ họa 3D cực đẹp.",
          content:
            "<p>Legends of Valor là tựa game nhập vai phiêu lưu với cốt truyện sâu sắc và thế giới mở rộng lớn. Người chơi có thể tự do khám phá, chiến đấu với quái vật và thu thập vật phẩm quý hiếm.</p><p>Bản phát hành chính thức dự kiến vào <strong>15/11/2025</strong>.</p>",
          createdAt: "2025-10-29",
          thumbnail: "https://picsum.photos/seed/game7/600/360",
        },
        {
          id: 2,
          title: "🕹️ Cập nhật sự kiện Halloween 2025",
          description: "Tham gia ngay để nhận skin độc quyền và quà khủng!",
          content:
            "<p>Sự kiện Halloween năm nay mang đến hàng loạt hoạt động hấp dẫn: săn bí ngô, chế tạo vật phẩm ma quái, và quà đăng nhập mỗi ngày.</p><p>Đừng bỏ lỡ cơ hội nhận skin <strong>Phù Thủy Bóng Đêm</strong> siêu hiếm!</p>",
          createdAt: "2025-10-25",
          thumbnail: "https://picsum.photos/seed/halloween2025/600/360",
        },
        {
          id: 3,
          title: "⚙️ Bản cập nhật 2.0: Tối ưu hiệu năng & thêm bản đồ mới",
          description:
            "Tốc độ tải nhanh hơn 40%, gameplay mượt mà hơn bao giờ hết.",
          content:
            "<p>Phiên bản 2.0 mang đến bản đồ <strong>Frozen Valley</strong>, chế độ PvP mới và hàng loạt cải tiến hiệu năng.</p><ul><li>Cải thiện FPS trung bình trên mọi thiết bị</li><li>Giảm thời gian load bản đồ xuống chỉ còn 3 giây</li><li>Thêm hệ thống vật phẩm năng lượng</li></ul>",
          createdAt: "2025-10-10",
          thumbnail: "https://picsum.photos/seed/update20/600/360",
        },
        {
          id: 4,
          title: "🏆 Giải đấu eSports mùa đông chính thức khởi tranh",
          description: "Tổng giải thưởng lên đến 200.000.000 VNĐ!",
          content:
            "<p>Giải đấu Winter Cup 2025 quy tụ 64 đội mạnh nhất toàn quốc. Trận chung kết sẽ được livestream trên kênh chính thức của game vào <strong>20/12/2025</strong>.</p><p>Đăng ký tại <a href='#'>wintercup.game.vn</a>.</p>",
          createdAt: "2025-09-25",
          thumbnail: "https://picsum.photos/seed/esport2025/600/360",
        },
        {
          id: 5,
          title: "💎 Sự kiện đặc biệt: Mừng 1 triệu người chơi!",
          description: "Đăng nhập 7 ngày liên tiếp để nhận quà cực hiếm.",
          content:
            "<p>Chúng tôi chân thành cảm ơn cộng đồng 1 triệu người chơi đã ủng hộ!</p><p>Từ <strong>01/11 - 07/11/2025</strong>, hãy đăng nhập mỗi ngày để nhận <strong>1000 kim cương</strong> và skin giới hạn.</p>",
          createdAt: "2025-10-31",
          thumbnail: "https://picsum.photos/seed/1millionplayers/600/360",
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

/* Nội dung */
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
