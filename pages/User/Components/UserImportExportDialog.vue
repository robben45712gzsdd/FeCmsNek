<template>
  <a-modal
    :visible="value"
    :title="$t('accountBalanceDialog.title')"
    :footer="null"
    centered
    width="900px"
    @cancel="close"
  >
    <div class="dialog-content">
      <div
        v-if="!importedData.length && !importResult.length"
        class="step step-upload"
      >
        <a-icon type="cloud-upload" class="upload-icon" />
        <p class="intro-text">{{ $t("accountBalanceDialog.description") }}</p>

        <div class="button-group">
          <a-button type="default" icon="plus" size="large" class="action-btn">
            <label for="importFile" class="import-label">
              {{ $t("accountBalanceDialog.importFile") }}
            </label>
            <input
              id="importFile"
              type="file"
              accept=".xlsx,.xls"
              @change="handleFileUpload"
              style="display: none"
            />
          </a-button>
          <a-button
            type="primary"
            icon="download"
            size="large"
            class="action-btn"
            @click="downloadTemplate"
          >
            {{ $t("accountBalanceDialog.downloadTemplate") }}
          </a-button>
        </div>
      </div>
      <div
        v-else-if="importedData.length && !importResult.length"
        class="step step-preview"
      >
        <div class="table-header">
          <p class="table-heade-title">
            {{ $t("accountBalanceDialog.importedDataTitle") }}
          </p>
        </div>

        <a-table
          :data-source="importedData"
          :columns="columns"
          :rowKey="(record, index) => record.UserID || index"
          bordered
          size="middle"
          :pagination="{ pageSize: 5 }"
          class="import-table"
        />

        <div class="button-group mt-4">
          <a-button
            type="primary"
            size="large"
            class="confirm-btn"
            :loading="loading"
            @click="confirmImport"
          >
            {{ $t("accountBalanceDialog.confirm") }}
          </a-button>
          <a-button
            size="large"
            class="reset-btn"
            icon="redo"
            @click="resetImport"
          >
            {{ $t("accountBalanceDialog.chooseAnother") }}
          </a-button>
        </div>
      </div>

      <div v-else class="step step-result">
        <div class="table-header">
          <p class="table-heade-title">{{ $t("importedDataTitleConfirm") }}</p>
        </div>
        <a-table
          :data-source="importResult"
          :columns="resultColumns"
          :rowKey="(record, index) => index"
          bordered
          size="middle"
          :pagination="{ pageSize: 4 }"
          class="import-table"
        >
        </a-table>
      </div></div
  ></a-modal>
</template>


     

<script>
import * as XLSX from "xlsx";
import *as usersAPI from "../../../apis/users";
import{STATUS_CODE} from "../../../constants/statusCode"

