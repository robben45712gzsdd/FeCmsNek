import axios from "axios";


export function getListLogTransaction(params) {
  const url = "/cms/log/GetListLogTransactionByCustomer";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}


export function getListLogErrorBoard(params) {
  const url = "/cms/log/GetListLogErrorBoard";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

export function getLogPlayByCustomer(params) {
  const url = "/cms/log/GetLogPlayByCustomer";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}


export function getLogErrorDetail(id) {
  const url = "/cms/log/GetLogErrorDetail";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params: { id } })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}


export function getLogPlayBoardDetail(gameHistoryId) {
  const url = "/cms/log/GetLogPlayBoardDetail";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params: { gameHistoryId } })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}


export function getLogDepositDetail(id) {
  const url = "/cms/log/GetLogDepositBoardDetail";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params: { id } })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}
