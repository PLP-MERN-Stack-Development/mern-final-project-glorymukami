import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '../../services/paymentService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ order, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success/${order._id}`,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${order.totalPrice}`}
      </button>
    </form>
  );
};

export const StripeCheckout = ({ order, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const initializePayment = async () => {
      const { clientSecret } = await paymentService.createPaymentIntent({
        orderId: order._id,
        amount: order.totalPrice
      });
      setClientSecret(clientSecret);
    };

    initializePayment();
  }, [order]);

  if (!clientSecret) return <div>Loading payment...</div>;

  const options = { clientSecret };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm order={order} onSuccess={onSuccess} />
    </Elements>
  );
};