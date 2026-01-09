# API Reference

Complete API documentation for StreamIt Admin Backend.

## Base URL

- **Development**: `http://localhost:4000`
- **Production**: `https://api.vidreplay.site`

## Authentication

All admin endpoints require JWT authentication.

**Login to get token:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@streamit.com",
  "password": "Admin@123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "email": "admin@streamit.com",
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

**Use token in requests:**
```http
Authorization: Bearer <token>
```

## Endpoints

### Health Check

```http
GET /health
```

No authentication required.

**Response:**
```json
{
  "success": true,
  "service": "admin-backend",
  "timestamp": "2026-01-09T15:00:00.000Z",
  "uptime": 12345
}
```

---

## User Management

### List Users

```http
GET /api/admin/users?page=1&limit=20&role=USER&suspended=false
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `role` - Filter by role (USER, CREATOR, ADMIN)
- `suspended` - Filter by suspension status (true/false)
- `search` - Search by name, email, username

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "role": "USER",
      "isSuspended": false,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Get User Details

```http
GET /api/admin/users/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "USER",
    "isSuspended": false,
    "suspendedReason": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "lastLoginAt": "2026-01-09T10:00:00.000Z",
    "_count": {
      "posts": 10,
      "followers": 50,
      "following": 30
    }
  }
}
```

### Suspend User

```http
PATCH /api/admin/users/:id/suspend
Content-Type: application/json

{
  "reason": "Violation of community guidelines",
  "expiresAt": "2026-02-01T00:00:00.000Z"  // null for permanent
}
```

**Response:**
```json
{
  "success": true,
  "message": "User suspended successfully"
}
```

### Unsuspend User

```http
PATCH /api/admin/users/:id/unsuspend
```

**Response:**
```json
{
  "success": true,
  "message": "User unsuspended successfully"
}
```

---

## Creator Applications

### List Applications

```http
GET /api/admin/creator-applications?status=PENDING&page=1&limit=20
```

**Query Parameters:**
- `status` - DRAFT, PENDING, UNDER_REVIEW, APPROVED, REJECTED
- `page`, `limit` - Pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "userId": "...",
      "status": "PENDING",
      "submittedAt": "2026-01-05T00:00:00.000Z",
      "user": {
        "name": "Jane Creator",
        "email": "jane@example.com"
      },
      "identity": {
        "idType": "AADHAAR",
        "isVerified": false
      }
    }
  ]
}
```

### Get Application Details

```http
GET /api/admin/creator-applications/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "PENDING",
    "user": { ... },
    "identity": {
      "idType": "AADHAAR",
      "idDocumentUrl": "https://...",
      "selfiePhotoUrl": "https://..."
    },
    "financial": {
      "accountHolderName": "Jane Creator",
      "ifscCode": "SBIN0001234"
    },
    "profile": {
      "bio": "Content creator...",
      "categories": ["ENTERTAINMENT", "LIFESTYLE"]
    }
  }
}
```

### Approve Application

```http
PATCH /api/admin/creator-applications/:id/approve
```

**Response:**
```json
{
  "success": true,
  "message": "Creator application approved"
}
```

### Reject Application

```http
PATCH /api/admin/creator-applications/:id/reject
Content-Type: application/json

{
  "reason": "Incomplete documentation"
}
```

---

## Payment Management

### List Transactions

```http
GET /api/admin/payments?status=COMPLETED&page=1&limit=20
```

**Query Parameters:**
- `status` - PENDING, COMPLETED, FAILED, REFUNDED
- `userId` - Filter by user
- `startDate`, `endDate` - Date range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "userId": "...",
      "amount": 9900,
      "coins": 1000,
      "status": "COMPLETED",
      "transactionId": "txn_...",
      "createdAt": "2026-01-09T10:00:00.000Z",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### Process Refund

```http
POST /api/admin/payments/:id/refund
Content-Type: application/json

{
  "reason": "User request"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully"
}
```

---

## Virtual Gifts

### List Gifts

```http
GET /api/admin/virtual-gifts
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Heart",
      "coinPrice": 10,
      "imageUrl": "https://...",
      "isActive": true,
      "sortOrder": 1
    }
  ]
}
```

### Create Gift

```http
POST /api/admin/virtual-gifts
Content-Type: application/json

{
  "name": "Diamond",
  "description": "Premium gift",
  "coinPrice": 100,
  "imageUrl": "https://...",
  "animationUrl": "https://...",
  "sortOrder": 5
}
```

