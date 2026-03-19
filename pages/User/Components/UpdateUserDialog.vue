<template>
  <a-modal
    :visible="value"
    :title="$t('updateUserInfo')"
    @ok="handleOk"
    @cancel="close"
    :confirm-loading="loading"
  >
    <div class="update-form">
      <div class="form-group">
        <label>{{ $t("displayName") }}</label>
        <input
          v-model="form.displayName"
          type="text"
          class="tiny-input"
          :placeholder="$t('displayName')"
        />
      </div>

      <div class="form-group">
        <label>{{ $t("accountBalance") }}</label>
        <input
          v-model.number="form.accountBalance"
          type="number"
          min="0"
          class="tiny-input"
          :placeholder="$t('accountBalance')"
        />
      </div>

      <div class="form-group">
        <label>{{ $t("status") }}</label>
        <select v-model="form.status" class="tiny-input">
          <option value="1">{{ $t("active") }}</option>
          <option value="0">{{ $t("maintain") }}</option>
        </select>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { updateInformationUser } from "../../../apis/users";

export default {
  name: "UpdateUserDialog",
  props: {
    value: { type: Boolean, default: false },
    user: { type: Object, default: null },
  },
  data() {
    return {
      form: {
        displayName: "",
        accountBalance: 0,
        status: 1,
      },
      loading: false,
    };
  },
  watch: {
    user: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form = {
            displayName: newVal.displayName || "",
            accountBalance: newVal.balanceAmount || 0,
            status: newVal.status ?? 1,
          };
        }
      },
    },
  },
  methods: {
    close() {
      this.$emit("input", false);
    },

    async handleOk() {
      if (!this.form.displayName.trim()) {
        this.$message.warning(this.$t("displayNameRequired"));
        return;
      }

      this.loading = true;
      updateInformationUser(this.user.userId, this.form)
        .then((res) => {
          if (res.responseCode === 1) {
            this.$message.success(this.$t("updateSuccess"));
            this.$emit("updated");
            this.close();
          } else {
            this.$message.error(this.$t("updateFailed"));
          }
        })
        .catch((err) => {
          console.error("❌ Update user error:", err);
          this.$message.error(this.$t("updateFailed"));
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped>
.update-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 14px;
}

.tiny-input {
  width: 100%;
  border: 1px solid #d0d7dd;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 14px;
}
</style>
