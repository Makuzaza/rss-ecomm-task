import { type MyProductsData } from "@/@types/interfaces";
import {
  type ProductPagedQueryResponse,
  type ProductProjectionPagedSearchResponse,
  Product,
  ProductProjection,
} from "@commercetools/platform-sdk";

export function productDataNormalization(product: Product): MyProductsData {
  const currentData = product.masterData.current;
  const masterVariant = currentData.masterVariant;
  const price = masterVariant.prices?.[0]?.value.centAmount / 100 || 0;
  const discountedPrice =
    masterVariant.prices?.[0]?.discounted?.value.centAmount / 100 || undefined;

  return {
    id: product.id,
    key: product.key,
    date: product.createdAt,
    name: currentData.name["en-US"],
    description: currentData.description?.["en-US"] || "",
    sku: masterVariant.sku,
    price,
    priceDiscounted: discountedPrice,
    images: masterVariant.images,
    variants: currentData.variants,
  };
}

export function allProductsNormalization(
  data: ProductPagedQueryResponse
): MyProductsData[] {
  return data.results.map((data) => {
    return productDataNormalization(data);
  });
}

type ProductProjectionContainer = {
  results: ProductProjection[];
};

export function productProjectionNormalization(
  data: ProductProjectionContainer
): MyProductsData[] {
  return data.results.map((record) => {
    const price = record.masterVariant.prices?.[0]?.value.centAmount / 100 || 0;
    const discountedPrice =
      record.masterVariant.prices?.[0]?.discounted?.value.centAmount / 100 ||
      undefined;

    return {
      id: record.id,
      key: record.key,
      date: record.createdAt,
      name: record.name["en-US"],
      description: record.description?.["en-US"] || "",
      sku: record.masterVariant.sku || "",
      price,
      priceDiscounted: discountedPrice,
      images: record.masterVariant.images,
      variants: record.variants,
    };
  });
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

export function singleProductProjectionNormalization(
  data: ProductProjection
): MyProductsData {
  const price = data.masterVariant.prices?.[0]?.value.centAmount / 100 || 0;
  const discountedPrice =
    data.masterVariant.prices?.[0]?.discounted?.value.centAmount / 100;

  return {
    id: data.id,
    key: data.key,
    date: data.createdAt,
    name: data.name["en-US"],
    description: data.description?.["en-US"] || "",
    sku: data.masterVariant.sku,
    price,
    priceDiscounted: discountedPrice,
    images: data.masterVariant.images,
    variants: data.variants,
  };
}
