import {
  ClientBuilder,
  type Client,
  type PasswordAuthMiddlewareOptions,
  type ExistingTokenMiddlewareOptions,
  type TokenCache,
  type TokenStore,
} from "@commercetools/ts-client";
import {
  createApiBuilderFromCtpClient,
  ApiRoot,
} from "@commercetools/platform-sdk";

import { v4 as uuidv4 } from 'uuid';

class CreateApiClient {
  protected BASE_URI = process.env.REACT_APP_BASE_URL;
  protected OAUTH_URI = process.env.REACT_APP_OAUTH_URL;
  protected PROJECT_KEY = process.env.REACT_APP_PROJECT_KEY;

  protected readonly ADMIN_CREDENTIALS = {
    // ADMIN CLIENT (SCOPE)
    clientId: process.env.REACT_APP_ADMIN_CLIENT_ID,
    clientSecret: process.env.REACT_APP_ADMIN_CLIENT_SECRET,
  };

  protected readonly SPA_CREDENTIALS = {
    // SPA CLIENT (SCOPE)
    clientId: process.env.REACT_APP_SPA_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPA_CLIENT_SECRET,
  };

  protected defaultClient: Client;
  protected client: Client;
  protected apiRoot: ApiRoot;

  constructor() {
    this.defaultClient = this.buildDefaultClient(true);
  }
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
        this.PROJECT_KEY,
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
        clientId: this.SPA_CREDENTIALS.clientId,
        clientSecret: this.SPA_CREDENTIALS.clientSecret,
        user: {
          username: email,
          password: password,
        },
      },
      scopes: [ `manage_my_profile:${this.PROJECT_KEY}`,
      `manage_my_orders:${this.PROJECT_KEY}`,
      `view_published_products:${this.PROJECT_KEY}`,],
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

  protected getOrCreateAnonymousId(): string {
    const key = "anonymous_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = uuidv4();
      localStorage.setItem(key, id);
    }
    return id;
  }

  // end
}

export default CreateApiClient;
