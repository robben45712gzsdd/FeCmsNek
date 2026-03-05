import axios from "axios";

export function getListPromptCms(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Prompt/GetListPromptCms", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getDetailPrompt(contentPromptId) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Prompt/GetDetailPrompt", { params: { contentPromptId } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function createPrompt(data) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Prompt/CreatePrompt", data)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function updatePrompt(data) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Prompt/UpdatePrompt", data)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function deletePrompt(contentPromptId) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Prompt/DeletePrompt", null, { params: { contentPromptId } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}
