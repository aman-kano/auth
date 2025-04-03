# Auth Service
## Features

- User authentication with JWT
- Role-based access control
- OAuth2 integration (Google, GitHub)
- Two-factor authentication
- Rate limiting
- OpenTelemetry integration for observability
- Swagger API documentation

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- Redis (optional, for rate limiting)
- OpenTelemetry Collector (for production)

## Environment Setup

The application supports three environments:

### Development
```bash
# Copy the development environment file
cp .env.development .env

# Install dependencies
npm install

# Start the development server
npm run start:dev
```

### Production
```bash
# Copy the production environment file
cp .env.production .env

# Set required environment variables
export DB_PASSWORD=your-db-password
export DB_HOST=your-db-host
export JWT_SECRET=your-jwt-secret
export OTEL_COLLECTOR_URL=your-otel-collector-url
# ... set other required variables

# Build the application
npm run build

# Start the production server
npm run start:prod
```

### Testing
```bash
# Copy the test environment file
cp .env.test .env

# Run tests
npm run test
```

## OpenTelemetry Integration

The service is instrumented with OpenTelemetry for observability. It captures:

- HTTP request/response traces
- Fastify route information
- NestJS operation traces
- Database queries
- External service calls

### Configuration

OpenTelemetry is configured through environment variables:

```env
# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
OTEL_SERVICE_NAME=auth-service
OTEL_SERVICE_VERSION=1.0.0
```

### Development Setup

For local development, you can use the OpenTelemetry Collector with Jaeger:

1. Start Jaeger using Docker:
```bash
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

2. Access the Jaeger UI at http://localhost:16686

### Production Setup

For production, configure your OpenTelemetry Collector to export traces to your preferred observability platform (e.g., Jaeger, Zipkin, or cloud providers).

## API Documentation

Once the application is running, you can access the Swagger documentation at:
- Development: http://localhost:3000/api
- Production: https://your-domain.com/api

## Environment Variables

### Common Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production/test)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `CORS_ORIGIN`: Allowed CORS origins

### OpenTelemetry Variables
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OpenTelemetry collector endpoint
- `OTEL_SERVICE_NAME`: Service name for traces
- `OTEL_SERVICE_VERSION`: Service version

### Email Variables
- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password
- `SMTP_FROM`: Sender email address

### OAuth Variables
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 