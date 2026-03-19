import axios from "axios";
import Cookies from "js-cookie";
import Vue from "vue";
import { Modal } from "ant-design-vue";

export default ({ app }, inject) => {
  const { $i18n } = app;
  axios.defaults.baseURL = process.env.NUXT_ENV_BASE_URL;
  axios.defaults.headers["Content-Type"] = "application/json";

  axios.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error?.response?.status;
      
 
      if (status === 403 && process.client) {
        window.location.href = "/403";
      }
      if (
        status === 401 &&
        process.client &&
        !Vue.prototype.$isSessionExpired
      ) {
        Vue.prototype.$isSessionExpired = true;
        Modal.warning({
          title: $i18n ? $i18n.t("sessionExpired.title") : "Session expired",
          content: $i18n
            ? $i18n.t("sessionExpired.content")
            : "Please log in again.",
          okText: $i18n ? $i18n.t("sessionExpired.ok") : "OK",
          centered: true,
          maskClosable: false,
          onOk() {
            Cookies.remove("token");
            Cookies.remove("displayName");
            Vue.prototype.$isSessionExpired = false;
            window.location.href = "/login";
          },
        });
      }
      return Promise.reject(error);
    }
  );
};
