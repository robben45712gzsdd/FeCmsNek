<template>
  <div id="app" class="case-study-root">
    <!-- LEFT PANEL -->
    <div id="left-panel">
      <div id="panel-header">
        <div class="logo">✦</div>
        <div>
          <div class="title">Case Study Editor</div>
          <div class="subtitle">Block Builder · {{ blocks.length }} block{{ blocks.length !== 1 ? 's' : '' }}</div>
        </div>
      </div>

      <div id="panel-scroll">
        <div class="meta-box">
          <div class="section-title"><span class="bar" /> About Project</div>
          <div class="field-group">
            <div>
              <label class="field-label">Văn bản giới thiệu (dùng {{text}} để bôi màu)</label>
              <textarea
                v-model="meta.aboutText"
                rows="3"
                placeholder="Welcome to Streamie, ..."
              />
            </div>
            <div>
              <label class="field-label">Màu highlight</label>
              <div class="field-row">
                <input type="color" v-model="meta.highlightColor" />
                <input type="text" v-model="meta.highlightColor" style="flex: 1" />
              </div>
            </div>
            <div>
              <label class="field-label">Font chữ toàn trang</label>
              <select class="meta-select" v-model="meta.globalFont">
                <option value="">── Default (Inter) ──</option>
                <template v-for="f in fontFamilies">
                  <option v-if="f.value" :key="f.value" :value="f.value">{{ f.label }}</option>
                </template>
              </select>
            </div>
            <div class="typo-section" style="margin-top:4px">
              <div class="typo-section-header">Kiểu chữ — About</div>
              <div class="typo-row">
                <span class="typo-row-label">Tiêu đề</span>
                <select class="typo-select" v-model="meta.aboutTitleTypo.fontFamily">
                  <option v-for="f in fontFamilies" :key="f.value" :value="f.value">{{ f.label }}</option>
                </select>
                <input class="typo-size" type="number" v-model.number="meta.aboutTitleTypo.fontSize" min="8" max="96" />
                <span class="typo-unit">px</span>
                <button class="typo-btn" :class="{ active: meta.aboutTitleTypo.bold }" type="button" @click="meta.aboutTitleTypo.bold = !meta.aboutTitleTypo.bold">B</button>
                <button class="typo-btn typo-italic" :class="{ active: meta.aboutTitleTypo.italic }" type="button" @click="meta.aboutTitleTypo.italic = !meta.aboutTitleTypo.italic">I</button>
              </div>
              <div class="typo-row">
                <span class="typo-row-label">Nội dung</span>
                <select class="typo-select" v-model="meta.aboutBodyTypo.fontFamily">
                  <option v-for="f in fontFamilies" :key="f.value" :value="f.value">{{ f.label }}</option>
                </select>
                <input class="typo-size" type="number" v-model.number="meta.aboutBodyTypo.fontSize" min="8" max="96" />
                <span class="typo-unit">px</span>
                <button class="typo-btn" :class="{ active: meta.aboutBodyTypo.bold }" type="button" @click="meta.aboutBodyTypo.bold = !meta.aboutBodyTypo.bold">B</button>
                <button class="typo-btn typo-italic" :class="{ active: meta.aboutBodyTypo.italic }" type="button" @click="meta.aboutBodyTypo.italic = !meta.aboutBodyTypo.italic">I</button>
              </div>
            </div>
          </div>
        </div>

        <div class="blocks-label">— Blocks —</div>
        <BlockList :blocks="blocks" @change-blocks="blocks = $event" />
      </div>

      <div id="panel-footer">
        <input ref="loadFileInput" type="file" accept=".html,.htm" style="display:none" @change="onLoadFileChange" />
        <button class="btn-load" @click="loadFromFile">📂 Load HTML</button>
        <button class="btn-primary" @click="download">⬇ Tải HTML</button>
        <button class="btn-copy" :class="{ copied }" @click="copyCode">
          {{ copied ? '✓ Copied' : 'Copy' }}
        </button>
      </div>
    </div>

    <!-- RIGHT PANEL -->
    <div id="right-panel">
      <div id="tab-bar">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="btn-tab"
          :class="{ active: tab === t.id }"
          @click="tab = t.id"
        >
          {{ t.label }}
        </button>
        <span>Live preview</span>
      </div>
      <div id="right-content">
        <div v-if="tab === 'preview'" id="preview-area" v-html="previewHtml" />
        <pre v-else id="code-area"><code>{{ htmlOutput }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script>
import { uploadImageMedia, deleteImageMedia } from "@/apis/files";

const FILE_API_BASE = process.env.NUXT_ENV_FILE_API_URL;
const toFullUrl = (url) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return FILE_API_BASE.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
};
const relPathFromUrl = (url) => {
  if (!url) return null;
  return url.replace(new RegExp("^" + FILE_API_BASE.replace(/\/$/, "") + "/"), "");
};

// URLs uploaded this session but not yet saved (downloaded/copied)
const _pendingImages = new Set();

function collectImageUrls(block) {
  const urls = [];
  if (block.type === "image" && block.url) urls.push(block.url);
  if (block.subBlocks) block.subBlocks.forEach((sub) => urls.push(...collectImageUrls(sub)));
  return urls;
}

async function deletePendingUrl(url) {
  if (!url || !_pendingImages.has(url)) return;
  _pendingImages.delete(url);
  const path = relPathFromUrl(url);
  if (path) await deleteImageMedia(path).catch(() => {});
}

let _id = 100;
const uid = () => ++_id;

// Forward reference – assigned after BlockList is defined (for circular use in SolutionEditor)
let _BlockList;

const BLOCK_TYPES = [
  { type: "challenge", icon: "⚡", label: "Challenge / Text với bullet list" },
  { type: "solution", icon: "🧩", label: "Solution (sidebar feature + content)" },
  { type: "text-section", icon: "📝", label: "Text Section (tiêu đề + nội dung)" },
  { type: "image", icon: "🖼", label: "Hình ảnh" }
];

const TYPE_META = {
  challenge: { icon: "⚡", color: "#f59e0b", label: "Challenge" },
  solution: { icon: "🧩", color: "#6366f1", label: "Solution" },
  "text-section": { icon: "📝", color: "#10b981", label: "Text Section" },
  image: { icon: "🖼", color: "#3b82f6", label: "Image" }
};

const DEFAULT_BLOCKS = [
  {
    id: uid(),
    type: "challenge",
    title: "Challenge",
    intro: "In an increasingly digital world, pet owners expect seamless experiences when managing their pets' health.",
    items: [
      "Simplify vet appointment scheduling and consultations.",
      "Manage medical records, medications, and health reminders.",
      "Enable video vet service and real-time chat with veterinarians."
    ]
  },
  { id: uid(), type: "image", url: "", alt: "Screenshot", width: 100, align: "center", borderRadius: 8 },
  {
    id: uid(),
    type: "solution",
    featureItems: ["Multi-pet selection", "Frequency scheduling", "Notification & alert calendar"],
    solutionTitle: "Solution",
    solutionText:
      "With stunning graphics, dynamic gameplay, and a variety of environments to explore, Streamie offers an unforgettable experience.",
    subBlocks: [
      { id: uid(), type: "image", url: "", alt: "Solution screenshot", width: 100, align: "center", borderRadius: 8 },
      {
        id: uid(),
        type: "text-section",
        title: "Own a dream room",
        body: "Get ready to dive into an unforgettable world where multiplayer options, story depth, and unique mechanics await."
      }
    ]
  }
];

