import axios from "axios";

// ── Send Mail ──────────────────────────────────────────────
export function getListSendMail(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Interaction/GetListSendMail", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function deleteSendMail(mailId) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Interaction/DeleteSendMail", { mailId })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// ── Subscribe Us ───────────────────────────────────────────
export function getListSendSubcribeUs(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Interaction/GetListSendSubcribeUs", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function deleteSendMailSubscribeUs(mailId) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Interaction/DeleteSendMailSubscribeUs", { mailId })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// ── Career / Send Mail Career ──────────────────────────────
export function getListSendMailCareer(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Interaction/GetListSendMailCareer", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function deleteMailCareer(mailId) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Interaction/DeleteMailCareer", { mailId })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getCareerCategoryList(languageCode) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Interaction/GetCareerCategoryList", { params: { languageCode } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// ── Jobs ───────────────────────────────────────────────────
export function getJobCms(params) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Interaction/GetJobCms", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getJobDetailCms(languageCode, jobId) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Interaction/GetJobDetailCms", { params: { languageCode, jobId } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

/**
 * CreateJob
<<<<<<< HEAD
 * params: { languageCode, categoryId, position, YearOfExperience, location, salary, startDate, endDate }
=======
 * params: { languageCode, categoryId, position, yearsOfExperience, location, salary, startDate, endDate }
>>>>>>> feature_khuong_dev
 * jdFile: IFormFile JD (required)
 */
export function createJob(params, jdFile) {
  const fd = new FormData();
  if (jdFile) fd.append("JD", jdFile);
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Interaction/CreateJob", fd, {
        params,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

/**
 * UpdateJob
<<<<<<< HEAD
 * params: { languageCode, jobId, categoryId, position, YearOfExperience, location, salary, startDate, endDate, jd, status }
=======
 * params: { languageCode, jobId, categoryId, position, yearsOfExperience, location, salary, startDate, endDate, jd, status }
>>>>>>> feature_khuong_dev
 * jdFile: IFormFile JD (optional)
 */
export function updateJob(params, jdFile) {
  const fd = new FormData();
  if (jdFile) fd.append("JD", jdFile);
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Interaction/UpdateJob", fd, {
        params,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function deleteJob(jobId) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Interaction/DeleteJob", { jobId })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}
