import {
  type Customer,
  type MyCustomerDraft,
  type Image,
  type ProductVariant,
  Cart,
  Category,
  MyCartUpdate,
} from "@commercetools/platform-sdk";

// Error type
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

// Registration form
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

// Country
export interface СountriesList {
  name: string;
  code: string;
}

// User
export interface User {
  firstName: string;
  lastName: string;
  email: string;
}

// Token storage
export interface TokenStore {
  token: string;
  expirationTime: number;
  refreshToken?: string;
}

// Auth context
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

// Product catalog props
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

// Product representation
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

// Filters
export interface MyProductFilter {
  minPrice: string;
  maxPrice: string;
  discountOnly: boolean;
}

// Sorting & searching
export type SortDirection = "asc" | "desc";
export type SearchTypes = "name" | "category";

// Customer profile
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

// UI/UX types
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

// Cart
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  priceDiscounted?: number;
  quantity: number;
  image: string;
  key: string;
}

// Cart context
export interface CartContextType {
  cart?: Cart | null;
  cartItems: CartItem[];
  addToCart: (
    product: CartItem | string,
    variantId?: number
  ) => void | Promise<void>;
  removeFromCart: (productId: string, variantId?: number) => void;
  isInCart?: (productId: string, variantId?: number) => boolean;
  isLoadingAddToCart?: (productId: string) => boolean;
  cartCount: number;
  clearCart: () => void;
  updateQuantity?: (id: string, newQuantity: number) => void;
  incrementQuantity?: (id: string) => void;
  decrementQuantity?: (id: string) => void;
  reloadCart?: () => Promise<void>;
  removeLineItem?: (lineItemId: string) => Promise<void>;
  clearEntireCart?: () => Promise<void>;
  totalItems?: number;
  changeQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: (code: string) => Promise<void>;
  cartService: ICartService;
  removeAllDiscountCodes: () => Promise<void>;
}

// Quantity change
interface QuantityChangeEvent extends React.ChangeEvent<HTMLInputElement> {
  customProperty?: string;
}

export interface HandleQuantityChange {
  (e: QuantityChangeEvent, id: string | number): void;
}

export type UpdateQuantityFn = (id: string, newQuantity: number) => void;

export interface ChangeQuantityFn {
  (id: string): void;
}

export interface ICartService {
  getActiveCart(): Promise<Cart>;
  createCart(customer?: Customer): Promise<Cart>;
  updateCart(cartId: string, payload: MyCartUpdate): Promise<Cart>;
  changeLineItemQuantity(
    cartId: string,
    version: number,
    lineItemId: string,
    quantity: number
  ): Promise<Cart>;
  addDiscountCode(cartId: string, version: number, code: string): Promise<Cart>;
  removeDiscountCode(
    cartId: string,
    version: number,
    discountCodeId: string
  ): Promise<Cart>;
}