export default {
  name: "UserImportExportDialog",
  props: {
    value: { type: Boolean, default: false },
  },
  data() {
    return {
      importedData: [],
      importResult: [],
      loading: false,
      columns: [
        {
          title: this.$t("accountBalanceDialog.columns.ord"),
          dataIndex: "ORD",
        },
        {
          title: this.$t("accountBalanceDialog.columns.displayName"),
          dataIndex: "DisplayName",
        },
        {
          title: this.$t("accountBalanceDialog.columns.userId"),
          dataIndex: "UserID",
        },
        {
          title: this.$t("accountBalanceDialog.columns.userName"),
          dataIndex: "UserName",
        },
        {
          title: this.$t("accountBalanceDialog.columns.type"),
          dataIndex: "Type",
        },
        {
          title: this.$t("accountBalanceDialog.columns.totalAmount"),
          dataIndex: "TotalAmount",
        },
        {
          title: this.$t("accountBalanceDialog.columns.description"),
          dataIndex: "Description",
        },
      ],
      resultColumns: [
        {
          title: this.$t("accountBalanceDialog.columns.ord"),
          key: "index",
          customRender: (text, record, index) => index + 1,
        },
        {
          title: this.$t("accountBalanceDialog.columns.displayName"),
          dataIndex: "displayName",
        },
        {
          title: this.$t("accountBalanceDialog.columns.userId"),
          dataIndex: "userID",
        },
        {
          title: this.$t("accountBalanceDialog.columns.userName"),
          dataIndex: "userName",
        },
        {
          title: this.$t("accountBalanceDialog.columns.type"),
          dataIndex: "type",
        },
        {
          title: this.$t("accountBalanceDialog.columns.totalAmount"),
          dataIndex: "totalAmount",
        },
        {
          title: this.$t("accountBalanceDialog.columns.description"),
          dataIndex: "description",
        },
        {
          title: this.$t("accountBalanceDialog.columns.status"),
          key: "status",
          customRender: (text, record, index) => {
            const isSuccess = record && record.status === 1;
            const className = isSuccess ? "status-success" : "status-fail";
            const textStatus = isSuccess
              ? this.$t("accountBalanceDialog.status.success")
              : this.$t("accountBalanceDialog.status.fail");

            return <span class={className}>{textStatus}</span>;
          },
        },
        {
          title: this.$t("accountBalanceDialog.columns.message"),
          dataIndex: "message",
        },
        {
          title: this.$t("action"),
          key: "action",
          customRender: (text, record, index) => {
            if (!record) return null; // tránh lỗi render lần đầu
            if (record.status !== STATUS_CODE.ERR_SYSTEM) return null;

            return (
              <a-button
                type="link"
                loading={record.retrying}
                onClick={() => this.retryImport(record, index)}
              >
                { this.$t("retry") }
              </a-button>
            );
          },
        },
      ],
    };
  },
  methods: {
    close() {
      this.$emit("input", false);
      this.importedData = [];
      this.importResult = [];
    },
    downloadTemplate() {
      const link = document.createElement("a");
      link.href = "/formAccountBalance.xlsx";
      link.download = "formAccountBalance.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.$message.success(this.$t("accountBalanceDialog.downloadSuccess"));
    },
    handleFileUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        this.importedData = json;
        this.$message.success(this.$t("accountBalanceDialog.importSuccess"));
      };
      reader.readAsArrayBuffer(file);
    },
    async confirmImport() {
      if (!this.importedData.length) {
        this.$message.warning(this.$t("noDataToSave"));
        return;
      }
      this.loading = true;
        const data = this.importedData.map((item) => ({
          displayName: item.DisplayName || "",
          userID: Number(item.UserID) || 0,
          userName: item.UserName || "",
          type: item.Type === "Deposit" ? 2 : 3,
          totalAmount: Number(item.TotalAmount) || 0,
          description: item.Description || "",
        }));
        const payload = {
          paymentReference: "import_balance_excel",
          note: "Import từ file Excel",
          data,
        };
        usersAPI.updateBalanceResult(payload)
        .then((res) => {
          if (res?.responseCode === 1) {
            this.$message.success(this.$t("accountBalanceDialog.confirmSuccess"));
            this.importResult = res.data.result || [];
          } else {
            this.$message.error(
              res?.message || this.$t("accountBalanceDialog.confirmFailed")
            );
          }
        })
        .catch((error) => {
          console.error("�O Import lỗi:", error);
          this.$message.error(this.$t("accountBalanceDialog.confirmFailed"));
        })
        .finally(() => {
          this.loading = false;
        });
    },
    retryImport(record, index) {
      const payload = {
        transId: record.transId,
        displayName: record.displayName,
        userID: record.userID,
        userName: record.userName,
        type: record.type,
        totalAmount: record.totalAmount,
        description: record.description,
      };

      usersAPI.retryUpdateBalance(payload)
        .then((res) => {
          if (res?.responseCode === 1) {
            this.$message.success("Retry thành công!");
            this.$set(this.importResult, index, {
              ...res.data,
              retrying: false,
            });
          } else {
            this.$message.error(res?.message || "Retry thất bại!");
            this.$set(this.importResult[index], "retrying", false);
          }
        })
        .catch((err) => {
          console.error("�O Retry lỗi:", err);
          this.$message.error("Retry thất bại!");
          this.$set(this.importResult[index], "retrying", false);
        });
    },
    resetImport() {
      this.importedData = [];
    },
    resetAll() {
      this.importedData = [];
      this.importResult = [];
    },
  },
};
</script>

<style scoped>
.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background-color: #fafafa;
  border-radius: 8px;
}

.step-upload,
.step-preview,
.step-result {
  width: 100%;
  text-align: center;
}

.upload-icon {
  font-size: 72px;
  color: #1890ff;
  margin-bottom: 16px;
}

.intro-text {
  font-size: 15px;
  color: #555;
  margin-bottom: 24px;
  max-width: 460px;
  margin: 0 auto 24px auto;
  line-height: 1.6;
}

.button-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  height: 40px;
  padding: 0 18px;
}

.action-btn label {
  cursor: pointer;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.table-header {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1a72c4;
  text-align: center;
}
.table-heade-title {
  font-size: 20px;
  font-weight: 700;
}
.excel-icon {
  color: #1a72c4;
  font-size: 20px;
}

.import-table {
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.import-table ::v-deep(.ant-table-thead > tr > th) {
  background: #f0f5ff;
  font-weight: 600;
  text-align: center;
}

.import-table ::v-deep(.ant-table-tbody > tr > td) {
  text-align: center;
  vertical-align: middle;
}

.mt-4 {
  margin-top: 24px;
}

.confirm-btn {
  background: #1677ff;
  border: none;
  font-weight: 600;
  border-radius: 6px;
  padding: 0 24px;
}

.confirm-btn:hover {
  background: #3a89ff;
}

.reset-btn {
  border-radius: 6px;
  font-weight: 500;
  padding: 0 24px;
}

.reset-btn:hover {
  color: #1677ff;
  border-color: #1677ff;
}

.status-success {
  color: #16a34a;
  font-weight: 600;
}

.status-fail {
  color: #dc2626;
  font-weight: 600;
}

@media (max-width: 768px) {
  .dialog-content {
    padding: 16px 8px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .import-table {
    font-size: 13px;
  }
}
</style>

