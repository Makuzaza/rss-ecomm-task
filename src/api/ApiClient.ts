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
  type Cart,
  type MyCustomerSignin,
} from "@commercetools/platform-sdk";
import {
  type CartItem,
  type SearchTypes,
  type CommerceToolsError,
  type MyProductsData,
} from "../@types/interfaces";

export class ApiClient extends CreateApiClient {
  /********************************************************
   ***************** CUSTOMER AUTHENTICATION ****************
   ********************************************************/

  // ***** SIGNIN CUSTOMER WITH PASSWORD *****
  public async getCustomerWithPassword(
    email: string,
    password: string
  ): Promise<CustomerSignInResult> {
    try {
      this.client = this.buildClientWithPassword(email, password);
      const apiRoot = this.getApiRoot(this.client);

      const customerData: MyCustomerSignin = {
        email: email,
        password: password,
        activeCartSignInMode: "MergeWithExistingCustomerCart",
      };

      const { body: customer } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .me()
        .login()
        .post({
          body: customerData,
        })
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

  // ***** SIGNIN CUSTOMER WITH TOKEN *****
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

  // ***** SET AUTHENTICATION *****
  public async setAuth(authState: boolean) {
    this.isAuth = authState;
    console.log("Auth:", this.isAuth);
  }
  // ***** LOGOUT CUSTOMER *****
  public async logout() {
    localStorage.removeItem("accessToken");
    this.setAuth(false);
  }
  // ***** REGISTER CUSTOMER *****
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

  /********************************************************
   ***************** CUSTOMER & PRODUCT DATA **************
   ********************************************************/

  // ***** GET CUSTOMER PROFILE *****
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

  // ***** GET CATEGORIES *****
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

  // ***** GET ALL PRODUCTS *****
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

  // ***** GET PRODUCT WITH KEY *****
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

  // ***** SEARCH DATA *****
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

  // ***** UPDATE CUSTOMER *****
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

  /********************************************************
   *********************** CART ***************************
   ********************************************************/
  /**
   * GET CART
   */

  // ***** GET CUSTOMER CART *****
  public async getCart(): Promise<Cart> {
    const defaultCart = localStorage.getItem("defaultCart");
    const customerCart = localStorage.getItem("customerCart");

    if (defaultCart && customerCart) {
      console.log("You have default & customer cart:");

      this.myCart = await apiClient.getCartById(customerCart);
      return this.myCart;
    } else if (defaultCart) {
      console.log("You have default cart:");

      this.myCart = await apiClient.getCartById(defaultCart);
      return this.myCart;
    } else if (customerCart) {
      console.log("You have customer cart:");

      this.myCart = await apiClient.getCartById(customerCart);
      return this.myCart;
    } else {
      console.log("You don't have a cart:");

      this.myCart = await apiClient.createCart();
      return this.myCart;
    }
  }

  // ***** GET CART BASED ON AUTHENTICATION *****
  public async getCartById(cartId: string) {
    if (this.isAuth) {
      // return await this.getCustomerActiveCart();
      return await this.getCustomerCartById(cartId);
    } else {
      return await this.getDefaultCartById(cartId);
    }
  }

  // ***** GET DEFAULT CUSTOMER CART *****
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

  // ***** GET AUTHORIZED CUSTOMER CART *****
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

  // ***** GET CUSTOMER ACTIVE CART *****
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
    } catch {
      console.log("Failed to fetch customer cart");
      // throw new Error("Failed to fetch active cart");
    }
  }

  // ***** GET ALL CARTS *****
  public async getAllCarts() {
    const apiRoot = this.getApiRoot(this.defaultClient);
    if (!apiRoot) throw new Error("Unauthorized action");
    try {
      const { body: carts } = await apiRoot
        .withProjectKey({ projectKey: this.PROJECT_KEY })
        .carts()
        .get({
          queryArgs: {
            limit: 300,
          },
        })
        .execute();
      return carts.results;
    } catch {
      console.log("Failed to fetch customer cart");
      // throw new Error("Failed to fetch active cart");
    }
  }

  /**
   * CREATE CART
   */

  // ***** CREATE BASED ON AUTHENTICATION *****
  public async createCart() {
    if (this.isAuth) {
      const cart = await this.createCustomerCart();
      localStorage.setItem("customerCart", cart.id);
      return cart;
    } else {
      const cart = await this.createDefaultCart();
      localStorage.setItem("defaultCart", cart.id);
      return cart;
    }
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

  /**
   * UPDATE CUSTOMER CART
   */

  // ***** UPDATE CART BASED ON AUTHENTICATION *****
  public async updateCart(cart: Cart, product: CartItem) {
    if (this.isAuth) {
      return this.updateCustomerCart(cart, product);
    } else {
      return this.updateDefaultCart(cart, product);
    }
  }

  // ***** UPDATE DEFAULT CART *****
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

  // ***** UPDATE CUSTOMER CART *****
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

  // ***** DELETE CART BASED ON AUTHENTICATION *****
  public async deleteCart(cart: Cart) {
    if (this.isAuth) {
      return this.deleteCustomerCart(cart);
    } else {
      return this.deleteDefaultCart(cart);
    }
  }

  // ***** DELETE DEFAULT CART *****
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

  // ***** DELETE CUSTOMER CART *****
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
