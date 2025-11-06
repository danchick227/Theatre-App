const API_URL = "https://localhost:7078/api";

export async function login(login, password) {
  const response = await fetch(`${API_URL}/Auth/login`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify({ login, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Ошибка авторизации");
  }

  return data;
}

export async function register(login, password) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Ошибка регистрации");
  }

  return data;
}
