# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User

Creates a new user and tenant (company).

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Acme Corp",
  "companyEmail": "info@acme.com",
  "companyPhone": "+1234567890",
  "companyAddress": "123 Business St"
}
```

**Response:** `201 Created`
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "tenantId": "uuid"
  },
  "tenant": {
    "id": "uuid",
    "name": "Acme Corp",
    "email": "info@acme.com"
  }
}
```

### Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN"
  }
}
```

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "tenant": {
      "id": "uuid",
      "name": "Acme Corp"
    }
  }
}
```

---

## Customer Endpoints

### List Customers

**Endpoint:** `GET /api/customers?page=1&limit=10`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** `200 OK`
```json
{
  "customers": [
    {
      "id": "uuid",
      "name": "Client Company",
      "email": "client@example.com",
      "phone": "+1987654321",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Create Customer

**Endpoint:** `POST /api/customers`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Client Company",
  "email": "client@example.com",
  "phone": "+1987654321",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}
```

**Response:** `201 Created`

### Get Customer

**Endpoint:** `GET /api/customers/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Update Customer

**Endpoint:** `PUT /api/customers/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Company Name",
  "email": "newemail@example.com"
}
```

**Response:** `200 OK`

### Delete Customer

**Endpoint:** `DELETE /api/customers/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

## Invoice Endpoints

### List Invoices

**Endpoint:** `GET /api/invoices?page=1&limit=10&status=SENT&customerId=uuid`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- `customerId` (optional): Filter by customer

**Response:** `200 OK`

### Create Invoice

**Endpoint:** `POST /api/invoices`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "customerId": "uuid",
  "dueDate": "2024-12-31T00:00:00Z",
  "items": [
    {
      "description": "Web Development Services",
      "quantity": 40,
      "unitPrice": 100
    }
  ],
  "tax": 400,
  "discount": 100,
  "notes": "Thank you for your business!"
}
```

**Response:** `201 Created`

### Get Invoice

**Endpoint:** `GET /api/invoices/:id`

**Response:** Includes customer, items, and payments

### Update Invoice

**Endpoint:** `PUT /api/invoices/:id`

**Request Body:** (all fields optional)

### Delete Invoice

**Endpoint:** `DELETE /api/invoices/:id`

**Response:** `204 No Content`

### Mark Invoice as Sent

**Endpoint:** `POST /api/invoices/:id/send`

**Response:** `200 OK`

### Generate Invoice PDF

**Endpoint:** `GET /api/invoices/:id/pdf`

**Response:** PDF file download

### Check Overdue Invoices

**Endpoint:** `POST /api/invoices/check-overdue`

**Response:** List of invoices marked as overdue

---

## Payment Endpoints

### List Payments

**Endpoint:** `GET /api/payments?page=1&limit=10&invoiceId=uuid`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Create Payment

**Endpoint:** `POST /api/payments`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "invoiceId": "uuid",
  "amount": 4000,
  "paymentMethod": "BANK_TRANSFER",
  "paymentDate": "2024-01-15T00:00:00Z",
  "transactionId": "TXN123456",
  "notes": "Payment received"
}
```

**Payment Methods:**
- `CREDIT_CARD`
- `BANK_TRANSFER`
- `CASH`
- `CHECK`
- `STRIPE`
- `OTHER`

**Response:** `201 Created`

### Get Payment

**Endpoint:** `GET /api/payments/:id`

**Response:** `200 OK`

---

## Webhook Endpoints

### Stripe Webhook

**Endpoint:** `POST /api/webhooks/stripe`

**Headers:** `stripe-signature: <signature>`

Handles Stripe webhook events automatically.

### Webhook Health Check

**Endpoint:** `GET /api/webhooks/health`

**Response:** `200 OK`

---

## Error Responses

All endpoints may return error responses:

**400 Bad Request**
```json
{
  "error": "Validation error message",
  "statusCode": 400
}
```

**401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "statusCode": 401
}
```

**404 Not Found**
```json
{
  "error": "Resource not found",
  "statusCode": 404
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "statusCode": 500
}
```

