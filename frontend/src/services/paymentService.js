import api from './api';

export const paymentService = {
  createPaymentIntent: async (paymentData) => {
    const response = await api.post('/payment/create-payment-intent', paymentData);
    return response.data;
  }
};