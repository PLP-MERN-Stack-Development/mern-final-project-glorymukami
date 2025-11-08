import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getById(orderId);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Order Details</h3>
              <p><strong>Order Number:</strong> {order?.orderNumber}</p>
              <p><strong>Order Date:</strong> {new Date(order?.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ${order?.totalPrice?.toFixed(2)}</p>
              <p><strong>Status:</strong> <span className="text-green-600 font-semibold">{order?.status}</span></p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <p>{order?.shippingAddress?.firstName} {order?.shippingAddress?.lastName}</p>
              <p>{order?.shippingAddress?.address}</p>
              <p>{order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.zipCode}</p>
              <p>{order?.shippingAddress?.country}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-3">
            {order?.orderItems?.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    📦
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link to="/products" className="btn-primary inline-block">
            Continue Shopping
          </Link>
          <br />
          <Link to="/orders" className="btn-secondary inline-block">
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;