import { CartItem, type MyProductsData } from "@/@types/interfaces";
import {
  type Cart,
  type Product,
  type ProductPagedQueryResponse,
  type ProductProjectionPagedSearchResponse,
} from "@commercetools/platform-sdk";

export function allProductsNormalization(
  data: ProductPagedQueryResponse
): MyProductsData[] {
  return data.results.map((data) => {
    return productDataNormalization(data);
  });
}

export function productDataNormalization(data: Product): MyProductsData {
  const currentData = data.masterData.current;
  const masterVariant = currentData.masterVariant;
  const price = masterVariant.prices?.[0]?.value.centAmount / 100 || 0;
  const discountedPrice =
    masterVariant.prices?.[0]?.discounted?.value.centAmount / 100;

  return {
    id: data.id,
    key: data.key,
    date: data.createdAt,
    name: currentData.name["en-US"],
    description: currentData.description?.["en-US"] || "",
    sku: masterVariant.sku,
    price: price,
    priceDiscounted: discountedPrice,
    images: masterVariant.images,
    variants: currentData.variants,
  };
}

export function productSearchNormalization(
  data: ProductProjectionPagedSearchResponse
) {
  return data.results.map((record) => {
    const price = record.masterVariant.prices?.[0]?.value.centAmount / 100 || 0;
    const discountedPrice =
      record.masterVariant.prices?.[0]?.discounted?.value.centAmount / 100 ||
      undefined;

    return {
      id: record.id,
      key: record.key,
      data: record.createdAt,
      name: record.name["en-US"],
      description: record.description["en-US"] || "",
      sku: record.masterVariant.sku || "",
      price: price,
      priceDiscounted: discountedPrice,
      images: record.masterVariant.images,
      variants: record.variants,
    };
  });
}

export function cartItemsNormalization(cart: Cart): CartItem[] {
  const items: CartItem[] = cart.lineItems.map((item) => ({
    id: item.productId,
    name: item.name?.["en-US"] || "",
    price: item.price?.value.centAmount ? item.price.value.centAmount / 100 : 0,
    priceDiscounted: item.price?.discounted?.value.centAmount
      ? item.price.discounted.value.centAmount / 100
      : undefined,
    image: item.variant.images?.[0]?.url || "",
    key: item.productKey || "",
    quantity: item.quantity,
  }));

  return items;
}
