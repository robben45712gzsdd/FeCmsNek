<template>
  <div class="user-page">
    <h2 class="title">{{ $t("listUser") }}</h2>

    <!-- Filter -->
    <LogsFilter @search="searchUsers" @reset="resetFilters">
      <template #fields>
        <div class="form-row">
          <div class="form-group">
            <label>{{ $t("userId") }}:</label>
            <input
              v-model="filters.userId"
              type="text"
              :placeholder="$t('userId')"
              class="tiny-input"
            />
          </div>
          <div class="form-group">
            <label>{{ $t("status") }}:</label>
            <select v-model="filters.status" class="tiny-input">
              <option value="All">{{ $t("all") }}</option>
              <option value="1">{{ $t("active") }}</option>
              <option value="0">{{ $t("maintain") }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t("displayName") }}:</label>
          <input
            v-model="filters.displayName"
            type="text"
            :placeholder="$t('displayName')"
            class="tiny-input"
          />
        </div>
      </template>
    </LogsFilter>
    <a-button type="primary" class="update-btn" @click="openImportExportDialog">
      {{ $t("updateAccountBalance") }}
    </a-button>

    <!-- Table -->
    <BoxTable
      :columns="columns"
      :data="users"
      :loading="loading"
      :page="page"
      :page-size="pageSize"
      :total="total"
      @page-change="changePage"
    >
      <template #status="{ record }">
        <span :class="record.status === 1 ? 'status active' : 'status locked'">
          {{ record.status === 1 ? $t("active") : $t("maintain") }}
        </span>
      </template>

      <template #actions="{ record }">
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent>
            {{ $t("action") }} <a-icon type="down" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item @click="openDetail(record)">
              {{ $t("showDetail") }}
            </a-menu-item>
            <a-menu-item @click="openUpdateDialog(record)">
              {{ $t("updateInformationUser") }}
            </a-menu-item>
            <a-menu-item @click="toggleStatus(record)">
              {{ record.status === 1 ? $t("lock") : $t("unlock") }}
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </BoxTable>

    <!-- Modal -->
    <a-modal
      v-model="showDetailModal"
      :title="selectedUser?.displayName"
      width="1000px"
      :footer="null"
    >
      <StatsCards v-if="selectedUser" :user="selectedUser" />
    </a-modal>
    <UserImportExportDialog
      v-model="showImportExportDialog"
      @imported="fetchUsers"
    />
    <UpdateUserDialog
      v-model="showUpdateDialog"
      :user="selectedUserToUpdate"
      @updated="fetchUsers"
    />
  </div>
</template>

<script>
import UpdateUserDialog from "./Components/UpdateUserDialog.vue";
import LogsFilter from "../../components/BoxFilter/index.vue";
import BoxTable from "../../components/BoxTable/index.vue";
import StatsCards from "../../components/StatsCards/index.vue";
import UserImportExportDialog from "./Components/UserImportExportDialog.vue";
import * as usersAPI from "../../apis/users";


export default {
  name: "UserPage",
  middleware: "auth",
  layout: "adminLayout",
  components: {
    LogsFilter,
    BoxTable,
    StatsCards,
    UserImportExportDialog,
    UpdateUserDialog,
  },
  data() {
    return {
      users: [],
      loading: false,
      page: 1,
      pageSize: 10,
      total: 0,
      showDetailModal: false,
      selectedUser: null,
      showImportExportDialog: false,
      showUpdateDialog: false,
      selectedUserToUpdate: null,
      filters: {
        userId: "",
        displayName: "",
        status: "All",
      },
      columns: [
        { key: "ord", label: "ord" },
        { key: "userId", label: "userId" },
        { key: "displayName", label: "displayName" },
        { key: "userName", label: "userName" },
        { key: "balanceAmount", label: "balanceAmount", format: "amount" },
        { key: "status", label: "status", slot: "status" },
        { key: "date", label: "date", format: "date" },
        { key: "actions", label: "action", slot: "actions" },
      ],
    };
  },

  async mounted() {
    await this.fetchUsers();
  },

  methods: {
    fetchUsers() {
      this.loading = true;
      const params = {
        currentPage: this.page,
        recordPerPage: this.pageSize,
      };

      if (this.filters.userId && !isNaN(Number(this.filters.userId))) {
        params.userId = Number(this.filters.userId);
      }

      if (this.filters.displayName) {
        params.displayName = this.filters.displayName.trim();
      }

      if (this.filters.status !== "All") {
        params.status = this.filters.status;
      }

      usersAPI
        .getListUsersByCustomer(params)
        .then((res) => {
          if (res.responseCode === 1) {
            this.users = res.data.records.map((r, i) => ({
              ord: (this.page - 1) * this.pageSize + i + 1,
              ...r,
            }));
            this.total = res.data.totalRecord;
          } else {
            this.users = [];
            this.total = 0;
          }
        })
        .catch((err) => {
          console.error(err);
          this.$message.error(this.$t("errorUser"));
        })
        .finally(() => {
          this.loading = false;
        });
    },
    toggleStatus(user) {
      const isActive = user.status === 1;
      const action = isActive
        ? usersAPI.lockUser({ userId: user.userId })
        : usersAPI.unlockUser({ userId: user.userId });
      action
        .then((res) => {
          if (res.responseCode === 1) {
            this.$message.success(
              isActive ? this.$t("lockSuccess") : this.$t("unlockSuccess")
            );
            this.fetchUsers();
          } else {
            this.$message.error(this.$t("actionFailed"));
          }
        })
        .catch((err) => {
          console.error(err);
          this.$message.error(this.$t("actionFailed"));
        });
    },

    searchUsers() {
      this.page = 1;
      this.fetchUsers();
    },

    resetFilters() {
      this.filters = { userId: "", displayName: "", status: "All" };
      this.page = 1;
      this.fetchUsers();
    },

    changePage(newPage) {
      this.page = newPage;
      this.fetchUsers();
    },
    openImportExportDialog() {
      this.showImportExportDialog = true;
    },
    openUpdateDialog(user) {
      this.selectedUserToUpdate = user;
      this.showUpdateDialog = true;
    },

    openDetail(user) {
      this.selectedUser = { userId: user.userId, username: user.userName };
      console.log("ðŸ‘‰ selectedUser", this.selectedUser);
      this.showDetailModal = true;
    },
  },
};
</script>
<style scoped>
.user-page {
  padding: 24px;
}
.title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}
.update-btn {
  display: inline-flex;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
}
/* status, form-row, form-group, tiny-input styles are now in global.css */
</style>
