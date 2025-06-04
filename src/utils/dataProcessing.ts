import { MyProductsData, SortDirection } from "@/@types/interfaces";
import {
  ProductPagedQueryResponse,
  ProductProjectionPagedSearchResponse,
} from "@commercetools/platform-sdk";

export function apiDataProcessing(
  data: ProductPagedQueryResponse
): MyProductsData[] {
  return data.results.map((record) => {
    const currentData = record.masterData.current;
    const masterVariant = currentData.masterVariant;
    const price = masterVariant.prices?.[0]?.value.centAmount / 100 || 0;
    const discountedPrice =
      masterVariant.prices?.[0]?.discounted?.value.centAmount / 100;

    return {
      id: record.id,
      key: record.key,
      name: currentData.name["en-US"],
      description: currentData.description?.["en-US"] || "",
      sku: masterVariant.sku,
      price: price,
      priceDiscounted: discountedPrice,
      images: masterVariant.images,
    };
  });
}

export function apiDataSearchProcessing(
  data: ProductProjectionPagedSearchResponse
) {
  return data.results.map((record) => {
    return {
      id: record.id,
      key: record.key,
      name: record.name["en-US"],
      description: record.description["en-US"],
      sku: record.masterVariant.sku,
      price: record.masterVariant.prices[0].value.centAmount / 100,
      priceDiscounted:
        record.masterVariant.prices[0].discounted.value.centAmount / 100,
      images: record.masterVariant.images,
    };
  });
}

export function sortProducts(
  products: MyProductsData[],
  key: keyof MyProductsData,
  direction: SortDirection = "asc"
): MyProductsData[] {
  return [...products].sort((a, b) => {
    // Handle string comparison
    if (typeof a[key] === "string") {
      return direction === "asc"
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    }

    // Handle number comparison
    if (typeof a[key] === "number") {
      return direction === "asc"
        ? Number(a[key]) - Number(b[key])
        : Number(b[key]) - Number(a[key]);
    }

    return 0;
  });
}
