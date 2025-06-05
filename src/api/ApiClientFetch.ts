import { Customer, MyCustomerUpdate } from "@commercetools/platform-sdk";
import CreateApiClient from "./CreateApiClient";

class ApiClientFetch extends CreateApiClient {
  /**
   * UPDATE CUSTOMER
   */
  public async updateCustomer(
    customerId: string,
    updatePayload: MyCustomerUpdate
  ): Promise<Customer> {
    const tokenObj = JSON.parse(localStorage.getItem("accessToken"));
    if (!tokenObj) {
      throw new Error("token not found");
    }
    const apiPath = `${this.BASE_URI}/${this.PROJECT_KEY}/customers/${customerId}`;
    const token = tokenObj.token;

    const response = await fetch(apiPath, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to update customer: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    return await response.json();
  }

  //end
}

export const apiClientFetch = new ApiClientFetch();