const Label = {
  functional: true,
  render(h, ctx) {
    return h("label", { class: "field-label" }, ctx.children);
  }
};

const Inp = {
  props: {
    value: String,
    placeholder: String
  },
  methods: {
    onInput(e) {
      this.$emit("input-value", e.target.value);
    }
  },
  render(h) {
    return h("input", {
      attrs: { type: "text", placeholder: this.placeholder },
      domProps: { value: this.value },
      on: { input: this.onInput }
    });
  }
};

const Txa = {
  props: {
    value: String,
    placeholder: String,
    rows: { type: Number, default: 3 }
  },
  methods: {
    onInput(e) {
      this.$emit("input-value", e.target.value);
    }
  },
  render(h) {
    return h("textarea", {
      attrs: { rows: this.rows, placeholder: this.placeholder },
      domProps: { value: this.value },
      on: { input: this.onInput }
    });
  }
};

/** Rich text editor (contenteditable) for body fields */
const RichTxa = {
  props: {
    value: { type: String, default: "" },
    placeholder: { type: String, default: "Nhập nội dung..." },
  },
  data() {
    return { focused: false };
  },
  methods: {
    onInput() {
      const html = this.$refs.editor.innerHTML;
      // treat <br> only as empty
      const clean = html === "<br>" ? "" : html;
      this.$emit("input-value", clean);
    },
    exec(cmd, val) {
      this.$refs.editor.focus();
      document.execCommand(cmd, false, val || null);
      this.onInput();
    },
    insertLink() {
      const url = prompt("Nhập URL:");
      if (url) this.exec("createLink", url);
    },
    setColor() {
      const c = this._colorInput;
      if (c) c.click();
    },
    onColorPick(e) {
      this.exec("foreColor", e.target.value);
    },
  },
  mounted() {
    if (this.value) this.$refs.editor.innerHTML = this.value;
  },
  watch: {
    value(newVal) {
      if (this.$refs.editor && this.$refs.editor.innerHTML !== newVal) {
        this.$refs.editor.innerHTML = newVal || "";
      }
    },
  },
  render(h) {
    return h("div", { class: "rich-txa-wrap" }, [
      h("div", { class: "rich-txa-toolbar" }, [
        h("button", { attrs: { type: "button", title: "Bold" }, class: "rtb rtb-bold", on: { click: () => this.exec("bold") } }, ["B"]),
        h("button", { attrs: { type: "button", title: "Italic" }, class: "rtb rtb-italic", on: { click: () => this.exec("italic") } }, ["I"]),
        h("button", { attrs: { type: "button", title: "Underline" }, class: "rtb", on: { click: () => this.exec("underline") } }, ["U"]),
        h("span", { class: "rtb-sep" }),
        h("button", { attrs: { type: "button", title: "Bullet list" }, class: "rtb", on: { click: () => this.exec("insertUnorderedList") } }, ["•"]),
        h("button", { attrs: { type: "button", title: "Numbered list" }, class: "rtb", on: { click: () => this.exec("insertOrderedList") } }, ["1."]),
        h("span", { class: "rtb-sep" }),
        h("button", { attrs: { type: "button", title: "Link" }, class: "rtb", on: { click: this.insertLink } }, ["🔗"]),
        h("div", { class: "rtb-color-wrap" }, [
          h("button", { attrs: { type: "button", title: "Màu chữ" }, class: "rtb", on: { click: this.setColor } }, ["A"]),
          h("input", {
            ref: "colorPicker",
            attrs: { type: "color", value: "#000000" },
            class: "rtb-color-input",
            on: { input: this.onColorPick },
          }),
        ]),
        h("span", { class: "rtb-sep" }),
        h("button", { attrs: { type: "button", title: "Xóa format" }, class: "rtb", on: { click: () => this.exec("removeFormat") } }, ["✕"]),
      ]),
      h("div", {
        ref: "editor",
        class: ["rich-txa-content", { "is-empty": !this.value && !this.focused }],
        attrs: { contenteditable: "true", "data-placeholder": this.placeholder },
        on: {
          input: this.onInput,
          focus: () => { this.focused = true; },
          blur: () => { this.focused = false; },
          paste: (e) => {
            // paste as plain text to avoid formatting issues
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData("text/html") || (e.clipboardData || window.clipboardData).getData("text/plain");
            document.execCommand("insertHTML", false, text);
            this.onInput();
          },
        },
      }),
    ]);
  },
  updated() {
    // store color input ref
    if (this.$refs.colorPicker) this._colorInput = this.$refs.colorPicker;
  },
};

const ListEditor = {
  props: {
    items: { type: Array, default: () => [] }
  },
  methods: {
    emit(items) {
      this.$emit("update-items", items);
    },
    add() {
      this.emit([...(this.items || []), ""]);
    },
    remove(i) {
      this.emit(this.items.filter((_, idx) => idx !== i));
    },
    updateItem(i, v) {
      this.emit(this.items.map((item, idx) => (idx === i ? v : item)));
    },
    move(i, dir) {
      const arr = this.items.slice();
      const j = i + dir;
      if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      this.emit(arr);
    }
  },
  render(h) {
    return h("div", { class: "list-editor" }, [
      ...(this.items || []).map((item, i) =>
        h(
          "div",
          { key: i, class: "list-item-row" },
          [
            h("div", { class: "list-move-col" }, [
              h(
                "button",
                { on: { click: () => this.move(i, -1) } },
                "▲"
              ),
              h(
                "button",
                { on: { click: () => this.move(i, 1) } },
                "▼"
              )
            ]),
            h("span", { class: "list-bullet" }, "•"),
            h("input", {
              class: "item-input",
              attrs: { type: "text", placeholder: "Nhập nội dung..." },
              domProps: { value: item },
              on: { input: (e) => this.updateItem(i, e.target.value) }
            }),
            h(
              "button",
              { class: "list-remove-btn", on: { click: () => this.remove(i) } },
              "×"
            )
          ]
        )
      ),
      h(
        "button",
        { class: "btn", style: { marginTop: "2px" }, on: { click: this.add } },
        "+ Thêm dòng"
      )
    ]);
  }
};

