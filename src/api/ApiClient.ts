import { ClientBuilder, type Client } from "@commercetools/ts-client";
import {
  createApiBuilderFromCtpClient,
  ApiRoot,
  CustomerSignInResult,
  MyCustomerDraft,
} from "@commercetools/platform-sdk";

export class ApiClient {
  private BASE_URI = "https://api.europe-west1.gcp.commercetools.com";
  private OAUTH_URI = "https://auth.europe-west1.gcp.commercetools.com";
  private PROJECT_KEY = "api-rs-school";
  private CREDENTIALS = {
    clientId: "wkSBIH57z7eootNrTs-fx54U",
    clientSecret: "aDRhkOUKc51Z3-_cp45A_asnITocAjzM",
  };

  private client: Client;

  constructor() {
    this.client = this.getClient();
  }

  private getClient(): Client {
    return new ClientBuilder()
      .defaultClient(
        this.BASE_URI,
        this.CREDENTIALS,
        this.OAUTH_URI,
        this.PROJECT_KEY
      )
      .build();
  }

  private getApiRoot(): ApiRoot {
    return createApiBuilderFromCtpClient(this.client);
  }

  async getCustomersByLastName(lastName: string) {
    const apiRoot = this.getApiRoot();

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
    const apiRoot = this.getApiRoot();
    
    try {
      const { body } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .signup()
        .post({ body: customerData })
        .execute();

      return body;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();
