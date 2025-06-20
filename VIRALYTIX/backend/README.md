# VIRALYTIX Backend API

## Overview
This is the backend API for the VIRALYTIX platform, built with FastAPI and designed for deployment on Render.com.

## Features
- FastAPI with automatic OpenAPI/Swagger documentation
- JWT-based authentication
- CORS configured for frontend integration
- Health check endpoints
- Production-ready error handling
- AI model integration for viral mutation analysis
- Blockchain integration for data verification

## Local Development

### Prerequisites
- Python 3.11.6+
- pip package manager

### Setup
1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd VIRALYTIX/backend
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

5. Edit `.env` file with your configuration

6. Run the development server:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Production Deployment

### Render.com Deployment
This backend is configured to deploy automatically on Render.com using the `render.yaml` configuration file.

#### Environment Variables Required:
- `SECRET_KEY`: JWT secret key (auto-generated on Render)
- `FRONTEND_URL`: Your frontend deployment URL
- `ENVIRONMENT`: Set to "production"

#### Optional Environment Variables:
- `DATABASE_URL` or `MONGODB_URL`: Database connection string
- `REDIS_URL`: Redis connection string for caching
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT token expiration (default: 30)

### Health Checks
- Health endpoint: `/health`
- Root endpoint: `/`

## API Endpoints

### Authentication
- `POST /api/auth/token` - Login and get access token
- `POST /api/auth/register` - Register new user
- `GET /api/auth/users/me` - Get current user info

### Core Features
- `/api/mutations` - Viral mutation tracking
- `/api/outbreaks` - Outbreak prediction and monitoring
- `/api/predictions` - AI-powered predictions
- `/api/sensors` - Sensor data integration
- `/api/blockchain` - Blockchain data verification
- `/api/llm` - Large Language Model interactions
- `/api/simulation` - Mutation simulation
- `/api/mutation-vaccine` - Vaccine recommendations
- `/api/explainability` - AI model explanations
- `/api/anonymous-alert` - Anonymous reporting system

## Architecture
- **Framework**: FastAPI
- **Authentication**: JWT with passlib/bcrypt
- **AI Models**: PyTorch-based models for mutation analysis
- **Blockchain**: Web3.py integration
- **Database**: MongoDB (configurable)
- **Caching**: Redis (optional)

## Security
- JWT tokens with configurable expiration
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- Environment-based configuration

## Monitoring
- Health check endpoint at `/health`
- Comprehensive error logging
- Production-ready exception handling

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License
This project is part of the VIRALYTIX platform.