/* ── Typography helpers ── */
const FONT_FAMILIES = [
  { value: "", label: "── Default ──", group: "" },
  // Sans-serif
  { value: "Inter", label: "Inter", group: "Sans-serif" },
  { value: "Roboto", label: "Roboto", group: "Sans-serif" },
  { value: "Open Sans", label: "Open Sans", group: "Sans-serif" },
  { value: "Lato", label: "Lato", group: "Sans-serif" },
  { value: "Poppins", label: "Poppins", group: "Sans-serif" },
  { value: "Nunito", label: "Nunito", group: "Sans-serif" },
  { value: "Montserrat", label: "Montserrat", group: "Sans-serif" },
  { value: "Raleway", label: "Raleway", group: "Sans-serif" },
  { value: "Oswald", label: "Oswald", group: "Sans-serif" },
  { value: "Ubuntu", label: "Ubuntu", group: "Sans-serif" },
  { value: "Noto Sans", label: "Noto Sans", group: "Sans-serif" },
  { value: "DM Sans", label: "DM Sans", group: "Sans-serif" },
  { value: "Manrope", label: "Manrope", group: "Sans-serif" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", group: "Sans-serif" },
  // Serif
  { value: "Playfair Display", label: "Playfair Display", group: "Serif" },
  { value: "Georgia", label: "Georgia", group: "Serif" },
  { value: "Merriweather", label: "Merriweather", group: "Serif" },
  { value: "Lora", label: "Lora", group: "Serif" },
  { value: "EB Garamond", label: "EB Garamond", group: "Serif" },
  { value: "Libre Baskerville", label: "Libre Baskerville", group: "Serif" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond", group: "Serif" },
  // Monospace
  { value: "Roboto Mono", label: "Roboto Mono", group: "Mono" },
  { value: "JetBrains Mono", label: "JetBrains Mono", group: "Mono" },
  { value: "Source Code Pro", label: "Source Code Pro", group: "Mono" },
  // Display
  { value: "Bebas Neue", label: "Bebas Neue", group: "Display" },
  { value: "Pacifico", label: "Pacifico", group: "Display" },
  { value: "Lobster", label: "Lobster", group: "Display" },
  { value: "Dancing Script", label: "Dancing Script", group: "Display" },
];

function renderTypoRow(h, label, typo, onChange) {
  const t = typo || {};
  return h("div", { class: "typo-row" }, [
    h("span", { class: "typo-row-label" }, [label]),
    h("select", {
      class: "typo-select",
      domProps: { value: t.fontFamily || "" },
      on: { change: (e) => onChange({ ...t, fontFamily: e.target.value }) }
    }, FONT_FAMILIES.map((f) => h("option", { attrs: { value: f.value } }, [f.label]))),
    h("input", {
      class: "typo-size",
      attrs: { type: "number", min: 8, max: 96, step: 1 },
      domProps: { value: t.fontSize || (label === "Tiêu đề" ? 32 : 16) },
      on: { input: (e) => onChange({ ...t, fontSize: Number(e.target.value) || 16 }) }
    }),
    h("span", { class: "typo-unit" }, ["px"]),
    h("button", {
      class: "typo-btn" + (t.bold ? " active" : ""),
      attrs: { type: "button", title: "Bold" },
      on: { click: () => onChange({ ...t, bold: !t.bold }) }
    }, ["B"]),
    h("button", {
      class: "typo-btn typo-italic" + (t.italic ? " active" : ""),
      attrs: { type: "button", title: "Italic" },
      on: { click: () => onChange({ ...t, italic: !t.italic }) }
    }, ["I"]),
  ]);
}

const GOOGLE_FONTS_SET = new Set([
  "Inter","Roboto","Open Sans","Lato","Poppins","Nunito","Montserrat","Raleway",
  "Oswald","Ubuntu","Noto Sans","DM Sans","Manrope","Plus Jakarta Sans",
  "Playfair Display","Merriweather","Lora","EB Garamond","Libre Baskerville","Cormorant Garamond",
  "Roboto Mono","JetBrains Mono","Source Code Pro",
  "Bebas Neue","Pacifico","Lobster","Dancing Script",
]);
function collectFontFamilies(blocks) {
  const fonts = new Set();
  function scan(b) {
    ["titleTypo", "bodyTypo", "solutionTitleTypo", "solutionBodyTypo"].forEach((k) => {
      const f = b[k]?.fontFamily;
      if (f && GOOGLE_FONTS_SET.has(f)) fonts.add(f);
    });
    (b.subBlocks || []).forEach(scan);
  }
  blocks.forEach(scan);
  return [...fonts];
}

const ChallengeEditor = {
  props: { block: Object },
  methods: {
    up(k, v) {
      this.$emit("change-block", { ...this.block, [k]: v });
    }
  },
  render(h) {
    const b = this.block;
    return h("div", { class: "block-body" }, [
      h("div", [h(Label, null, ["Tiêu đề"]), h(Inp, { props: { value: b.title, placeholder: "Challenge" }, on: { "input-value": (v) => this.up("title", v) } })]),
      h("div", [h(Label, null, ["Đoạn intro (tuỳ chọn)"]), h(RichTxa, { props: { value: b.intro, placeholder: "Nhập mô tả..." }, on: { "input-value": (v) => this.up("intro", v) } })]),
      h("div", [h(Label, null, ["Danh sách bullet"]), h(ListEditor, { props: { items: b.items || [] }, on: { "update-items": (items) => this.up("items", items) } })]),
      h("div", { class: "typo-section" }, [
        h("div", { class: "typo-section-header" }, ["Kiểu chữ"]),
        renderTypoRow(h, "Tiêu đề", b.titleTypo, (v) => this.up("titleTypo", v)),
        renderTypoRow(h, "Nội dung", b.bodyTypo, (v) => this.up("bodyTypo", v)),
      ])
    ]);
  }
};

const TextSectionEditor = {
  props: { block: Object },
  methods: {
    up(k, v) {
      this.$emit("change-block", { ...this.block, [k]: v });
    }
  },
  render(h) {
    const b = this.block;
    return h("div", { class: "block-body" }, [
      h("div", [h(Label, null, ["Tiêu đề"]), h(Inp, { props: { value: b.title, placeholder: "Tiêu đề..." }, on: { "input-value": (v) => this.up("title", v) } })]),
      h("div", [h(Label, null, ["Nội dung"]), h(RichTxa, { props: { value: b.body, placeholder: "Nội dung..." }, on: { "input-value": (v) => this.up("body", v) } })]),
      h("div", { class: "typo-section" }, [
        h("div", { class: "typo-section-header" }, ["Kiểu chữ"]),
        renderTypoRow(h, "Tiêu đề", b.titleTypo, (v) => this.up("titleTypo", v)),
        renderTypoRow(h, "Nội dung", b.bodyTypo, (v) => this.up("bodyTypo", v)),
      ])
    ]);
  }
};

const ImageEditor = {
  props: { block: Object },
  data() {
    return { uploading: false };
  },
  methods: {
    up(k, v) {
      this.$emit("change-block", { ...this.block, [k]: v });
    },
    hideOnError(e) {
      e.target.style.display = "none";
    },
    triggerUpload() {
      this.$refs.imgInput.click();
    },
    clearImage() {
      deletePendingUrl(this.block.url);
      this.up("url", "");
    },
    async handleFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const oldUrl = this.block.url;
      this.uploading = true;
      try {
        const res = await uploadImageMedia(file);
        if (res?.responseCode === 200 && res?.data?.url) {
          const newUrl = toFullUrl(res.data.url);
          _pendingImages.add(newUrl);
          if (oldUrl) deletePendingUrl(oldUrl);
          this.up("url", newUrl);
          this.$message.success("Tải ảnh thành công!");
        } else {
          this.$message.error(res?.message || "Tải ảnh thất bại!");
        }
      } catch (err) {
        this.$message.error("Lỗi khi tải ảnh!");
      } finally {
        this.uploading = false;
        e.target.value = "";
      }
    }
  },
  render(h) {
    const b = this.block;
    return h("div", { class: "block-body" }, [
      h("input", {
        ref: "imgInput",
        attrs: { type: "file", accept: "image/*" },
        style: { display: "none" },
        on: { change: this.handleFileChange }
      }),
      h("div", [
        h(Label, null, ["Hình ảnh"]),
        h("div", { style: { display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" } }, [
          h("button", {
            class: "btn-upload-img",
            attrs: { type: "button", disabled: this.uploading },
            on: { click: this.triggerUpload }
          }, [this.uploading ? "⏳ Đang tải..." : "📁 Chọn ảnh"]),
          b.url
            ? h("span", { style: { fontSize: "11px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px", display: "inline-block" } }, [b.url])
            : h("span", { style: { fontSize: "11px", color: "#9ca3af" } }, ["Chưa chọn ảnh"]),
          b.url
            ? h("button", {
                class: "btn-clear-img",
                attrs: { type: "button", title: "Xóa ảnh" },
                on: { click: this.clearImage }
              }, ["× Xóa"])
            : null
        ])
      ]),
      h("div", [h(Label, null, ["Alt text"]), h(Inp, { props: { value: b.alt, placeholder: "Mô tả hình..." }, on: { "input-value": (v) => this.up("alt", v) } })]),
      // Size controls
      h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" } }, [
        h("div", [
          h(Label, null, ["Cỡ rộng (" + (b.width || 100) + "%]"]),
          h("input", {
            attrs: { type: "range", min: 10, max: 100, step: 5, value: b.width || 100 },
            style: { width: "100%", accentColor: "#6366f1", cursor: "pointer" },
            on: { input: (e) => this.up("width", Number(e.target.value)) }
          })
        ]),
        h("div", [
          h(Label, null, ["Bo góc (" + (b.borderRadius !== undefined ? b.borderRadius : 8) + "px]"]),
          h("input", {
            attrs: { type: "range", min: 0, max: 48, step: 2, value: b.borderRadius !== undefined ? b.borderRadius : 8 },
            style: { width: "100%", accentColor: "#6366f1", cursor: "pointer" },
            on: { input: (e) => this.up("borderRadius", Number(e.target.value)) }
          })
        ])
      ]),
      h("div", { style: { marginTop: "6px" } }, [
        h(Label, null, ["Căn lề"]),
        h("div", { style: { display: "flex", gap: "6px", marginTop: "4px" } },
          [["left", "⇤ Trái"], ["center", "— Giữa"], ["right", "Phải ⇥"]].map(([val, label]) =>
            h("button", {
              class: "btn-align" + (b.align === val || (!b.align && val === "center") ? " active" : ""),
              attrs: { type: "button" },
              on: { click: () => this.up("align", val) }
            }, [label])
          )
        )
      ]),
      b.url
        ? h("img", { attrs: { src: b.url, alt: b.alt }, on: { error: this.hideOnError }, style: { display: "block", width: (b.width || 100) + "%", margin: b.align === "right" ? "8px 0 0 auto" : b.align === "left" ? "8px auto 0 0" : "8px auto 0", borderRadius: (b.borderRadius !== undefined ? b.borderRadius : 8) + "px", maxHeight: "120px", objectFit: "cover" } })
        : null
    ]);
  }
};

