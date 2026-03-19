<template>
  <div class="api-key-page">
    <div class="page-header">
      <h2 class="title">Quản lý API Key</h2>
    </div>

    <a-tabs v-model="activeTab" @change="onTabChange">
      <a-tab-pane key="keys" tab="Danh sách API Key">
        <div class="filter-bar">
          <a-input-search
            v-model="keyFilters.keyword"
            placeholder="Tìm theo API key..."
            style="width: 280px"
            allow-clear
            @search="searchKeys"
          />
          <a-select
            v-model="keyFilters.isActive"
            style="width: 180px"
            allow-clear
            placeholder="Trạng thái"
            @change="searchKeys"
          >
            <a-select-option :value="true">Đang active</a-select-option>
            <a-select-option :value="false">Đã tắt</a-select-option>
          </a-select>
        </div>

        <a-table
          :columns="keyColumns"
          :data-source="keyList"
          :loading="keyLoading"
          :pagination="keyPagination"
          row-key="id"
          @change="onKeyTableChange"
        >
          <template #apiKey="val">
            <span>{{ maskApiKey(val) }}</span>
          </template>

          <template #isActive="val, record">
            <a-switch
              :checked="!!val"
              checked-children="On"
              un-checked-children="Off"
              :loading="statusUpdatingId === record.id"
              @change="(checked) => changeApiKeyStatus(record, checked)"
            />
          </template>

          <template #date="val">
            {{ formatDate(val) }}
          </template>

          <template #action="record">
            <a-button type="link" @click="openApiKeyDetail(record)">
              <a-icon type="eye" /> Chi tiết
            </a-button>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="requests" tab="Yêu cầu cấp API Key">
        <div class="filter-bar">
          <a-input-search
            v-model="requestFilters.keyword"
            placeholder="Tìm theo tên/email..."
            style="width: 320px"
            allow-clear
            @search="searchRequests"
          />
        </div>

        <a-table
          :columns="requestColumns"
          :data-source="requestList"
          :loading="requestLoading"
          :pagination="requestPagination"
          row-key="id"
          @change="onRequestTableChange"
        >
          <template #requestStatus="val">
            <a-tag :color="requestStatusColor(val)">
              {{ requestStatusText(val) }}
            </a-tag>
          </template>

          <template #date="val">
            {{ formatDate(val) }}
          </template>

          <template #requestAction="record">
            <a-dropdown>
              <a class="ant-dropdown-link" @click.prevent>
                Hành Động <a-icon type="down" />
              </a>
              <a-menu slot="overlay">
                <a-menu-item @click="openRequestDetail(record)">
                  <a-icon type="eye" /> Chi tiết
                </a-menu-item>
                <a-menu-item @click="openApprove(record)">
                  <a-icon type="check" /> Duyệt
                </a-menu-item>
                <a-menu-item @click="openReject(record)">
                  <a-icon type="close" /> Từ chối
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <a-modal
      :visible="apiKeyDetailVisible"
      title="Chi tiết API Key"
      :footer="null"
      @cancel="apiKeyDetailVisible = false"
    >
      <a-spin :spinning="apiKeyDetailLoading">
        <div v-if="apiKeyDetail" class="detail-grid">
          <p><strong>ID:</strong> {{ apiKeyDetail.id ?? "-" }}</p>
          <p><strong>RequestId:</strong> {{ apiKeyDetail.requestId ?? "-" }}</p>
          <p><strong>FullName:</strong> {{ apiKeyDetail.fullName || "-" }}</p>
          <p><strong>Email:</strong> {{ apiKeyDetail.email || "-" }}</p>
          <p><strong>PhoneNumber:</strong> {{ apiKeyDetail.phoneNumber || "-" }}</p>
          <p>
            <strong>ApiKey:</strong>
            <span>{{ apiKeyDetail.apiKey || "-" }}</span>
            <a-button
              v-if="apiKeyDetail.apiKey"
              type="link"
              size="small"
              @click="copyText(apiKeyDetail.apiKey)"
            >
              Copy
            </a-button>
          </p>
          <p><strong>IsActive:</strong> {{ apiKeyDetail.isActive ? "On" : "Off" }}</p>
          <p><strong>ExpiredAt:</strong> {{ formatDate(apiKeyDetail.expiredAt) }}</p>
          <p><strong>SentEmailAt:</strong> {{ formatDate(apiKeyDetail.sentEmailAt) }}</p>
          <p><strong>LastUsedAt:</strong> {{ formatDate(apiKeyDetail.lastUsedAt) }}</p>
          <p><strong>CreatedAt:</strong> {{ formatDate(apiKeyDetail.createdAt) }}</p>
          <p><strong>UpdatedAt:</strong> {{ formatDate(apiKeyDetail.updatedAt) }}</p>
        </div>
      </a-spin>
    </a-modal>

    <a-modal
      :visible="requestDetailVisible"
      title="Chi tiết yêu cầu API Key"
      :footer="null"
      @cancel="requestDetailVisible = false"
    >
      <a-spin :spinning="requestDetailLoading">
        <div v-if="requestDetail" class="detail-grid">
          <p><strong>ID:</strong> {{ requestDetail.id ?? "-" }}</p>
          <p><strong>FullName:</strong> {{ requestDetail.fullName || "-" }}</p>
          <p><strong>Email:</strong> {{ requestDetail.email || "-" }}</p>
          <p><strong>PhoneNumber:</strong> {{ requestDetail.phoneNumber || "-" }}</p>
          <p><strong>Status:</strong> {{ requestStatusText(requestDetail.status) }}</p>
          <p><strong>Note:</strong> {{ requestDetail.note || "-" }}</p>
          <p><strong>CreatedAt:</strong> {{ formatDate(requestDetail.createdAt) }}</p>
          <p><strong>ApprovedBy:</strong> {{ requestDetail.approvedBy ?? "-" }}</p>
          <p><strong>ApprovedByName:</strong> {{ requestDetail.approvedByName || "-" }}</p>
        </div>
      </a-spin>
    </a-modal>

    <a-modal
      :visible="approveVisible"
      title="Duyệt yêu cầu API Key"
      ok-text="Duyệt"
      cancel-text="Hủy"
      :confirm-loading="approveLoading"
      @ok="submitApprove"
      @cancel="approveVisible = false"
    >
      <a-form-model layout="vertical">
        <a-form-model-item label="Expired At (tùy chọn)">
          <a-date-picker
            v-model="approveForm.expiredAt"
            show-time
            style="width: 100%"
            placeholder="Chọn thời gian hết hạn"
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal
      :visible="rejectVisible"
      title="Từ chối yêu cầu API Key"
      ok-text="Từ chối"
      cancel-text="Hủy"
      :confirm-loading="rejectLoading"
      @ok="submitReject"
      @cancel="rejectVisible = false"
    >
      <a-form-model layout="vertical">
        <a-form-model-item label="Lý do từ chối">
          <a-textarea
            v-model="rejectForm.reason"
            :rows="3"
            placeholder="Nhập lý do từ chối"
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import {
  getListApiKey,
  getListApiKeyRequest,
  getDetailApiKey,
  getDetailApiKeyRequest,
  updateApiKeyStatus,
  approveApiKeyRequest,
  rejectApiKeyRequest,
} from "../../apis/ai";
import { getAccountDetail } from "../../apis/account";

