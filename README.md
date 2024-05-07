# SAKANI Property Management System - Backend Documentation

Welcome to the documentation for the SAKANI Property Management System backend. This system allows users with different roles (Superadmin, Admin, Subadmin, and Agent) to manage property data and access records based on their roles. The system also handles leads data and provides a dashboard to display leads based on saved time intervals for each user. CRUD operations are supported for Subadmins, Admins, and Agents.

## Directory Structure

The backend codebase follows the following directory structure:

```
SAKANI
└── v1
    ├── index.js
    └── src
        ├── middleware
        │   └── jwt
        │       └── jwt.middleware.js
        ├── models
        │   ├── logger.model.js
        │   └── mysql.model.js
        ├── routes
        │   ├── agents
        │   │   └── index.js
        │   ├── dashboard
        │   │   └── index.js
        │   ├── leads
        │   │   └── index.js
        │   ├── login
        │   │   └── index.js
        │   ├── properties
        │   │   └── index.js
        │   ├── settings
        │   │   └── index.js
        │   └── index.js
        ├── setups
        │   ├── database
        │   │   ├── database.setup.js
        │   │   └── mongoDb.js
        │   ├── logger
        │   │   └── logger.setup.js
        │   ├── query
        │   │   ├── query.agent.js
        │   │   ├── query.dashboard.js
        │   │   ├── query.profile.js
        │   │   ├── query.properties.js
        │   │   ├── query.server.js
        │   │   └── query.settings.js
        │   └── server
        │       └── server.setup.js
        └── utilities
            ├── cache.utility.js
            ├── decrypt.utility.js
            ├── encrypt.utility.js
            ├── filter.utility.js
            ├── jwt.utility.js
            ├── otp.utility.js
            ├── password.utility.js
            └── sms.utility.js
```

## Technologies Used

- Node.js
- MySQL

## Features

1. **Role-Based Access Control**

   - Superadmin and Admin users have full access to all data in the database.
   - Subadmin and Agent users can only access data related to their roles.

2. **Leads Data**

   - The system stores and manages leads data.
   - Users can view leads data on their dashboard based on saved time intervals.

3. **CRUD Operations**
   - Subadmins, Admins, and Agents can perform CRUD operations on various resources such as properties.

## Getting Started

1. Clone the repository.
2. Install the necessary dependencies using `npm install`.
3. Set up your MySQL database and configure the connection in `database.setup.js`.
4. Run the application using `npm start`.

## API Documentation

The API documentation for each endpoint can be found in the respective route files in the `routes` directory. Refer to these files for detailed information on available endpoints and their functionalities.





