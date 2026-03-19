<template>
  <a-modal
    :visible="visible"
    width="760px"
    centered
    @cancel="close"
    :footer="null"
    class="log-detail-modern"
  >
    <template #title>
      <div class="modal-header">
        <div class="icon-circle">🎮</div>
        <div>
          <h3 class="title">{{ $t("logDetail.title") }}</h3>
          <p class="subtitle">{{ $t("logDetail.subtitle") }}</p>
        </div>
      </div>
    </template>

    <a-spin :spinning="loading">
      <template v-if="data">
        <div class="detail-section">
          <!-- Player info -->
          <div class="info-card">
            <h4>👤 {{ $t("logDetail.playerInfo") }}</h4>
            <div class="info-grid">
              <div><strong>{{ $t("logDetail.userName") }}:</strong> {{ data.userName }}</div>
              <div><strong>{{ $t("logDetail.displayName") }}:</strong> {{ data.displayName }}</div>
              <div><strong>{{ $t("logDetail.userId") }}:</strong> {{ data.userId }}</div>
              <div><strong>{{ $t("logDetail.gameHistoryId") }}:</strong> {{ data.gameHistoryId }}</div>
            </div>
          </div>

          <!-- Game info -->
          <div class="info-card">
            <h4>🎲 {{ $t("logDetail.gameInfo") }}</h4>
            <div class="info-grid">
              <div><strong>{{ $t("logDetail.date") }}:</strong> {{ formatDate(data.date) }}</div>
              <div>
                <strong>{{ $t("logDetail.status") }}:</strong>
                <a-tag :color="data.status === 1 ? 'green' : 'red'">
                  {{ data.description }}
                </a-tag>
              </div>
              <div>
                <strong>{{ $t("logDetail.type") }}:</strong>
                <a-tag color="blue">{{ data.type }}</a-tag>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-icon bg-green">💰</div>
              <div class="stat-info">
                <p class="label">{{ $t("logDetail.totalWinLost") }}</p>
                <p
                  class="value"
                  :class="data.totalPlayWinLost >= 0 ? 'text-green' : 'text-red'"
                >
                  {{ data.totalPlayWinLost.toFixed(2) }} USDT
                </p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon bg-blue">💵</div>
              <div class="stat-info">
                <p class="label">{{ $t("logDetail.totalAmount") }}</p>
                <p class="value text-blue">
                  {{ data.totalAmount.toFixed(2) }} USDT
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <a-empty :description="$t('logDetail.noData')" />
      </template>
    </a-spin>
  </a-modal>
</template>

<script>
import { getLogPlayBoardDetail } from "../../../apis/logs";
export default {
  name: "LogPlayBoardDetailDialog",
  props: {
    visible: Boolean,
    gameHistoryId: Number,
  },
  data() {
    return {
      data: null,
      loading: false,
    };
  },
  watch: {
    visible(val) {
      if (val && this.gameHistoryId) {
        this.fetchData();
      }
    },
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const res = await getLogPlayBoardDetail(this.gameHistoryId);
        this.data = res.data;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      const d = new Date(date);
      return d.toLocaleString("vi-VN", { hour12: false });
    },
    close() {
      this.$emit("close");
      this.data = null;
    },
  },
};
</script>

<style scoped>
.log-detail-modern >>> .ant-modal-body {
  background: #f9fafb;
  padding: 28px 24px;
  border-radius: 12px;
}
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.icon-circle {
  width: 42px;
  height: 42px;
  background: #2563eb22;
  color: #2563eb;
  border-radius: 50%;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
}
.subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}
.info-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 20px;
  margin-top: 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}
.info-card h4 {
  margin-bottom: 12px;
  color: #2563eb;
  font-size: 1rem;
  font-weight: 600;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  font-size: 0.95rem;
  color: #374151;
}
.stats-section {
  display: flex;
  gap: 20px;
  margin-top: 24px;
}
.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
}
.bg-green {
  background: #10b981;
}
.bg-blue {
  background: #2563eb;
}
.stat-info .label {
  font-size: 0.9rem;
  color: #6b7280;
}
.stat-info .value {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}
.text-green {
  color: #10b981;
}
.text-red {
  color: #ef4444;
}
.text-blue {
  color: #2563eb;
}
</style>
