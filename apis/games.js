import axios from "axios";

// ── Game List (CMS, paginated) ────────────────────────────
export function getGameList(languageCode, currentPage, recordPerPage) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Game/GetListGameCms", { params: { languageCode, currentPage, recordPerPage } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// ── Game Detail ────────────────────────────────────────────
export function getGameDetail(gameId, languageCode) {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/Game/GetGameDetail", { params: { gameId, languageCode } })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// ── Create Game (multipart) ────────────────────────────────
// params (CreateGameReq): { name, gameType, isComming, status, googlePlay, appStore, webLink, languageCode, description }
// bannerFile → "banner", logoFile → "logo"
export function createGame(params, bannerFile, logoFile) {
  const fd = new FormData();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
  if (bannerFile) fd.append("banner", bannerFile);
  if (logoFile) fd.append("logo", logoFile);
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Game/CreateGame", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// ── Update Game (multipart) ────────────────────────────────
// params (UpdateGameInfoReq): { gameId, gameType, status, isComming, googlePlay, appStore, webLink, languageCode, gameName, gameDescription }
// bannerFile → "banner", logoFile → "logo"
export function updateGame(params, bannerFile, logoFile) {
  const fd = new FormData();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
  if (bannerFile) fd.append("banner", bannerFile);
  if (logoFile) fd.append("logo", logoFile);
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Game/UpdateGame", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

// ── Delete Game ────────────────────────────────────────────
export function deleteGame(gameId) {
  return new Promise((resolve, reject) => {
    axios
      .post("/api/Game/DeleteGame", { gameId })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}