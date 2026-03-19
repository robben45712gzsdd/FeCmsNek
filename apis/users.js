import axios from "axios";

export function getListUsersByCustomer(params) {
  const url = "/cms/user/GetListUserByCustomer";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

export function lockUser(params) {
  const url = "/cms/user/LockUser";
  return new Promise((resolve, reject) => {
    axios
      .post(url, null, { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

export function unlockUser(params) {
  const url = "/cms/user/UnlockUser";
  return new Promise((resolve, reject) => {
    axios
      .post(url, null, { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

export function getOverviewByUser(params) {
  const url = "/cms/user/GetOverviewByUser";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

export function updateBalanceResult(data) {
  const url = "/cms/user/UpdateBalanceResult";
  return new Promise((resolve, reject) => {
    axios
      .post(url, data)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

export function retryUpdateBalance(data) {
  const url = "/cms/user/RetryUpdateBalance";
  return new Promise((resolve, reject) => {
    axios
      .post(url, data)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

export function getLogProviderByUser(params) {
  const url = "/cms/user/GetLogProviderByUser";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

export function getListTransaction(params) {
  const url = "/cms/user/GetListTransaction";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

export function updateInformationUser(userId, data) {
  const url = "/cms/user/UpdateInformationUser";
  return new Promise((resolve, reject) => {
    axios
      .post(url, data, { params: { userId } })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}
