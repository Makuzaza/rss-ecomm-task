import { spaClient } from "@/shared/clients";

export const getLoginToken = async (
  email: string,
  password: string
): Promise<Response> => {
  const authHeader = "Basic " + btoa(`${spaClient.clientId}:`);
  const scope = [
    `manage_my_profile:${spaClient.projectKey}`,
    `manage_my_orders:${spaClient.projectKey}`,
    `view_published_products:${spaClient.projectKey}`,
  ].join(" ");

  console.log("🧪 Login clientId:", spaClient.clientId);
  console.log("🧪 Auth header:", authHeader);

  return fetch(`${spaClient.authUrl}/oauth/${spaClient.projectKey}/customers/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: authHeader,
    },
    body: new URLSearchParams({
      grant_type: "password",
      username: email,
      password: password,
      scope,
    }),
  });
};

