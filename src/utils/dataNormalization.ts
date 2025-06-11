import { type MyProductsData } from "@/@types/interfaces";
import {
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
