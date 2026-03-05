<template>
  <div class="file-page">
    <h2 class="title">{{ $t("listTitleFile") }}</h2>

    <!-- Filter -->
    <BoxsFilter @search="searchFiles" @reset="resetFilters">
      <template #fields>
        <div class="form-row">
          <div class="form-group">
            <label>{{ $t("name") }}:</label>
            <input
              v-model="filters.name"
              type="text"
              :placeholder="$t('name')"
              class="tiny-input"
            />
          </div>

          <div class="form-group">
            <label>{{ $t("folder") }}:</label>
            <input
              v-model="filters.folderName"
              type="text"
              :placeholder="$t('folder')"
              class="tiny-input"
            />
          </div>

          <div class="form-group">
            <label>{{ $t("dateRange") }}:</label>
            <a-range-picker
              v-model="filters.dateRange"
              :format="'YYYY-MM-DD'"
              :allowClear="false"
            />
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t("extension") }}:</label>
          <input
            v-model="filters.fileExtension"
            type="text"
            :placeholder="$t('extension')"
            class="tiny-input"
          />
        </div>
      </template>
    </BoxsFilter>

    <a-button type="primary" @click="showUpload = true" class="bt-upload">
      {{ $t("uploadButtonFile") }}
    </a-button>

    <UploadFile
      :visible="showUpload"
      @close="showUpload = false"
      @uploaded="fetchFiles"
    />

    <!-- Table -->
    <BoxTable
      :columns="columns"
      :data="files"
      :loading="loading"
      :page="page"
      :page-size="pageSize"
      :total="total"
      @page-change="changePage"
    >
      <template #name="{ record }">
        <a
          :href="record.fileUrl"
          target="_blank"
          class="text-blue-600 underline"
        >
          {{ record.name }}
        </a>
      </template>

      <template #action="{ record }">
        <a-button type="link" @click="openDetail(record)">
          {{ $t("viewDetail") }}
        </a-button>
      </template>
    </BoxTable>

    <FileDetail
      :visible="showDetail"
      :refId="selectedRefId"
      @close="showDetail = false"
    />
  </div>
</template>

<script>
import moment from "moment";
import BoxsFilter from "../../components/BoxFilter/index.vue";
import BoxTable from "../../components/BoxTable/index.vue";
import FileDetail from "../Files/components/FileDetail.vue";
import UploadFile from "../Files/components/UploadFile.vue";
import { GetListFile } from "../../apis/files";

export default {
  name: "FilePage",
  middleware: "auth",
  layout: "adminLayout",
  components: { BoxsFilter, BoxTable, FileDetail, UploadFile },

  data() {
    const end = moment();
    const start = moment().subtract(7, "days");
    return {
      files: [],
      loading: false,
      page: 1,
      pageSize: 10,
      total: 0,
      showDetail: false,
      selectedRefId: null,
      showUpload: false,
      filters: {
        name: "",
        folderName: "",
        fileExtension: "",
        dateRange: [start, end],
      },
    };
  },

  computed: {
    columns() {
      return [
        { key: "ord", label: this.$t("stt") },
        { key: "name", label: this.$t("name") },
        { key: "folderName", label: this.$t("folder") },
        { key: "fileExtension", label: this.$t("extension") },
        { key: "createdTime", label: this.$t("createdTime"), format: "date" },
        { label: this.$t("action"), key: "action", slot: "action" },
      ];
    },
  },

  methods: {
    fetchFiles() {
      this.loading = true;
      const [start, end] = this.filters.dateRange || [];
      const params = {
        StartDate: start ? start.toISOString() : null,
        EndDate: end ? end.toISOString() : null,
        currentPage: this.page,
        recordPerPage: this.pageSize,
        name: this.filters.name || undefined,
        folderName: this.filters.folderName || undefined,
        fileExtension: this.filters.fileExtension || undefined,
      };

      GetListFile(params)
        .then((res) => {
          const data = res?.data?.records;
          if (Array.isArray(data)) {
            this.files = data.map((r, i) => ({
              ord: (this.page - 1) * this.pageSize + i + 1,
              ...r,
            }));
            this.total = res.data.totalRecord || 0;
          } else {
            this.files = [];
            this.total = 0;
          }
        })
        .catch(() => {
          this.files = [];
          this.total = 0;
          this.$message.error(this.$t("fetchError"));
        })
        .finally(() => {
          this.loading = false;
        });
    },

    searchFiles() {
      this.page = 1;
      this.fetchFiles();
    },

    resetFilters() {
      const end = moment();
      const start = moment().subtract(7, "days");
      this.filters = {
        name: "",
        folderName: "",
        fileExtension: "",
        dateRange: [start, end],
      };
      this.page = 1;
      this.fetchFiles();
    },

    changePage(newPage) {
      this.page = newPage;
      this.fetchFiles();
    },

    openDetail(record) {
      this.selectedRefId = record.refId;
      this.showDetail = true;
    },
  },

  mounted() {
    this.fetchFiles();
  },
};
</script>


<style scoped>
.file-page {
  padding: 24px;
}
.title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}
.bt-upload {
  margin-bottom: 16px;
  font-weight: 600;
}
</style>
