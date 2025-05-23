import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "@/pages/register/Register";
import { useApiClient } from "@/api/ApiClientContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import "@testing-library/jest-dom";

// Mock the dependencies
jest.mock("@/api/ApiClientContext");
jest.mock("@/context/AuthContext");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockRegisterCustomer = jest.fn();
const mockUseApiClient = useApiClient as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockUseNavigate = useNavigate as jest.Mock;

describe("Registration Form", () => {
  beforeEach(() => {
    mockUseApiClient.mockReturnValue({
      registerCustomer: mockRegisterCustomer,
    });
    mockUseAuth.mockReturnValue({ user: null });
    mockUseNavigate.mockReturnValue(jest.fn());
    mockRegisterCustomer.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<Register />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Date of Birth")).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
    expect(screen.getByLabelText("Street Address")).toBeInTheDocument();
    expect(screen.getByLabelText("City")).toBeInTheDocument();
    expect(screen.getByLabelText("Postal Code")).toBeInTheDocument();
    expect(
      screen.getByText("Set as default shipping and billing address")
    ).toBeInTheDocument();
  });

  it("shows validation errors for required fields", async () => {
    render(<Register />);

    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(screen.getByText("First name is required")).toBeInTheDocument();
      expect(screen.getByText("Last name is required")).toBeInTheDocument();
      expect(screen.getByText("Date of birth is required")).toBeInTheDocument();
      expect(screen.getByText("Country is required")).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "invalid-email" },
    });
    fireEvent.blur(screen.getByLabelText("Email"));

    await waitFor(() => {
      expect(screen.getByText("Email is invalid")).toBeInTheDocument();
    });
  });

  it("validates password requirements", async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "weak" },
    });

    await waitFor(() => {
      expect(screen.getByText("• Minimum 8 characters")).toBeInTheDocument();
      expect(
        screen.getByText("• At least 1 uppercase letter")
      ).toBeInTheDocument();
      expect(
        screen.getByText("• At least 1 lowercase letter")
      ).toBeInTheDocument();
      expect(screen.getByText("• At least 1 number")).toBeInTheDocument();
    });
  });

  it("validates password confirmation", async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "ValidPass123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "DifferentPass123" },
    });
    fireEvent.blur(screen.getByLabelText("Confirm Password"));

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    });
  });

  it("disables address fields when no country selected", () => {
    render(<Register />);

    expect(screen.getByLabelText("Street Address")).toBeDisabled();
    expect(screen.getByLabelText("City")).toBeDisabled();
    expect(screen.getByLabelText("Postal Code")).toBeDisabled();
  });

  it("enables address fields when country is selected", async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "DE" },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Street Address")).toBeEnabled();
      expect(screen.getByLabelText("City")).toBeEnabled();
      expect(screen.getByLabelText("Postal Code")).toBeEnabled();
    });
  });

  it("clears postal code when country changes", async () => {
    render(<Register />);

    // Select first country and enter postal code
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "DE" },
    });
    fireEvent.change(screen.getByLabelText("Postal Code"), {
      target: { value: "10115" },
    });

    // Change country
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "FR" },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Postal Code")).toHaveValue("");
    });
  });

  it("shows country-specific postal code validation", async () => {
    render(<Register />);

    // Select Germany (postal code format: ^\d{5}$)
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "DE" },
    });
    fireEvent.change(screen.getByLabelText("Postal Code"), {
      target: { value: "invalid" },
    });
    fireEvent.blur(screen.getByLabelText("Postal Code"));

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid postal code format/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Example for Germany: 10115/)
      ).toBeInTheDocument();
    });
  });

  it("submits the form with valid data", async () => {
    const mockNavigate = jest.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);

    render(<Register />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "ValidPass123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "ValidPass123" },
    });
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Date of Birth"), {
      target: { value: "1990-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "DE" },
    });
    fireEvent.change(screen.getByLabelText("Street Address"), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "Berlin" },
    });
    fireEvent.change(screen.getByLabelText("Postal Code"), {
      target: { value: "10115" },
    });

    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(mockRegisterCustomer).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "ValidPass123",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        addresses: [
          {
            streetName: "123 Main St",
            city: "Berlin",
            postalCode: "10115",
            country: "DE",
          },
        ],
        defaultShippingAddress: 0,
        defaultBillingAddress: 0,
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("handles API errors", async () => {
    mockRegisterCustomer.mockRejectedValue(new Error("Registration failed"));

    render(<Register />);

    // Fill minimal valid form
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "ValidPass123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "ValidPass123" },
    });
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Date of Birth"), {
      target: { value: "1990-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "DE" },
    });
    fireEvent.change(screen.getByLabelText("Street Address"), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "Berlin" },
    });
    fireEvent.change(screen.getByLabelText("Postal Code"), {
      target: { value: "10115" },
    });

    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(screen.getByText("Registration failed")).toBeInTheDocument();
    });
  });
});
