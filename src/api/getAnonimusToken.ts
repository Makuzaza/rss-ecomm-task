export const getAnonimusToken = async (
  clientId: string,
  clientSecret: string,
  projectKey: string,
  authUrl: string
): Promise<string | null> => {
  const response = await fetch(`${authUrl}/oauth/${projectKey}/anonymous/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: `create_anonymous_token:${projectKey} manage_my_profile:${projectKey}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Failed to get anonymous token:\n", errorText);
    return null;
  }

  const { access_token } = await response.json();
  return access_token;
};