export default {
  name: "ApiKeyPage",
  layout: "adminLayout",
  middleware: "auth",
  data() {
    return {
      activeTab: "keys",

      keyLoading: false,
      keyList: [],
      keyFilters: {
        keyword: "",
        isActive: undefined,
      },
      keyPage: 1,
      keyPageSize: 10,
      keyTotal: 0,
      statusUpdatingId: null,

      requestLoading: false,
      requestList: [],
      requestFilters: {
        keyword: "",
      },
      requestPage: 1,
      requestPageSize: 10,
      requestTotal: 0,

      apiKeyDetailVisible: false,
      apiKeyDetailLoading: false,
      apiKeyDetail: null,

      requestDetailVisible: false,
      requestDetailLoading: false,
      requestDetail: null,

      approveVisible: false,
      approveLoading: false,
      approveTarget: null,
      approveForm: {
        expiredAt: null,
      },

      rejectVisible: false,
      rejectLoading: false,
      rejectTarget: null,
      rejectForm: {
        reason: "",
      },

      approverId: 0,
    };
  },
  computed: {
    keyColumns() {
      return [
        { title: "#", dataIndex: "ord", key: "ord", width: 55 },
        { title: "ID", dataIndex: "id", key: "id", width: 80 },
        { title: "RequestId", dataIndex: "requestId", key: "requestId", width: 100 },
        { title: "ApiKey", dataIndex: "apiKey", key: "apiKey", scopedSlots: { customRender: "apiKey" } },
        { title: "Active", dataIndex: "isActive", key: "isActive", scopedSlots: { customRender: "isActive" }, width: 100 },
        { title: "ExpiredAt", dataIndex: "expiredAt", key: "expiredAt", scopedSlots: { customRender: "date" }, width: 160 },
        { title: "LastUsedAt", dataIndex: "lastUsedAt", key: "lastUsedAt", scopedSlots: { customRender: "date" }, width: 160 },
        { title: "CreatedAt", dataIndex: "createdAt", key: "createdAt", scopedSlots: { customRender: "date" }, width: 160 },
        { title: "Hành Động", key: "action", scopedSlots: { customRender: "action" }, width: 110 },
      ];
    },
    keyPagination() {
      return {
        current: this.keyPage,
        pageSize: this.keyPageSize,
        total: this.keyTotal,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50"],
      };
    },
    requestColumns() {
      return [
        { title: "#", dataIndex: "ord", key: "ord", width: 55 },
        { title: "ID", dataIndex: "id", key: "id", width: 80 },
        { title: "FullName", dataIndex: "fullName", key: "fullName", width: 180 },
        { title: "Email", dataIndex: "email", key: "email", width: 210 },
        { title: "Phone", dataIndex: "phoneNumber", key: "phoneNumber", width: 140 },
        { title: "Status", dataIndex: "status", key: "status", scopedSlots: { customRender: "requestStatus" }, width: 120 },
        { title: "CreatedAt", dataIndex: "createdAt", key: "createdAt", scopedSlots: { customRender: "date" }, width: 160 },
        { title: "Hành Động", key: "requestAction", scopedSlots: { customRender: "requestAction" }, width: 140 },
      ];
    },
    requestPagination() {
      return {
        current: this.requestPage,
        pageSize: this.requestPageSize,
        total: this.requestTotal,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50"],
      };
    },
  },
  mounted() {
    this.resolveApproverId();
    this.fetchApiKeyList();
  },
  methods: {
    async resolveApproverId() {
      try {
        const res = await getAccountDetail();
        const data = res?.data || {};
        this.approverId =
          Number(data.id) ||
          Number(data.accountId) ||
          Number(data.userId) ||
          Number(data.customerId) ||
          0;
      } catch (error) {
        this.approverId = 0;
      }
    },
    formatDate(value) {
      if (!value) return "-";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      return d.toLocaleString("vi-VN");
    },
    maskApiKey(value) {
      if (!value) return "-";
      if (value.length <= 10) return value;
      return `${value.slice(0, 6)}...${value.slice(-4)}`;
    },
    requestStatusText(status) {
      const map = {
        0: "Chờ Duyệt",
        1: "Đã Duyệt",
        2: "Từ chối",
      };
      return map[Number(status)] || `Status ${status}`;
    },
    requestStatusColor(status) {
      const map = {
        0: "orange",
        1: "green",
        2: "red",
      };
      return map[Number(status)] || "default";
    },
    formatDateForRequest(value) {
      if (!value) return null;
      if (typeof value === "string") return value;
      if (typeof value.toDate === "function") return value.toDate().toISOString();
      if (typeof value.toISOString === "function") return value.toISOString();
      return null;
    },
    async copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.$message.success("Đã copy API key");
      } catch (error) {
        this.$message.error("Không th�f copy API key");
      }
    },

    onTabChange(tab) {
      if (tab === "keys" && this.keyList.length === 0) {
        this.fetchApiKeyList();
      }
      if (tab === "requests" && this.requestList.length === 0) {
        this.fetchRequestList();
      }
    },

    async fetchApiKeyList() {
      this.keyLoading = true;
      try {
        const params = {
          KeyWord: this.keyFilters.keyword || undefined,
          IsActive:
            this.keyFilters.isActive === true || this.keyFilters.isActive === false
              ? this.keyFilters.isActive
              : undefined,
          CurrentPage: this.keyPage,
          RecordPerPage: this.keyPageSize,
        };
        const res = await getListApiKey(params);
        const records = res?.data?.records || [];
        this.keyTotal = res?.data?.totalRecord || 0;
        this.keyList = records.map((item, index) => ({
          ...item,
          ord: (this.keyPage - 1) * this.keyPageSize + index + 1,
        }));
      } catch (error) {
        this.$message.error("Không th�f tải danh sách API key");
      } finally {
        this.keyLoading = false;
      }
    },
    searchKeys() {
      this.keyPage = 1;
      this.fetchApiKeyList();
    },
    onKeyTableChange(pagination) {
      const nextPage = pagination?.current || 1;
      const nextPageSize = pagination?.pageSize || this.keyPageSize;
      const changedPageSize = nextPageSize !== this.keyPageSize;

      this.keyPageSize = nextPageSize;
      this.keyPage = changedPageSize ? 1 : nextPage;
      this.fetchApiKeyList();
    },
    async changeApiKeyStatus(record, checked) {
      this.statusUpdatingId = record.id;
      try {
        await updateApiKeyStatus({
          id: record.id,
          isActive: checked,
        });
        this.$message.success("Cập nhật trạng thái API key thành công");
        record.isActive = checked;
      } catch (error) {
        this.$message.error("Cập nhật trạng thái API key thất bại");
      } finally {
        this.statusUpdatingId = null;
      }
    },
    async openApiKeyDetail(record) {
      this.apiKeyDetailVisible = true;
      this.apiKeyDetailLoading = true;
      try {
        const res = await getDetailApiKey({ id: record.id });
        this.apiKeyDetail = res?.data || { ...record };
      } catch (error) {
        this.apiKeyDetail = { ...record };
        this.$message.error("Không th�f tải chi tiết API key");
      } finally {
        this.apiKeyDetailLoading = false;
      }
    },

    async fetchRequestList() {
      this.requestLoading = true;
      try {
        const params = {
          KeyWord: this.requestFilters.keyword || undefined,
          CurrentPage: this.requestPage,
          RecordPerPage: this.requestPageSize,
        };
        const res = await getListApiKeyRequest(params);
        const records = res?.data?.records || [];
        this.requestTotal = res?.data?.totalRecord || 0;
        this.requestList = records.map((item, index) => ({
          ...item,
          ord: (this.requestPage - 1) * this.requestPageSize + index + 1,
        }));
      } catch (error) {
        this.$message.error("Không th�f tải danh sách yêu cầu API key");
      } finally {
        this.requestLoading = false;
      }
    },
    searchRequests() {
      this.requestPage = 1;
      this.fetchRequestList();
    },
    onRequestTableChange(pagination) {
      const nextPage = pagination?.current || 1;
      const nextPageSize = pagination?.pageSize || this.requestPageSize;
      const changedPageSize = nextPageSize !== this.requestPageSize;

      this.requestPageSize = nextPageSize;
      this.requestPage = changedPageSize ? 1 : nextPage;
      this.fetchRequestList();
    },
    async openRequestDetail(record) {
      this.requestDetailVisible = true;
      this.requestDetailLoading = true;
      try {
        const res = await getDetailApiKeyRequest({ id: record.id });
        this.requestDetail = res?.data || { ...record };
      } catch (error) {
        this.requestDetail = { ...record };
        this.$message.error("Không th�f tải chi tiết yêu cầu");
      } finally {
        this.requestDetailLoading = false;
      }
    },
    openApprove(record) {
      this.approveTarget = record;
      this.approveForm = { expiredAt: null };
      this.approveVisible = true;
    },
    async submitApprove() {
      if (!this.approveTarget) return;
      this.approveLoading = true;
      try {
        const body = {
          requestId: this.approveTarget.id,
          approvedBy: this.approverId,
          expiredAt: this.formatDateForRequest(this.approveForm.expiredAt),
        };
        await approveApiKeyRequest(body);
        this.$message.success("Duyệt yêu cầu thành công");
        this.approveVisible = false;
        this.fetchRequestList();
        if (this.activeTab === "keys") this.fetchApiKeyList();
      } catch (error) {
        this.$message.error("Duyệt yêu cầu thất bại");
      } finally {
        this.approveLoading = false;
      }
    },
    openReject(record) {
      this.rejectTarget = record;
      this.rejectForm = { reason: "" };
      this.rejectVisible = true;
    },
    async submitReject() {
      if (!this.rejectTarget) return;
      this.rejectLoading = true;
      try {
        const body = {
          requestId: this.rejectTarget.id,
          approvedBy: this.approverId,
          rejectReason: this.rejectForm.reason || "",
        };
        await rejectApiKeyRequest(body);
        this.$message.success("Từ chối yêu cầu thành công");
        this.rejectVisible = false;
        this.fetchRequestList();
      } catch (error) {
        this.$message.error("Từ chối yêu cầu thất bại");
      } finally {
        this.rejectLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.api-key-page {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.detail-grid p {
  margin-bottom: 8px;
}
</style>
