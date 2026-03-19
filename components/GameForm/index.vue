<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? $t('editGame') : $t('addGame')"
    @cancel="$emit('close')"
    @ok="handleSubmit"
    :confirmLoading="loading"
    width="700px"
  >
    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item :label="$t('gameName')">
            <a-input
              v-model="form.gameName"
              :placeholder="$t('enterGameName')"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="$t('altText')">
            <a-input v-model="form.alt" :placeholder="$t('enterAlt')" />
          </a-form-item>
        </a-col>
      </a-row>

      <div class="container-button">
        <a-form-item :label="$t('thumbnail')">
          <div class="image-picker">
            <div class="image-container" v-if="form.previewUrl">
              <img :src="form.previewUrl" class="preview-image" />
            </div>
            <a-button type="dashed" @click="showImagePicker = true">
              {{ $t("chooseImage") }}
            </a-button>
          </div>
        </a-form-item>

        <a-form-item :label="$t('status')">
          <a-switch
            v-model="form.status"
            :checked-children="$t('on')"
            :un-checked-children="$t('off')"
          />
        </a-form-item>
      </div>

      <a-form-item :label="$t('url')">
        <a-input v-model="form.url" :placeholder="$t('enterUrl')" />
      </a-form-item>

      <a-form-item :label="$t('urlClient')">
        <a-input v-model="form.urlClient" :placeholder="$t('enterUrlClient')" />
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item :label="$t('partnerGameId')">
            <a-input
              v-model="form.partnerGameId"
              :placeholder="$t('enterPartnerGameId')"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="$t('partnerGameType')">
            <a-input
              v-model="form.partnerGameType"
              :placeholder="$t('enterPartnerGameType')"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item :label="$t('partnerTableId')">
            <a-input
              v-model="form.partnerTableId"
              :placeholder="$t('enterPartnerTableId')"
            />
          </a-form-item>
        </a-col>
        
        <a-col :span="12">
          <a-form-item :label="$t('partnerType')">
            <a-select
              :key="visible ? 'partnerType-' + Math.random() : 'partnerType'"
              v-model="form.partnerType"
              :placeholder="$t('selectPartnerType')"
              style="width: 100%"
              allowClear
              show-search
              option-filter-prop="children"
              class="form-select"
            >
              <a-select-option
                v-for="item in partnerTypeOptions"
                :key="item.partnerId"
                :value="item.partnerId"
              >
                {{ item.partnerName}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <ImagePicker
      v-if="showImagePicker"
      :visible="showImagePicker"
      @close="showImagePicker = false"
      @selected="onImageSelected"
    />
  </a-modal>
</template>

<script>
import ImagePicker from "./ImagePicker.vue";
import {
  addGame,
  addGameWithImageId,
  updateGameInfo,
  updateGameImage,
  getPartnerType
} from "../../apis/games";

export default {
  components: { ImagePicker },
  props: {
    visible: Boolean,
    isEdit: Boolean,
    record: Object,
  },
  data() {
    return {
      loading: false,
      showImagePicker: false,
      selectedImageRefId: null,
      partnerTypeOptions: [],
      form: {
        gameName: "",
        alt: "",
        Image: null,
        partnerGameId: "",
        partnerGameType: "",
        partnerTableId: "",
        partnerType: 0,
        url: "",
        urlClient: "",
        status: true,
      },
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.$nextTick(() => {
          this.fetchDropdownData();
          this.isEdit && this.record ? this.fillEditForm() : this.resetForm();
        });
      }
    },
  },
  methods: {
    fillEditForm() {
      Object.assign(this.form, {
        gameName: this.record.gameName,
        alt: this.record.alt,
        previewUrl: this.record.image,
        partnerGameId: this.record.partnerGameId,
        partnerGameType: this.record.partnerGameType,
        partnerTableId: this.record.partnerTableId,
        partnerType: this.record.partnerType,
        url: this.record.url,
        urlClient: this.record.urlClient,
        status: this.record.status,
      });
    },
    resetForm() {
      this.form = {
        gameName: "",
        alt: "",
        imageFile: null,
        partnerGameId: "",
        partnerGameType: "",
        partnerTableId: "",
        partnerType: undefined,
        url: "",
        urlClient: "",
        status: true,
      };
    },
    removeImage() {
      this.form.previewUrl = "";
      this.form.imageFile = null;
    },
    onImageSelected(payload) {
      if (payload.file) {
        this.form.imageFile = payload.file;
        this.form.previewUrl = payload.previewUrl;
      } else if (payload.url) {
        this.form.previewUrl = payload.url;
        this.form.imageFile = null;
        this.selectedImageRefId = payload.refId;
      }
      this.showImagePicker = false;
    },
    buildFormData() {
      const fd = new FormData();
      const f = this.form;
      fd.append("GameName", f.gameName);
      fd.append("Alt", f.alt || "");
      fd.append("Image", f.imageFile);
      fd.append("PartnerGameId", f.partnerGameId || "");
      fd.append("PartnerGameType", f.partnerGameType || "");
      fd.append("PartnerTableId", f.partnerTableId || "");
      fd.append("PartnerType", f.partnerType || 0);
      fd.append("Url", f.url || "");
      fd.append("UrlClient", f.urlClient || "");
      fd.append("Status", f.status);
      return fd;
    },
    handleSubmit() {
      const requiredFields = {
        gameName: this.$t("gameName"),
      };

      for (const [key, label] of Object.entries(requiredFields)) {
        if (!this.form[key] || !this.form[key].toString().trim()) {
          this.$message.error(this.$t("requiredField", { field: label }));
          return;
        }
      }

      this.loading = true;

      if (this.isEdit && this.record) {
        updateGameInfo({
          gameId: this.record.gameId,
          gameName: this.form.gameName,
          alt: this.form.alt,
          partnerGameId: this.form.partnerGameId,
          partnerGameType: this.form.partnerGameType,
          partnerTableId: this.form.partnerTableId,
          partnerTypeId: this.form.partnerType,
          url: this.form.url,
          urlClient: this.form.urlClient,
          status: this.form.status,
        })
          .then((infoRes) => {
            if (this.form.imageFile) {
              const fd = new FormData();
              fd.append("GameId", this.record.gameId);
              fd.append("Image", this.form.imageFile);
              return updateGameImage(fd).then(() => infoRes);
            }
            return infoRes;
          })
          .then((res) => {
            if (res.responseCode === 1) {
              this.$message.success(this.$t("updateSuccess"));
              this.$emit("saved");
              this.$emit("close");
            } else {
              this.$message.error(res.message || this.$t("errorOccurred"));
            }
          })
          .catch(() => {
            this.$message.error(this.$t("updateFail"));
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        let apiCall = this.form.imageFile
          ? addGame(this.buildFormData())
          : addGameWithImageId({
              ...this.form,
              image: this.selectedImageRefId,
            });

        apiCall
          .then((res) => {
            if (res.responseCode === 1) {
              this.$message.success(this.$t("addSuccess"));
              this.$emit("saved");
              this.$emit("close");
            } else {
              this.$message.error(res.message || this.$t("errorOccurred"));
            }
          })
          .catch(() => {
            this.$message.error(this.$t("addFail"));
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    fetchDropdownData() {
      Promise.all([
        getPartnerType({ currentPage: 1, recordPerPage: 100 }),
      ])
        .then(([partnerTypeRes]) => {
          if (partnerTypeRes.responseCode === 1) {
            this.partnerTypeOptions = partnerTypeRes.data.records || [];
          }
        })
        .catch((err) => {
          console.error("Error fetching dropdown data:", err);
          this.$message.error(this.$t("loadFail"));
        });
    },
  },
};
</script>

<style scoped>
.image-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}
.image-container {
  position: relative;
  width: 80px;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: 0.25s;
}
.image-container:hover .image-hover-overlay {
  opacity: 1;
}
.delete-icon {
  color: white;
  font-size: 20px;
  background: red;
  border-radius: 50%;
  padding: 5px;
}
.form-select .ant-select-selector {
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 0 11px;
  border-radius: 6px;
}

.form-select .ant-select-focused .ant-select-selector,
.form-select .ant-select-selector:hover {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.08);
  border-color: #40a9ff;
}
.form-select .ant-select-selection-placeholder {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.container-button {
  display: flex;
  gap: 16px;
}
.container-button > .ant-form-item {
  flex: 1;
}
</style>
