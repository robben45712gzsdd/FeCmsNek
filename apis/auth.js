import axios from "axios";
export function login(body) {
  const url = "/cms/login";
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
