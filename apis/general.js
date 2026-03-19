import axios from "axios";

// ── Language Code ──────────────────────────────────────────
export function getLanguageCode() {
  return new Promise((resolve, reject) => {
    axios.get("/api/General/GetLanguageCode")
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// ── Our Leaders ────────────────────────────────────────────
export function getOurLeaders(keyWord, currentPage, recordPerPage) {
  return new Promise((resolve, reject) => {
    axios.get("/api/General/GetOurLeaders", { params: { keyWord, currentPage, recordPerPage } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getOurLeaderDetail(leaderId) {
  return new Promise((resolve, reject) => {
    axios.get("/api/General/GetOurLeaderDetail", { params: { leaderId } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// photo → "photo" file field; req fields sent as query params ([FromQuery])
export function createOurLeader(params, photoFile) {
  const fd = new FormData();
  if (photoFile) fd.append("photo", photoFile);
  return new Promise((resolve, reject) => {
    axios.post("/api/General/CreateOurLeader", fd, {
      params,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function updateOurLeader(params, photoFile) {
  const fd = new FormData();
  if (photoFile) fd.append("photo", photoFile);
  return new Promise((resolve, reject) => {
    axios.post("/api/General/UpdateOurLeader", fd, {
      params,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function deleteOurLeader(leaderId) {
  return new Promise((resolve, reject) => {
    axios.post("/api/General/DeleteOurLeader", { leaderId })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// ── Testimonial ────────────────────────────────────────────
export function getTestimonial(languageCode, keyWord, currentPage, recordPerPage) {
  return new Promise((resolve, reject) => {
    axios.get("/api/General/GetTestimonial", { params: { languageCode, keyWord, currentPage, recordPerPage } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getTestimonialDetail(languageCode, testimonialId) {
  return new Promise((resolve, reject) => {
    axios.get("/api/General/TestimonialDetail", { params: { languageCode, testimonialId } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// languageCode as query param, req as JSON body ([FromBody] default)
export function createTestimonial(languageCode, req) {
  return new Promise((resolve, reject) => {
    axios.post("/api/General/CreateTestimonial", req, { params: { languageCode } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function updateTestimonial(languageCode, req) {
  return new Promise((resolve, reject) => {
    axios.post("/api/General/UpdateTestimonial", req, { params: { languageCode } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function deleteTestimonial(testimonialId) {
  return new Promise((resolve, reject) => {
    axios.post("/api/General/DeleteTestimonial", { testimonialId })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// ── Career Category ────────────────────────────────────────
export function createCareerCategory(req) {
  return new Promise((resolve, reject) => {
    axios.post("/api/General/CreateCareerCategory", req)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}
