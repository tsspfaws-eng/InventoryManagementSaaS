# Inventory Management SaaS

A comprehensive inventory management solution offered as Software as a Service (SaaS) to customers.

## Features

- Multi-tenant architecture for serving multiple customers
- Product management (add, update, delete)
- Inventory tracking and stock management
- Purchase order management
- Sales order processing
- Reporting and analytics
- User management and role-based access control
- Notifications and alerts

## Technology Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (for robust relational data management)
- **ORM**: Sequelize (for database operations)
- **Authentication**: JWT with OAuth 2.0
- **Hosting**: Docker containers with Kubernetes for scalability
- **CI/CD**: GitHub Actions

## Project Structure

```
InventoryManagementSaaS/
├── frontend/           # React frontend application
├── backend/            # Node.js backend API
│   ├── src/            # Source code
│   │   ├── config/     # Configuration files
│   │   ├── controllers/# API controllers
│   │   ├── database/   # Database setup and migrations
│   │   ├── middleware/ # Express middleware
│   │   ├── models/     # Sequelize models
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── utils/      # Utility functions
│   ├── scripts/        # Helper scripts
│   └── tests/          # Test files
├── docs/               # Documentation
└── deployment/         # Deployment configurations
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (v12 or higher)

### Setting Up PostgreSQL

1. Install PostgreSQL on your system:
   - **Windows**: Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)
   - **macOS**: Use Homebrew: `brew install postgresql`
   - **Linux**: Use your package manager, e.g., `sudo apt install postgresql postgresql-contrib`

2. Create a database user and database:
   ```bash
   # Log into PostgreSQL as the postgres user
   sudo -u postgres psql
   
   # Create a new user (replace 'username' and 'password')
   CREATE USER username WITH ENCRYPTED PASSWORD 'password';
   
   # Create a new database
   CREATE DATABASE inventory_management;
   
   # Grant privileges to the user
   GRANT ALL PRIVILEGES ON DATABASE inventory_management TO username;
   
   # Exit PostgreSQL
   \q
   ```

### Setting Up the Application

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/InventoryManagementSaaS.git
   cd InventoryManagementSaaS
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Copy the example .env file
   cp .env.example .env
   
   # Edit the .env file with your database credentials
   # DB_USERNAME=username
   # DB_PASSWORD=password
   # DB_NAME=inventory_management
   # DB_HOST=localhost
   # DB_PORT=5432
   ```

4. Initialize the database:
   ```bash
   # Run the database initialization script
   node scripts/db-init.js
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

6. Install frontend dependencies and start the frontend:
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

### Database Management

The application uses Sequelize ORM for database operations. Here are some useful commands:

```bash
# Create a new migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npx sequelize-cli db:migrate

# Undo the last migration
npx sequelize-cli db:migrate:undo

# Create a new seeder
npx sequelize-cli seed:generate --name seeder-name

# Run seeders
npx sequelize-cli db:seed:all

# Undo the last seeder
npx sequelize-cli db:seed:undo
```

## API Documentation

API documentation is available at `/api/docs` when the server is running.

## License

This project is proprietary software.