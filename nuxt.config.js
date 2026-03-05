export default {
  ssr: false,
  
  server: {
    host: '127.0.0.1',
    port: 3005
  },
  
  head: {
    title: process.env.npm_package_name || "",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || "",
      },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],

    // 👇 Thêm phần này
    script: [
      {
        src: "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
        defer: true,
      },
    ],
  },

  css: [
    "ant-design-vue/dist/antd.css",
    "@/assets/css/global.css",
    "leaflet/dist/leaflet.css",
  ],

  plugins: ["@/plugins/antd-ui", "@/plugins/i18n", "@/plugins/axios"],

  router: {
    middleware: ["auth"],
  },

  modules: ["@nuxtjs/axios", "@nuxtjs/dotenv"],

  axios: {
    baseURL: process.env.NUXT_ENV_BASE_URL,
  },

  build: {
    postcss: {
      postcssOptions: {
        plugins: {
          autoprefixer: {},
        },
      },
    },
    extend(config, ctx) {},
  },
};
