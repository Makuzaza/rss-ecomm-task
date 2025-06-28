import { Cart, MyCartUpdateAction } from "@commercetools/platform-sdk"; // Удалил Cart
import { apiClient } from "@/api/ApiClient";

export const mergeAnonymousCartWithCustomerCart =
  async (): Promise<Cart | null> => {
    const anonymousCartId = localStorage.getItem("anonymousCartId");
    if (!anonymousCartId) return null;

    try {
      const { body: anonCart } = await apiClient.publicApiRoot
        .withProjectKey({ projectKey: apiClient.publicProjectKey })
        .carts()
        .withId({ ID: anonymousCartId })
        .get()
        .execute();

      const { body: customerCart } = await apiClient.publicApiRoot
        .withProjectKey({ projectKey: apiClient.publicProjectKey })
        .me()
        .activeCart()
        .get()
        .execute()
        .catch(async () => {
          const res = await apiClient.publicApiRoot
            .withProjectKey({ projectKey: apiClient.publicProjectKey })
            .me()
            .carts()
            .post({ body: { currency: "EUR" } })
            .execute();
          return res;
        });

      const newItems: MyCartUpdateAction[] = anonCart.lineItems.map((item) => ({
        action: "addLineItem",
        productId: item.productId,
        variantId: item.variant.id,
        quantity: item.quantity,
      }));

      // console.log("Merging anonymous cart...");
      // console.log("Anonymous cart ID:", anonymousCartId);
      // console.log("Customer cart ID:", customerCart.id);
      // console.log("Line items to move:", newItems);

      if (newItems.length > 0) {
        const { body: updatedCart } = await apiClient.publicApiRoot
          .withProjectKey({ projectKey: apiClient.publicProjectKey })
          .me()
          .carts()
          .withId({ ID: customerCart.id })
          .post({
            body: {
              version: customerCart.version,
              actions: newItems,
            },
          })
          .execute();
        await apiClient.publicApiRoot
          .withProjectKey({ projectKey: apiClient.publicProjectKey })
          .carts()
          .withId({ ID: anonCart.id })
          .delete({ queryArgs: { version: anonCart.version } })
          .execute();

        localStorage.removeItem("anonymousCartId");
        localStorage.removeItem("anonymousId");

        return updatedCart;
      }

      return customerCart;
    } catch (err) {
      console.error("Failed to merge anonymous cart:", err);
      return null;
    }
  };
