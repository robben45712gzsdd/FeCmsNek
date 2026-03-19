<template>
  <div class="career-page">
    <!-- �.��.��.��.��.��.��.��.��.��.��.��.��.��.��.� VIEW 1: Danh sách vị trí �.��.��.��.��.��.��.��.��.��.��.��.��.��.��.� -->
    <template v-if="!activeJob">
      <div class="page-header">
        <div>
          <h2 class="title">Đơn ứng tuyển</h2>
          <p class="subtitle">Chọn vị trí tuyển dụng và xem danh sách ứng viên</p>
        </div>
        <a-select v-model="langCode" style="width:140px" @change="loadJobs">
          <a-select-option value="vi">Tiếng Việt</a-select-option>
          <a-select-option value="us">English</a-select-option>
        </a-select>
      </div>

      <!-- Search -->
      <div class="filter-bar">
        <a-input-search
          v-model="jobSearch"
          placeholder="Tìm vị trí tuyển dụng..."
          style="width:320px"
          allow-clear
        />
      </div>

      <!-- Loading -->
      <div v-if="loadingJobs" class="loading-center"><a-spin tip="Đang tải vị trí..." /></div>

      <!-- Empty -->
      <a-empty v-else-if="!filteredJobs.length" description="Không có vị trí nào" style="padding:60px 0" />

      <!-- Job cards grid -->
      <div v-else class="job-grid">
        <div
          v-for="job in filteredJobs"
          :key="job.jobId"
          class="job-card"
          @click="selectJob(job)"
        >
          <div class="job-card-top">
            <div class="job-logo-wrap">
              <img v-if="job.logoUrl" :src="toFullUrl(job.logoUrl)" class="job-logo" @error="(e) => e.target.style.display='none'" />
              <div v-else class="job-logo-placeholder">
                <a-icon type="apartment" />
              </div>
            </div>
            <div class="job-meta">
              <h3 class="job-title">{{ job.position }}</h3>
              <div class="job-tags">
                <span v-if="job.location" class="job-tag"><a-icon type="environment" /> {{ job.location }}</span>
                <span v-if="job.salary" class="job-tag"><a-icon type="dollar" /> {{ job.salary }}</span>
                <span v-if="job.YearOfExperience" class="job-tag"><a-icon type="clock-circle" /> {{ job.YearOfExperience }}</span>
              </div>
            </div>
          </div>
          <div class="job-card-bottom">
            <a-tag :color="job.status === 1 ? 'green' : 'default'" style="margin:0">
              {{ job.status === 1 ? 'Đang tuyển' : 'Tạm dừng' }}
            </a-tag>
            <span class="job-date">{{ job.date || '' }}</span>
            <a-button type="link" class="view-cv-btn">
              Xem ứng viên <a-icon type="right" />
            </a-button>
          </div>
        </div>
      </div>
    </template>

    <!-- �.��.��.��.��.��.��.��.��.��.��.��.��.��.��.� VIEW 2: Danh sách CV cho 1 vị trí �.��.��.��.��.��.��.��.��.��.��.��.��.��.��.� -->
    <template v-else>
      <div class="page-header">
        <div class="breadcrumb-header">
          <a class="back-link" @click="goBack">
            <a-icon type="arrow-left" /> Danh sách vị trí
          </a>
          <h2 class="title" style="margin-top:4px">{{ activeJob.position }}</h2>
          <div class="job-info-row">
            <span v-if="activeJob.location" class="job-info-item"><a-icon type="environment" /> {{ activeJob.location }}</span>
            <span v-if="activeJob.salary" class="job-info-item"><a-icon type="dollar" /> {{ activeJob.salary }}</span>
            <span v-if="activeJob.YearOfExperience" class="job-info-item"><a-icon type="clock-circle" /> {{ activeJob.YearOfExperience }}</span>
            <span class="job-info-item count-badge"><a-icon type="team" /> {{ total }} ứng viên</span>
          </div>
        </div>
      </div>

      <!-- Applicant filter -->
      <div class="filter-bar">
        <a-input-search
          v-model="keyword"
          placeholder="Tìm theo tên, email, SĐT..."
          style="width:300px"
          @search="() => { page = 1; fetchList(); }"
          allow-clear
        />
      </div>

      <!-- Applicant table -->
      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="pagination"
        row-key="applicantId"
        @change="onTableChange"
      >
        <template #fullName="text, record">
          <div class="applicant-name">
            <a-avatar :size="32" style="background:#e0e7ff;color:#6366f1;font-weight:700;flex-shrink:0">
              {{ (text || '?')[0].toUpperCase() }}
            </a-avatar>
            <div>
              <div class="name-text">{{ text }}</div>
              <div class="email-text">{{ record.email }}</div>
            </div>
          </div>
        </template>

        <template #cvUrl="text, record">
          <div v-if="text" class="cv-actions">
            <a-button size="small" type="primary" ghost @click="previewCv(record)">
              <a-icon type="eye" /> Xem CV
            </a-button>
            <a-tooltip title="Tải về">
              <a :href="toFullUrl(text)" target="_blank" download class="cv-download">
                <a-icon type="download" />
              </a>
            </a-tooltip>
          </div>
          <span v-else class="no-cv">Không có CV</span>
        </template>

        <template #phoneNumber="text">
          <span v-if="text" class="phone-text"><a-icon type="phone" style="margin-right:4px;color:#94a3b8" />{{ text }}</span>
          <span v-else class="no-cv">�?"</span>
        </template>

        <template #createdDate="text">
          <span class="date-text">{{ formatDate(text) }}</span>
        </template>

        <template #message="text, record">
          <div v-if="text" class="message-cell" @click="showMessage(record)">
            <span class="message-snippet">{{ text }}</span>
            <a class="message-more">Xem thêm</a>
          </div>
          <span v-else class="no-cv">�?"</span>
        </template>

        <template #action="record">
          <a-popconfirm
            title="Xóa �'ơn ứng tuyển này?"
            ok-text="Xóa"
            ok-type="danger"
            cancel-text="Hủy"
            @confirm="remove(record)"
          >
            <a-button type="link" style="color:#ff4d4f" size="small"><a-icon type="delete" /></a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </template>

    <!-- �.��.��.��.��.��.��.��.��.��.��.��.��.��.��.� CV Preview Modal �.��.��.��.��.��.��.��.��.��.��.��.��.��.��.� -->
    <a-modal
      :visible="!!cvPreview"
      :title="false"
      width="850px"
      :footer="null"
      :body-style="{ padding: '0', height: '85vh' }"
      @cancel="cvPreview = null"
    >
      <div v-if="cvPreview" class="cv-preview-container">
        <div class="cv-preview-header">
          <div class="cv-preview-info">
            <a-avatar :size="36" style="background:#e0e7ff;color:#6366f1;font-weight:700;flex-shrink:0">
              {{ (cvPreview.fullName || '?')[0].toUpperCase() }}
            </a-avatar>
            <div>
              <div class="cv-preview-name">{{ cvPreview.fullName }}</div>
              <div class="cv-preview-pos">{{ cvPreview.position || activeJob.position || '�?"' }}</div>
            </div>
          </div>
          <div class="cv-header-actions">
            <a :href="toFullUrl(cvPreview.cvUrl)" target="_blank" download>
              <a-button size="small" type="primary" ghost><a-icon type="download" /> Tải về</a-button>
            </a>
            <a-button size="small" @click="cvPreview = null"><a-icon type="close" /></a-button>
          </div>
        </div>
        <div class="cv-preview-body">
          <iframe
            v-if="isCvPdf(cvPreview.cvUrl)"
            :src="toFullUrl(cvPreview.cvUrl)"
            class="cv-iframe"
          />
          <div v-else-if="isCvImage(cvPreview.cvUrl)" class="cv-image-wrap">
            <img :src="toFullUrl(cvPreview.cvUrl)" class="cv-image" />
          </div>
          <div v-else class="cv-fallback">
            <a-icon type="file-unknown" style="font-size:56px;color:#c7d2fe;" />
            <p style="margin:12px 0 0;font-size:15px;">Không th�f xem trư�>c �'�<nh dạng này</p>
            <a :href="toFullUrl(cvPreview.cvUrl)" target="_blank">
              <a-button type="primary" style="margin-top:16px"><a-icon type="download" /> Tải về và xem</a-button>
            </a>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- �.��.��.��.��.��.��.��.��.��.��.��.��.��.��.� Message Detail Modal �.��.��.��.��.��.��.��.��.��.��.��.��.��.��.� -->
    <a-modal
      :visible="!!messageDetail"
      title="Giới thiệu bản thân"
      width="560px"
      :footer="null"
      @cancel="messageDetail = null"
    >
      <div v-if="messageDetail" class="msg-detail">
        <div class="msg-detail-header">
          <a-avatar :size="40" style="background:#e0e7ff;color:#6366f1;font-weight:700;flex-shrink:0">
            {{ (messageDetail.fullName || '?')[0].toUpperCase() }}
          </a-avatar>
          <div>
            <div class="msg-detail-name">{{ messageDetail.fullName }}</div>
            <div class="msg-detail-sub">{{ messageDetail.email }} · {{ messageDetail.phoneNumber || '�?"' }}</div>
          </div>
        </div>
        <div class="msg-detail-body">{{ messageDetail.message }}</div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { getListSendMailCareer, deleteMailCareer, getJobCms } from "../../../apis/interaction";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL;

