<template>
  <div class="rich-editor-wrap">
    <client-only>
      <editor
        :value="value"
        :api-key="apiKey"
        :init="mergedInit"
        @input="$emit('input', $event)"
      />
      <div slot="placeholder" class="editor-loading">
        <a-spin tip="Đang tải editor..." />
      </div>
    </client-only>
  </div>
</template>

<script>
export default {
  name: "RichTextEditor",
  components: {
    editor: () =>
      process.client
        ? import("@tinymce/tinymce-vue").then((m) => m.default)
        : Promise.resolve({ render: () => {} }),
  },
  props: {
    value: { type: String, default: "" },
    height: { type: Number, default: 400 },
    /** "full" = all tools, "mini" = compact toolbar for inline use */
    mode: { type: String, default: "full" },
    placeholder: { type: String, default: "Nhập nội dung..." },
  },
  computed: {
    apiKey() {
      return process.env.NUXT_ENV_TINYMCE_API_KEY || "no-api-key";
    },
    mergedInit() {
      const base = {
        height: this.height,
        placeholder: this.placeholder,
        branding: false,
        content_style: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            color: #334155;
            line-height: 1.7;
            padding: 16px;
          }
          img { max-width: 100%; height: auto; border-radius: 8px; }
          table { border-collapse: collapse; width: 100%; }
          table td, table th { border: 1px solid #e2e8f0; padding: 8px 12px; }
          a { color: #6366f1; }
          blockquote { border-left: 3px solid #6366f1; padding-left: 16px; color: #64748b; margin: 16px 0; }
        `,
        skin: "oxide",
        toolbar_mode: "sliding",
        image_advtab: true,
        paste_data_images: true,
        automatic_uploads: false,
        convert_urls: false,
        relative_urls: false,
        language: "vi",
        language_url: "",
      };

      if (this.mode === "mini") {
        return {
          ...base,
          menubar: false,
          plugins: ["lists", "link", "autolink", "paste", "searchreplace"],
          toolbar:
            "bold italic underline strikethrough | forecolor | bullist numlist | link | removeformat",
        };
      }

      return {
        ...base,
        menubar: "file edit view insert format tools table",
        plugins: [
          "advlist autolink lists link image charmap preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table paste help wordcount hr",
        ],
        toolbar:
          "undo redo | formatselect | bold italic underline strikethrough | " +
          "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | link image media table | " +
          "blockquote hr | code fullscreen | removeformat help",
      };
    },
  },
};
</script>

<style scoped>
.rich-editor-wrap {
  border-radius: 10px;
  overflow: hidden;
}
.editor-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}
</style>