// ── SolutionEditor: defined outside BlockList, uses _BlockList forward ref ──
const SolutionEditor = {
  props: { block: Object },
  methods: {
    up(k, v) {
      this.$emit("change-block", { ...this.block, [k]: v });
    }
  },
  render(h) {
    const b = this.block;
    return h("div", { class: "block-body" }, [
      h("div", [
        h(Label, null, ["Feature sidebar items"]),
        h(ListEditor, { props: { items: b.featureItems || [] }, on: { "update-items": (items) => this.up("featureItems", items) } })
      ]),
      h("div", [
        h(Label, null, ["Tiêu đề solution"]),
        h(Inp, { props: { value: b.solutionTitle, placeholder: "Solution" }, on: { "input-value": (v) => this.up("solutionTitle", v) } })
      ]),
      h("div", [
        h(Label, null, ["Nội dung solution"]),
        h(RichTxa, { props: { value: b.solutionText, placeholder: "Nội dung..." }, on: { "input-value": (v) => this.up("solutionText", v) } })
      ]),
      h("div", { class: "typo-section" }, [
        h("div", { class: "typo-section-header" }, ["Kiểu chữ"]),
        renderTypoRow(h, "Tiêu đề", b.solutionTitleTypo, (v) => this.up("solutionTitleTypo", v)),
        renderTypoRow(h, "Nội dung", b.solutionBodyTypo, (v) => this.up("solutionBodyTypo", v)),
      ]),
      h("div", { class: "subblock-divider" }, [
        h("div", { class: "subblock-title" }, "Nội dung bên trong solution"),
        h(_BlockList, {
          props: { blocks: b.subBlocks || [], allowedTypes: ["image", "text-section", "challenge"], nested: true },
          on: { "change-blocks": (subs) => this.$emit("change-block", { ...b, subBlocks: subs }) }
        })
      ])
    ]);
  }
};

// ── BlockCard: defined outside BlockList for stable component identity ──
const BlockCard = {
  props: { block: Object, canMoveUp: Boolean, canMoveDown: Boolean, nested: Boolean },
  data() {
    return { open: true };
  },
  render(h) {
    const meta = TYPE_META[this.block.type] || { icon: "◻", color: "#94a3b8", label: this.block.type };
    const subtitle = this.block.title || this.block.solutionTitle || "";
    return h("div", {
      class: ["block-card", this.nested ? "nested" : ""],
      style: { borderColor: this.open ? meta.color + "55" : "#1e293b" }
    }, [
      h("div", { class: "block-header", on: { click: () => (this.open = !this.open) } }, [
        h("span", { class: "block-icon" }, meta.icon),
        h("span", { class: "block-label", style: { color: meta.color } }, [
          meta.label,
          subtitle ? h("span", { class: "block-subtitle" }, `— ${subtitle}`) : null
        ]),
        !this.nested
          ? h("div", { class: "block-move-btns", on: { click: (e) => e.stopPropagation() } }, [
              h("button", { attrs: { disabled: !this.canMoveUp }, on: { click: () => this.$emit("move", -1) } }, "↑"),
              h("button", { attrs: { disabled: !this.canMoveDown }, on: { click: () => this.$emit("move", 1) } }, "↓")
            ])
          : null,
        h("button", {
          class: "block-delete-btn",
          on: { click: (e) => { e.stopPropagation(); this.$emit("delete"); } }
        }, "×"),
        h("span", { class: "block-toggle" }, this.open ? "▲" : "▼")
      ]),
      this.open
        ? h("div", null, [
            this.block.type === "challenge"
              ? h(ChallengeEditor, { props: { block: this.block }, on: { "change-block": (b) => this.$emit("change", b) } })
              : this.block.type === "text-section"
              ? h(TextSectionEditor, { props: { block: this.block }, on: { "change-block": (b) => this.$emit("change", b) } })
              : this.block.type === "image"
              ? h(ImageEditor, { props: { block: this.block }, on: { "change-block": (b) => this.$emit("change", b) } })
              : this.block.type === "solution"
              ? h(SolutionEditor, { props: { block: this.block }, on: { "change-block": (b) => this.$emit("change", b) } })
              : null
          ])
        : null
    ]);
  }
};

