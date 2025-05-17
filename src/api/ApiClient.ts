import { ClientBuilder, type Client } from "@commercetools/ts-client";
import {
  createApiBuilderFromCtpClient,
  ApiRoot,
  CustomerSignInResult,
  MyCustomerDraft,
} from "@commercetools/platform-sdk";
import { CommerceToolsError } from "../moduls/interfaces";

export class ApiClient {
  private BASE_URI = "https://api.europe-west1.gcp.commercetools.com";
  private OAUTH_URI = "https://auth.europe-west1.gcp.commercetools.com";
  private PROJECT_KEY = "api-rs-school";

  private readonly ADMIN_CREDENTIALS = { // Admin client (scope)
    clientId: "wkSBIH57z7eootNrTs-fx54U",
    clientSecret: "aDRhkOUKc51Z3-_cp45A_asnITocAjzM",
  };

  private readonly SPA_CREDENTIALS = { // SPA client (scope)
    clientId: "DLHBgbFar-WAp5-rUwI_u0nA", 
    clientSecret: "2HUjaA1AZjzqbIranxV9PisjzBJ1zhjW"
  };

  private client: Client;

  constructor() {
    this.client = this.getClient();
  }

  private getClient(): Client {
    return new ClientBuilder()
      .defaultClient(
        this.BASE_URI,
        this.ADMIN_CREDENTIALS,
        this.OAUTH_URI,
        this.PROJECT_KEY
      )
      .build();
  }

  private getApiRoot(isAdmin: boolean = false): ApiRoot {
    return createApiBuilderFromCtpClient(this.buildClient(isAdmin));
  }

  private buildClient(isAdmin: boolean): Client {
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

  async getCustomersByLastName(lastName: string) {
    const apiRoot = this.getApiRoot(true); // Admin client

    try {
      const { body } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .customers()
        .get({
          queryArgs: {
            where: `lastName="${lastName}"`,
          },
        })
        .execute();
      return body;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  public async registerCustomer(customerData: MyCustomerDraft): Promise<CustomerSignInResult> {
    const apiRoot = this.getApiRoot(false);

    try {
      const { body } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .signup()
        .post({ body: customerData })
        .execute();

      return body;
    } catch (error) {
        const err = error as CommerceToolsError;

        const duplicateEmail = err.body.errors?.find(
          (e) => e.code === "DuplicateField" && e.field === "email"
        );

        if (duplicateEmail) {
          throw new Error("A customer with this email already exists.");
        }

        throw new Error(err.body.message || "Registration failed. Try again.");
    }
  }

  public async loginCustomer(email: string, password: string): Promise<{ accessToken: string }> {
    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", email);
    formData.append("password", password);
    formData.append(
      "scope",
      [
        "manage_my_profile",
        "view_published_products",
        "manage_my_orders"
      ]
        .map(scope => `${scope}:${this.PROJECT_KEY}`)
        .join(" ")
    );

    const authUrl = `${this.OAUTH_URI}/oauth/${this.PROJECT_KEY}/customers/token`;

    const res = await fetch(authUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${this.SPA_CREDENTIALS.clientId}:${this.SPA_CREDENTIALS.clientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data?.error_description || data?.message || "Login failed";
      throw new Error(errorMessage);
    }

    return { accessToken: data.access_token };
  }
}
// Singleton instance
export const apiClient = new ApiClient();
