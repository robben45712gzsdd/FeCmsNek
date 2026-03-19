import axios from "axios";
export function login(body) {
<<<<<<< HEAD
  const url = "/api/Auth/Login";
=======
  const url = "/cms/login";
>>>>>>> feature_khuong_dev
  return new Promise((resolve, reject) => {
    axios
      .post(url, body)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