const BlockList = {
  props: {
    blocks: { type: Array, default: () => [] },
    allowedTypes: { type: Array, default: null },
    nested: { type: Boolean, default: false }
  },
  data() {
    return { showPicker: false };
  },
  computed: {
    typeOptions() {
      return this.allowedTypes ? BLOCK_TYPES.filter((t) => this.allowedTypes.includes(t.type)) : BLOCK_TYPES;
    }
  },
  methods: {
    emit(blocks) {
      this.$emit("change-blocks", blocks);
    },
    addBlock(type) {
      const defaults = {
        challenge: { title: "New Section", intro: "", items: [""] },
        "text-section": { title: "Tiêu đề", body: "" },
        image: { url: "", alt: "" },
        solution: { featureItems: ["Feature 1"], solutionTitle: "Solution", solutionText: "", subBlocks: [] }
      };
      this.emit([...this.blocks, { id: uid(), type, ...defaults[type] }]);
      this.showPicker = false;
    },
    updateBlock(id, updated) {
      this.emit(this.blocks.map((b) => (b.id === id ? updated : b)));
    },
    removeBlock(id) {
      const block = this.blocks.find((b) => b.id === id);
      if (block) collectImageUrls(block).forEach((url) => deletePendingUrl(url));
      this.emit(this.blocks.filter((b) => b.id !== id));
    },
    moveBlock(i, dir) {
      const arr = this.blocks.slice();
      const j = i + dir;
      if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      this.emit(arr);
    }
  },
  render(h) {
    return h("div", null, [
      h("div", { style: { display: "flex", flexDirection: "column", gap: this.nested ? 0 : "10px" } },
        this.blocks.map((block, i) =>
          h(BlockCard, {
            key: block.id,
            props: { block, canMoveUp: i > 0, canMoveDown: i < this.blocks.length - 1, nested: this.nested },
            on: {
              move: (dir) => this.moveBlock(i, dir),
              delete: () => this.removeBlock(block.id),
              change: (updated) => this.updateBlock(block.id, updated)
            }
          })
        )
      ),
      h("div", { style: { marginTop: this.nested ? "8px" : "0" } }, [
        !this.showPicker
          ? h("button", { class: "add-block-btn", on: { click: () => { this.showPicker = true; } } }, "+ Thêm block")
          : h("div", { class: "block-picker" }, [
              h("div", { class: "block-picker-title" }, "Chọn loại block"),
              h("div", { class: "block-picker-options" },
                this.typeOptions.map((t) =>
                  h("button", { key: t.type, class: "picker-option", on: { click: () => this.addBlock(t.type) } }, [
                    h("span", { class: "picker-icon" }, t.icon),
                    h("span", null, t.label)
                  ])
                )
              ),
              h("button", { class: "btn btn-cancel", on: { click: () => { this.showPicker = false; } } }, "Huỷ")
            ])
      ])
    ]);
  }
};

// Assign forward reference so SolutionEditor can use BlockList for nested sub-blocks
_BlockList = BlockList;

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseHighlight(text) {
  return esc(text).replace(/\{\{(.+?)\}\}/g, (_, content) => `<span class="highlight">${content}</span>`);
}

function parseHighlightPreview(text, color) {
  return esc(text).replace(/\{\{(.+?)\}\}/g, (_, content) => {
    return `<span style="color:${esc(color)};font-weight:700">${content}</span>`;
  });
}

function typoStyle(typo) {
  if (!typo) return "";
  const parts = [];
  if (typo.fontSize) parts.push(`font-size:${typo.fontSize}px`);
  if (typo.fontFamily) parts.push(`font-family:'${typo.fontFamily}',sans-serif`);
  if (typeof typo.bold === "boolean") parts.push(`font-weight:${typo.bold ? "700" : "400"}`);
  if (typeof typo.italic === "boolean") parts.push(`font-style:${typo.italic ? "italic" : "normal"}`);
  return parts.length ? ` style="${parts.join(";")}"` : "";
}

function blockToHTML(block, indent) {
  const i = indent || "  ";

  if (block.type === "image") {
    if (!block.url) return i + "<!-- image placeholder -->";
    return i + `<div class="content-image">\n${i}  <img src="${esc(block.url)}" alt="${esc(block.alt || "")}">\n${i}</div>`;
  }
  if (block.type === "challenge") {
    const listHTML = (block.items || []).filter(Boolean).map((x) => `${i}    <li${typoStyle(block.bodyTypo)}>${esc(x)}</li>`).join("\n");
    const introContent = block.intro || "";
    // intro may contain rich HTML from RichTxa, pass it through
    return `${i}<div class="challenge-section">\n${i}  <h2${typoStyle(block.titleTypo)}>${esc(block.title)}</h2>\n${introContent ? `${i}  <div${typoStyle(block.bodyTypo)}>${introContent}</div>\n` : ""}${listHTML ? `${i}  <ul class="challenge-list">\n${listHTML}\n${i}  </ul>` : ""}\n${i}</div>`;
  }
  if (block.type === "text-section") {
    const bodyContent = block.body || "";
    return `${i}<div class="text-section">\n${i}  <h2${typoStyle(block.titleTypo)}>${esc(block.title)}</h2>\n${i}  <div${typoStyle(block.bodyTypo)}>${bodyContent}</div>\n${i}</div>`;
  }
  if (block.type === "solution") {
    const features = (block.featureItems || []).map((f) => `      <div class="feature-item">${esc(f)}</div>`).join("\n");
    const subHTML = (block.subBlocks || []).map((sb) => blockToHTML(sb, "      ")).join("\n");
    const solutionContent = block.solutionText || "";
    return `${i}<div class="solution-container">\n${i}  <div class="feature-sidebar">\n${features}\n${i}  </div>\n${i}  <div class="solution-content">\n${i}    <h2${typoStyle(block.solutionTitleTypo)}>${esc(block.solutionTitle)}</h2>\n${i}    <div${typoStyle(block.solutionBodyTypo)}>${solutionContent}</div>\n${subHTML}\n${i}  </div>\n${i}</div>`;
  }
  return "";
}

function generateHTML(meta, blocks) {
  const hl = meta.highlightColor;
  const bodyHTML = blocks.map((b) => blockToHTML(b)).join("\n\n");
  const titleMatch = meta.aboutText.match(/\{\{(.+?)\}\}/);
  const docTitle = titleMatch ? titleMatch[1] : "Case Study";

  // collect all used Google fonts (blocks + meta)
  const blockFonts = collectFontFamilies(blocks);
  const metaFonts = [meta.globalFont, meta.aboutTitleTypo?.fontFamily, meta.aboutBodyTypo?.fontFamily]
    .filter((f) => f && GOOGLE_FONTS_SET.has(f));
  const usedFonts = [...new Set([...blockFonts, ...metaFonts])];
  const fontLink = usedFonts.length
    ? `  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link href="https://fonts.googleapis.com/css2?${usedFonts.map((f) => "family=" + f.replace(/ /g, "+") + ":wght@400;500;700").join("&")}&display=swap" rel="stylesheet">\n`
    : "";

  const globalFontStack = meta.globalFont
    ? `'${meta.globalFont}', -apple-system, BlinkMacSystemFont, sans-serif`
    : "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

  const aboutH3Style = typoStyle(meta.aboutTitleTypo);
  const aboutPStyle = typoStyle(meta.aboutBodyTypo);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(docTitle)} - Case Study</title>
