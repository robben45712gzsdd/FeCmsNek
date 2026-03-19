import Cookies from "js-cookie";

export default function ({ route, redirect }) {
  const accessToken = Cookies.get("accessToken");
  const isLoginPage = route.path === "/login" || route.path === "/Login";

  // Chưa vàng nhập �?' redirect về login (trừ khi �'ang �Y login)
  if (!accessToken && !isLoginPage) {
    return redirect("/login");
  }

  // Đã vàng nhập mà vào login �?' redirect về overview
  if (accessToken && isLoginPage) {
    return redirect("/overview");
  }
}
