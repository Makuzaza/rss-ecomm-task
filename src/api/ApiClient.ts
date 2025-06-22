import CreateApiClient from "./CreateApiClient";
import {
  productProjectionNormalization,
  productDataNormalization
} from "@/utils/dataNormalization";

// types
import {
  type CategoryPagedQueryResponse,
  type CustomerSignInResult,
  type MyCustomerDraft,
  type MyCustomerUpdate,
  type Customer,
  Cart,
  ProductProjectionPagedQueryResponse,
  MyCartUpdateAction,
  MyCartUpdate,
} from "@commercetools/platform-sdk";
import {
  SearchTypes,
  type CommerceToolsError,
  type MyProductsData,
} from "../@types/interfaces";
import { AuthMiddlewareOptions, ClientBuilder, ClientResponse, TokenStore  } from "@commercetools/ts-client";


interface AnonymousAuthOptions extends AuthMiddlewareOptions {
  anonymousId: string;
  fetch: typeof fetch;
}
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
      const apiRoot = this.getApiRootSafe();

      const response: ClientResponse<Customer> = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .get()
        .execute();

      return response.body;
    } catch (error: unknown) {
      console.error("Failed to get customer with password:", error);

      // Проверка: это стандартная ошибка с текстом
      if (
        error instanceof Error &&
        error.message.includes("Customer account with the given credentials not found")
      ) {
        throw new Error("Invalid email or password");
      }

      // Проверка: это объект с полем 'body.message'
      if (
        typeof error === "object" &&
        error !== null &&
        "body" in error &&
        typeof (error as { body: unknown }).body === "object" &&
        (error as { body: { message?: unknown } }).body?.message &&
        typeof (error as { body: { message: unknown } }).body.message === "string"
      ) {
        throw new Error((error as { body: { message: string } }).body.message);
      }

      throw new Error("Authentication failed");
    }
  }
  /**
   * BUILD CUSTOMER WITH TOKEN
   */
  public async getCustomerWithToken(token: string) {
    this.client = this.buildClientWithToken(token);
    const apiRoot = this.getApiRootSafe();

    try {
      const { body: customer } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .get()
        .execute();
      return customer;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch customer by token");
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
      console.error("Update failed", error);
      throw new Error("Failed to update customer");
    }
  }

  /**
   * REGISTER CUSTOMER
   */
  public async registerCustomer(
    customerData: MyCustomerDraft,
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
        (e) => e.code === "DuplicateField" && e.field === "email",
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
    offset?: number;
  }): Promise<{ products: MyProductsData[]; total: number }> {
    const apiRoot = this.getApiRoot(this.defaultClient);
    try {
      const { body: data }: { body: ProductProjectionPagedQueryResponse } =
        await apiRoot
          .withProjectKey({ projectKey: this.PROJECT_KEY })
          .productProjections()
          .get({ queryArgs: args })
          .execute();

      const normalized = productProjectionNormalization(data);
      return { products: normalized, total: data.total };
    } catch (error) {
      console.log(error);
      return { products: [], total: 0 };
    }
  }
  /**
   * GET PRODUCT WITH KEY
   */
  public async getProduct(key: string): Promise<MyProductsData> {
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

      return productDataNormalization(data);
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * SEARCH DATA
   */

  public async searchData(
    searchType: SearchTypes,
    searchValue: string,
    options: {
      limit?: number;
      offset?: number;
      sort?: string | string[];
      minPrice?: number;
      maxPrice?: number;
      discountOnly?: boolean;
    } = {}
  ): Promise<{ products: MyProductsData[]; total: number }> {
    const apiRoot = this.getApiRoot(this.defaultClient);

    const filterArgs: string[] = [];

    if (typeof options.minPrice === "number") {
      filterArgs.push(
        `variants.price.centAmount:range(${options.minPrice * 100} to *)`
      );
    }

    if (typeof options.maxPrice === "number") {
      filterArgs.push(
        `variants.price.centAmount:range(* to ${options.maxPrice * 100})`
      );
    }

    if (options.discountOnly) {
      filterArgs.push("variants.prices.discounted.exists:true");
    }

    const queryArgs: {
      [key: string]: string | string[] | number | boolean | undefined;
    } = {
      limit: options.limit,
      offset: options.offset,
      sort: options.sort,
    };

    if (searchType === "name") {
      queryArgs["text.en-US"] = searchValue;
    } else if (searchType === "category") {
      filterArgs.push(`categories.id:"${searchValue}"`);
    }

    if (filterArgs.length > 0) {
      queryArgs["filter.query"] = filterArgs;
    }

    try {
      const { body } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .productProjections()
        .search()
        .get({ queryArgs })
        .execute();

      const products = productProjectionNormalization({ results: body.results });
      const total = body.total ?? products.length;

      return { products, total };
    } catch (error) {
      console.error("Failed to search products:", error);
      throw new Error("Failed to fetch filtered products");
    }
  }



  /**
   * UPDATE CUSTOMER
   */
  public async updateCustomer(
    updatePayload: MyCustomerUpdate,
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

  public async changePassword(
    currentPassword: string,
    newPassword: string,
    version: number,
  ) {
    const apiRoot = this.getApiRoot(this.client);

    await apiRoot
      .withProjectKey({ projectKey: this.PROJECT_KEY })
      .me()
      .password()
      .post({
        body: {
          version,
          currentPassword,
          newPassword,
        },
      })
      .execute();
  }

  public async getMyActiveCart() {
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");
    try {
      const { body: cart } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .activeCart()
        .get()
        .execute();
      return cart;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch active cart");
    }
  }

  public async createMyCart(customer?: Customer): Promise<Cart> {
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");

    const shippingAddress = customer?.addresses?.find(
      (addr) => addr.id === customer.defaultShippingAddressId
    );

    const countryFromCustomer = shippingAddress?.country;

    const body: {
      currency: string;
      country?: string;
      anonymousId?: string;
    } = {
      currency: "EUR",
    };

    if (!customer?.id) {
      body.anonymousId = this.getOrCreateAnonymousId();
    }

    if (countryFromCustomer) {
      body.country = countryFromCustomer;
    }

    const { body: cart } = await apiRoot
      .withProjectKey({ projectKey: this.PROJECT_KEY })
      .me()
      .carts()
      .post({ body })
      .execute();

    return cart;
  }

  public async addProductToCart(
    productId: string,
    variantId: number = 1,
    customer?: Customer,
  ): Promise<Cart> {
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");

    try {
      let cart;
      try {
        cart = await this.getMyActiveCart();
      } catch {
        cart = await this.createMyCart(customer);
      }

      const payload: MyCartUpdate = {
        version: cart.version,
        actions: [
          {
            action: "addLineItem",
            productId,
            variantId,
            quantity: 1,
          },
        ],
      };

      console.log("Add to cart payload", JSON.stringify(payload, null, 2));

      const updatedCart = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .carts()
        .withId({ ID: cart.id })
        .post({ body: payload })
        .execute();

      return updatedCart.body;
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      throw new Error("Add to cart failed");
    }
  }


  public async getCartById(cartId: string) {
    const apiRoot = this.getApiRoot(this.client); 
    const { body: cart } = await apiRoot
      .withProjectKey({ projectKey: this.PROJECT_KEY })
      .me()
      .carts()
      .withId({ ID: cartId })
      .get()
      .execute();

    return cart;
  }


  public initAnonymousClient() {
    const anonymousId = this.getOrCreateAnonymousId();

    const options: AnonymousAuthOptions = {
      host: this.OAUTH_URI,
      projectKey: this.PROJECT_KEY,
      credentials: this.SPA_CREDENTIALS,
      scopes: [
        `manage_my_profile:${this.PROJECT_KEY}`,
        `manage_my_orders:${this.PROJECT_KEY}`,
        `view_published_products:${this.PROJECT_KEY}`,
      ],
      anonymousId,
      tokenCache: {
        get: (): TokenStore | null => {
          const cached = localStorage.getItem("accessToken");
          return cached ? JSON.parse(cached) : null;
        },
        set: (cache: TokenStore): void => {
          localStorage.setItem("accessToken", JSON.stringify(cache));
        },
      },
      fetch,
    };

    this.client = new ClientBuilder()
      .withAnonymousSessionFlow(options)
      .withHttpMiddleware({ host: this.BASE_URI })
      .build();
  }

  /**
   * Initialize the client from localStorage
   * If no valid token is found, fallback to anonymous client
   */

  public initClientFromStorage() {
    const raw = localStorage.getItem("accessToken");

    if (raw) {
      try {
        const token = JSON.parse(raw) as TokenStore;
        const now = Date.now();

        if (token.expirationTime && token.expirationTime > now) {
          this.client = this.buildClientWithToken(token.token);
          return;
        }

        console.warn("Access token expired, removing.");
        localStorage.removeItem("accessToken");
      } catch (e) {
        console.error("Failed to parse accessToken", e);
        localStorage.removeItem("accessToken");
      }
    }

    // Fallback to anonymous
    this.initAnonymousClient();
  }

  /**
   * Remove a line item from the cart
   */
  async removeLineItemFromCart(cartId: string, version: number, lineItemId: string) {
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");

    const body: MyCartUpdate = {
      version,
      actions: [
        {
          action: "removeLineItem",
          lineItemId,
        } as MyCartUpdateAction,
      ],
    };

    const res = await apiRoot
      .withProjectKey({ projectKey: this.PROJECT_KEY })
      .me()
      .carts()
      .withId({ ID: cartId })
      .post({ body })
      .execute();

    return res.body;
  }

  public async clearMyCart(cartId: string, version: number, lineItemIds: string[]): Promise<Cart> {
  const apiRoot = this.getApiRoot(this.client);
  const body: MyCartUpdate = {
    version,
    actions: lineItemIds.map((lineItemId) => ({
      action: "removeLineItem",
      lineItemId,
    })),
  };

  const res = await apiRoot
    .withProjectKey({ projectKey: this.PROJECT_KEY })
    .me()
    .carts()
    .withId({ ID: cartId })
    .post({ body })
    .execute();

  return res.body;
}

public async deleteCart(cartId: string, version: number): Promise<void> {
  const apiRoot = this.getApiRoot(this.client);
  if (!apiRoot) throw new Error("Unauthorized action");

  await apiRoot
    .withProjectKey({ projectKey: this.PROJECT_KEY })
    .me()
    .carts()
    .withId({ ID: cartId })
    .delete({ queryArgs: { version } })
    .execute();
}

public get publicApiRoot() {
  return this.getApiRootSafe();
}

public get publicProjectKey() {
  return this.PROJECT_KEY;
}

private getApiRootSafe(client = this.client) {
  if (!client) throw new Error("API client is not initialized");
  return this.getApiRoot(client);
}

public isAuthorized(): boolean {
  const raw = localStorage.getItem("accessToken");
  if (!raw) return false;
  try {
    const token = JSON.parse(raw) as TokenStore;
    return token.expirationTime > Date.now();
  } catch {
    return false;
  }
}

public logout() {
  localStorage.removeItem("accessToken");
  this.initAnonymousClient();
}

  // end
}

// Singleton instance
export const apiClient = new ApiClient();