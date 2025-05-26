import {
  ClientBuilder,
  type Client,
  type PasswordAuthMiddlewareOptions,
  type ExistingTokenMiddlewareOptions,
  type TokenCache,
  type TokenStore,
  // ClientResponse,
} from "@commercetools/ts-client";
import {
  createApiBuilderFromCtpClient,
  ApiRoot,
} from "@commercetools/platform-sdk";

class CreateApiClient {
  protected BASE_URI = "https://api.europe-west1.gcp.commercetools.com";
  protected OAUTH_URI = "https://auth.europe-west1.gcp.commercetools.com";
  protected PROJECT_KEY = "api-rs-school";

  protected readonly ADMIN_CREDENTIALS = {
    // Admin client (scope)
    clientId: "wkSBIH57z7eootNrTs-fx54U",
    clientSecret: "aDRhkOUKc51Z3-_cp45A_asnITocAjzM",
  };

  protected readonly SPA_CREDENTIALS = {
    // SPA client (scope)
    clientId: "DLHBgbFar-WAp5-rUwI_u0nA",
    clientSecret: "2HUjaA1AZjzqbIranxV9PisjzBJ1zhjW",
  };

  protected client: Client;
  protected apiRoot: ApiRoot;

  // API ROOT
  protected getApiRoot(client: Client) {
    return createApiBuilderFromCtpClient(client);
  }

  // DEFAULT CLIENT
  protected buildDefaultClient(isAdmin: boolean): Client {
    const credentials = isAdmin ? this.ADMIN_CREDENTIALS : this.SPA_CREDENTIALS;

    return new ClientBuilder()
      .defaultClient(
        this.BASE_URI,
        credentials,
        this.OAUTH_URI,
        this.PROJECT_KEY
      )
      .build();
  }

  // AUTHORIZED CLIENT (with Password)
  protected buildClientWithPassword(email: string, password: string): Client {
    const customTokenCache: TokenCache = {
      get: () => {
        const cached = localStorage.getItem("accessToken");
        if (cached) {
          return JSON.parse(cached);
        }
        return { token: "", expirationTime: 0 };
      },
      set: (cache: TokenStore) => {
        localStorage.setItem("accessToken", JSON.stringify(cache));
      },
    };

    const options: PasswordAuthMiddlewareOptions = {
      host: this.OAUTH_URI,
      projectKey: this.PROJECT_KEY,
      credentials: {
        clientId: this.ADMIN_CREDENTIALS.clientId,
        clientSecret: this.ADMIN_CREDENTIALS.clientSecret,
        user: {
          username: email,
          password: password,
        },
      },
      scopes: [`manage_project:${this.PROJECT_KEY}`],
      tokenCache: customTokenCache,
      httpClient: fetch,
    };

    return new ClientBuilder()
      .withPasswordFlow(options)
      .withHttpMiddleware({
        host: this.BASE_URI,
      })
      .build();
  }

  // AUTHORIZED CLIENT (with Token)
  protected buildClientWithToken(token: string): Client {
    const authorization: string = `Bearer ${token}`;
    const options: ExistingTokenMiddlewareOptions = {
      force: true,
    };
    return new ClientBuilder()
      .withExistingTokenFlow(authorization, options)
      .withHttpMiddleware({
        host: this.BASE_URI,
      })
      .build();
  }

  // end
}

export default CreateApiClient;
