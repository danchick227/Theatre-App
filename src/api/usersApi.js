const API_BASE = "https://localhost:7078";
const API_URL = `${API_BASE}/api`;

export const USER_ROLES = {
  ARTIST: "artist",
  DIRECTOR: "director",
  WORKER: "worker",
};

async function handleResponse(response, fallbackMessage) {
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export async function getUsers(role) {
  const url = new URL(`${API_URL}/Users`);
  if (role) {
    url.searchParams.append("role", role);
  }

  const response = await fetch(url, {
    headers: {
      accept: "*/*",
    },
  });

  return handleResponse(response, "Не удалось загрузить список пользователей");
}

export async function createUser(formData) {
  const response = await fetch(`${API_URL}/Users`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response, "Не удалось создать пользователя");
}

export async function deleteUser(login) {
  const response = await fetch(`${API_URL}/Users/${encodeURIComponent(login)}`, {
    method: "DELETE",
    headers: {
      accept: "*/*",
    },
  });

  await handleResponse(response, "Не удалось удалить пользователя");
}
