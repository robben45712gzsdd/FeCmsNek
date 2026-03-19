import Cookies from "js-cookie";

const expiredTimeToken = 8;

export default {
  state: () => ({
    isLoggedIn: !!Cookies.get("accessToken"),
    accessToken: Cookies.get("accessToken") || null,
    refreshToken: Cookies.get("refreshToken") || null,
    displayName: Cookies.get("displayName") || null,
  }),
  // Getters
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
    accessToken: (state) => state.accessToken,
    refreshToken: (state) => state.refreshToken,
    displayName: (state) => state.displayName,
  },
  // Mutations
  mutations: {
    setIsLoggedIn(state, isLoggedIn) {
      state.isLoggedIn = isLoggedIn;
    },
    setAccessToken(state, accessToken) {
      state.accessToken = accessToken;
    },
    setRefreshToken(state, refreshToken) {
      state.refreshToken = refreshToken;
    },
    setDisplayName(state, displayName) {
      state.displayName = displayName;
    },
  },
  // Actions
  actions: {
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
    },

    logout({ commit }) {
      commit("setIsLoggedIn", false);
      commit("setAccessToken", null);
      commit("setRefreshToken", null);
      commit("setDisplayName", null);

      // Xóa cookies
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("displayName");
    },

    initAuth({ commit }) {
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
      if (displayName) {
        commit("setDisplayName", displayName);
      }
    },
  },
};
