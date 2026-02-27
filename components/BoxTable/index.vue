<template>
  <div class="logs-table card">
    <h3 v-if="title">{{ title }}</h3>
    <div class="table-container">
      <a-spin :spinning="loading" :tip="$t('loadingData')">
        <table class="table">
          <thead>
            <tr>
              <th v-for="(col, i) in columns" :key="i">
                {{ $t(col.label) }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!data || data.length === 0">
              <td :colspan="columns.length" class="empty">
                {{ $t("noRecords") }}
              </td>
            </tr>

            <tr v-for="(row, rIdx) in data" :key="rIdx">
              <td
                v-for="(col, cIdx) in columns"
                :key="cIdx"
                :class="getClass(col, row)"
              >
                <slot
                  v-if="col.slot"
                  :name="col.slot"
                  :record="row"
                  :column="col"
                />
                <span v-else-if="col.format === 'amount'">
                  {{ formatAmount(row[col.key]) }}
                </span>
                <span v-else-if="col.format === 'date'">
                  {{ formatDate(row[col.key],$i18n.locale) }}
                </span>
                <span v-else>
                  <template v-if="col.key === 'actionType'">
                    {{ row.actionType === 1 ? $t("deposit") : $t("withdraw") }}
                  </template>
                  
                  <template v-else>
                    {{ row[col.key] }}
                  </template>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </a-spin>
    </div>

    <div class="pagination">
      <a-pagination
        :current="page"
        :page-size="pageSize"
        :total="total"
        @change="$emit('page-change', $event)"
        :show-size-changer="false"
      />
    </div>
  </div>
</template>

<script>
import { formatAmount, formatDate } from "../../utils/formatHelper";

export default {
  name: "BoxTable",
  props: {
    title: String,
    columns: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
    loading: Boolean,
    page: Number,
    pageSize: Number,
    total: Number,
  },
  methods: {
    formatAmount,
    formatDate,
    getClass(col, row) {
      if (col.classFn) return col.classFn(row[col.key]);
      return col.class || "";
    },
  },
};
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5eaf0;
  padding: 1rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: #fafafa;
  padding-bottom: 4px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.table-container::-webkit-scrollbar {
  height: 8px;
}
.table-container::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
.table-container::-webkit-scrollbar-track {
  background: #f8fafc;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
  table-layout: auto;
  font-size: 0.9rem;
}

.table thead th {
  text-align: center;
  background: linear-gradient(180deg, #f9fafb, #f1f5f9);
  padding: 10px 12px;
  border-bottom: 2px solid #e2e8f0;
  color: #334155;
  font-weight: 700;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 2;
}

.table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  transition: background 0.15s ease;
}

.table tbody tr:nth-child(odd) {
  background-color: #f9fbfd;
}
.table tbody tr:nth-child(even) {
  background-color: #ffffff;
}
.table tbody tr:hover {
  background-color: #e2e8f0;
}

.positive {
  color: #10b981;
  font-weight: 600;
}
.negative {
  color: #ef4444;
  font-weight: 600;
}

.empty {
  text-align: center;
  padding: 28px;
  color: #6b7280;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}

@media (max-width: 1024px) {
  .table {
    min-width: 900px;
    font-size: 0.85rem;
  }
}
@media (max-width: 768px) {
  .table {
    min-width: 700px;
    font-size: 0.8rem;
  }
}
</style>

