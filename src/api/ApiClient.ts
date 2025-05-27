import CreateApiClient from "./CreateApiClient";

import {
  CustomerSignInResult,
  MyCustomerDraft,
  Product,
  ProductPagedQueryResponse,
} from "@commercetools/platform-sdk";
import { CommerceToolsError } from "../@types/interfaces";

export class ApiClient extends CreateApiClient {
  products: ProductPagedQueryResponse;

  /**
   * LOGIN CUSTOMER WITH PASSWORD
   */
  public async loginCustomer(email: string, password: string) {
    try {
      const client = this.buildClientWithPassword(email, password);
      this.apiRoot = this.getApiRoot(client);

      const { body: customer } = await this.apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .me()
        .get()
        .execute();
      return customer;
    } catch (error) {
      if (
        error.toString() ===
        "BadRequest: Customer account with the given credentials not found."
      ) {
        throw new Error("Invalid email or password");
      }

      // Fallback to generic message
      throw new Error(error.toString());
    }
  }

  /**
   * LOGIN CUSTOMER WITH TOKEN
   */
  public async loginCustomerWithToken(token: string) {
    const client = this.buildClientWithToken(token);
    this.apiRoot = this.getApiRoot(client);

    try {
      const res = await this.apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .me()
        .get()
        .execute();

      return res;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * REGISTER CUSTOMER
   */
  public async registerCustomer(
    customerData: MyCustomerDraft
  ): Promise<CustomerSignInResult> {
    const client = this.buildDefaultClient(false);
    this.apiRoot = this.getApiRoot(client);

    try {
      const { body } = await this.apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
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

  /**
   * GET CUSTOMER PROFILE
   */
  public async getCustomerProfile() {
    try {
      const { body: customer } = await this.apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .me()
        .get()
        .execute();
      return customer;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * GET ALL PRODUCTS
   */
  public async getAllProducts(): Promise<ProductPagedQueryResponse> {
    this.apiRoot = this.getApiRoot(this.defaultClient);
    try {
      const { body: data } = await this.apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .products()
        .get()
        .execute();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * GET PRODUCT WITH ID
   */
  public async getProduct(id: string): Promise<Product> {
    this.apiRoot = this.getApiRoot(this.defaultClient);
    try {
      const { body: data } = await this.apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .products()
        .withId({ ID: id })
        .get()
        .execute();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  // end
}

// Singleton instance
export const apiClient = new ApiClient();