### Update Gift

```http
PATCH /api/admin/virtual-gifts/:id
Content-Type: application/json

{
  "coinPrice": 150,
  "isActive": true
}
```

### Delete Gift

```http
DELETE /api/admin/virtual-gifts/:id
```

---

## Discount Codes

### List Codes

```http
GET /api/admin/discount-codes?type=PROMOTIONAL&active=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "code": "WELCOME10",
      "discountType": "PERCENTAGE",
      "discountValue": 10,
      "codeType": "PROMOTIONAL",
      "maxRedemptions": 1000,
      "currentRedemptions": 50,
      "expiresAt": "2026-02-01T00:00:00.000Z",
      "isActive": true
    }
  ]
}
```

### Create Discount Code

```http
POST /api/admin/discount-codes
Content-Type: application/json

{
  "code": "NEWYEAR25",
  "discountType": "PERCENTAGE",
  "discountValue": 25,
  "codeType": "PROMOTIONAL",
  "maxRedemptions": 500,
  "expiresAt": "2026-01-31T23:59:59.000Z",
  "description": "New Year Sale"
}
```

### Update Discount Code

```http
PATCH /api/admin/discount-codes/:id
Content-Type: application/json

{
  "isActive": false
}
```

### Delete Discount Code

```http
DELETE /api/admin/discount-codes/:id
```

---

## Content Moderation

### List Posts

```http
GET /api/admin/posts?hidden=false&flagged=true
```

**Query Parameters:**
- `hidden` - Filter by hidden status
- `flagged` - Filter by flagged status
- `authorId` - Filter by author

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "content": "Post content...",
      "type": "TEXT",
      "isHidden": false,
      "isFlagged": true,
      "flagCount": 3,
      "likesCount": 10,
      "commentsCount": 5,
      "author": {
        "name": "John Doe",
        "username": "johndoe"
      },
      "createdAt": "2026-01-09T10:00:00.000Z"
    }
  ]
}
```

### Hide Post

```http
PATCH /api/admin/posts/:id/hide
Content-Type: application/json

{
  "reason": "Inappropriate content"
}
```

### Unhide Post

```http
PATCH /api/admin/posts/:id/unhide
```

### Delete Post

```http
DELETE /api/admin/posts/:id
```

### List Comments

```http
GET /api/admin/comments?hidden=false
```

### Delete Comment

```http
DELETE /api/admin/comments/:id
```

---

## Reports

### List Reports

```http
GET /api/admin/reports?status=PENDING&page=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "reason": "HARASSMENT",
      "description": "User is harassing me",
      "status": "PENDING",
      "reporter": {
        "name": "User A",
        "username": "usera"
      },
      "reportedUser": {
        "name": "User B",
        "username": "userb"
      },
      "post": {
        "id": "...",
        "content": "..."
      },
      "createdAt": "2026-01-09T10:00:00.000Z"
    }
  ]
}
```

### Resolve Report

```http
PATCH /api/admin/reports/:id/resolve
Content-Type: application/json

{
  "resolution": "User suspended for 7 days"
}
```

### Dismiss Report

```http
PATCH /api/admin/reports/:id/dismiss
Content-Type: application/json

{
  "resolution": "No violation found"
}
```

---

## Analytics

### Revenue Analytics

```http
GET /api/admin/analytics/revenue?period=7d
```

**Query Parameters:**
- `period` - 7d, 30d, 90d, 1y

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 1000000,
    "totalTransactions": 500,
    "averageTransaction": 2000,
    "chartData": [
      { "date": "2026-01-01", "revenue": 10000 },
      { "date": "2026-01-02", "revenue": 15000 }
    ]
  }
}
```

### User Analytics

```http
GET /api/admin/analytics/users?period=30d
```

### Content Analytics

```http
GET /api/admin/analytics/content?period=30d
```

### Gift Analytics

```http
GET /api/admin/analytics/gifts?period=30d
```

---

## Activity Logs

### List Activity Logs

```http
GET /api/admin/activity-logs?action=USER_SUSPENDED&page=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "action": "USER_SUSPENDED",
      "description": "Suspended user for 7 days",
      "admin": {
        "name": "Admin User",
        "email": "admin@streamit.com"
      },
      "affectedUser": {
        "name": "John Doe"
      },
      "createdAt": "2026-01-09T10:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

No rate limiting currently implemented.

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response includes:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
