import axios from "axios";

const fileAxios = axios.create({
  baseURL: process.env.NUXT_ENV_FILE_API_URL,
  headers: { "Content-Type": "multipart/form-data" },
});

// Forward auth token for file API
if (process.client) {
  fileAxios.interceptors.request.use((config) => {
    const token = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    if (token) config.headers.Authorization = `Bearer ${token[1]}`;
    return config;
  });
}

export function uploadImageMedia(file) {
  const formData = new FormData();
  formData.append("file", file);
  return fileAxios
    .post("/api/File/SaveFileMedia", formData)
    .then((res) => res.data);
}

export function deleteImageMedia(filePath) {
  return fileAxios
    .post("/api/File/DeleteFileOnLanding", JSON.stringify(filePath), {
      headers: { "Content-Type": "application/json" },
    })
    .then((res) => res.data)
    .catch(() => {});
}

export function uploadImageToFolder(file, parentFolder = "case-study", customFolder = "images") {
  const formData = new FormData();
  formData.append("file", file);
  return fileAxios
    .post(`/api/File/UploadFile/${parentFolder}/${customFolder}`, formData)
    .then((res) => res.data);
}

export function getListMedia() {
  return fileAxios.get("/api/File/GetListMedia").then((res) => res.data);
}

export function GetListFile(params) {
  const url = "/cms/files/GetListFile";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}
export function getDetailFile(refId) {
  const url = "/cms/files/GetDetailFile";
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params: { refId} })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}
export function uploadFile(formData) {
  const url = "/cms/files/Upload";
  return new Promise((resolve, reject) => {
    axios
      .post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}
