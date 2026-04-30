import ky from "ky";

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL ?? "/api/v1",
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401 && localStorage.getItem("auth_token")) {
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
        }
      },
    ],
  },
});
