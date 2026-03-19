<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? 'Chỉnh sửa game' : 'Thêm game'"
    width="700px"
    :confirm-loading="saving"
    ok-text="Lưu"
    cancel-text="Hủy"
    @ok="handleSave"
    @cancel="close"
  >
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 17 }"
    >
      <!-- Ngôn ngữ -->
      <a-form-model-item label="Ngôn ngữ" prop="languageCode">
        <a-select v-model="form.languageCode">
          <a-select-option value="vi">Tiếng Việt</a-select-option>
          <a-select-option value="us">English</a-select-option>
        </a-select>
      </a-form-model-item>

      <!-- Tên game -->
      <a-form-model-item label="Tên game" prop="name">
        <a-input v-model="form.name" placeholder="Nhập tên game" />
      </a-form-model-item>

      <!-- Loại game -->
      <a-form-model-item label="Loại game" prop="gameType">
        <a-select v-model="form.gameType" placeholder="Chọn loại game">
          <a-select-option :value="1">Mobile</a-select-option>
          <a-select-option :value="2">Cả hai</a-select-option>
          <a-select-option :value="3">Web</a-select-option>
        </a-select>
      </a-form-model-item>

      <!-- Sắp ra mắt -->
      <a-form-model-item label="Sắp ra mắt" prop="isComming">
        <a-select v-model="form.isComming">
          <a-select-option :value="1">Sắp ra mắt</a-select-option>
          <a-select-option :value="0">D� ra m?t</a-select-option>
        </a-select>
      </a-form-model-item>

      <!-- Tr?ng th�i -->
      <a-form-model-item label="Tr?ng th�i" prop="status">
        <a-select v-model="form.status">
          <a-select-option :value="1">Hiển thị</a-select-option>
          <a-select-option :value="0">Ẩn</a-select-option>
        </a-select>
      </a-form-model-item>

      <!-- Google Play -->
      <a-form-model-item label="Google Play" prop="googlePlay">
        <a-input v-model="form.googlePlay" placeholder="Link Google Play" />
      </a-form-model-item>

      <!-- App Store -->
      <a-form-model-item label="App Store" prop="appStore">
        <a-input v-model="form.appStore" placeholder="Link App Store" />
      </a-form-model-item>

      <!-- Web Link -->
      <a-form-model-item label="Web Link" prop="webLink">
        <a-input v-model="form.webLink" placeholder="Link website" />
      </a-form-model-item>

      <!-- Mô tả -->
      <a-form-model-item label="Mô tả" prop="description">
        <client-only>
          <editor
            v-model="form.description"
            :api-key="tinymceApiKey"
            :init="editorInit"
          />
          <div slot="placeholder" class="editor-placeholder">
            <a-spin tip="Đang tải editor..." />
          </div>
        </client-only>
      </a-form-model-item>

      <!-- Banner (video) -->
      <a-form-model-item label="Banner (video)">
        <div class="upload-wrap">
          <a-upload :before-upload="onBannerSelect" :show-upload-list="false" accept="video/*">
            <a-button><a-icon type="upload" /> {{ bannerFile ? bannerFile.name : (form.bannerUrl ? 'Đổi video banner' : 'Chọn video banner') }}</a-button>
          </a-upload>
          <div v-if="bannerPreview || form.bannerUrl" class="video-preview">
            <video :src="bannerPreview || toFullUrl(form.bannerUrl)" controls muted />
          </div>
        </div>
      </a-form-model-item>

      <!-- Logo -->
      <a-form-model-item label="Logo">
        <div class="upload-wrap">
          <a-upload :before-upload="onLogoSelect" :show-upload-list="false" accept="image/*">
            <a-button><a-icon type="upload" /> {{ logoFile ? logoFile.name : (form.logoUrl ? 'Đổi ảnh logo' : 'Chọn ảnh logo') }}</a-button>
          </a-upload>
          <div v-if="logoPreview || form.logoUrl" class="img-preview logo-preview">
            <img :src="logoPreview || toFullUrl(form.logoUrl)" alt="logo" />
          </div>
        </div>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import { createGame, updateGame, getGameDetail } from "../../../apis/games";

const FILE_BASE = process.env.NUXT_ENV_FILE_API_URL;

function defaultForm(languageCode) {
  return {
    languageCode: languageCode || "vi",
    gameId: null,
    name: "",
    gameType: undefined,
    isComming: 0,
    status: 1,
    googlePlay: "",
    appStore: "",
    webLink: "",
    description: "",
    bannerUrl: null,
    logoUrl: null,
  };
}

