# FastAPI Code Generator Migration Guide for Node.js/Express

## Table of Contents
- [Introduction](#introduction)
- [Architecture Overview](#architecture-overview)
- [Core Concepts](#core-concepts)
- [Directory Structure](#directory-structure)
- [Module Conversion Guide](#module-conversion-guide)
  - [Models](#models)
  - [Repositories](#repositories)
  - [Services](#services)
  - [API Routes](#api-routes)
  - [Middleware](#middleware)
  - [Dependency Injection](#dependency-injection)
  - [Validation](#validation)
- [OpenAPI Parser Adaptation](#openapi-parser-adaptation)
- [Code Generation Process](#code-generation-process)
- [Type System](#type-system)
- [Implementation Steps](#implementation-steps)
- [Example Templates](#example-templates)
- [Testing Strategy](#testing-strategy)
- [Performance Considerations](#performance-considerations)

## Introduction

This document provides a comprehensive guide for migrating the Python-based FastAPI code generator to support Node.js/Express applications. The FastAPI Code Generator is a tool that generates highly modular API projects from OpenAPI/Swagger specifications. This migration will adapt the tool to create well-structured Express.js applications with similar architectural patterns.

## Architecture Overview

The current FastAPI Code Generator creates applications with a layered architecture:

```
FastAPI App
├── API Layer (API endpoints in FastAPI routers)
├── Service Layer (Business logic)
├── Repository Layer (Data access)
└── Model Layer (Pydantic schemas/SQLAlchemy models)
```

The Express.js version will maintain this structure but adapt it to Node.js paradigms:

```
Express App
├── API Layer (Express routers)
├── Service Layer (Business logic)
├── Repository Layer (Data access)
└── Model Layer (TypeScript interfaces/classes or Mongoose models)
```

## Core Concepts

| FastAPI Concept | Express.js Equivalent | Notes |
|-----------------|------------------------|-------|
| Pydantic models | Joi/Zod schemas + TypeScript interfaces | For validation and type definitions |
| Path operations | Express routes | Endpoint definitions |
| Dependencies | Middleware + DI container | Using libraries like `inversify` or `awilix` |
| FastAPI routers | Express Router | Modular routing |
| Request validation | Express validator / Joi / Zod | Middleware-based validation |
| Path parameters | Express route parameters | Similar but different syntax |
| SQLAlchemy models | Mongoose schemas / TypeORM entities | Data models |

## Directory Structure

The Express.js project structure will follow a similar pattern to the FastAPI one:

```
express-project/
├── src/
│   ├── api/             # API route definitions
│   │   └── [resource].routes.js
│   ├── services/        # Business logic
│   │   └── [resource].service.js
│   ├── repositories/    # Data access
│   │   └── [resource].repository.js
│   ├── models/          # Data models/interfaces
│   │   └── [resource].model.js
│   ├── middlewares/     # Express middlewares
│   │   ├── auth.js
│   │   ├── error-handler.js
│   │   └── validator.js
│   ├── config/          # Configuration
│   │   ├── database.js
│   │   └── server.js
│   ├── utils/           # Utility functions
│   │   └── helpers.js
│   └── app.js           # Express application setup
├── tests/               # Test files
├── .env.example         # Environment variables template
├── package.json         # Node.js dependencies
└── README.md            # Project documentation
```

## Module Conversion Guide

### Models

#### FastAPI (Python):
```python
from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: Optional[int] = None
    username: str
    email: str
    is_active: bool = True
```

#### Express.js (JavaScript):
```javascript
// models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

#### Express.js (TypeScript):
```typescript
// models/user.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

export default model<IUser>('User', userSchema);
```

### Repositories

#### FastAPI (Python):
```python
class UserRepository:
    async def get_all(self):
        # Database logic
        return await User.find_all()
    
    async def create(self, user_data):
        # Create logic
        return await User.create(**user_data)
```

#### Express.js (JavaScript):
```javascript
// repositories/user.repository.js
const User = require('../models/user.model');

class UserRepository {
  async getAll() {
    return await User.find();
  }
  
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }
}

module.exports = new UserRepository();
```

#### Express.js (TypeScript):
```typescript
// repositories/user.repository.ts
import User, { IUser } from '../models/user.model';

export class UserRepository {
  async getAll(): Promise<IUser[]> {
    return await User.find();
  }
  
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }
}

export default new UserRepository();
```

### Services

#### FastAPI (Python):
```python
class UserService:
    def __init__(self, repo: UserRepository = Depends(UserRepository)):
        self.repo = repo
    
    async def get_all_users(self):
        return await self.repo.get_all()
    
    async def create_user(self, user_data):
        return await self.repo.create(user_data)
```

#### Express.js (JavaScript):
```javascript
// services/user.service.js
const userRepository = require('../repositories/user.repository');

class UserService {
  constructor(repository = userRepository) {
    this.repository = repository;
  }
  
  async getAllUsers() {
    return await this.repository.getAll();
  }
  
  async createUser(userData) {
    // Add business logic here if needed
    return await this.repository.create(userData);
  }
}

module.exports = new UserService();
```

#### Express.js (TypeScript):
```typescript
// services/user.service.ts
import { UserRepository } from '../repositories/user.repository';
import { IUser } from '../models/user.model';

export class UserService {
  constructor(private repository = new UserRepository()) {}
  
  async getAllUsers(): Promise<IUser[]> {
    return await this.repository.getAll();
  }
  
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    // Add business logic here if needed
    return await this.repository.create(userData);
  }
}

export default new UserService();
```

### API Routes

#### FastAPI (Python):
```python
@router.get("/users", response_model=List[User])
def get_users(service: UserService = Depends(UserService)):
    return service.get_all_users()

@router.post("/users", response_model=User)
def create_user(body: User, service: UserService = Depends(UserService)):
    return service.create_user(body)
```

#### Express.js (JavaScript):
```javascript
// api/user.routes.js
const express = require('express');
const userService = require('../services/user.service');
const { validateUser } = require('../middlewares/validator');

const router = express.Router();

router.get('/users', async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/users', validateUser, async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

#### Express.js (TypeScript):
```typescript
// api/user.routes.ts
import express, { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { validateUser } from '../middlewares/validator';

const router = express.Router();

router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();
    return res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/users', validateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
```

### Middleware

#### FastAPI (Dependencies):
```python
def get_current_user(token: str = Depends(oauth2_scheme)):
    # Validate token and get user
    return user
```

#### Express.js (JavaScript):
```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
```

#### Express.js (TypeScript):
```typescript
// middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  username: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user as UserPayload;
    next();
  });
}
```

### Dependency Injection

FastAPI uses a dependency injection system that's built into the framework. For Express, we'll need to implement a DI container using a library or manual constructor injection.

#### Express.js with Awilix (JavaScript):
```javascript
// config/container.js
const awilix = require('awilix');
const { UserRepository } = require('../repositories/user.repository');
const { UserService } = require('../services/user.service');

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY
});

container.register({
  userRepository: awilix.asClass(UserRepository).singleton(),
  userService: awilix.asClass(UserService).singleton()
});

module.exports = container;
```

#### Express.js with Awilix (TypeScript):
```typescript
// config/container.ts
import { createContainer, asClass, InjectionMode } from 'awilix';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';

const container = createContainer({
  injectionMode: InjectionMode.PROXY
});

container.register({
  userRepository: asClass(UserRepository).singleton(),
  userService: asClass(UserService).singleton()
});

export default container;
```

### Validation

#### FastAPI (Pydantic):
```python
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
```

#### Express.js with Joi (JavaScript):
```javascript
// middlewares/validator.js
const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

function validateUser(req, res, next) {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}

module.exports = { validateUser };
```

#### Express.js with Zod (TypeScript):
```typescript
// middlewares/validator.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const userSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(6)
});

export function validateUser(req: Request, res: Response, next: NextFunction) {
  try {
    userSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    next(error);
  }
}
```

## OpenAPI Parser Adaptation

The OpenAPI parser needs to be adapted to generate TypeScript/JavaScript code instead of Python. Here's how the parser modification might look:

```typescript
// openapi-parser.ts
import { parse } from 'yaml';
import { readFileSync } from 'fs';
import { UniversalAPIModel, DataModel, APIEndpoint } from './universal-api-model';

export class OpenAPIParser {
  parse(specFile: string, options?: any): UniversalAPIModel {
    // Read and parse specification file
    let spec: any;
    try {
      const content = readFileSync(specFile, 'utf8');
      if (specFile.endsWith('.yaml') || specFile.endsWith('.yml')) {
        spec = parse(content);
      } else {
        spec = JSON.parse(content);
      }
    } catch (error) {
      throw new Error(`Failed to parse specification file: ${error.message}`);
    }

    // Extract basic information
    const projectName = options?.projectName || spec.info?.title || 'express-api';
    const description = spec.info?.description;
    const version = spec.info?.version || '0.1.0';

    // Initialize the model
    const model = new UniversalAPIModel(projectName, version, description);

    // Parse paths
    if (spec.paths) {
      for (const [path, pathDetails] of Object.entries(spec.paths)) {
        for (const [method, methodDetails] of Object.entries(pathDetails)) {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
            const tags = methodDetails.tags || ['default'];
            
            // Helper function to extract schema names
            const getSchemaName = (ref) => {
              if (!ref || !ref.$ref) return null;
              return ref.$ref.split('/').pop();
            };

            // Extract request and response schemas
            let requestSchema = null;
            if (methodDetails.requestBody) {
              const content = methodDetails.requestBody.content;
              if (content && content['application/json']) {
                requestSchema = getSchemaName(content['application/json'].schema);
              }
            }

            let responseSchema = null;
            if (methodDetails.responses) {
              for (const code of ['200', '201']) {
                if (methodDetails.responses[code]) {
                  const content = methodDetails.responses[code].content;
                  if (content && content['application/json']) {
                    responseSchema = getSchemaName(content['application/json'].schema);
                    break;
                  }
                }
              }
            }

            // Create endpoint
            const endpoint = new APIEndpoint(
              path,
              method.toUpperCase(),
              methodDetails.summary,
              methodDetails.description,
              requestSchema,
              responseSchema,
              tags,
              methodDetails.operationId
            );

            // Add to appropriate router
            const routerName = tags[0];
            if (!model.routers[routerName]) {
              model.routers[routerName] = [];
            }
            model.routers[routerName].push(endpoint);
          }
        }
      }
    }

    // Parse schemas
    if (spec.components && spec.components.schemas) {
      for (const [schemaName, schemaDetails] of Object.entries(spec.components.schemas)) {
        const fields = {};
        if (schemaDetails.properties) {
          for (const [propName, propDetails] of Object.entries(schemaDetails.properties)) {
            fields[propName] = propDetails.type || 'any';
          }
        }
        model.models.push(new DataModel(schemaName, fields, schemaDetails.description));
      }
    }

    return model;
  }
}
```

## Code Generation Process

The code generation process will follow these steps:

1. Parse the OpenAPI specification
2. Create the project structure
3. Generate models (TypeScript interfaces or Mongoose models)
4. Generate repositories
5. Generate services
6. Generate API routes
7. Generate validation schemas
8. Generate middleware
9. Generate main application file
10. Generate package.json and other configuration files

## Type System

JavaScript doesn't have built-in type annotations like Python, but we can use:

1. **Plain JavaScript with JSDoc comments** for type hints
2. **TypeScript** for full type safety

### JSDoc Example:

```javascript
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} email
 * @property {boolean} isActive
 */

/**
 * Get all users
 * @returns {Promise<User[]>}
 */
async function getAllUsers() {
  // ...
}
```

### TypeScript Example:

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
}

async function getAllUsers(): Promise<User[]> {
  // ...
}
```

## Implementation Steps

1. **Create a new branch** for the Express.js generator
2. **Adapt the UniversalAPIModel** to be language-agnostic
3. **Create Express.js templates** for each component (models, services, etc.)
4. **Modify the code generator** to use these templates
5. **Add TypeScript support**
6. **Create a language selection option** in the CLI
7. **Update the documentation**
8. **Create tests** for the Express.js generator
9. **Implement sample applications** to validate the generator

## Example Templates

### Main Application (app.js)

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/error-handler');
const config = require('./config/server');

// Import routers
{{#each routers}}
const {{name}}Router = require('./api/{{name}}.routes');
{{/each}}

// Create Express app
const app = express();

// Apply middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Register routes
{{#each routers}}
app.use('/api/{{routePath}}', {{name}}Router);
{{/each}}

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Apply error handler
app.use(errorHandler);

// Start server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

### Model Template (Mongoose)

```javascript
const mongoose = require('mongoose');

/**
 * {{description}}
 */
const {{name}}Schema = new mongoose.Schema({
  {{#each fields}}
  {{name}}: {
    type: {{type}},
    {{#if required}}required: true,{{/if}}
    {{#if default}}default: {{default}},{{/if}}
  },
  {{/each}}
}, { timestamps: true });

module.exports = mongoose.model('{{name}}', {{name}}Schema);
```

### Service Template

```javascript
const {{name}}Repository = require('../repositories/{{name}}.repository');

/**
 * Service for {{name}} operations
 */
class {{pascalCase name}}Service {
  constructor(repository = {{name}}Repository) {
    this.repository = repository;
  }
  
  {{#each methods}}
  /**
   * {{description}}
   {{#each params}}
   * @param {{{type}}} {{name}} - {{description}}
   {{/each}}
   * @returns {Promise<{{returnType}}>}
   */
  async {{name}}({{paramList}}) {
    {{#if hasRequestBody}}
    return await this.repository.{{repositoryMethod}}({{params}});
    {{else}}
    return await this.repository.{{repositoryMethod}}();
    {{/if}}
  }
  {{/each}}
}

module.exports = new {{pascalCase name}}Service();
```

## Testing Strategy

To ensure the Express.js generator works correctly:

1. **Unit tests** for the OpenAPI parser
2. **Unit tests** for the code generator
3. **Integration tests** for the complete generation process
4. **Validation tests** for the generated code
5. **End-to-end tests** that build and run a generated Express application

## Performance Considerations

1. **Async code generation** for large projects
2. **Incremental generation** for faster updates
3. **Template caching** to improve generation speed
4. **Parallel processing** for independent components