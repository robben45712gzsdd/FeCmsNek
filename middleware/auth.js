<<<<<<< HEAD
import Cookies from "js-cookie";

export default function ({ route, redirect }) {
  const accessToken = Cookies.get("accessToken");
  const isLoginPage = route.path === "/login" || route.path === "/Login";

  // Chưa đăng nhập → redirect về login (trừ khi đang ở login)
  if (!accessToken && !isLoginPage) {
    return redirect("/login");
  }

  // Đã đăng nhập mà vào login → redirect về overview
  if (accessToken && isLoginPage) {
    return redirect("/overview");
  }
=======
export default function () {
  // Đã tắt kiểm tra đăng nhập, luôn cho phép vào thẳng
>>>>>>> feature_khuong_dev
}
