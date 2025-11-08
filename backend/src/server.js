const { app, connectDB } = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`\n🛍️  ShopSphere Server Started Successfully!`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/`);
      console.log(`⏰ Started: ${new Date().toISOString()}`);
      console.log('='.repeat(50));
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log('Unhandled Rejection at:', promise, 'reason:', err);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();