export default {
  layout: "adminLayout",
  middleware: "auth",
  data() {
    return {
      /* �"?�"? View 1: Jobs �"?�"? */
      langCode: "vi",
      jobs: [],
      loadingJobs: false,
      jobSearch: "",
      /* �"?�"? View 2: Applicants �"?�"? */
      activeJob: null,
      list: [],
      loading: false,
      keyword: "",
      page: 1,
      pageSize: 10,
      total: 0,
      /* �"?�"? CV Preview �"?�"? */
      cvPreview: null,
      /* �"?�"? Message Detail �"?�"? */
      messageDetail: null,
    };
  },
  computed: {
    filteredJobs() {
      if (!this.jobSearch) return this.jobs;
      const q = this.jobSearch.toLowerCase();
      return this.jobs.filter(
        (j) =>
          (j.position || "").toLowerCase().includes(q) ||
          (j.location || "").toLowerCase().includes(q)
      );
    },
    columns() {
      return [
        { title: "#", dataIndex: "ord", key: "ord", width: 55, align: "center" },
        { title: "Ứng viên", dataIndex: "fullName", key: "fullName", scopedSlots: { customRender: "fullName" } },
        { title: "SĐT", dataIndex: "phoneNumber", key: "phoneNumber", scopedSlots: { customRender: "phoneNumber" }, width: 150 },
        { title: "Giới thiệu", dataIndex: "message", key: "message", scopedSlots: { customRender: "message" }, width: 220 },
        { title: "CV", dataIndex: "cvUrl", key: "cvUrl", scopedSlots: { customRender: "cvUrl" }, width: 140 },
        { title: "Ngày nộp", dataIndex: "createdDate", key: "createdDate", scopedSlots: { customRender: "createdDate" }, width: 110 },
        { title: "", key: "action", scopedSlots: { customRender: "action" }, width: 50 },
      ];
    },
    pagination() {
      return {
        current: this.page,
        pageSize: this.pageSize,
        total: this.total,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50"],
        showTotal: (t) => `T�.ng ${t} ứng viên`,
      };
    },
  },
  mounted() {
    this.loadJobs();
  },
  methods: {
    toFullUrl(url) {
      if (!url) return "";
      return /^https?:\/\//i.test(url) ? url : FILE_BASE.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
    },
    formatDate(dateStr) {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      return isNaN(d) ? dateStr : d.toLocaleDateString("vi-VN");
    },

    /* �"?�"? View 1 �"?�"? */
    async loadJobs() {
      this.loadingJobs = true;
      try {
        const res = await getJobCms({
          languageCode: this.langCode,
          currentPage: 1,
          recordPerPage: 200,
        });
        this.jobs = res && res.data ? res.data.records || [] : [];
      } catch {
        this.jobs = [];
        this.$message.error("Không th�f tải danh sách vị trí!");
      } finally {
        this.loadingJobs = false;
      }
    },

    selectJob(job) {
      this.activeJob = job;
      this.keyword = "";
      this.page = 1;
      this.fetchList();
    },

    goBack() {
      this.activeJob = null;
      this.list = [];
      this.total = 0;
    },

    /* �"?�"? View 2 �"?�"? */
    async fetchList() {
      this.loading = true;
      try {
        const params = {
          languageCode: this.langCode,
          keyWord: this.keyword || undefined,
          jobId: this.activeJob ? this.activeJob.jobId : undefined,
          currentPage: this.page,
          recordPerPage: this.pageSize,
        };
        const res = await getListSendMailCareer(params);
        if (res && res.data) {
          const records = res.data.records || [];
          this.list = records.map((r, i) => ({
            ...r,
            ord: (this.page - 1) * this.pageSize + i + 1,
          }));
          this.total = res.data.totalRecord || 0;
        } else {
          this.list = [];
          this.total = 0;
        }
      } catch {
        this.$message.error("Không th�f tải dữ li�?u!");
      } finally {
        this.loading = false;
      }
    },

    onTableChange(pag) {
      this.page = pag.current;
      if (pag.pageSize !== this.pageSize) {
        this.pageSize = pag.pageSize;
        this.page = 1;
      }
      this.fetchList();
    },

    async remove(record) {
      try {
        await deleteMailCareer(record.applicantId);
        this.$message.success("Đã xóa!");
        this.fetchList();
      } catch {
        this.$message.error("Xóa thất bại!");
      }
    },

    /* �"?�"? Message Detail �"?�"? */
    showMessage(record) {
      this.messageDetail = record;
    },

    /* �"?�"? CV Preview �"?�"? */
    previewCv(record) {
      this.cvPreview = record;
    },
    isCvPdf(url) {
      return /\.pdf$/i.test(url || "");
    },
    isCvImage(url) {
      return /\.(jpe?g|png|gif|webp|bmp)$/i.test(url || "");
    },
  },
};
</script>

