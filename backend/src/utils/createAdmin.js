const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🔗 Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@shopsphere.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'ShopSphere Admin',
      email: 'admin@shopsphere.com',
      password: 'admin123', // Change this in production!
      role: 'admin'
    });

    console.log('✅ Admin user created successfully:');
    console.log(`   Email: admin@shopsphere.com`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ${adminUser.role}`);
    console.log('   ⚠️  Change this password immediately in production!');
    
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();