<template>
  <div class="box-table-wrap">
    <h3 v-if="title" class="table-title">{{ title }}</h3>
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
.box-table-wrap {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  padding: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04);
  overflow: hidden;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  padding: 16px 20px 12px;
  margin: 0;
  border-bottom: 1px solid #f1f5f9;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.table-container::-webkit-scrollbar {
  height: 6px;
}
.table-container::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
.table-container::-webkit-scrollbar-track {
  background: transparent;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
  table-layout: auto;
  font-size: 14px;
}

.table thead th {
  text-align: left;
  background: #f8fafc;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 2;
}

.table tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  white-space: nowrap;
  vertical-align: middle;
  color: #334155;
  transition: background 0.15s ease;
}

.table tbody tr:hover > td {
  background: #f8faff;
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
  padding: 40px 0 !important;
  color: #94a3b8;
  font-size: 13px;
}

.pagination {
  padding: 14px 20px;
  text-align: right;
  border-top: 1px solid #f1f5f9;
}

@media (max-width: 1024px) {
  .table {
    min-width: 700px;
    font-size: 13px;
  }
}
</style>

