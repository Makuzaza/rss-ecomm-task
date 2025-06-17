import { MyProductsData } from "@/@types/interfaces";
import { Price } from "@commercetools/platform-sdk";

export const getEURVariant = (
  product: MyProductsData
): { id: number; sku: string } | undefined => {
  if (product.variants && product.variants.length > 0) {
    const match = product.variants.find(
      (variant) =>
        variant.sku &&
        variant.prices?.some(
          (price: Price) =>
            price.value.currencyCode === "EUR" &&
            !price.country &&
            !price.channel &&
            !price.customerGroup
        )
    );

    if (match) {
      return { id: match.id, sku: match.sku };
    }
  }

  if (product.price && product.sku && !isNaN(product.price)) {
    return { id: 1, sku: product.sku };
  }

  return undefined;
};

export const getBuyableVariant = (
  product: MyProductsData
): { id: number; sku: string } | undefined => {
  // Ищем в variants[], если они есть
  if (product.variants && product.variants.length > 0) {
    const match = product.variants.find((variant) =>
      variant.prices?.some(
        (price: Price) =>
          price.value.currencyCode === "EUR" &&
          !price.country &&
          !price.channel &&
          !price.customerGroup
      )
    );
    if (match) return { id: match.id, sku: match.sku };
  }

  // Если нет variants, используем данные на корне
  if (product.price && !isNaN(product.price)) {
    return { id: 1, sku: product.sku };
  }

  return undefined;
};