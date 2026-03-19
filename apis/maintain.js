import axios from "axios";
export function UpdateStatusProvider(body) {
  const url = "cms/maintain/UpdateStatusProvider";
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
