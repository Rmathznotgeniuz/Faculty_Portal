import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8081",
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? "faculty-portal",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "faculty-portal-frontend",
});

export async function initializeAuthentication() {
  return keycloak.init({
    onLoad: "login-required",
    pkceMethod: "S256",
    checkLoginIframe: false,
  });
}

export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  await keycloak.updateToken(30);
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${keycloak.token ?? ""}`);
  headers.set("Content-Type", "application/json");
  return fetch(input, { ...init, headers });
}

export function logout() {
  return keycloak.logout({ redirectUri: window.location.origin });
}
