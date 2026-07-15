const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

function get(path) {
  return fetch(`${BASE}${path}`).then(handle);
}

function post(path, body) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(handle);
}

function put(path, body) {
  return fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(handle);
}

function patch(path, body) {
  return fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(handle);
}

function del(path) {
  return fetch(`${BASE}${path}`, { method: "DELETE" }).then(handle);
}

function postForm(path, formData) {
  return fetch(`${BASE}${path}`, { method: "POST", body: formData }).then(handle);
}

export const api = {
  health: () => get("/health"),

  getUser: () => get("/user"),
  updateUser: (data) => put("/user", data),

  getMeals: (date) => get(`/meals${date ? `?date=${date}` : ""}`),
  logMealText: (text, inputType = "text") => post("/meals/text", { text, inputType }),
  logMealPhoto: (formData) => postForm("/meals/photo", formData),
  deleteMeal: (id) => del(`/meals/${id}`),

  tasteMatch: (craving) => post("/taste-match", { craving }),

  getBalanceScore: (date) => get(`/balance-score${date ? `?date=${date}` : ""}`),

  getStreetFoods: () => get("/street-food/list"),
  optimizeStreetFood: (dishName) => post("/street-food/optimize", { dishName }),

  familyFood: (description) => post("/family-food", { description }),

  transformRecipe: (dishName) => post("/recipe-transform", { dishName }),

  getRegions: () => get("/regional/regions"),
  getRegionalFoods: (region) => get(`/regional${region ? `?region=${encodeURIComponent(region)}` : ""}`),

  buildPlate: (desiredDish) => post("/plate-builder", { desiredDish }),

  getGrocery: () => get("/grocery"),
  generateGrocery: (focusArea) => post("/grocery/generate", { focusArea }),
  addGroceryItem: (name, category) => post("/grocery", { name, category }),
  toggleGroceryItem: (id, checked) => patch(`/grocery/${id}`, { checked }),
  deleteGroceryItem: (id) => del(`/grocery/${id}`),

  getJourney: () => get("/journey"),

  getHealthConnect: (date) => get(`/health-connect${date ? `?date=${date}` : ""}`),
  updateHealthConnect: (data) => post("/health-connect", data),
};
