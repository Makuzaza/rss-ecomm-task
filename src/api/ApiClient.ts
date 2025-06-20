import CreateApiClient from "./CreateApiClient";
import {
  allProductsNormalization,
  productDataNormalization,
  productSearchNormalization,
} from "@/utils/dataNormalization";

// types
import {
  type CategoryPagedQueryResponse,
  type CustomerSignInResult,
  type MyCustomerDraft,
  type MyCustomerUpdate,
  type Customer,
  Cart,
  // CartPagedQueryResponse,
} from "@commercetools/platform-sdk";
import {
  CartItem,
  SearchTypes,
  type CommerceToolsError,
  type MyProductsData,
} from "../@types/interfaces";

export class ApiClient extends CreateApiClient {
  /**
   * DEFAULT CUSTOMER
   */
  /**
   * GET DEFAULT PROFILE
   */
  public async getDefaultProfile() {
    const apiRoot = this.getApiRoot(this.defaultClient);
    if (!apiRoot) throw new Error("Unauthorized action");

    try {
      const { body: customer } = await apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .carts()
        .get()
        .execute();
      return customer;
    } catch (error) {
      console.log(error);
    }
  }

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

      this.isAuth = true;
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

      this.isAuth = true;
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

      this.isAuth = true;
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

      return allProductsNormalization(data);
    } catch (error) {
      console.log(error);
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
    searchValue: string
  ): Promise<MyProductsData[]> {
    const apiRoot = this.getApiRoot(this.defaultClient);

    let searchArgs = {};
    switch (searchType) {
      case "name":
        searchArgs = { "text.en-US": searchValue, limit: 10 };
        break;
      case "category":
        searchArgs = { "filter.query": `categories.id:"${searchValue}"` };
        break;
    }

    try {
      const { body: data } = await apiRoot
        .withProjectKey({
          projectKey: this.PROJECT_KEY,
        })
        .productProjections()
        .search()
        .get({
          queryArgs: searchArgs,
        })
        .execute();
      return productSearchNormalization(data);
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

  /**
   * GET CART
   */
  public async getCart(): Promise<Cart> {
    const cartId = localStorage.getItem("cartId");

    if (cartId) {
      console.log("You have cart:");

      this.myCart = await apiClient.getCartById(cartId);
      return this.myCart;
    } else {
      console.log("You don't have a cart:");

      this.myCart = await apiClient.createCart();
      localStorage.setItem("cartId", this.myCart.id);
      return this.myCart;
    }
  }

  // GET CART BASED ON AUTHENTICATION
  public async getCartById(cartId: string) {
    if (this.isAuth) {
      return await this.getCustomerCartById(cartId);
    } else {
      return await this.getDefaultCartById(cartId);
    }
  }

  // GET DEFAULT CUSTOMER CART
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
    } catch {
      console.log("Failed to fetch default cart");
    }
  }

  // GET AUTHORIZED CUSTOMER CART
  public async getCustomerCartById(cartId: string) {
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");
    try {
      const { body: cart } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .carts()
        .withId({ ID: cartId })
        .get()
        .execute();
      return cart;
    } catch {
      console.log("Failed to fetch customer cart");
      // throw new Error("Failed to fetch active cart");
    }
  }

  /**
   * CREATE CART
   */

  // CREATE BASED ON AUTHENTICATION
  public async createCart() {
    if (this.isAuth) {
      return await this.createCustomerCart();
    } else {
      return await this.createDefaultCart();
    }
  }

  // CREATE DEFAULT CART
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

      return cart;
    } catch {
      throw new Error("Failed to create default cart");
    }
  }
  // CREATE CUSTOMER CART
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

  /**
   * UPDATE CART
   */

  // UPDATE CART BASED ON AUTHENTICATION
  public async updateCart(cart: Cart, product: CartItem) {
    if (this.isAuth) {
      return this.updateCustomerCart(cart, product);
    } else {
      return this.updateDefaultCart(cart, product);
    }
  }

  // UPDATE DEFAULT CART
  public async updateDefaultCart(cart: Cart, product: CartItem): Promise<Cart> {
    const apiRoot = this.getApiRoot(this.defaultClient);
    if (!apiRoot) throw new Error("Unauthorized action");

    const productId = product.id;
    const variantId = 1;

    try {
      const { body: updatedCart } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .carts()
        .withId({ ID: cart.id })
        .post({
          body: {
            version: cart.version,
            actions: [
              {
                action: "addLineItem",
                productId,
                variantId,
                quantity: 1,
              },
            ],
          },
        })
        .execute();

      return updatedCart;
    } catch {
      throw new Error("Failed to update default cart");
    }
  }

  // UPDATE DEFAULT CART
  public async updateCustomerCart(cart: Cart, product: CartItem) {
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");
    const productId = product.id;
    const variantId = 1;

    try {
      const { body: updatedCart } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .carts()
        .withId({ ID: cart.id })
        .post({
          body: {
            version: cart.version,
            actions: [
              {
                action: "addLineItem",
                productId,
                variantId,
                quantity: 1,
              },
            ],
          },
        })
        .execute();

      return updatedCart;
    } catch {
      throw new Error("Failed to update customer cart");
    }
  }

  /**
   * DELETE CART
   */

  // DELETE CART BASED ON AUTHENTICATION
  public async deleteCart(cart: Cart) {
    if (this.isAuth) {
      return this.deleteCustomerCart(cart);
    } else {
      return this.deleteDefaultCart(cart);
    }
  }
  // DELETE DEFAULT CART
  public async deleteDefaultCart(cart: Cart) {
    const apiRoot = this.getApiRoot(this.defaultClient);
    if (!apiRoot) throw new Error("Unauthorized action");

    try {
      const { body: result } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .carts()
        .withId({ ID: cart.id })
        .delete({
          queryArgs: {
            version: cart.version,
          },
        })
        .execute();
      return result;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to delete default cart");
    }
  }

  // DELETE CUSTOMER CART
  public async deleteCustomerCart(cart: Cart) {
    const apiRoot = this.getApiRoot(this.client);
    if (!apiRoot) throw new Error("Unauthorized action");

    try {
      const { body: result } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .carts()
        .withId({ ID: cart.id })
        .delete({
          queryArgs: {
            version: cart.version,
          },
        })
        .execute();
      return result;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to delete customer cart");
    }
  }

  // end
}

// Singleton instance
export const apiClient = new ApiClient();
