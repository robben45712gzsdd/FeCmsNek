<template>
  <a-modal
    :visible="visible"
    :footer="null"
    :width="800"
    centered
    :title="isDraft ? '📝 Xem trước bản nháp' : '📰 Xem trước tin tức'"
    @cancel="$emit('close')"
  >
    <div class="preview-wrapper">
      <!-- Tiêu đề -->
      <h1 class="title">{{ item.title }}</h1>
      <p class="date">
        {{ isDraft ? 'Bản nháp - chưa lưu' : 'Ngày đăng: ' + item.createdAt }}
      </p>

      <!-- Ảnh thumbnail -->
      <div class="thumb">
        <img
          :src="item.thumbnail || 'https://via.placeholder.com/800x400?text=No+Image'"
          alt="thumbnail"
        />
      </div>

      <!-- Mô tả -->
      <p class="description">{{ item.description }}</p>

      <!-- Nội dung chính -->
      <div class="content" v-html="item.content"></div>
    </div>
  </a-modal>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    item: { type: Object, required: true },
    isDraft: Boolean,
  },
};
</script>

<style scoped>
.preview-wrapper {
  font-family: "Inter", "Segoe UI", sans-serif;
  color: #333;
  padding: 12px 8px 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  text-align: center;
  margin-bottom: 8px;
}

.date {
  font-size: 13px;
  color: #999;
  text-align: center;
  margin-bottom: 20px;
}

.thumb {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.thumb img {
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Description */
.description {
  text-align: center;
  font-size: 15px;
  font-style: italic;
  color: #555;
  margin-bottom: 20px;
  padding: 0 10px;
}

/* Content */
.content {
  font-size: 15px;
  line-height: 1.7;
  color: #333;
}

.content p {
  margin-bottom: 14px;
}

.content ul {
  margin-left: 20px;
  list-style: disc;
}

.content a {
  color: #1890ff;
  text-decoration: none;
}

.content a:hover {
  text-decoration: underline;
}

/* Cuộn mượt */
.preview-wrapper::-webkit-scrollbar {
  width: 6px;
}
.preview-wrapper::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}
</style>