<style scoped>
.career-page { padding: 24px; }

/* �"?�"? Header �"?�"? */
.page-header { margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
.title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
.subtitle { font-size: 13px; color: #94a3b8; margin: 4px 0 0; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }

.loading-center { display: flex; justify-content: center; padding: 80px 0; }

/* �"?�"? Job cards grid �"?�"? */
.job-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.job-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.job-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.job-card-top {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.job-logo-wrap {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.job-logo { width: 100%; height: 100%; object-fit: cover; }
.job-logo-placeholder { font-size: 22px; color: #94a3b8; }

.job-meta { flex: 1; min-width: 0; }
.job-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
  line-height: 1.3;
}
.job-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.job-tag {
  font-size: 12px;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  padding: 3px 10px;
  border-radius: 6px;
  white-space: nowrap;
}
.job-tag .anticon { margin-right: 3px; font-size: 11px; }

.job-card-bottom {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #f8fafc;
}
.job-date { font-size: 12px; color: #94a3b8; }
.view-cv-btn { margin-left: auto; font-weight: 600; padding: 0; }

/* �"?�"? Breadcrumb header (View 2) �"?�"? */
.breadcrumb-header { display: flex; flex-direction: column; }
.back-link {
  font-size: 13px;
  color: #6366f1;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}
.back-link:hover { color: #4f46e5; }
.job-info-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; }
.job-info-item {
  font-size: 13px;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.count-badge {
  background: linear-gradient(135deg, #eef2ff, #f5f3ff);
  color: #6366f1;
  font-weight: 600;
  padding: 2px 12px;
  border-radius: 8px;
  border: 1px solid #e0e7ff;
}

/* �"?�"? Applicant table custom cells �"?�"? */
.applicant-name {
  display: flex;
  align-items: center;
  gap: 10px;
}
.name-text { font-weight: 600; color: #1e293b; font-size: 13px; line-height: 1.3; }
.email-text { font-size: 12px; color: #94a3b8; }
.phone-text { font-size: 13px; color: #475569; }
.date-text { font-size: 12px; color: #94a3b8; }
.message-cell {
  cursor: pointer;
  transition: background 0.15s;
  border-radius: 6px;
  padding: 4px 6px;
  margin: -4px -6px;
}
.message-cell:hover { background: #f8fafc; }
.message-snippet {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #475569;
  font-size: 13px;
  line-height: 1.5;
}
.message-more {
  display: inline-block;
  font-size: 12px;
  color: #6366f1;
  font-weight: 600;
  margin-top: 2px;
}

.cv-actions { display: flex; gap: 6px; align-items: center; }
.cv-download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f0f4ff;
  color: #6366f1;
  transition: all 0.2s;
}
.cv-download:hover { background: #6366f1; color: #fff; }
.no-cv { color: #cbd5e1; font-size: 12px; }

/* �"?�"? CV Preview Modal �"?�"? */
.cv-preview-container { display: flex; flex-direction: column; height: 85vh; }
.cv-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}
.cv-preview-info { display: flex; align-items: center; gap: 12px; }
.cv-preview-name { font-weight: 700; font-size: 15px; color: #1e293b; }
.cv-preview-pos { font-size: 13px; color: #64748b; }
.cv-header-actions { display: flex; gap: 8px; }

.cv-preview-body { flex: 1; overflow: hidden; }
.cv-iframe { width: 100%; height: 100%; border: none; }
.cv-image-wrap { height: 100%; overflow: auto; text-align: center; padding: 16px; }
.cv-image { max-width: 100%; border-radius: 8px; }
.cv-fallback {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

/* �"?�"? Message Detail Modal �"?�"? */
.msg-detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 16px;
}
.msg-detail-name { font-weight: 700; font-size: 15px; color: #1e293b; }
.msg-detail-sub { font-size: 13px; color: #94a3b8; }
.msg-detail-body {
  font-size: 14px;
  color: #334155;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .job-grid { grid-template-columns: 1fr; }
}
</style>
