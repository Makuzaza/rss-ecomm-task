import { ICartService } from "@/@types/interfaces";
import { Cart, MyCartUpdate } from "@commercetools/platform-sdk";
import { ApiRoot } from "@commercetools/platform-sdk"; // нужен тип для apiRoot

export class AnonymousCartService implements ICartService {
  constructor(
    private apiRoot: ApiRoot,
    private projectKey: string,
  ) {}

  async getActiveCart(): Promise<Cart> {
    const cartId = localStorage.getItem("anonymousCartId");
    if (!cartId) throw new Error("No anonymous cart found.");

    const response = await this.apiRoot
      .withProjectKey({ projectKey: this.projectKey })
      .me()
      .carts()
      .withId({ ID: cartId })
      .get()
      .execute();

    return response.body;
  }

  async createCart(): Promise<Cart> {
    const anonymousId =
      localStorage.getItem("anonymousId") || crypto.randomUUID();
    localStorage.setItem("anonymousId", anonymousId);

    const body = {
      currency: "EUR",
      anonymousId,
    };

    const response = await this.apiRoot
      .withProjectKey({ projectKey: this.projectKey })
      .me()
      .carts()
      .post({ body })
      .execute();

    localStorage.setItem("anonymousCartId", response.body.id);

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

  async changeLineItemQuantity(
    cartId: string,
    version: number,
    lineItemId: string,
    quantity: number,
  ): Promise<Cart> {
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

  async addDiscountCode(
    cartId: string,
    version: number,
    code: string,
  ): Promise<Cart> {
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

  async removeDiscountCode(
    cartId: string,
    version: number,
    discountCodeId: string,
  ): Promise<Cart> {
    const payload: MyCartUpdate = {
      version,
      actions: [
        {
          action: "removeDiscountCode",
          discountCode: {
            typeId: "discount-code",
            id: discountCodeId,
          },
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
