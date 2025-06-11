import {
  type Customer,
  // CustomerSignInResult,
  type MyCustomerDraft,
  type Image,
  type ProductVariant,
} from "@commercetools/platform-sdk";
import { Category } from "@commercetools/platform-sdk";

export interface CommerceToolsError {
  body: {
    statusCode: number;
    message: string;
    errors?: {
      code: string;
      message: string;
      field?: string;
    }[];
  };
}

export type RegisterFormFields = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  shippingCountry: string;
  shippingCity: string;
  shippingStreet: string;
  shippingPostalCode: string;
  billingCountry: string;
  billingCity: string;
  billingStreet: string;
  billingPostalCode: string;
};

export interface СountriesList {
  name: string;
  code: string;
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
}

export interface TokenStore {
  token: string;
  expirationTime: number;
  refreshToken?: string;
}

export interface AuthContextType {
  isAuth: boolean;
  customer: Customer | null;
  token: string | null;
  login: (email: string, password: string) => Promise<Customer>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  register: (customerData: MyCustomerDraft) => Promise<Customer>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshToken: () => Promise<void>;
  setCustomer: (customer: Customer | null) => void;
  relogin: (params: { email: string; password: string }) => Promise<void>;
}

export interface ProductCatalogProps {
  categoryId?: string;
  propsLimit?: number;
  propsApiSort?: string;
  propsSort?: string;
  propsProducts?: MyProductsData[];
  filterMinPrice?: string;
  filterMaxPrice?: string;
  filterDiscountOnly?: boolean;
}

export interface MyProductsData {
  id: string;
  key: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  priceDiscounted: number;
  images: Image[];
  variants: ProductVariant[];
}

export interface MyProductFilter {
  minPrice: string;
  maxPrice: string;
  discountOnly: boolean;
}

export type SortDirection = "asc" | "desc";

export interface SearchResult {
  id: string;
  key?: string;
  name: { [key: string]: string };
}

export interface CustomerAddress {
  id?: string;
  streetName: string;
  postalCode: string;
  city: string;
  country: string;
  state?: string;
}

export interface CustomerProfile {
  id: string;
  version: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  addresses: CustomerAddress[];
  defaultBillingAddressId?: string;
  defaultShippingAddressId?: string;
}

export interface ClickOutsideEvent extends MouseEvent {
  target: Node;
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

export type InteractionEvent = MouseEvent | KeyboardEvent | TouchEvent;
