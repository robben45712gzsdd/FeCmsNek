import Cookies from "js-cookie";

const expiredTimeToken = 8;

export default {
  state: () => ({
    isLoggedIn: !!Cookies.get("token"),
    token: Cookies.get("token") || null,
    displayName: Cookies.get("displayName") || null,
  }),
  // Getters
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
    token: (state) => state.token,
    displayName: (state) => state.displayName,
  },
  // Mutations
  mutations: {
    setIsLoggedIn(state, isLoggedIn) {
      state.isLoggedIn = isLoggedIn;
    },
    setToken(state, token) {
      state.token = token;
    },
    setDisplayName(state, displayName) {
      state.displayName = displayName;
    },
  },
  // Actions
  actions: {
    login({ commit }, { token, displayName }) {
      // Cập nhật state
      commit("setIsLoggedIn", true);
      commit("setToken", token);
      commit("setDisplayName", displayName);

      // Lưu cookies (thời hạn 8 ngày)
      Cookies.set("token", token, { expires: expiredTimeToken });
      Cookies.set("displayName", displayName, { expires: expiredTimeToken });

      return { token, displayName } 
    },

    logout({ commit }) {
      commit("setIsLoggedIn", false);
      commit("setToken", null);
      commit("setDisplayName", null);

      // Xóa cookies
      Cookies.remove("token");
      Cookies.remove("displayName");
    },

    initAuth({ commit }) {
      const token = Cookies.get("token");
      const displayName = Cookies.get("displayName");

      if (token) {
        commit("setIsLoggedIn", true);
        commit("setToken", token);
      }

      if (displayName) {
        commit("setDisplayName", displayName);
      }
    },
  },
};
