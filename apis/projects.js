import axios from "axios";

export function getProjectList(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Project/GetProjectListPaging", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getProjectDetail(projectId, languageCode = "vi") {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Project/GetProjectDetail", { params: { projectId, languageCode } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function addProject(formData) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Project/CreateProject", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function updateProject(params, thumbnailFile, bodyFile, imageFile) {
  const fd = new FormData();
  if (thumbnailFile) fd.append("thumbnail", thumbnailFile);
  if (bodyFile) fd.append("projectBody", bodyFile);
  if (imageFile) fd.append("image", imageFile);
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Project/UpdateProject", fd, {
        params,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function deleteProject(projectId) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Project/DeleteProject", { projectId })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getListTags() {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Project/GetListTags")
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function createTag(req) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Project/CreateTag", req)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function deleteTag(tagId) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Project/DeleteTag", { tagId })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}
