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
  itemsPerPage?: number;
  onResetFilters?: () => void;
}

export interface MyProductsData {
  id: string;
  key?: string;
  date?: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  priceDiscounted: number;
  images?: Image[];
  variants?: ProductVariant[];
}

export interface MyProductFilter {
  minPrice: string;
  maxPrice: string;
  discountOnly: boolean;
}

export type SortDirection = "asc" | "desc";
export type SearchTypes = "name" | "category";

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

export interface ValidatedInputProps {
  label: string;
  type: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (v: string) => void;
  showToggle?: boolean;
  isShown?: boolean;
  onToggleShow?: () => void;
}

export interface CategoryDropdownProps {
  onItemSelected?: () => void;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  priceDiscounted?: number;
  quantity: number;
  image: string;
  key: string;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => void;
  cartCount: number;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  totalItems: number;
}

interface QuantityChangeEvent extends React.ChangeEvent<HTMLInputElement> {
  customProperty?: string;
}

export interface HandleQuantityChange {
  (e: QuantityChangeEvent, id: string | number): void;
}

export interface UpdateQuantityFn {
  (id: string, newQuantity: number): void;
}

export interface IncrementQuantityFn {
  (id: string): void;
}

export interface DecrementQuantityFn {
  (id: string): void;
}
