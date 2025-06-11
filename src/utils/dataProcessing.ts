import {
  MyProductFilter,
  MyProductsData,
  SortDirection,
} from "@/@types/interfaces";

export function sortProducts(
  products: MyProductsData[],
  arg: string
): MyProductsData[] {
  let key: keyof MyProductsData;
  let direction: SortDirection;

  switch (arg) {
    case "name-desc":
      key = "name";
      direction = "desc";
      break;
    case "price-asc":
      key = "price";
      direction = "asc";
      break;
    case "price-desc":
      key = "price";
      direction = "desc";
      break;
    default:
      key = "name";
      direction = "asc";
  }

  return [...products].sort((a, b) => {
    if (typeof a[key] === "string") {
      return direction === "asc"
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    }

    if (typeof a[key] === "number") {
      return direction === "asc"
        ? Number(a[key]) - Number(b[key])
        : Number(b[key]) - Number(a[key]);
    }

    return 0;
  });
}

export function filterProducts(data: MyProductsData[], arg: MyProductFilter) {
  return data.filter((product) => {
    const price = product.priceDiscounted || product.price;

    const passesMin = arg.minPrice ? price >= Number(arg.minPrice) : true;
    const passesMax = arg.maxPrice ? price <= Number(arg.maxPrice) : true;
    const passesDiscount = arg.discountOnly ? !!product.priceDiscounted : true;

    return passesMin && passesMax && passesDiscount;
  });
}
