import CreateApiClient from "./CreateApiClient";

import {
  CategoryPagedQueryResponse,
  CustomerSignInResult,
  MyCustomerDraft,
  Product,
  ProductPagedQueryResponse,
  ProductProjectionPagedQueryResponse,
  MyCustomerUpdate,
  Customer,
  ClientResponse,
  ApiRoot,
} from "@commercetools/platform-sdk";
import {
  apiDataProcessing,
  apiDataSearchProcessing,
} from "@/utils/dataProcessing";
import { TokenStore } from "@commercetools/ts-client";
import { CommerceToolsError, MyProductsData } from "../@types/interfaces";

export class ApiClient extends CreateApiClient {
  products: ProductPagedQueryResponse;
  private customerApiRoot?: ApiRoot;

  /**
   * LOGIN CUSTOMER WITH PASSWORD
   */
  public async loginCustomer(email: string, password: string) {
    try {
      const client = this.buildClientWithPassword(email, password);
      this.apiRoot = this.getApiRoot(client);
      this.customerApiRoot = this.apiRoot;

      const { body: customer } = await this.customerApiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
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
   * GET CATEGORIES
   */
  public async getAllCategories(args: {
    limit?: number;
    sort?: string;
    where?: string;
  }): Promise<CategoryPagedQueryResponse> {
    this.apiRoot = this.getApiRoot(this.defaultClient);
    try {
      const { body: data } = await this.apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .categories()
        .get({ queryArgs: args })
        .execute();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * GET ALL PRODUCTS
   */
  public async getAllProducts(args?: {
    limit?: number;
    sort?: string | string[];
  }): Promise<MyProductsData[]> {
    this.apiRoot = this.getApiRoot(this.defaultClient);
    try {
      const { body: data } = await this.apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .products()
        .get({ queryArgs: args })
        .execute();

      this.productData = apiDataProcessing(data);
      return this.productData;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * GET PRODUCT WITH KEY
   */
  public async getProduct(key: string): Promise<Product> {
    this.apiRoot = this.getApiRoot(this.defaultClient);
    try {
      const { body: data } = await this.apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .products()
        .withKey({ key: key })
        .get()
        .execute();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * SEARCH PRODUCT
   */
  public async searchProductsByName(
    searchName: string
  ): Promise<ProductProjectionPagedQueryResponse> {
    this.apiRoot = this.getApiRoot(this.defaultClient);

    try {
      const { body: data } = await this.apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .productProjections()
        .search()
        .get({
          queryArgs: {
            "text.en-US": searchName,
            limit: 10,
          },
        })
        .execute();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  public async searchProductsByCategory(
    categoryId: string
  ): Promise<MyProductsData[]> {
    this.apiRoot = this.getApiRoot(this.defaultClient);

    try {
      const { body: data } = await this.apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .productProjections()
        .search()
        .get({
          queryArgs: {
            "filter.query": `categories.id:"${categoryId}"`,
          },
        })
        .execute();

      return apiDataSearchProcessing(data);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * UPDATE CUSTOMER
   */
  public async updateCustomer(
    updatePayload: MyCustomerUpdate
  ): Promise<ClientResponse<Customer>> {
    if (!this.customerApiRoot) {
      throw new Error(
        "Customer API root is not initialized. Please log in first."
      );
    }

    return this.customerApiRoot
      .withProjectKey({ projectKey: this.PROJECT_KEY })
      .me()
      .post({ body: updatePayload })
      .execute();
  }

  public async restoreCustomerSessionFromStorage(): Promise<void> {
    const storedToken = localStorage.getItem("accessToken");

    if (!storedToken) {
      console.warn("No customer token found in storage.");
      return;
    }

    const parsedToken: TokenStore = JSON.parse(storedToken);
    const token = parsedToken.token;

    //  Decode JWT token to check if expired
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    const expiryInSec = decoded.exp;

    if (Date.now() / 1000 > expiryInSec) {
      console.warn("Stored token is expired.");
      localStorage.removeItem("accessToken");
      return;
    }

    const client = this.buildClientWithToken(token);
    this.customerApiRoot = this.getApiRoot(client);
  }

  // end
}

// Singleton instance
export const apiClient = new ApiClient();
