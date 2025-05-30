import { ProductPagedQueryResponse } from "@commercetools/platform-sdk";

export function apiDataProcessing(data: ProductPagedQueryResponse) {
  return data.results.map((record) => {
    const currentData = record.masterData.current;
    const masterVariant = currentData.masterVariant;

    return {
      id: record.id,
      name: currentData.name["en-US"],
      description: currentData.description["en-US"],
      sku: masterVariant.sku,
      price: masterVariant.prices[0].value.centAmount,
      priceDiscounted: masterVariant.prices[0].discounted.value.centAmount,
      images: masterVariant.images,
    };
  });
}
