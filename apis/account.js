import axios from "axios";

export function getAccountDetail() {
  const url = "/cms/overview/GetAccountDetail";
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
  }
