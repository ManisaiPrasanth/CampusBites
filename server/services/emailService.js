const nodemailer = require('nodemailer');

// Create transporter with Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

/**
 * Send Welcome Email to New User
 * @param {Object} user - User object with email, fullName
 */
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"CampusBites - KLU" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎉 Welcome to CampusBites - Your Campus Food Ordering App!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              background: white;
              padding: 30px;
              border: 2px solid #e5e7eb;
              border-top: none;
            }
            .welcome-text {
              font-size: 18px;
              color: #1e3a8a;
              margin-bottom: 20px;
            }
            .features {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .features h3 {
              color: #1e3a8a;
              margin-top: 0;
            }
            .feature-item {
              display: flex;
              align-items: start;
              margin: 10px 0;
            }
            .feature-icon {
              font-size: 24px;
              margin-right: 10px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              color: white;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
              margin-top: 20px;
            }
            .account-info {
              background: #eff6ff;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🍔 Welcome to CampusBites!</h1>
            <p>Your Campus Food Ordering Made Easy</p>
          </div>
          
          <div class="content">
            <p class="welcome-text">
              Hi <strong>${user.fullName}</strong>,
            </p>
            
            <p>
              Welcome to <strong>CampusBites</strong> - the easiest way to order delicious food from your favorite campus canteens at KLU! 🎓
            </p>
            
            <div class="account-info">
              <strong>📧 Your Account Details:</strong><br>
              Email: <strong>${user.email}</strong><br>
              Account Type: <strong>${user.role === 'user' ? 'Student' : user.role}</strong>
            </div>
            
            <div class="features">
              <h3>🌟 What You Can Do:</h3>
              
              <div class="feature-item">
                <span class="feature-icon">🍕</span>
                <div>
                  <strong>Browse Menu</strong><br>
                  Explore delicious food items from multiple campus canteens
                </div>
              </div>
              
              <div class="feature-item">
                <span class="feature-icon">🛒</span>
                <div>
                  <strong>Easy Ordering</strong><br>
                  Add items to cart and place orders in seconds
                </div>
              </div>
              
              <div class="feature-item">
                <span class="feature-icon">📱</span>
                <div>
                  <strong>Track Orders</strong><br>
                  Get real-time updates on your order status via email
                </div>
              </div>
              
              <div class="feature-item">
                <span class="feature-icon">⭐</span>
                <div>
                  <strong>Leave Reviews</strong><br>
                  Share your experience and help others choose better
                </div>
              </div>
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu" class="cta-button">
                Start Ordering Now 🚀
              </a>
            </center>
            
            <p style="margin-top: 30px;">
              <strong>Need Help?</strong><br>
              If you have any questions or need assistance, feel free to reach out to our support team.
            </p>
            
            <p>
              Happy Ordering! 🎉<br>
              <strong>The CampusBites Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>
              This email was sent to ${user.email}<br>
              CampusBites - K L University<br>
              © 2024 CampusBites. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${user.email}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Order Status Update Email
 * @param {Object} order - Order object with all details
 * @param {String} newStatus - New status of the order
 * @param {String} canteen - Canteen name (for item-level updates)
 */
const sendOrderStatusEmail = async (order, newStatus, canteen = null) => {
  try {
    const transporter = createTransporter();

    // Populate user and items if not already populated
    if (!order.user.email) {
      throw new Error('Order user email not available');
    }

    // Filter items if canteen is specified (for item-level status updates)
    const relevantItems = canteen 
      ? order.items.filter(item => item.canteen === canteen)
      : order.items;

    // Calculate subtotal for relevant items
    const subtotal = relevantItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Get status emoji and color
    const statusConfig = {
      pending: { emoji: '⏳', color: '#f59e0b', text: 'Pending' },
      confirmed: { emoji: '✅', color: '#10b981', text: 'Confirmed' },
      preparing: { emoji: '👨‍🍳', color: '#3b82f6', text: 'Preparing' },
      ready: { emoji: '🔔', color: '#8b5cf6', text: 'Ready for Pickup' },
      completed: { emoji: '🎉', color: '#10b981', text: 'Completed' },
      cancelled: { emoji: '❌', color: '#ef4444', text: 'Cancelled' }
    };

    const status = statusConfig[newStatus] || statusConfig.pending;

    // Generate items HTML
    const itemsHtml = relevantItems.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.name}</strong>
          ${item.canteen ? `<br><small style="color: #6b7280;">from ${item.canteen}</small>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ₹${item.price.toFixed(2)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          <strong>₹${item.subtotal.toFixed(2)}</strong>
        </td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"CampusBites - KLU" <${process.env.EMAIL_USER}>`,
      to: order.user.email,
      subject: `${status.emoji} Order ${order.orderNumber} is now ${status.text}${canteen ? ` - ${canteen}` : ''}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .status-badge {
              display: inline-block;
              background: ${status.color};
              color: white;
              padding: 10px 20px;
              border-radius: 20px;
              font-size: 18px;
              margin: 15px 0;
              font-weight: bold;
            }
            .content {
              background: white;
              padding: 30px;
              border: 2px solid #e5e7eb;
              border-top: none;
            }
            .order-info {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .order-info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #d1d5db;
            }
            .order-info-row:last-child {
              border-bottom: none;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: white;
            }
            th {
              background: #f3f4f6;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              color: #1e3a8a;
            }
            .total-row {
              background: #eff6ff;
              font-weight: bold;
              font-size: 18px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
              margin-top: 20px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${status.emoji} Order Status Updated</h1>
            <div class="status-badge">${status.text}</div>
          </div>
          
          <div class="content">
            <p style="font-size: 18px;">
              Hi <strong>${order.user.fullName}</strong>,
            </p>
            
            <p>
              Your order status has been updated!${canteen ? ` The items from <strong>${canteen}</strong> are now <strong>${status.text}</strong>.` : ''}
            </p>
            
            <div class="order-info">
              <h3 style="margin-top: 0; color: #1e3a8a;">📦 Order Details</h3>
              <div class="order-info-row">
                <span>Order Number:</span>
                <strong>${order.orderNumber}</strong>
              </div>
              <div class="order-info-row">
                <span>Order Date:</span>
                <strong>${new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
              </div>
              ${canteen ? `
              <div class="order-info-row">
                <span>Restaurant:</span>
                <strong>${canteen}</strong>
              </div>
              ` : ''}
              <div class="order-info-row">
                <span>Payment Method:</span>
                <strong>${order.paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}</strong>
              </div>
            </div>
            
            <h3 style="color: #1e3a8a;">🍽️ Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="padding: 15px; text-align: right;">Total:</td>
                  <td style="padding: 15px; text-align: right; color: #1e3a8a;">₹${subtotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            ${newStatus === 'ready' ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>🔔 Your order is ready for pickup!</strong><br>
              Please collect your order from the canteen counter.
            </div>
            ` : ''}
            
            ${newStatus === 'completed' ? `
            <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>🎉 Thank you for your order!</strong><br>
              We hope you enjoyed your meal. Don't forget to leave a review!
            </div>
            ` : ''}
            
            ${newStatus === 'cancelled' ? `
            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>❌ Order Cancelled</strong><br>
              If you have any questions, please contact the canteen.
            </div>
            ` : ''}
            
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-orders" class="cta-button">
                View Order Details
              </a>
            </center>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              <strong>Questions or concerns?</strong><br>
              Contact us at ${process.env.EMAIL_USER || 'support@campusbites.com'}
            </p>
          </div>
          
          <div class="footer">
            <p>
              This email was sent to ${order.user.email}<br>
              CampusBites - K L University<br>
              © 2024 CampusBites. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Order status email sent to ${order.user.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending order status email:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOrderStatusEmail
};