export default {
  components: {
    editor: () =>
      process.client
        ? import("@tinymce/tinymce-vue").then((m) => m.default)
        : Promise.resolve({ render: () => {} }),
  },
  props: {
    languageCode: { type: String, default: "vi" },
  },
  data() {
    return {
      visible: false,
      isEdit: false,
      form: defaultForm(this.languageCode),
      saving: false,
      bannerFile: null,
      logoFile: null,
      bannerPreview: null,
      logoPreview: null,
      tinymceApiKey: process.env.NUXT_ENV_TINYMCE_API_KEY || "no-api-key",
      editorInit: {
        height: 250,
        menubar: false,
        plugins: [
          "advlist autolink lists link image charmap preview",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table paste help wordcount",
        ],
        toolbar:
          "undo redo | formatselect | bold italic underline | " +
          "forecolor backcolor | alignleft aligncenter alignright | " +
          "bullist numlist | link image | code | removeformat",
        content_style:
          "body { font-family: 'Inter', sans-serif; font-size: 14px; color: #334155; line-height: 1.6; padding: 10px; }",
      },
      rules: {
        name: [{ required: true, message: "Nhập tên game!", trigger: "blur" }],
        gameType: [{ required: true, message: "Chọn loại game!", trigger: "change" }],
      },
    };
  },
  watch: {
    "form.languageCode"(newLang) {
      if (!this.isEdit || !this.form.gameId) return;
      getGameDetail(this.form.gameId, newLang)
        .then((res) => {
          if (res && res.data) {
            const r = res.data;
            this.form.name = r.name || r.gameName || "";
            this.form.description = r.gameDescription || r.description || "";
            this.form.gameType = r.gameType ?? this.form.gameType;
            this.form.isComming = r.isComming ?? this.form.isComming;
            this.form.status = r.status ?? this.form.status;
            this.form.googlePlay = r.googlePlay || "";
            this.form.appStore = r.appStore || "";
            this.form.webLink = r.webLink || "";
            this.form.bannerUrl = r.bannerUrl || this.form.bannerUrl;
            this.form.logoUrl = r.logoUrl || this.form.logoUrl;
          }
        })
        .catch(() => this.$message.error("Không thể tải dữ liệu ngôn ngữ mới!"));
    },
  },
  methods: {
    openAdd() {
      this.isEdit = false;
      this.bannerFile = null;
      this.logoFile = null;
      this.bannerPreview = null;
      this.logoPreview = null;
      this.form = defaultForm(this.languageCode);
      this.visible = true;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    openEdit(r) {
      this.isEdit = true;
      this.bannerFile = null;
      this.logoFile = null;
      this.bannerPreview = null;
      this.logoPreview = null;
      this.form = {
        languageCode: this.languageCode,
        gameId: r.gameId,
        name: r.name || r.gameName || "",
        gameType: r.gameType ?? undefined,
        isComming: r.isComming ?? 0,
        status: r.status ?? 1,
        googlePlay: r.googlePlay || "",
        appStore: r.appStore || "",
        webLink: r.webLink || "",
        description: r.gameDescription || r.description || "",
        bannerUrl: r.bannerUrl || null,
        logoUrl: r.logoUrl || null,
      };
      this.visible = true;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    close() {
      this.visible = false;
      this.$emit("close");
    },
    toFullUrl(url) {
      if (!url) return "";
      return /^https?:\/\//i.test(url) ? url : FILE_BASE.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
    },
    onBannerSelect(file) { this.bannerFile = file; this.bannerPreview = URL.createObjectURL(file); return false; },
    onLogoSelect(file) { this.logoFile = file; this.logoPreview = URL.createObjectURL(file); return false; },
    handleSave() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        this.saving = true;
        try {
          if (this.isEdit) {
            const params = {
              gameId: this.form.gameId,
              languageCode: this.form.languageCode,
              gameName: this.form.name,
              gameType: this.form.gameType,
              isComming: this.form.isComming,
              status: this.form.status,
              googlePlay: this.form.googlePlay || "",
              appStore: this.form.appStore || "",
              webLink: this.form.webLink || "",
              gameDescription: this.form.description || "",
            };
            await updateGame(params, this.bannerFile || null, this.logoFile || null);
          } else {
            const params = {
              languageCode: this.form.languageCode,
              name: this.form.name,
              gameType: this.form.gameType,
              isComming: this.form.isComming,
              status: this.form.status,
              googlePlay: this.form.googlePlay || "",
              appStore: this.form.appStore || "",
              webLink: this.form.webLink || "",
              description: this.form.description || "",
            };
            await createGame(params, this.bannerFile || null, this.logoFile || null);
          }
          this.$message.success("Lưu thành công!");
          this.$emit("saved");
          this.close();
        } catch {
          this.$message.error("Có lỗi, vui lòng thử lại!");
        } finally {
          this.saving = false;
        }
      });
    },
  },
};
</script>

<style scoped>
.upload-wrap { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.video-preview { width: 200px; border-radius: 6px; overflow: hidden; border: 1px solid #e8e8e8; background: #000; }
.video-preview video { width: 100%; display: block; max-height: 120px; object-fit: cover; }
.img-preview { width: 100px; height: 64px; border-radius: 6px; overflow: hidden; border: 1px solid #e8e8e8; background: #f5f5f5; }
.img-preview img { width: 100%; height: 100%; object-fit: cover; }
.logo-preview { width: 64px; height: 64px; border-radius: 50%; }
.editor-placeholder {
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}
</style>
