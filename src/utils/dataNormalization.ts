import { type MyProductsData } from "@/@types/interfaces";
import {
  Product,
  ProductProjection,
  ProductProjectionPagedQueryResponse,
  type ProductProjectionPagedSearchResponse,
} from "@commercetools/platform-sdk";

export function allProductsNormalization(
  data: ProductProjectionPagedQueryResponse
): MyProductsData[] {
  return data.results.map((product: ProductProjection) =>
    productDataNormalization(product)
  );
}

export function productDataNormalization(product: ProductProjection | Product): MyProductsData {
  const masterVariant = 'masterData' in product
    ? product.masterData.current.masterVariant
    : product.masterVariant;

  const variants = 'masterData' in product
    ? product.masterData.current.variants
    : product.variants;

  const name = 'masterData' in product
    ? product.masterData.current.name["en-US"]
    : product.name["en-US"];

  const description = 'masterData' in product
    ? product.masterData.current.description?.["en-US"] ?? ""
    : product.description?.["en-US"] ?? "";

  return {
    id: product.id,
    key: product.key,
    date: product.createdAt,
    name,
    description,
    sku: masterVariant?.sku ?? "",
    price: masterVariant?.prices?.[0]?.value.centAmount / 100 || NaN,
    priceDiscounted:
      masterVariant?.prices?.[0]?.discounted?.value?.centAmount / 100 || NaN,
    images: masterVariant?.images || [],
    variants:
      variants?.map((variant) => ({
        id: variant.id,
        sku: variant.sku || "",
        prices: variant.prices || [],
        images: variant.images || [],
        attributes: variant.attributes || [],
      })) || [],
  };
}


export function productSearchNormalization(
  data: ProductProjectionPagedSearchResponse,
): { products: MyProductsData[]; total: number } {
  const products: MyProductsData[] = data.results.map((record) => {
    return productDataNormalization(record);
  });

  return {
    products,
    total: data.total,
  };
}
