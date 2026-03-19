<template>
  <a-modal
    v-model="visible"
    :title="`ðŸ“„ ${$t('errorDetail')}`"
    width="700px"
    centered
    :footer="null"
    @cancel="handleClose"
  >
    <!-- Loading -->
    <a-spin
      v-if="loading"
      class="flex justify-center py-6"
      :tip="$t('loadingData')"
    />

    <!-- Có dữ li�?u -->
    <div v-else-if="errorDetail" class="detail-wrapper">
      <!-- Thông tin chung -->
      <a-card size="small" bordered class="info-card">
        <a-descriptions
          bordered
          size="small"
          :column="2"
          :title="$t('generalInfo')"
          class="desc-section"
        >
          <a-descriptions-item :label="$t('userId')">
            {{ errorDetail.userId }}
          </a-descriptions-item>

          <a-descriptions-item :label="$t('userName')">
            {{ errorDetail.userName }}
          </a-descriptions-item>

          <a-descriptions-item :label="$t('displayName')">
            {{ errorDetail.displayName }}
          </a-descriptions-item>

          <a-descriptions-item :label="$t('errorCode')">
            <a-tag :color="errorDetail.errorCode === 0 ? 'green' : 'red'">
              {{ errorDetail.errorCode }}
            </a-tag>
          </a-descriptions-item>

          <a-descriptions-item :label="$t('totalAmount')">
            <a-statistic
              :value="errorDetail.totalAmount"
              :precision="0"
              value-style="{ color: '#3f8600' }"
              
            />
          </a-descriptions-item>

          <a-descriptions-item :label="$t('type')">
            {{ errorDetail.type }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- Mô tả và ghi chú -->
      <a-card size="small" bordered class="mt-4 desc-card">
        <!-- Description -->
        <h4 class="section-title">ðŸ“ {{ $t("description") }}</h4>
        <a-alert
          v-if="errorDetail.description"
          :message="errorDetail.description"
          type="info"
          show-icon
        />
        <a-empty v-else :description="$t('noDescription')" />

        <!-- Note -->
        <h4 class="section-title mt-4">ðŸ’¬ {{ $t("note") }}</h4>
        <a-alert
          v-if="errorDetail.note"
          :message="errorDetail.note"
          type="success"
          show-icon
        />
        <a-empty v-else :description="$t('noNote')" />

        <!-- Transaction ID -->
        <h4 class="section-title mt-4">ðŸ”— {{ $t("transactionId") }}</h4>
        <div class="code-block">
          <code>{{ errorDetail.transactionId }}</code>
        </div>
      </a-card>
    </div>

    <!-- Không có dữ li�?u -->
    <a-empty v-else :description="$t('noDataDetail')" class="py-6" />
  </a-modal>
</template>

<script>
import { getLogErrorDetail } from "../../../apis/logs";

export default {
  name: "LogsErrorDetailDialog",
  props: {
    visible: { type: Boolean, required: true },
    id: { type: String, default: null },
  },
  data() {
    return {
      loading: false,
      errorDetail: null,
    };
  },
  watch: {
    visible(newVal) {
      if (newVal && this.id) this.fetchDetail();
    },
  },
  methods: {
    fetchDetail() {
      this.loading = true;
      this.errorDetail = null;

      getLogErrorDetail(this.id)
        .then((res) => {
          if (res.responseCode === 1 && res.data) {
            this.errorDetail = res.data;
          } else {
            this.errorDetail = null;
            this.$message.warning(this.$t("noDataFound")); // thông báo không có dữ li�?u
          }
        })
        .catch((err) => {
          this.$message.error(this.$t("errorOccurred"));
        })
        .finally(() => {
          this.loading = false;
        });
    },

    handleClose() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.detail-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card,
.desc-card {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
}

.mt-4 {
  margin-top: 1rem;
}

.code-block {
  background: #f3f4f6;
  padding: 6px 10px;
  border-radius: 6px;
  font-family: monospace;
  color: #111827;
  border: 1px solid #e5e7eb;
}
</style>
