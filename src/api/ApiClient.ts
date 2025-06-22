import CreateApiClient from "./CreateApiClient";
import {
  productProjectionNormalization,
  productDataNormalization,
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
import {
  ClientResponse,
  // AuthMiddlewareOptions,
  // ClientBuilder,
  TokenStore,
} from "@commercetools/ts-client";

// interface AnonymousAuthOptions extends AuthMiddlewareOptions {
//   anonymousId: string;
//   fetch: typeof fetch;
// }
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

      this.setAuth(true);
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

      this.setAuth(true);
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

  // GET AUTHENTICATION
  public getAuth() {
    return this.isAuth;
  }

  // SET AUTHENTICATION
  public setAuth(value: boolean) {
    this.isAuth = value;
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

      const products = productProjectionNormalization({
        results: body.results,
      });
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

  public async changePassword(
    currentPassword: string,
    newPassword: string,
    version: number
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

  // GET CART
  public async getCart() {
    return this.getAuth()
      ? this.getCustomerActiveCart()
      : this.getDefaultCart();
  }

  public async getCustomerActiveCart() {
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

  public async getDefaultCart() {
    const cartId = localStorage.getItem("defaultCart");
    if (cartId) {
      return this.getDefaultCartById(cartId);
    }
    return this.createDefaultCart();
  }
  public async getDefaultCartById(cartId: string) {
    const apiRoot = this.getApiRoot(this.defaultClient);
    if (!apiRoot) throw new Error("Unauthorized action");
    try {
      const { body: cart } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .carts()
        .withId({ ID: cartId })
        .get()
        .execute();
      return cart;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch active cart");
    }
  }
  // public async createMyCart(customer?: Customer): Promise<Cart> {
  //   const apiRoot = this.getApiRoot(this.client);
  //   if (!apiRoot) throw new Error("Unauthorized action");

  //   const shippingAddress = customer?.addresses?.find(
  //     (addr) => addr.id === customer.defaultShippingAddressId
  //   );

  //   const countryFromCustomer = shippingAddress?.country;

  //   const body: {
  //     currency: string;
  //     country?: string;
  //     anonymousId?: string;
  //   } = {
  //     currency: "EUR",
  //   };

  //   if (!customer?.id) {
  //     body.anonymousId = this.getOrCreateAnonymousId();
  //   }

  //   if (countryFromCustomer) {
  //     body.country = countryFromCustomer;
  //   }

  //   const { body: cart } = await apiRoot
  //     .withProjectKey({ projectKey: this.PROJECT_KEY })
  //     .me()
  //     .carts()
  //     .post({ body })
  //     .execute();

  //   return cart;
  // }
  public async createMyCart(): Promise<Cart> {
    return this.getAuth()
      ? this.createCustomerCart()
      : this.createDefaultCart();
  }

  // ***** CREATE DEFAULT CART *****
  public async createDefaultCart(): Promise<Cart> {
    const apiRoot = this.getApiRoot(this.defaultClient);
    if (!apiRoot) throw new Error("Unauthorized action");

    const body: { currency: string } = {
      currency: "EUR",
    };
    try {
      const { body: cart } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .carts()
        .post({ body })
        .execute();

      localStorage.setItem("defaultCart", cart.id);
      return cart;
    } catch {
      throw new Error("Failed to create default cart");
    }
  }

  // ***** CREATE CUSTOMER CART *****
  public async createCustomerCart(): Promise<Cart> {
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");

    const body: { currency: string } = {
      currency: "EUR",
    };
    try {
      const { body: cart } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .carts()
        .post({ body })
        .execute();

      return cart;
    } catch {
      throw new Error("Failed to create customer cart");
    }
  }

  // // ADD PRODUCT TO CART
  public async addProductToCart(
    cart: Cart,
    productId: string,
    variantId: number = 1
  ): Promise<Cart> {
    return this.getAuth()
      ? this.updateCustomerCart(cart, productId, variantId)
      : this.updateDefaultCart(cart, productId, variantId);
  }

  public async updateDefaultCart(
    cart: Cart,
    productId: string,
    variantId: number = 1
  ) {
    const apiRoot = this.getApiRoot(this.defaultClient);
    if (!apiRoot) throw new Error("Unauthorized action");

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
    try {
      const updatedCart = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
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

  public async updateCustomerCart(
    cart: Cart,
    productId: string,
    variantId: number = 1
  ) {
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");

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
    try {
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

  // public async addProductToCart2(
  //   productId: string,
  //   variantId: number = 1,
  //   customer?: Customer
  // ): Promise<Cart> {
  //   const apiRoot = this.getApiRoot(this.client);
  //   if (!apiRoot) throw new Error("Unauthorized action");

  //   try {
  //     let cart;
  //     try {
  //       cart = await this.getMyActiveCart();
  //     } catch {
  //       cart = await this.createMyCart(customer);
  //     }

  //     const payload: MyCartUpdate = {
  //       version: cart.version,
  //       actions: [
  //         {
  //           action: "addLineItem",
  //           productId,
  //           variantId,
  //           quantity: 1,
  //         },
  //       ],
  //     };

  //     console.log("Add to cart payload", JSON.stringify(payload, null, 2));

  //     const updatedCart = await apiRoot
  //       .withProjectKey({ projectKey: this.PROJECT_KEY })
  //       .me()
  //       .carts()
  //       .withId({ ID: cart.id })
  //       .post({ body: payload })
  //       .execute();

  //     return updatedCart.body;
  //   } catch (error) {
  //     console.error("Failed to add product to cart:", error);
  //     throw new Error("Add to cart failed");
  //   }
  // }

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

  // public initAnonymousClient() {
  //   const anonymousId = this.getOrCreateAnonymousId();

  //   const options: AnonymousAuthOptions = {
  //     host: this.OAUTH_URI,
  //     projectKey: this.PROJECT_KEY,
  //     credentials: this.SPA_CREDENTIALS,
  //     scopes: [
  //       `manage_my_profile:${this.PROJECT_KEY}`,
  //       `manage_my_orders:${this.PROJECT_KEY}`,
  //       `view_published_products:${this.PROJECT_KEY}`,
  //     ],
  //     anonymousId,
  //     tokenCache: {
  //       get: (): TokenStore | null => {
  //         const cached = localStorage.getItem("accessToken");
  //         return cached ? JSON.parse(cached) : null;
  //       },
  //       set: (cache: TokenStore): void => {
  //         localStorage.setItem("accessToken", JSON.stringify(cache));
  //       },
  //     },
  //     fetch,
  //   };

  //   this.client = new ClientBuilder()
  //     .withAnonymousSessionFlow(options)
  //     .withHttpMiddleware({ host: this.BASE_URI })
  //     .build();
  // }

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
    // this.initAnonymousClient();
  }

  /**
   * Remove a line item from the cart
   */
  public async removeFromCart(
    cartId: string,
    version: number,
    lineItemId: string
  ) {
    return this.getAuth()
      ? this.removeFromCustomerCart(cartId, version, lineItemId)
      : this.removeFromDefaultCart(cartId, version, lineItemId);
  }

  public async removeFromDefaultCart(
    cartId: string,
    version: number,
    lineItemId: string
  ) {
    const apiRoot = this.getApiRoot(this.defaultClient);
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
    try {
      const res = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .carts()
        .withId({ ID: cartId })
        .post({ body })
        .execute();

      return res.body;
    } catch (error) {
      console.error("Failed to remove product from cart:", error);
    }
  }

  public async removeFromCustomerCart(
    cartId: string,
    version: number,
    lineItemId: string
  ) {
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
    try {
      const res = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .carts()
        .withId({ ID: cartId })
        .post({ body })
        .execute();

      return res.body;
    } catch (error) {
      console.error("Failed to remove product from cart:", error);
    }
  }

  // async removeLineItemFromCart(
  //   cartId: string,
  //   version: number,
  //   lineItemId: string
  // ) {
  //   const apiRoot = this.getApiRoot(this.client);
  //   if (!apiRoot) throw new Error("Unauthorized action");

  //   const body: MyCartUpdate = {
  //     version,
  //     actions: [
  //       {
  //         action: "removeLineItem",
  //         lineItemId,
  //       } as MyCartUpdateAction,
  //     ],
  //   };

  //   const res = await apiRoot
  //     .withProjectKey({ projectKey: this.PROJECT_KEY })
  //     .me()
  //     .carts()
  //     .withId({ ID: cartId })
  //     .post({ body })
  //     .execute();

  //   return res.body;
  // }

  // CLEAR CART
  public async clearCart(
    cartId: string,
    version: number,
    lineItemIds: string[]
  ): Promise<ClientResponse<Cart>> {
    return this.getAuth()
      ? this.clearCustomerCart(cartId, version, lineItemIds)
      : this.clearDefaultCart(cartId, version, lineItemIds);
  }

  // CLEAR CUSTOMER CART
  public async clearCustomerCart(
    cartId: string,
    version: number,
    lineItemIds: string[]
  ): Promise<ClientResponse<Cart>> {
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");

    const body: MyCartUpdate = {
      version,
      actions: lineItemIds.map((lineItemId) => ({
        action: "removeLineItem",
        lineItemId,
      })),
    };
    try {
      const res = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .carts()
        .withId({ ID: cartId })
        .post({ body })
        .execute();
      return res;
    } catch (error) {
      console.error("Failed to clear customer cart:", error);
    }
  }

  // CLEAR DEFAULT CART
  public async clearDefaultCart(
    cartId: string,
    version: number,
    lineItemIds: string[]
  ): Promise<ClientResponse<Cart>> {
    const apiRoot = this.getApiRoot(this.defaultClient);
    if (!apiRoot) throw new Error("Unauthorized action");

    const body: MyCartUpdate = {
      version,
      actions: lineItemIds.map((lineItemId) => ({
        action: "removeLineItem",
        lineItemId,
      })),
    };
    try {
      const res = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .carts()
        .withId({ ID: cartId })
        .post({ body })
        .execute();
      return res;
    } catch (error) {
      console.error("Failed to clear customer cart:", error);
    }
  }

  // DELETE CART
  public async deleteCart(cartId: string, version: number): Promise<Cart> {
    return this.getAuth()
      ? this.deleteCustomerCart(cartId, version)
      : this.deleteDefaultCart(cartId, version);
  }
  // DELETE DEFAULT CART
  public async deleteDefaultCart(
    cartId: string,
    version: number
  ): Promise<Cart> {
    const apiRoot = this.getApiRoot(this.defaultClient);
    if (!apiRoot) throw new Error("Unauthorized action");

    try {
      const { body: deletedCart } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .carts()
        .withId({ ID: cartId })
        .delete({ queryArgs: { version } })
        .execute();
      return deletedCart;
    } catch (error) {
      console.error("Failed to delete default cart:", error);
    }
  }

  // DELETE CUSTOMER CART
  public async deleteCustomerCart(
    cartId: string,
    version: number
  ): Promise<Cart> {
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");

    try {
      const { body: deletedCart } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .carts()
        .withId({ ID: cartId })
        .delete({ queryArgs: { version } })
        .execute();
      return deletedCart;
    } catch (error) {
      console.error("Failed to delete customer cart:", error);
    }
  }

  // end
}

// Singleton instance
export const apiClient = new ApiClient();
