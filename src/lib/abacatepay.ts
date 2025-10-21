import axios, { AxiosInstance } from "axios";

const ABACATEPAY_API_URL = "https://api.abacatepay.com/v1";

class AbacatePayService {
  private api: AxiosInstance;
  private apiKey: string;

  constructor() {
    // API Key do ambiente
    this.apiKey =
      process.env.ABACATEPAY_API_KEY || "abc_dev_s1wT52gBy1p21pRZwUG5jb3r";

    if (!this.apiKey) {
      console.error("❌ ABACATEPAY_API_KEY não encontrada!");
    } else {
      console.log(
        "✅ ABACATEPAY_API_KEY configurada:",
        this.apiKey.substring(0, 15) + "...",
      );
    }

    this.api = axios.create({
      baseURL: ABACATEPAY_API_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    // Interceptor para log de requisições
    this.api.interceptors.request.use((config) => {
      console.log("📤 Requisição AbacatePay:", {
        url: config.url,
        method: config.method,
        hasAuth: !!config.headers["Authorization"],
      });
      return config;
    });

    // Interceptor para log de respostas
    this.api.interceptors.response.use(
      (response) => {
        console.log("✅ Resposta AbacatePay:", {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      (error) => {
        console.error("❌ Erro AbacatePay:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      },
    );

    console.log("🥑 AbacatePay configurado:", ABACATEPAY_API_URL);
  }

  /**
   * Criar um billing (cobrança) no AbacatePay
   * @param data Dados da cobrança
   * @returns Dados da cobrança criada
   */
  async createBilling(data: {
    frequency: "ONE_TIME" | "MULTIPLE_PAYMENTS";
    methods: ("PIX" | "CARD")[];
    products: Array<{
      externalId: string;
      name: string;
      description?: string;
      quantity: number;
      price: number; // em centavos
    }>;
    returnUrl: string;
    completionUrl: string;
    customer: {
      email: string;
      name?: string;
      cellphone?: string;
      taxId?: string; // CPF/CNPJ
    };
    metadata?: Record<string, any>;
  }) {
    try {
      const response = await this.api.post("/billing/create", data);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data.data;
    } catch (error: any) {
      console.error(
        "Erro ao criar billing no AbacatePay:",
        error.response?.data || error.message,
      );
      throw new Error(error.response?.data?.error || "Falha ao criar cobrança");
    }
  }

  /**
   * Buscar um billing específico
   * @param billingId ID do billing
   * @returns Dados do billing
   */
  async getBilling(billingId: string) {
    try {
      const response = await this.api.get(`/billing/${billingId}`);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data.data;
    } catch (error: any) {
      console.error(
        "Erro ao buscar billing:",
        error.response?.data || error.message,
      );
      throw new Error("Falha ao buscar cobrança");
    }
  }

  /**
   * Listar todos os billings
   * @returns Lista de billings
   */
  async listBillings() {
    try {
      const response = await this.api.get("/billing/list");

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data.data;
    } catch (error: any) {
      console.error(
        "Erro ao listar billings:",
        error.response?.data || error.message,
      );
      throw new Error("Falha ao listar cobranças");
    }
  }

  /**
   * Cancelar um billing
   * @param billingId ID do billing
   * @returns Confirmação do cancelamento
   */
  async cancelBilling(billingId: string) {
    try {
      const response = await this.api.post(`/billing/${billingId}/cancel`);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data.data;
    } catch (error: any) {
      console.error(
        "Erro ao cancelar billing:",
        error.response?.data || error.message,
      );
      throw new Error("Falha ao cancelar cobrança");
    }
  }

  /**
   * Criar um cliente
   * @param data Dados do cliente
   * @returns Dados do cliente criado
   */
  async createCustomer(data: {
    email: string;
    name?: string;
    cellphone?: string;
    taxId?: string; // CPF/CNPJ
  }) {
    try {
      const response = await this.api.post("/customer/create", {
        metadata: data,
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data.data;
    } catch (error: any) {
      console.error(
        "Erro ao criar cliente:",
        error.response?.data || error.message,
      );
      throw new Error("Falha ao criar cliente");
    }
  }

  /**
   * Buscar um cliente
   * @param customerId ID do cliente
   * @returns Dados do cliente
   */
  async getCustomer(customerId: string) {
    try {
      const response = await this.api.get(`/customer/${customerId}`);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data.data;
    } catch (error: any) {
      console.error(
        "Erro ao buscar cliente:",
        error.response?.data || error.message,
      );
      return null;
    }
  }

  /**
   * Criar QR Code PIX para pagamento direto (checkout customizado)
   * @param data Dados do pagamento PIX
   * @returns Dados do QR Code PIX
   */
  async createPixQrCode(data: {
    amount: number; // valor em centavos
    expiresIn?: number; // tempo de expiração em segundos (padrão: 3600 = 1 hora)
    description: string;
    customer: {
      name: string;
      cellphone: string;
      email: string;
      taxId: string; // CPF/CNPJ
    };
    metadata?: Record<string, any>;
  }) {
    try {
      const response = await this.api.post("/pixQrCode/create", {
        amount: data.amount,
        expiresIn: data.expiresIn || 3600, // 1 hora padrão
        description: data.description,
        customer: data.customer,
        metadata: data.metadata,
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // AbacatePay retorna os dados dentro de response.data.data
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(
        "Erro ao criar QR Code PIX:",
        error.response?.data || error.message,
      );
      throw new Error(
        error.response?.data?.error || "Falha ao criar QR Code PIX",
      );
    }
  }

  /**
   * Verificar status de um pagamento PIX
   * @param pixQrCodeId ID do QR Code PIX
   * @returns Dados do pagamento
   */
  async getPixQrCodeStatus(pixQrCodeId: string) {
    try {
      const response = await this.api.get(`/pixQrCode/${pixQrCodeId}`);

      console.log(
        "📊 Resposta completa do AbacatePay:",
        JSON.stringify(response.data, null, 2),
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // AbacatePay retorna { id, status, ... } diretamente
      // Normalizar a resposta para garantir compatibilidade
      const pixData = response.data.data || response.data;

      return {
        id: pixData.id,
        status: pixData.status,
        ...pixData,
      };
    } catch (error: any) {
      console.error(
        "Erro ao buscar status do PIX:",
        error.response?.data || error.message,
      );
      throw new Error("Falha ao buscar status do PIX");
    }
  }

  /**
   * Verificar assinatura do webhook
   * @param payload Corpo da requisição
   * @param signature Assinatura HMAC do cabeçalho
   * @param secret Secret configurado no webhook
   * @returns true se a assinatura for válida
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return signature === expectedSignature;
  }
}

export const abacatePayService = new AbacatePayService();
