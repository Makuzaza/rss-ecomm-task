import CreateApiClient from "./CreateApiClient";
import {
  apiDataProcessing,
  apiDataSearchProcessing,
} from "@/utils/dataProcessing";

// types
import {
  type CategoryPagedQueryResponse,
  type CustomerSignInResult,
  type MyCustomerDraft,
  type Product,
  type ProductProjectionPagedQueryResponse,
  type MyCustomerUpdate,
  type Customer,
} from "@commercetools/platform-sdk";
import {
  type CommerceToolsError,
  type MyProductsData,
} from "../@types/interfaces";

export class ApiClient extends CreateApiClient {
  /**
   * BUILD CUSTOMER WITH PASSWORD
   */
  public async getCustomerWithPassword(
    email: string,
    password: string
  ): Promise<Customer> {
    try {
      this.client = this.buildClientWithPassword(email, password);
      const apiRoot = this.getApiRoot(this.client);

      const { body: customer } = await apiRoot
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
   * BUILD CUSTOMER WITH TOKEN
   */
  public async getCustomerWithToken(token: string) {
    this.client = this.buildClientWithToken(token);
    const apiRoot = this.getApiRoot(this.client);

    try {
      const { body: customer } = await apiRoot
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
   * SIGN IN CUSTOMER
   */
  public async loginCustomer(customerData: MyCustomerDraft) {
    const apiRoot = this.getApiRoot(this.defaultClient);

    try {
      const { body: customer } = await apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .me()
        .login()
        .post({ body: customerData })
        .execute();

      return customer;
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
      const { body: customer } = await this.apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .me()
        .signup()
        .post({ body: customerData })
        .execute();

      return customer;
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
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");

    try {
      const { body: customer } = await apiRoot
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
    const apiRoot = this.getApiRoot(this.defaultClient);
    try {
      const { body: data } = await apiRoot
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
    const apiRoot = this.getApiRoot(this.defaultClient);
    try {
      const { body: data } = await apiRoot
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
    const apiRoot = this.getApiRoot(this.defaultClient);
    try {
      const { body: data } = await apiRoot
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
    const apiRoot = this.getApiRoot(this.defaultClient);

    try {
      const { body: data } = await apiRoot
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
    const apiRoot = this.getApiRoot(this.defaultClient);

    try {
      const { body: data } = await apiRoot
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
  ): Promise<Customer> {
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");

    try {
      const { body: data } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .post({ body: updatePayload })
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
