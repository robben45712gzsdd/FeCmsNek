import axios from "axios";

// AIDemo - API Key Request
export function approveApiKeyRequest(body) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/AIDemo/ApproveApiKeyRequest", body)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function rejectApiKeyRequest(body) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/AIDemo/RejectApiKeyRequest", body)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// AIDemo - API Key
export function getListApiKey(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/AIDemo/GetListApiKey", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getListApiKeyRequest(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/AIDemo/GetListApiKeyRequest", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getDetailApiKey(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/AIDemo/GetDetailApiKey", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getDetailApiKeyRequest(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/AIDemo/GetDetailApiKeyRequest", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function updateApiKeyStatus(body) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/AIDemo/UpdateApiKeyStatus", body)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// AIDemo - Label
export function getListLabelCMS(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/AIDemo/GetListLabelCMS", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getListCategoryGroup(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/AIDemo/GetListCategoryGroup", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getDetailLabel(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/AIDemo/GetDetailLabel", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function createLabel(body) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/AIDemo/CreateLabel", body)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function updateLabel(body) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/AIDemo/UpdateLabel", body)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function deleteLabel(body) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/AIDemo/DeleteLabel", body)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// AIDemo - AI
export function getListAICMS(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/AIDemo/GetListAICMS", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getDetailAI(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/AIDemo/GetDetailAI", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function createAI(body) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/AIDemo/CreateAI", body)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function updateAI(body) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/AIDemo/UpdateAI", body)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function deleteAI(body) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/AIDemo/DeleteAI", body)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}