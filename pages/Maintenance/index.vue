<template>
  <div class="provider-page">
    <h2 class="title">{{ $t("listTitle") }}</h2>

    <!-- Filter -->
    <LogsFilter @search="searchProviders" @reset="resetFilters">
      <template #fields>
        <div class="form-row">
          <div class="form-group">
            <label>{{ $t("providerId") }}:</label>
            <input
              v-model="filters.providerId"
              type="text"
              :placeholder="$t('providerId')"
              class="tiny-input"
            />
          </div>

          <div class="form-group">
            <label>{{ $t("status") }}:</label>
            <select v-model="filters.status" class="tiny-input">
              <option value="">{{ $t("all") }}</option>
              <option value="1">{{ $t("active") }}</option>
              <option value="0">{{ $t("inactive") }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t("providerName") }}:</label>
          <input
            v-model="filters.providerName"
            type="text"
            :placeholder="$t('providerName')"
            class="tiny-input"
          />
        </div>
      </template>
    </LogsFilter>

    <!-- Table -->
    <BoxTable
      :columns="columns"
      :data="providers"
      :loading="loading"
      :page="page"
      :page-size="pageSize"
      :total="total"
      @page-change="changePage"
    >
      <template #status="{ record }">
        <span
          :class="record.status === 1 ? 'status active' : 'status inactive'"
        >
          {{ record.status === 1 ? $t("active") : $t("inactive") }}
        </span>
      </template>

      <template #action="{ record }">
        <button
          class="toggle-btn"
          :class="record.status === 1 ? 'off' : 'on'"
          @click="openConfirmDialog(record)"
        >
          <span v-if="record.status === 1">{{ $t("turnOfStatust") }}</span>
          <span v-else>{{ $t("turnOnStatust") }}</span>
        </button>
      </template>
    </BoxTable>

    <!-- Modal xác nhận -->
    <a-modal
      v-model="confirmVisible"
      :title="$t('confirm')"
      centered
      @ok="confirmChangeStatus"
      @cancel="cancelDialog"
    >
      <p>{{ confirmMessage }}</p>
    </a-modal>
  </div>
</template>

<script>
import LogsFilter from "@/components/BoxFilter/index.vue";
import BoxTable from "@/components/BoxTable/index.vue";
import { getProviders } from "../../apis/dashboard";
import { UpdateStatusProvider } from "../../apis/maintain";

export default {
  name: "ProviderPage",
  layout: "adminLayout",
  middleware: "auth",
  components: { LogsFilter, BoxTable },

  data() {
    return {
      providers: [],
      loading: false,
      page: 1,
      pageSize: 10,
      total: 0,
      filters: {
        providerName: "",
        providerId: "",
        status: "",
      },
      confirmVisible: false,
      selectedRecord: null,
      confirmMessage: "",
    };
  },

  computed: {
    columns() {
      return [
        { key: "ord", label: "STT" },
        { key: "providerId", label: "providerId" },
        { key: "providerName", label: "providerName" },
        { key: "providerDomain", label: "providerDomain" },
        { key: "status", label: "status", slot: "status" },
        { key: "createdTime", label: "createdTime", format: "date" },
        { key: "action", label: "Thao tác", slot: "action" },
      ];
    },
  },

  methods: {
    fetchProviders() {
      this.loading = true;
      const params = {
        currentPage: this.page,
        recordPerPage: this.pageSize,
        providerName: this.filters.providerName || undefined,
        providerId: this.filters.providerId || undefined,
        status:
          this.filters.status !== "" ? Number(this.filters.status) : undefined,
      };

      getProviders(params)
        .then((res) => {
          const data = res?.data?.records;
          if (Array.isArray(data)) {
            this.providers = data.map((r, i) => ({
              ord: (this.page - 1) * this.pageSize + i + 1,
              ...r,
            }));
            this.total = res.data.totalRecord || 0;
          } else {
            this.providers = [];
            this.total = 0;
          }
        })
        .catch(() => {
          this.$message.error(this.$t("fetchError"));
        })
        .finally(() => {
          this.loading = false;
        });
    },

    searchProviders() {
      this.page = 1;
      this.fetchProviders();
    },

    resetFilters() {
      this.filters = { providerName: "", status: "", providerId: "" };
      this.page = 1;
      this.fetchProviders();
    },

    changePage(newPage) {
      this.page = newPage;
      this.fetchProviders();
    },

    openConfirmDialog(record) {
      this.selectedRecord = record;
      const newStatus = record.status === 1 ? 0 : 1;
      this.confirmMessage =
        newStatus === 1 ? this.$t("confirmEnable") : this.$t("confirmDisable");
      this.confirmVisible = true;
    },

    confirmChangeStatus() {
      if (!this.selectedRecord) return;
      const newStatus = this.selectedRecord.status === 1 ? 0 : 1;
      const body = {
        providerId: this.selectedRecord.providerId,
        status: newStatus,
      };

      this.loading = true;
      UpdateStatusProvider(body)
        .then(() => {
          this.$message.success(this.$t("updateSuccess"));
          this.fetchProviders();
        })
        .catch(() => {
          this.$message.error(this.$t("updateFail"));
        })
        .finally(() => {
          this.loading = false;
          this.confirmVisible = false;
        });
    },

    cancelDialog() {
      this.confirmVisible = false;
      this.selectedRecord = null;
    },
  },

  mounted() {
    this.fetchProviders();
  },
};
</script>

<style scoped>
.provider-page {
  padding: 1rem;
}

.title {
  margin-bottom: 1rem;
  font-weight: 700;
  font-size: 1.125rem;
}

.form-row {
  display: flex;
  gap: 2.75rem;
  align-items: flex-end;
  margin-bottom: 0.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  min-width: 160px;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}
.tiny-input,
.date-inputs input {
  height: 36px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d0d7dd;
  background: #fff;
  font-size: 0.95rem;
  width: 220px;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  text-align: center;
  width: 100px;
}
.status.active {
  background-color: #16a34a;
}
.status.inactive {
  background-color: #ef4444;
}

.toggle-btn {
  border: none;
  outline: none;
  width: 180px;
  border-radius: 6px;
  padding: 7px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: 0.25s;
}
.toggle-btn.on {
  border: 1px solid #16a34a;
  color: #16a34a;
}
.toggle-btn.on:hover {
  background: #16a34a;
  color: white;
}
.toggle-btn.off:hover {
  background: #dc2626;
  color: white;
}
.toggle-btn.off {
  border: 1px solid #dc2626;
  color: #dc2626;
}
.toggle-btn:hover {
  opacity: 0.85;
}
</style>
