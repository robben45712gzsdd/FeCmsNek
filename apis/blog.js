import axios from "axios";

export function getListPost(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Blog/GetListPost", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getPostDetail(postId, languageCode) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Blog/GetPostDetailCMS", { params: { postId, languageCode } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function createPost(params, contentFile, imageFile) {
  const fd = new FormData();
  if (contentFile) fd.append("Content", contentFile);
  if (imageFile) fd.append("ImageUrl", imageFile);
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Blog/CreatePost", fd, {
        params,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function updatePost(params, contentFile, imageFile) {
  const fd = new FormData();
  if (contentFile) fd.append("Content", contentFile);
  if (imageFile) fd.append("ImageUrl", imageFile);
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Blog/UpdatePost", fd, {
        params,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function deletePost(postId) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Blog/DeletePost", { postId })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getPostGenerate(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Blog/GetPostGenerate", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function changeApprovalStatus(req) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Blog/ChangeApprovalStatus", req)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function generateBlog(prompt) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Service/GenerateBlog", { prompt })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}
