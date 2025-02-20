export default {
  app: {
    port: 3001,
    nodeEnv: 'test',
    database: {
      url: 'postgresql://postgres:postgres@localhost:5432/auth_service_test?schema=public',
    },
    jwt: {
      secret: 'test-secret-key',
      expiresIn: '15m',
      refreshExpiresIn: '7d',
    },
    redis: {
      host: 'localhost',
      port: 6379,
      password: '',
    },
    rateLimit: {
      ttl: 60,
      limit: 100,
    },
    mfa: {
      issuer: 'DroneManagementSystem',
    },
    email: {
      host: 'smtp.example.com',
      port: 587,
      user: 'test@example.com',
      password: 'test-password',
    },
    oauth: {
      google: {
        clientId: 'test-google-client-id',
        clientSecret: 'test-google-client-secret',
      },
      github: {
        clientId: 'test-github-client-id',
        clientSecret: 'test-github-client-secret',
      },
    },
  },
};
