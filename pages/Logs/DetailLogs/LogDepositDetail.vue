<template>
  <a-modal
    :visible="visible"
    :title="$t('transactionDetail')"
    width="700px"
    centered
    @cancel="closeDialog"
    :footer="null"
  >
    <div v-if="loading" class="loading-container">
      <a-spin size="large" :tip="$t('loadingData')" />
    </div>

    <div v-else-if="detail" class="detail-container">
      <a-descriptions
        bordered
        :column="2"
        size="middle"
        class="custom-descriptions"
      >
        <a-descriptions-item :label="$t('username')">
          <strong>{{ detail.userName }}</strong>
        </a-descriptions-item>

        <a-descriptions-item :label="$t('userId')">
          {{ detail.userId }}
        </a-descriptions-item>

        <a-descriptions-item :label="$t('displayName')">
          {{ detail.displayName }}
        </a-descriptions-item>

        <a-descriptions-item :label="$t('transactionId')">
          <a-tag color="blue">{{ detail.transactionId }}</a-tag>
        </a-descriptions-item>

        <a-descriptions-item :label="$t('amount')">
          <span
            :class="{
              negative: detail.amount < 0,
              positive: detail.amount > 0,
            }"
          >
            {{ formatAmount(detail.amount) }}
          </span>
        </a-descriptions-item>

        <a-descriptions-item :label="$t('status')">
          <a-tag :color="detail.status === 1 ? 'green' : 'red'">
            {{ detail.status === 1 ? $t("success") : $t("failed") }}
          </a-tag>
        </a-descriptions-item>

        <a-descriptions-item :label="$t('type')">
          <a-tag
            :color="
              detail.type === 2
                ? 'green'
                : detail.type === 3
                ? 'red'
                : 'geekblue'
            "
          >
            {{
              detail.type === 2
                ? $t("deposit")
                : detail.type === 3
                ? $t("withdraw")
                : detail.type
            }}
          </a-tag>
        </a-descriptions-item>

        <a-descriptions-item :label="$t('date')">
          {{ formatDate(detail.date) }}
        </a-descriptions-item>

        <a-descriptions-item :label="$t('description')" :span="2">
          {{ detail.description || "-" }}
        </a-descriptions-item>
      </a-descriptions>
    </div>

    <div v-else class="empty-container">
      <a-empty :description="$t('noData')" />
    </div>
  </a-modal>
</template>

<script>
import * as logsAPI from "../../../apis/logs";
import { formatAmount, formatDate } from "../../../utils/formatHelper";

export default {
  name: "LogDepositDetailDialog",
  props: {
    visible: { type: Boolean, default: false },
    id: { type: [String, Number], default: null },
  },
  data() {
    return {
      loading: false,
      detail: null,
    };
  },
  watch: {
    visible(val) {
      if (val && this.id) {
        this.fetchDetail();
      }
    },
  },
  methods: {
    fetchDetail() {
      this.loading = true;
      logsAPI
        .getLogDepositDetail(this.id)
        .then((res) => {
          if (res.responseCode === 1) {
            this.detail = res.data;
          } else {
            this.detail = null;
            this.$message.warn("API returned:", res.message);
          }
        })
        .catch((err) => {
          this.$message.error(this.$t("errorOccurred"));
          this.detail = null;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    closeDialog() {
      this.$emit("close");
    },
    formatAmount,
    formatDate,
  },
};
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 180px;
}

.detail-container {
  margin-top: 10px;
  padding: 10px;
  background: #fafcff;
  border-radius: 10px;
  border: 1px solid #e6edf3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.custom-descriptions {
  background: white;
  border-radius: 8px;
}

.positive {
  color: #16a34a;
  font-weight: 700;
  font-size: 1rem;
}

.negative {
  color: #dc2626;
  font-weight: 700;
  font-size: 1rem;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
</style>
