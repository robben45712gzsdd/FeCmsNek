import Cookies from "js-cookie";

const expiredTimeToken = 8;

export default {
  state: () => ({
<<<<<<< HEAD
    isLoggedIn: !!Cookies.get("accessToken"),
    accessToken: Cookies.get("accessToken") || null,
    refreshToken: Cookies.get("refreshToken") || null,
=======
    isLoggedIn: !!Cookies.get("token"),
    token: Cookies.get("token") || null,
>>>>>>> feature_khuong_dev
    displayName: Cookies.get("displayName") || null,
  }),
  // Getters
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
<<<<<<< HEAD
    accessToken: (state) => state.accessToken,
    refreshToken: (state) => state.refreshToken,
=======
    token: (state) => state.token,
>>>>>>> feature_khuong_dev
    displayName: (state) => state.displayName,
  },
  // Mutations
  mutations: {
    setIsLoggedIn(state, isLoggedIn) {
      state.isLoggedIn = isLoggedIn;
    },
<<<<<<< HEAD
    setAccessToken(state, accessToken) {
      state.accessToken = accessToken;
    },
    setRefreshToken(state, refreshToken) {
      state.refreshToken = refreshToken;
=======
    setToken(state, token) {
      state.token = token;
>>>>>>> feature_khuong_dev
    },
    setDisplayName(state, displayName) {
      state.displayName = displayName;
    },
  },
  // Actions
  actions: {
<<<<<<< HEAD
    login({ commit }, { accessToken, refreshToken, displayName }) {
      commit("setIsLoggedIn", true);
      commit("setAccessToken", accessToken);
      commit("setRefreshToken", refreshToken);
      commit("setDisplayName", displayName);

      // Lưu cookies (thời hạn 8 ngày)
      Cookies.set("accessToken", accessToken, { expires: expiredTimeToken });
      Cookies.set("refreshToken", refreshToken, { expires: expiredTimeToken });
      Cookies.set("displayName", displayName, { expires: expiredTimeToken });

      return { accessToken, refreshToken, displayName };
=======
    login({ commit }, { token, displayName }) {
      // Cập nhật state
      commit("setIsLoggedIn", true);
      commit("setToken", token);
      commit("setDisplayName", displayName);

      // Lưu cookies (thời hạn 8 ngày)
      Cookies.set("token", token, { expires: expiredTimeToken });
      Cookies.set("displayName", displayName, { expires: expiredTimeToken });

      return { token, displayName } 
>>>>>>> feature_khuong_dev
    },

    logout({ commit }) {
      commit("setIsLoggedIn", false);
<<<<<<< HEAD
      commit("setAccessToken", null);
      commit("setRefreshToken", null);
      commit("setDisplayName", null);

      // Xóa cookies
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
=======
      commit("setToken", null);
      commit("setDisplayName", null);

      // Xóa cookies
      Cookies.remove("token");
>>>>>>> feature_khuong_dev
      Cookies.remove("displayName");
    },

    initAuth({ commit }) {
<<<<<<< HEAD
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");
      const displayName = Cookies.get("displayName");

      if (accessToken) {
        commit("setIsLoggedIn", true);
        commit("setAccessToken", accessToken);
      }
      if (refreshToken) {
        commit("setRefreshToken", refreshToken);
      }
=======
      const token = Cookies.get("token");
      const displayName = Cookies.get("displayName");

      if (token) {
        commit("setIsLoggedIn", true);
        commit("setToken", token);
      }

>>>>>>> feature_khuong_dev
      if (displayName) {
        commit("setDisplayName", displayName);
      }
    },
  },
};
