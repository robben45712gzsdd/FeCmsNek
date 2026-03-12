<template>
  <a-modal
    :visible="visible"
    :title="$t('titleGame')"
    :footer="null"
    :width="700"
    centered
    @cancel="$emit('close')"
  >
    <div v-if="loading" class="loading">
      <a-spin /> {{ $t("common.loading") }}
    </div>

    <div v-else-if="hasData" class="game-detail">
      <div class="header">
        <img
          v-if="detail.image"
          :src="detail.image"
          alt="Ảnh game"
          class="image"
        />
        <div class="info">
          <h2 class="name">{{ detail.gameName }}</h2>
          <a-tag :color="detail.status ? 'green' : 'red'" class="status-detail">
            {{ detail.status ? $t("common.active") : $t("common.inactive") }}
          </a-tag>
          <p class="id">ID {{ detail.gameId }}</p>
        </div>
      </div>

      <div class="divider" />
      <section class="section">
        <h3 class="section-title">{{ $t("generalInfo") }}</h3>
        <div class="rows-container">
          <div class="rows">
            <div class="row">
              <span class="label">{{ $t("partnerGameId") }}:</span>
              <span class="value">{{
                detail.partnerGameId || $t("common.noData")
              }}</span>
            </div>
          </div>
          <div class="rows">
            <div class="row">
              <span class="label">{{ $t("partnerGameType") }}:</span>
              <span class="value">{{
                detail.partnerGameType || $t("common.noData")
              }}</span>
            </div>
            <div class="row">
              <span class="label">{{ $t("partnerTableId") }}:</span>
              <span class="value">{{
                detail.partnerTableId || $t("common.noData")
              }}</span>
            </div>
            <div class="row">
              <span class="label">{{ $t("partnerType") }}:</span>
              <span class="value">{{
                detail.partnerType || $t("common.noData")
              }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- LIÊN KẾT -->
      <section class="section">
        <h3 class="section-title">{{ $t("links") }}</h3>
        <div class="rows">
          <div class="row">
            <span class="label">URL:</span>
            <span class="value">
              <a v-if="detail.url" :href="detail.url" target="_blank">{{
                detail.url
              }}</a>
              <span v-else>{{ $t("common.noData") }}</span>
            </span>
          </div>
          <div class="row">
            <span class="label">URL Client:</span>
            <span class="value">
              <a
                v-if="detail.urlClient"
                :href="detail.urlClient"
                target="_blank"
                >{{ detail.urlClient }}</a
              >
              <span v-else>{{ $t("common.noData") }}</span>
            </span>
          </div>
        </div>
      </section>

      <!-- THỜI GIAN -->
      <section class="section">
        <h3 class="section-title">{{ $t("timeInfo") }}</h3>
        <div class="rows">
          <div class="row">
            <span class="label">{{ $t("createdTime") }}:</span>
            <span class="value">{{ formatDate(detail.createdTime) }}</span>
          </div>
          <div class="row">
            <span class="label">{{ $t("updatedTime") }}:</span>
            <span class="value">{{ formatDate(detail.updatedTime) }}</span>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="no-data">
      <a-empty :description="$t('common.noData')" />
    </div>
  </a-modal>
</template>

<script>
import { getPartnerType } from "../../../apis/games";

export default {
  name: "GameDetail",
  props: {
    visible: { type: Boolean, default: false },
    detail: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  data() {
    return {

      
    };
  },
  computed: {
    hasData() {
      return this.detail && Object.keys(this.detail).length > 0;
    },

  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return this.$t("common.noData");
      return new Date(dateStr).toLocaleString("vi-VN");
    },


  },
  mounted() {
    if (this.visible) {

    }
  },
  
};
</script>


<style scoped>
.game-detail {
  padding: 10px 10px 20px;
}
.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
}
.image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.name {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: #1f1f1f;
}
.id {
  color: #888;
  font-size: 13px;
  margin-top: 2px;
}
.section {
  margin-top: 15px;
}
.section-title {
  font-weight: 600;
  font-size: 15px;
  color: #1677ff;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.rows-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}
.rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.status-detail {
  font-size: 12px;
  text-align: center;
  padding: 2px 6px;
  width: 90px;
}
.row {
  display: flex;
  justify-content: space-between;
  background: #fafafa;
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid #f0f0f0;
}
.label {
  color: #555;
  font-weight: 500;
}
.value {
  color: #1f1f1f;
  font-weight: 500;
  text-align: right;
  max-width: 65%;
  word-break: break-word;
}
.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 10px 0 5px;
}
.loading {
  text-align: center;
  padding: 30px;
  color: #888;
}
.no-data {
  text-align: center;
  padding: 40px 0;
}
</style>
