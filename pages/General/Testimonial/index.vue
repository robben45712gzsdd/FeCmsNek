<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2 class="title">Quản lý Testimonial</h2>
      <a-button type="primary" @click="openAdd">+ Thêm �'ánh giá</a-button>
    </div>

    <div class="filter-bar">
      <a-input-search
        v-model="keyword"
        placeholder="Tìm kiếm..."
        style="width: 280px"
        allow-clear
        @search="onSearch"
      />
      <a-select v-model="langCode" style="width: 130px" @change="onLangChange">
        <a-select-option value="vi">Tiếng Việt</a-select-option>
        <a-select-option value="us">English</a-select-option>
      </a-select>
    </div>

    <a-table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      :pagination="pagination"
      row-key="testimonialId"
      @change="onTableChange"
    >
      <template #content="text">
        <span class="ellipsis-cell">{{ text }}</span>
      </template>

      <template #status="val">
        <a-tag :color="val === 1 ? 'green' : 'default'">{{ val === 1 ? 'Hiển thị' : 'Ẩn' }}</a-tag>
      </template>

      <template #action="record">
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent>Hành Động <a-icon type="down" /></a>
          <a-menu slot="overlay">
            <a-menu-item @click="openEdit(record)"><a-icon type="edit" /> Chỉnh sửa</a-menu-item>
            <a-menu-item @click="confirmDelete(record)">
              <a-icon type="delete" style="color:#ff4d4f" />
              <span style="color:#ff4d4f"> Xóa</span>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </a-table>

    <TestimonialForm ref="testimonialForm" :language-code="langCode" @saved="fetchList" />
  </div>
</template>

<script>
import TestimonialForm from "./components/TestimonialForm.vue";
import { getTestimonial, getTestimonialDetail, deleteTestimonial } from "../../../apis/general";

export default {
  layout: "adminLayout",
  middleware: "auth",
  components: { TestimonialForm },
  data() {
    return {
      list: [],
      loading: false,
      keyword: "",
      langCode: "vi",
      page: 1,
      pageSize: 10,
      total: 0,
    };
  },
  computed: {
    columns() {
      return [
        { title: "#", dataIndex: "ord", key: "ord", width: 55 },
        { title: "Họ tên", dataIndex: "name", key: "name", width: 150 },
        { title: "Chức vụ / Công ty", dataIndex: "businessName", key: "businessName", width: 180 },
        { title: "Nội dung", dataIndex: "content", key: "content", scopedSlots: { customRender: "content" }, ellipsis: true },
        { title: "Trạng thái", dataIndex: "status", key: "status", scopedSlots: { customRender: "status" }, width: 110 },
        { title: "Hành Động", key: "action", scopedSlots: { customRender: "action" }, width: 130 },
      ];
    },
    pagination() {
      return { current: this.page, pageSize: this.pageSize, total: this.total, showSizeChanger: false };
    },
  },
  mounted() {
    this.fetchList();
  },
  methods: {
    async fetchList() {
      this.loading = true;
      try {
        const res = await getTestimonial(this.langCode, this.keyword || null, this.page, this.pageSize);
        if (res && res.data) {
          const records = res.data.records || [];
          this.total = res.data.totalRecord || 0;
          this.list = records.map((r, i) => ({ ...r, ord: (this.page - 1) * this.pageSize + i + 1 }));
        }
      } catch {
        this.$message.error("Không th�f tải danh sách testimonial!");
      } finally {
        this.loading = false;
      }
    },
    onSearch() {
      this.page = 1;
      this.fetchList();
    },
    onLangChange() {
      this.page = 1;
      this.fetchList();
    },
    onTableChange(pag) {
      this.page = pag.current;
      this.fetchList();
    },
    openAdd() {
      this.$refs.testimonialForm.openAdd();
    },
    async openEdit(record) {
      try {
        const res = await getTestimonialDetail(this.langCode, record.testimonialId);
        const data = res && res.data ? { ...res.data, testimonialId: record.testimonialId } : record;
        this.$refs.testimonialForm.openEdit(data);
      } catch {
        this.$refs.testimonialForm.openEdit(record);
      }
    },
    confirmDelete(record) {
      this.$confirm({
        title: "Xác nhận xóa",
        content: `Xóa �'ánh giá của "${record.name}"?`,
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            await deleteTestimonial(record.testimonialId);
            this.$message.success("Đã xóa!");
            this.fetchList();
          } catch {
            this.$message.error("Xóa thất bại!");
          }
        },
      });
    },
  },
};
</script>

<style scoped>
.page-wrap { padding: 24px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.title { font-size: 22px; font-weight: 600; color: #1e293b; margin: 0; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.ellipsis-cell { display: block; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
