import { ICartService } from "@/@types/interfaces";
import { Customer, MyCartUpdate, Cart } from "@commercetools/platform-sdk";
import { ApiRoot } from "@commercetools/platform-sdk"; 


export class CustomerCartService implements ICartService {
  constructor(
    private apiRoot: ApiRoot,
    private projectKey: string
  ) {}

  async getActiveCart(): Promise<Cart> {
    const response = await this.apiRoot
      .withProjectKey({ projectKey: this.projectKey })
      .me()
      .activeCart()
      .get()
      .execute();
    return response.body;
  }

  async createCart(customer?: Customer): Promise<Cart> {
    const body: { currency: string; country?: string } = { currency: "EUR" };

    if (customer?.defaultShippingAddressId) {
      const address = customer.addresses?.find(
        (a) => a.id === customer.defaultShippingAddressId
      );
      if (address?.country) body.country = address.country;
    }

    const response = await this.apiRoot
      .withProjectKey({ projectKey: this.projectKey })
      .me()
      .carts()
      .post({ body })
      .execute();
    return response.body;
  }

  async updateCart(cartId: string, payload: MyCartUpdate): Promise<Cart> {
    const response = await this.apiRoot
      .withProjectKey({ projectKey: this.projectKey })
      .me()
      .carts()
      .withId({ ID: cartId })
      .post({ body: payload })
      .execute();
    return response.body;
  }

  async changeLineItemQuantity(cartId: string, version: number, lineItemId: string, quantity: number): Promise<Cart> {
    const payload: MyCartUpdate = {
      version,
      actions: [
        {
          action: "changeLineItemQuantity",
          lineItemId,
          quantity,
        },
      ],
    };

    const response = await this.apiRoot
      .withProjectKey({ projectKey: this.projectKey })
      .me()
      .carts()
      .withId({ ID: cartId })
      .post({ body: payload })
      .execute();

    return response.body;
  }

  async addDiscountCode(cartId: string, version: number, code: string): Promise<Cart> {
    const payload: MyCartUpdate = {
      version,
      actions: [
        {
          action: "addDiscountCode",
          code,
        },
      ],
    };

    const response = await this.apiRoot
      .withProjectKey({ projectKey: this.projectKey })
      .me()
      .carts()
      .withId({ ID: cartId })
      .post({ body: payload })
      .execute();

    return response.body;
}

}
