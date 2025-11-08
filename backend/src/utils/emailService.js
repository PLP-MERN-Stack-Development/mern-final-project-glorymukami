const nodemailer = require('nodemailer');

// Create transporter (will be configured when email credentials are added)
const createTransporter = () => {
  // For now, return a mock transporter that doesn't actually send emails
  return {
    sendMail: async (mailOptions) => {
      console.log('📧 Mock Email Sent:', {
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      return { messageId: 'mock-message-id' };
    }
  };
};

const transporter = createTransporter();

// Order confirmation email
const sendOrderConfirmation = async (user, order) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@shopsphere.com',
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Thank you for your order!</h2>
          <p>Hello ${user.name},</p>
          <p>Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
          
          <h3>Order Summary:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${order.totalPrice}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Status:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.status}</td>
            </tr>
          </table>
          
          <p>We'll notify you when your order ships.</p>
          <p>Thank you for shopping with ShopSphere!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
  }
};

// Payment confirmation email
const sendPaymentConfirmation = async (user, order, payment) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@shopsphere.com',
      to: user.email,
      subject: `Payment Confirmed - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Payment Confirmed!</h2>
          <p>Hello ${user.name},</p>
          <p>Your payment for order <strong>${order.orderNumber}</strong> has been successfully processed.</p>
          
          <h3>Payment Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount Paid:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${order.totalPrice}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Payment Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(order.paidAt).toLocaleDateString()}</td>
            </tr>
          </table>
          
          <p>Your order is now being processed.</p>
          <p>Thank you for your purchase!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Error sending payment confirmation email:', error);
  }
};

// Order status update email
const sendOrderStatusUpdate = async (user, order) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@shopsphere.com',
      to: user.email,
      subject: `Order Update - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F59E0B;">Order Status Updated</h2>
          <p>Hello ${user.name},</p>
          <p>The status of your order <strong>${order.orderNumber}</strong> has been updated.</p>
          
          <h3>New Status: ${order.status.toUpperCase()}</h3>
          
          <p>You can track your order in your account dashboard.</p>
          <p>Thank you for shopping with ShopSphere!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order status update email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Error sending order status update email:', error);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendPaymentConfirmation,
  sendOrderStatusUpdate,
};