const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8081/api/v1";

export interface Address {
  _id: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface AddressInput {
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

// Add address to user
export const addAddress = async (
  _userId: string,
  addressData: AddressInput,
  token: string
): Promise<{ success: boolean; addresses: Address[]; message: string }> => {
  const response = await fetch(`${baseURL}/accounts/me/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to add address");
  }

  return await response.json();
};

// Update address
export const updateAddress = async (
  _userId: string,
  addressId: string,
  addressData: Partial<AddressInput>,
  token: string
): Promise<{ success: boolean; addresses: Address[]; message: string }> => {
  const response = await fetch(
    `${baseURL}/accounts/me/addresses/${addressId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update address");
  }

  return await response.json();
};

// Delete address
export const deleteAddress = async (
  _userId: string,
  addressId: string,
  token: string
): Promise<{ success: boolean; addresses: Address[]; message: string }> => {
  const response = await fetch(
    `${baseURL}/accounts/me/addresses/${addressId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete address");
  }

  return await response.json();
};
