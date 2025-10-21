import axios, { AxiosInstance } from 'axios';

const ASAAS_API_URL = process.env.ASAAS_ENV === 'production'
  ? 'https://api.asaas.com/v3'
  : 'https://sandbox.asaas.com/api/v3';

class AsaasService {
  private api: AxiosInstance;

  constructor() {
    // API Key hardcoded (temporário - mover para .env depois)
    const apiKey = process.env.ASAAS_API_KEY || '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjE5NDc0ZGU1LTdhN2UtNDUyMi04ZGRlLWY0NTc2ZDJkNWMyMDo6JGFhY2hfYjIzMTQ4ODMtN2Q3Yy00YjJjLWEyODQtN2IxMGMyYjE0N2Q3';

    if (!apiKey) {
      console.error('❌ ASAAS_API_KEY não encontrada!');
    } else {
      console.log('✅ ASAAS_API_KEY encontrada:', apiKey.substring(0, 20) + '...');
    }

    this.api = axios.create({
      baseURL: ASAAS_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey || '',
        'User-Agent': 'Booky App',
      },
    });

    // Interceptor para garantir que o access_token seja enviado em todas as requisições
    this.api.interceptors.request.use((config) => {
      if (apiKey) {
        config.headers['access_token'] = apiKey;
      }
      console.log('📤 Requisição Asaas:', {
        url: config.url,
        method: config.method,
        hasAccessToken: !!config.headers['access_token'],
      });
      return config;
    });

    // Log para debug
    console.log('Headers configurados:', {
      hasAccessToken: !!apiKey,
      tokenLength: apiKey?.length,
    });

    console.log('🔧 Asaas configurado para:', ASAAS_API_URL);
  }

  // Criar cliente no Asaas
  async createCustomer(data: {
    name: string;
    email: string;
    cpfCnpj?: string;
    phone?: string;
  }) {
    try {
      const response = await this.api.post('/customers', {
        name: data.name,
        email: data.email,
        cpfCnpj: data.cpfCnpj,
        mobilePhone: data.phone,
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar cliente no Asaas:', error.response?.data || error.message);
      throw new Error('Falha ao criar cliente no Asaas');
    }
  }

  // Atualizar cliente no Asaas
  async updateCustomer(customerId: string, data: {
    name?: string;
    email?: string;
    cpfCnpj?: string;
    phone?: string;
  }) {
    try {
      const response = await this.api.post(`/customers/${customerId}`, {
        name: data.name,
        email: data.email,
        cpfCnpj: data.cpfCnpj,
        mobilePhone: data.phone,
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar cliente no Asaas:', error.response?.data || error.message);
      // Repassar o erro original para tratamento específico
      throw error;
    }
  }

  // Verificar se cliente existe e não foi removido
  async getCustomer(customerId: string) {
    try {
      const response = await this.api.get(`/customers/${customerId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar cliente no Asaas:', error.response?.data || error.message);
      return null;
    }
  }

  // Criar cobrança (PIX ou Cartão)
  async createPayment(data: {
    customer: string; // ID do cliente no Asaas
    billingType: 'PIX' | 'CREDIT_CARD';
    value: number;
    dueDate: string; // YYYY-MM-DD
    description: string;
    externalReference?: string;
    creditCard?: {
      holderName: string;
      number: string;
      expiryMonth: string;
      expiryYear: string;
      ccv: string;
    };
    creditCardHolderInfo?: {
      name: string;
      email: string;
      cpfCnpj: string;
      postalCode: string;
      addressNumber: string;
      phone: string;
    };
  }) {
    try {
      const payload: any = {
        customer: data.customer,
        billingType: data.billingType,
        value: data.value,
        dueDate: data.dueDate,
        description: data.description,
        externalReference: data.externalReference,
      };

      // Se for cartão de crédito, adiciona os dados do cartão
      if (data.billingType === 'CREDIT_CARD' && data.creditCard && data.creditCardHolderInfo) {
        payload.creditCard = data.creditCard;
        payload.creditCardHolderInfo = data.creditCardHolderInfo;
      }

      const response = await this.api.post('/payments', payload);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar cobrança no Asaas:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errors?.[0]?.description || 'Falha ao criar cobrança');
    }
  }

  // Buscar cobrança por ID
  async getPayment(paymentId: string) {
    try {
      const response = await this.api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar cobrança:', error.response?.data || error.message);
      throw new Error('Falha ao buscar cobrança');
    }
  }

  // Buscar QR Code do PIX
  async getPixQrCode(paymentId: string) {
    try {
      const response = await this.api.get(`/payments/${paymentId}/pixQrCode`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar QR Code PIX:', error.response?.data || error.message);
      throw new Error('Falha ao buscar QR Code PIX');
    }
  }

  // Cancelar cobrança
  async cancelPayment(paymentId: string) {
    try {
      const response = await this.api.delete(`/payments/${paymentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao cancelar cobrança:', error.response?.data || error.message);
      throw new Error('Falha ao cancelar cobrança');
    }
  }

  // Criar assinatura recorrente
  async createSubscription(data: {
    customer: string;
    billingType: 'PIX' | 'CREDIT_CARD';
    value: number;
    nextDueDate: string;
    cycle: 'MONTHLY' | 'YEARLY';
    description: string;
    externalReference?: string;
  }) {
    try {
      const response = await this.api.post('/subscriptions', {
        customer: data.customer,
        billingType: data.billingType,
        value: data.value,
        nextDueDate: data.nextDueDate,
        cycle: data.cycle,
        description: data.description,
        externalReference: data.externalReference,
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error.response?.data || error.message);
      throw new Error('Falha ao criar assinatura');
    }
  }

  // Buscar assinatura
  async getSubscription(subscriptionId: string) {
    try {
      const response = await this.api.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar assinatura:', error.response?.data || error.message);
      throw new Error('Falha ao buscar assinatura');
    }
  }

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string) {
    try {
      const response = await this.api.delete(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error.response?.data || error.message);
      throw new Error('Falha ao cancelar assinatura');
    }
  }
}

export const asaasService = new AsaasService();
