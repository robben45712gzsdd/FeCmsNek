import axios from "axios";

export function getOverviewSummary(params) {
  const url = "/cms/overview/GetOverviewSummary";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

export function getProviders(params) {
  const url = "/cms/overview/GetListProvider";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}
