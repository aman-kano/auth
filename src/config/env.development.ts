export default {
  app: {
    port: 3000,
    nodeEnv: 'development',
    database: {
      url: 'postgresql://postgres:postgres@localhost:5432/auth_service?schema=public',
    },
    jwt: {
      secret: 'dev-secret-key',
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
      user: 'dev@example.com',
      password: 'dev-password',
    },
    oauth: {
      google: {
        clientId: 'dev-google-client-id',
        clientSecret: 'dev-google-client-secret',
      },
      github: {
        clientId: 'dev-github-client-id',
        clientSecret: 'dev-github-client-secret',
      },
    },
  },
};