${fontLink}  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${globalFontStack}; background: #ffffff; color: #525252; }
    .content-wrapper { width: 100%; max-width: 960px; margin: 0 auto; padding: 60px 24px; }
    .about-section { margin-bottom: 60px; }
    .about-section h3 { font-weight: 700; font-size: 20px; line-height: 51px; color: #000; margin-bottom: 8px; }
    .about-section p { font-weight: 500; font-size: 16px; line-height: 26px; color: #525252; }
    .highlight { color: ${hl}; font-weight: 700; }
    .challenge-section { margin-bottom: 50px; }
    .text-section { margin-bottom: 40px; }
    .challenge-section h2, .text-section h2 { font-weight: 700; font-size: 32px; line-height: 40px; color: #000; margin-bottom: 16px; }
    .challenge-section p, .challenge-section div, .text-section p, .text-section div { font-weight: 500; font-size: 16px; line-height: 26px; color: #525252; margin-bottom: 12px; }
    .challenge-section a, .text-section a, .solution-content a { color: #6366f1; text-decoration: underline; }
    .challenge-list { list-style: none; padding: 0; margin: 16px 0 0 0; }
    .challenge-list li { font-weight: 500; font-size: 16px; line-height: 26px; color: #525252; padding-left: 16px; position: relative; margin-bottom: 6px; }
    .challenge-list li::before { content: '•'; position: absolute; left: 0; color: #525252; }
    .content-image { margin: 50px 0; }
    .content-image img { height: auto; }
    .solution-container { display: flex; gap: 60px; margin-bottom: 50px; align-items: flex-start; }
    .feature-sidebar { position: relative; padding-left: 24px; min-width: 200px; }
    .feature-sidebar::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: #d9d9d9; border-radius: 7px; }
    .feature-sidebar::after { content: ''; position: absolute; left: 0; top: 0; width: 2px; height: 18px; background: #000; border-radius: 7px; z-index: 1; }
    .feature-item { font-weight: 500; font-size: 14px; line-height: 20px; color: #525252; margin-bottom: 8px; }
    .solution-content { flex: 1; }
    .solution-content h2 { font-weight: 700; font-size: 32px; line-height: 40px; color: #000; margin-bottom: 16px; }
    .solution-content p, .solution-content > div { font-weight: 500; font-size: 16px; line-height: 26px; color: #525252; margin-bottom: 20px; }
    .solution-content .text-section h2 { font-size: 20px; line-height: 51px; margin-bottom: 8px; }
    .solution-content .challenge-section h2 { font-size: 24px; }
    @media (max-width: 768px) { .solution-container { flex-direction: column; } }
  </style>
</head>
<body>
  <div class="content-wrapper">

    <div id="about" class="about-section">
      <h3${aboutH3Style}>About The Project</h3>
      <p${aboutPStyle}>${parseHighlight(meta.aboutText)}</p>
    </div>

${bodyHTML}

  </div>
</body>
</html>
<!-- EDITOR_DATA:${JSON.stringify({ meta, blocks })} -->`;
}

function previewBlockHTML(block, hl) {
  if (block.type === "image") {
    if (!block.url) return "<div class=\"pv-image\"><div class=\"pv-image-placeholder\">🖼 Image placeholder</div></div>";
    const w = block.width || 100;
    const align = block.align || "center";
    const br = block.borderRadius !== undefined ? block.borderRadius : 8;
    const marginStyle = align === "left" ? "margin-right:auto" : align === "right" ? "margin-left:auto" : "margin-left:auto;margin-right:auto";
    return `<div class="pv-image" style="text-align:${align}"><img src="${esc(block.url)}" alt="${esc(block.alt || "")}" style="width:${w}%;border-radius:${br}px;${marginStyle};display:block" onerror="this.style.display='none'"></div>`;
  }
  if (block.type === "challenge") {
    const listItems = (block.items || []).filter(Boolean).map((x) => `<li${typoStyle(block.bodyTypo)}>${esc(x)}</li>`).join("");
    return `<div class="pv-challenge">
      <div class="pv-challenge-title"${typoStyle(block.titleTypo)}>${esc(block.title)}</div>
      ${block.intro ? `<div class="pv-challenge-intro"${typoStyle(block.bodyTypo)}>${block.intro}</div>` : ""}
      ${listItems ? `<ul class="pv-list">${listItems}</ul>` : ""}
    </div>`;
  }
  if (block.type === "text-section") {
    return `<div class="pv-text-section">
      <div class="pv-text-title"${typoStyle(block.titleTypo)}>${esc(block.title)}</div>
      <div class="pv-text-body"${typoStyle(block.bodyTypo)}>${block.body || ""}</div>
    </div>`;
  }
  if (block.type === "solution") {
    const featureItems = (block.featureItems || []).map((f) => `<div class="pv-sidebar-item">${esc(f)}</div>`).join("");
    const subHTML = (block.subBlocks || []).map((sb) => previewBlockHTML(sb, hl)).join("");
    return `<div class="pv-solution">
      <div class="pv-sidebar">${featureItems}</div>
      <div class="pv-solution-content">
        <div class="pv-solution-title"${typoStyle(block.solutionTitleTypo)}>${esc(block.solutionTitle)}</div>
        <div class="pv-solution-text"${typoStyle(block.solutionBodyTypo)}>${block.solutionText || ""}</div>
        ${subHTML}
      </div>
    </div>`;
  }
  return "";
}

export default {
  name: "CaseStudyEditor",
  components: {
    BlockList
  },
  data() {
    return {
      meta: {
        aboutText: "Welcome to {{Streamie}}, an exciting adventure where players explore a world filled with challenges, mysteries, and rewards.",
        highlightColor: "#f05252",
        globalFont: "",
        aboutTitleTypo: { fontFamily: "", fontSize: 20, bold: true, italic: false },
        aboutBodyTypo: { fontFamily: "", fontSize: 16, bold: false, italic: false },
      },
      blocks: JSON.parse(JSON.stringify(DEFAULT_BLOCKS)),
      tab: "preview",
      copied: false,
      tabs: [
        { id: "preview", label: "👁 Preview" },
        { id: "code", label: "</> HTML" }
      ]
    };
  },
  mounted() {
    this._beforeUnloadHandler = () => {
      _pendingImages.forEach((url) => {
        const path = relPathFromUrl(url);
        if (path) {
          const body = JSON.stringify(path);
          const blob = new Blob([body], { type: "application/json" });
          navigator.sendBeacon
            ? navigator.sendBeacon(FILE_API_BASE.replace(/\/$/, "") + "/api/File/DeleteFileOnLanding", blob)
            : null;
        }
      });
    };
    window.addEventListener("beforeunload", this._beforeUnloadHandler);
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this._beforeUnloadHandler);
    const urls = [..._pendingImages];
    urls.forEach((url) => deletePendingUrl(url));
  },
  computed: {
    fontFamilies() {
      return FONT_FAMILIES;
    },
    htmlOutput() {
      return generateHTML(this.meta, this.blocks);
    },
    previewHtml() {
      const gf = this.meta.globalFont;
      const wrapStyle = gf ? ` style="font-family:'${gf}',sans-serif"` : "";
      const titleStyle = typoStyle(this.meta.aboutTitleTypo);
      const bodyStyle = typoStyle(this.meta.aboutBodyTypo);
      let html = `<div${wrapStyle}>
        <div class="pv-about">
          <div class="pv-about-title"${titleStyle}>About The Project</div>
          <p class="pv-about-text"${bodyStyle}>${parseHighlightPreview(this.meta.aboutText, this.meta.highlightColor)}</p>
        </div>
      `;
      this.blocks.forEach((b) => {
        html += previewBlockHTML(b, this.meta.highlightColor);
      });
      html += "</div>";
      return html;
    }
  },
  methods: {
    download() {
      // mark all current image URLs as saved (don't delete on destroy)
      this.blocks.forEach((b) => collectImageUrls(b).forEach((url) => _pendingImages.delete(url)));
      const html = this.htmlOutput;
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const titleMatch = this.meta.aboutText.match(/\{\{(.+?)\}\}/);
      const filename = titleMatch ? titleMatch[1].toLowerCase().replace(/\s+/g, "-") : "case-study";
      a.download = `${filename}.html`;
      a.click();
      URL.revokeObjectURL(url);
    },
    loadFromFile() {
      this.$refs.loadFileInput.click();
    },
    onLoadFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result;
        const match = text.match(/<!--\s*EDITOR_DATA:(.*?)\s*-->\s*$/s);
        if (!match) {
          this.$message ? this.$message.error("File HTML này không có dữ liệu editor!") : alert("File HTML này không có dữ liệu editor (thiếu EDITOR_DATA)!");
          return;
        }
        try {
          const data = JSON.parse(match[1]);
          if (data.meta) this.meta = { ...this.meta, ...data.meta };
          if (data.blocks) {
            // reassign fresh ids to avoid collisions
            const reassign = (b) => ({ ...b, id: uid(), subBlocks: b.subBlocks ? b.subBlocks.map(reassign) : undefined });
            this.blocks = data.blocks.map(reassign);
          }
          this.$message ? this.$message.success("Đã load dữ liệu từ file HTML!") : alert("Đã load xong!");
        } catch {
          this.$message ? this.$message.error("Parse dữ liệu thất bại!") : alert("Lỗi parse JSON!");
        }
      };
      reader.readAsText(file);
      // reset input so same file can be re-selected
      e.target.value = "";
    },
    copyCode() {
      if (!navigator.clipboard) return;
      // mark all current image URLs as saved
      this.blocks.forEach((b) => collectImageUrls(b).forEach((url) => _pendingImages.delete(url)));
      navigator.clipboard.writeText(this.htmlOutput);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    }
  }
};
</script>

<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

.case-study-root {
  font-family: 'Inter', system-ui, sans-serif;
  background: #f8fafc;
  color: #334155;
  height: 100vh;
  overflow: hidden;
  display: flex;
}

#left-panel {
  width: 400px;
  min-width: 320px;
  background: #fff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

#panel-header {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #faf5ff, #eef2ff);
}

#panel-header .logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
  color: #fff;
  box-shadow: 0 2px 8px rgba(99,102,241,.3);
}

#panel-header .title { font-size: 13px; font-weight: 700; color: #1e293b; }
#panel-header .subtitle { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; }

#panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

#panel-footer {
  padding: 12px 14px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  background: #fafbfc;
}

#right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fafbfc;
}

#tab-bar {
  padding: 8px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

#tab-bar span {
  margin-left: auto;
  font-size: 10.5px;
  color: #c7d2fe;
  font-weight: 500;
}

#right-content { flex: 1; overflow: auto; }

#preview-area {
  background: #f8fafc;
  min-height: 100%;
  font-family: Georgia, 'Times New Roman', serif;
  padding: 36px 32px;
  font-size: 14px;
  color: #525252;
}

#code-area {
  padding: 24px;
  font-size: 11px;
  line-height: 1.75;
  color: #64748b;
  background: #f8fafc;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  min-height: 100%;
}

label.field-label {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 5px;
  font-family: 'Inter', system-ui, sans-serif;
}

.meta-select {
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  font-size: 12.5px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: border-color .2s;
}
.meta-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }

input[type="text"], textarea {
  width: 100%;
  padding: 8px 11px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  font-size: 12.5px;
  outline: none;
  font-family: inherit;
  transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box;
}
input[type="text"]:focus, textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
textarea { resize: vertical; line-height: 1.6; display: block; }

.meta-box {
  margin-bottom: 14px;
  padding: 14px;
  background: linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%);
  border-radius: 12px;
  border: 1px solid #e0e7ff;
}

.meta-box .section-title {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #6366f1;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-box .section-title .bar {
  width: 3px;
  height: 12px;
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  border-radius: 2px;
  display: inline-block;
}

.field-group { display: flex; flex-direction: column; gap: 10px; }
.field-row { display: flex; gap: 8px; align-items: center; }

.blocks-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #c7d2fe;
  margin-bottom: 10px;
  padding-left: 2px;
}

.block-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  margin-bottom: 10px;
  overflow: hidden;
  transition: border-color .2s, box-shadow .2s;
}
.block-card:hover { box-shadow: 0 2px 8px rgba(99,102,241,.06); }
.block-card.nested { background: #f8fafc; margin-bottom: 8px; }

.block-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fafbfc;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #f1f5f9;
}
.block-card.nested .block-header { background: #f1f5f9; }

.block-icon { font-size: 14px; }
.block-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
  flex: 1;
}
.block-subtitle { color: #94a3b8; font-weight: 400; text-transform: none; margin-left: 6px; }

.block-move-btns { display: flex; gap: 2px; }
.block-move-btns button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 13px;
  padding: 0 3px;
  line-height: 1;
}
.block-move-btns button:disabled { color: #e2e8f0; cursor: default; }

.block-delete-btn {
  background: none;
  border: none;
  color: #fca5a5;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0 3px;
}
.block-delete-btn:hover { color: #ef4444; }

.block-toggle { color: #c7d2fe; font-size: 11px; }

.block-body { padding: 14px; display: flex; flex-direction: column; gap: 12px; }
.block-body.hidden { display: none; }

.btn {
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  border: 1px dashed #c7d2fe;
  background: none;
  color: #6366f1;
  transition: all .15s;
}
.btn:hover { border-color: #6366f1; background: #eef2ff; }
.btn-cancel { width: 100%; margin-top: 8px; }

.btn-align {
  flex: 1;
  padding: 4px 6px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  background: #fff;
  color: #64748b;
  font-size: 11px;
  font-family: inherit;
  transition: all .15s;
}
.btn-align.active { border-color: #6366f1; color: #6366f1; background: #eef2ff; }
.btn-align:hover:not(.active) { border-color: #c7d2fe; color: #6366f1; }

.typo-section {
  margin-top: 10px;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
}
.typo-section-header {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: #94a3b8;
  margin-bottom: 6px;
}
.typo-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
}
.typo-row:last-child { margin-bottom: 0; }
.typo-row-label {
  font-size: 10px;
  color: #94a3b8;
  min-width: 46px;
  flex-shrink: 0;
}
.typo-select {
  flex: 1;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  font-size: 11px;
  padding: 3px 4px;
  font-family: inherit;
  cursor: pointer;
}
.typo-select:focus { outline: none; border-color: #6366f1; }
.typo-size {
  width: 44px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  font-size: 11px;
  padding: 3px 5px;
  font-family: inherit;
  appearance: textfield;
  -moz-appearance: textfield;
}
.typo-size::-webkit-inner-spin-button { display: none; }
.typo-size:focus { outline: none; border-color: #6366f1; }
.typo-unit { font-size: 10px; color: #94a3b8; flex-shrink: 0; }
.typo-btn {
  width: 26px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #94a3b8;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1;
  transition: all .15s;
}
.typo-btn.typo-italic { font-style: italic; }
.typo-btn.active { border-color: #6366f1; color: #6366f1; background: #eef2ff; }
.typo-btn:hover:not(.active) { border-color: #c7d2fe; color: #6366f1; }

.btn-clear-img {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #fecaca;
  cursor: pointer;
  background: #fef2f2;
  color: #ef4444;
  font-size: 11px;
  font-family: inherit;
  white-space: nowrap;
  transition: all .15s;
}
.btn-clear-img:hover { border-color: #ef4444; background: #fee2e2; }

.btn-upload-img {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  background: #fff;
  color: #475569;
  font-size: 12px;
  font-family: inherit;
  white-space: nowrap;
  transition: all .15s;
}
.btn-upload-img:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
.btn-upload-img:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-load {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  background: #fff;
  color: #6366f1;
  font-weight: 600;
  font-size: 12.5px;
  font-family: inherit;
  transition: all .2s;
}
.btn-load:hover { background: #eef2ff; border-color: #c7d2fe; }

.btn-primary {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  color: #fff;
  font-weight: 700;
  font-size: 12.5px;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(99,102,241,.25);
  transition: all .2s;
}
.btn-primary:hover { box-shadow: 0 4px 12px rgba(99,102,241,.35); transform: translateY(-1px); }

.btn-copy {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  background: #fff;
  color: #64748b;
  font-weight: 600;
  font-size: 12.5px;
  font-family: inherit;
  transition: all .2s;
}
.btn-copy:hover { border-color: #c7d2fe; color: #6366f1; }
.btn-copy.copied { color: #10b981; border-color: #a7f3d0; background: #f0fdf4; }

.btn-tab {
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  background: none;
  color: #94a3b8;
  transition: all .2s;
}
.btn-tab.active { background: linear-gradient(135deg, #eef2ff, #f5f3ff); color: #6366f1; }
.btn-tab:hover:not(.active) { color: #6366f1; }

.add-block-btn {
  width: 100%;
  padding: 8px;
  border-radius: 10px;
  border: 1px dashed #c7d2fe;
  background: none;
  color: #6366f1;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  margin-top: 0;
  transition: all .15s;
}
.add-block-btn:hover { border-color: #6366f1; background: #eef2ff; }

.block-picker {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  margin-top: 0;
}
.block-picker-title {
  font-size: 10.5px;
  color: #94a3b8;
  margin-bottom: 8px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
}
.block-picker-options { display: flex; flex-direction: column; gap: 6px; }
.picker-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  color: #334155;
  font-size: 12.5px;
  font-family: inherit;
  text-align: left;
  transition: all .15s;
}
.picker-option:hover { border-color: #6366f1; background: #eef2ff; color: #6366f1; }
.picker-option .picker-icon { font-size: 16px; }

.list-editor { display: flex; flex-direction: column; gap: 6px; }
.list-item-row { display: flex; gap: 5px; align-items: center; }
.list-move-col { display: flex; flex-direction: column; }
.list-move-col button {
  background: none;
  border: none;
  color: #c7d2fe;
  cursor: pointer;
  font-size: 9px;
  line-height: 1;
  padding: 1px 3px;
}
.list-move-col button:hover { color: #6366f1; }
.list-bullet { color: #6366f1; font-size: 11px; min-width: 10px; }
.list-item-row .item-input { flex: 1; }
.list-remove-btn {
  background: none;
  border: none;
  color: #fca5a5;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0 3px;
}
.list-remove-btn:hover { color: #ef4444; }

.subblock-divider {
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
  margin-top: 2px;
}
.subblock-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 8px;
}

.pv-about { margin-bottom: 28px; }
.pv-about-title { font-weight: 700; font-size: 16px; line-height: 44px; color: #0f172a; font-family: sans-serif; }
.pv-about-text { font-size: 13px; line-height: 22px; font-family: sans-serif; }

.pv-challenge { margin-bottom: 24px; }
.pv-challenge-title { font-weight: 700; font-size: 20px; color: #0f172a; margin-bottom: 8px; }
.pv-challenge-intro { font-size: 13px; line-height: 22px; color: #525252; margin-bottom: 8px; }
.pv-list { list-style: none; padding: 0; margin: 0; }
.pv-list li { font-size: 13px; line-height: 22px; color: #525252; padding-left: 14px; position: relative; margin-bottom: 4px; }
.pv-list li::before { content: '•'; position: absolute; left: 0; }

.pv-text-section { margin-bottom: 16px; }
.pv-text-title { font-weight: 700; font-size: 15px; line-height: 40px; color: #0f172a; }
.pv-text-body { font-size: 13px; line-height: 22px; color: #525252; }

.pv-image { margin: 16px 0; }
.pv-image img { width: 100%; border-radius: 10px; display: block; }
.pv-image-placeholder {
  height: 56px;
  border-radius: 10px;
  border: 1px dashed #c7d2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #faf5ff;
  font-size: 11px;
  color: #a78bfa;
}

.pv-solution { display: flex; gap: 24px; margin-bottom: 24px; }
.pv-sidebar { position: relative; padding-left: 16px; min-width: 130px; }
.pv-sidebar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
  border-radius: 7px;
}
.pv-sidebar::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: 14px;
  background: #6366f1;
  border-radius: 7px;
}
.pv-sidebar-item { font-size: 12px; color: #525252; margin-bottom: 6px; }
.pv-solution-content { flex: 1; }
.pv-solution-title { font-weight: 700; font-size: 20px; color: #0f172a; margin-bottom: 8px; }
.pv-solution-text { font-size: 13px; line-height: 22px; color: #525252; margin-bottom: 12px; }

input[type="color"] {
  width: 32px;
  height: 32px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  background: none;
  padding: 2px;
  flex-shrink: 0;
}

/* ── Rich Text Editor (RichTxa) ── */
.rich-txa-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: border-color .2s, box-shadow .2s;
}
.rich-txa-wrap:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.08);
}
.rich-txa-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.rtb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 24px;
  border-radius: 5px;
  border: none;
  background: none;
  color: #64748b;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all .12s;
}
.rtb:hover { background: #eef2ff; color: #6366f1; }
.rtb:active { background: #e0e7ff; }
.rtb-bold { font-weight: 800; }
.rtb-italic { font-style: italic; }
.rtb-sep {
  width: 1px;
  height: 16px;
  background: #e2e8f0;
  margin: 0 2px;
}
.rtb-color-wrap {
  position: relative;
  display: inline-flex;
}
.rtb-color-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
.rich-txa-content {
  min-height: 60px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px 11px;
  font-size: 12.5px;
  line-height: 1.6;
  color: #334155;
  outline: none;
  font-family: inherit;
}
.rich-txa-content.is-empty::before {
  content: attr(data-placeholder);
  color: #cbd5e1;
  pointer-events: none;
}
.rich-txa-content a { color: #6366f1; text-decoration: underline; }
.rich-txa-content ul, .rich-txa-content ol { padding-left: 18px; margin: 4px 0; }
.rich-txa-content li { margin-bottom: 2px; }

/* Preview rich text styles */
.pv-challenge-intro a, .pv-text-body a, .pv-solution-text a { color: #6366f1; text-decoration: underline; }
.pv-challenge-intro ul, .pv-text-body ul, .pv-solution-text ul,
.pv-challenge-intro ol, .pv-text-body ol, .pv-solution-text ol { padding-left: 20px; margin: 4px 0; }
</style>
