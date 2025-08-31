// services/paymongoService.ts
import axios, { AxiosResponse } from "axios";
import { PAYMONGO_CONFIG } from "../config/paymongo";

export interface PaymentIntentData {
  amount: number;
  currency: string;
  description?: string;
  statement_descriptor?: string;
  metadata?: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  type: string;
  attributes: {
    type: string;
    details: Record<string, any>;
  };
}

export interface PaymentIntent {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    description: string;
    status: string;
    client_key: string;
    next_action?: {
      type: string;
      redirect?: {
        url: string;
        return_url: string;
      };
    };
  };
}

export interface Source {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    type: string;
    redirect: {
      checkout_url: string;
      return_url: string;
    };
    status: string;
  };
}

class PayMongoService {
  private baseURL = PAYMONGO_CONFIG.BASE_URL;
  private publicKey = PAYMONGO_CONFIG.PUBLIC_KEY;
  private secretKey = PAYMONGO_CONFIG.SECRET_KEY;

  // React Native compatible base64 encoding
  private base64Encode(str: string): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let result = "";
    let i = 0;

    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;

      const bitmap = (a << 16) | (b << 8) | c;

      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += chars.charAt(b !== 0 ? (bitmap >> 6) & 63 : 64);
      result += chars.charAt(c !== 0 ? bitmap & 63 : 64);
    }

    return result;
  }

  // Create Basic Auth header
  private getAuthHeader(useSecret: boolean = false): string {
    const key = useSecret ? this.secretKey : this.publicKey;
    const encoded = this.base64Encode(key + ":");
    return `Basic ${encoded}`;
  }

  // Create Payment Intent
  async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntent> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseURL}/payment_intents`,
        {
          data: {
            attributes: {
              amount: data.amount,
              currency: data.currency,
              description: data.description || "",
              statement_descriptor: data.statement_descriptor,
              metadata: data.metadata || {},
            },
          },
        },
        {
          headers: {
            Authorization: this.getAuthHeader(true),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("PayMongo Error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.errors?.[0]?.detail ||
          "Payment intent creation failed"
      );
    }
  }

  // Create Payment Method
  async createPaymentMethod(
    type: string,
    details: Record<string, any>
  ): Promise<PaymentMethod> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseURL}/payment_methods`,
        {
          data: {
            attributes: {
              type,
              details,
            },
          },
        },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("PayMongo Error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.errors?.[0]?.detail ||
          "Payment method creation failed"
      );
    }
  }

  // Attach Payment Method to Payment Intent
  async attachPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string,
    returnUrl?: string
  ): Promise<PaymentIntent> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseURL}/payment_intents/${paymentIntentId}/attach`,
        {
          data: {
            attributes: {
              payment_method: paymentMethodId,
              return_url: returnUrl,
            },
          },
        },
        {
          headers: {
            Authorization: this.getAuthHeader(true),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("PayMongo Error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.errors?.[0]?.detail || "Payment attachment failed"
      );
    }
  }

  // Create Source (for e-wallets like GCash, GrabPay)
  // Create Source (for e-wallets like GCash, Maya, GrabPay)
  async createSource(
    type: string,
    amount: number,
    currency: string = "PHP",
    redirectUrls: { success: string; failed: string }
  ): Promise<Source> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseURL}/sources`,
        {
          data: {
            attributes: {
              type,
              amount,
              currency,
              redirect: {
                success: redirectUrls.success,
                failed: redirectUrls.failed,
              },
            },
          },
        },
        {
          headers: {
            Authorization: this.getAuthHeader(true),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("PayMongo Error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.errors?.[0]?.detail || "Source creation failed"
      );
    }
  }

  // Retrieve Payment Intent
  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseURL}/payment_intents/${paymentIntentId}`,
        {
          headers: {
            Authorization: this.getAuthHeader(true),
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("PayMongo Error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.errors?.[0]?.detail ||
          "Failed to retrieve payment intent"
      );
    }
  }

  // Retrieve Source
  async retrieveSource(sourceId: string): Promise<Source> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseURL}/sources/${sourceId}`,
        {
          headers: {
            Authorization: this.getAuthHeader(true),
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("PayMongo Error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.errors?.[0]?.detail || "Failed to retrieve source"
      );
    }
  }
}

export default new PayMongoService();
