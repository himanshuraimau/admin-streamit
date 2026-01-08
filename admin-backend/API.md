# StreamIt Admin API Documentation

Base URL: `http://localhost:4000/api/admin`

All endpoints require authentication with an admin role (`ADMIN` or `SUPER_ADMIN`).

## Authentication

Include the session cookie in all requests. Better Auth handles authentication automatically.

---

## Dashboard

### GET /dashboard/stats

Get platform overview statistics.

**Response:**
```json
{
  "totalUsers": 1234,
  "totalRevenue": 45678.90,
  "activeCreators": 56,
  "pendingReports": 12
}
```

---

## User Management

### GET /users

List all users with pagination and filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional) - Search by name, email, or username
- `role` (string, optional) - Filter by role: `USER`, `CREATOR`, `ADMIN`, `SUPER_ADMIN`
- `isSuspended` (boolean, optional) - Filter suspended users

**Response:**
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### GET /users/:id

Get detailed information about a specific user.

**Response:**
```json
{
  "id": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "isSuspended": false,
  ...
}
```

### PATCH /users/:id/suspend

Suspend a user account.

**Body:**
```json
{
  "reason": "Violation of terms",
  "duration": 7 // days, or null for permanent
}
```

### PATCH /users/:id/unsuspend

Unsuspend a user account.

---

## Creator Applications

### GET /creators/applications

List creator applications.

**Query Parameters:**
- `status` (string, optional) - `PENDING`, `APPROVED`, `REJECTED`
- `page`, `limit`

### PATCH /creators/applications/:id/approve

Approve a creator application.

**Body:**
```json
{
  "note": "Approved based on quality content"
}
```

### PATCH /creators/applications/:id/reject

Reject a creator application.

**Body:**
```json
{
  "reason": "Content quality does not meet requirements"
}
```

---

## Payments

### GET /payments

List all payment transactions.

**Query Parameters:**
- `page`, `limit`
- `status` - `COMPLETED`, `PENDING`, `FAILED`, `REFUNDED`
- `search` - Search by buyer email

### GET /payments/:id

Get payment details.

### POST /payments/:id/refund

Refund a payment.

**Body:**
```json
{
  "reason": "Customer request"
}
```

### GET /payments/stats

Get payment statistics.

---

## Virtual Gifts

### GET /gifts

List all virtual gifts.

### POST /gifts

Create a new gift.

**Body:**
```json
{
  "name": "Heart",
  "coinPrice": 10,
  "imageUrl": "https://...",
  "animationUrl": "https://..."
}
```

### PATCH /gifts/:id

Update a gift.

### DELETE /gifts/:id

Delete a gift.

### GET /gifts/transactions

List gift transactions with pagination.

---

## Discount Codes

### GET /discounts

List discount codes.

### POST /discounts

Create a discount code.

**Body:**
```json
{
  "code": "SAVE20",
  "type": "PERCENTAGE",
  "value": 20,
  "maxRedemptions": 100,
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

### PATCH /discounts/:id

Update a discount code.

### DELETE /discounts/:id

Delete a discount code.

### GET /discounts/stats

Get discount usage statistics.

---

## Content Moderation

### GET /content/posts

List posts with moderation filters.

### PATCH /content/posts/:id/visibility

Hide or unhide a post.

**Body:**
```json
{
  "reason": "Violates community guidelines"
}
```

### DELETE /content/posts/:id

Delete a post permanently.

**Body:**
```json
{
  "reason": "Spam content"
}
```

### GET /content/comments

List comments.

### DELETE /content/comments/:id

Delete a comment.

### GET /content/streams

List streams.

### POST /content/streams/:id/end

Force end a live stream.

**Body:**
```json
{
  "reason": "Policy violation"
}
```

---

## Reports

### GET /reports

List user reports.

**Query Parameters:**
- `status` - `PENDING`, `UNDER_REVIEW`, `RESOLVED`, `DISMISSED`
- `reason` - Report reason type

### GET /reports/:id

Get report details.

### PATCH /reports/:id/review

Mark report as under review.

### PATCH /reports/:id/resolve

Resolve a report.

**Body:**
```json
{
  "note": "Action taken against reported user"
}
```

### PATCH /reports/:id/dismiss

Dismiss a report.

**Body:**
```json
{
  "note": "No violation found"
}
```

### GET /reports/stats

Get report statistics.

---

## Activity Logs

### GET /logs

List admin activity logs.

**Query Parameters:**
- `action` - Filter by action type
- `search` - Search by admin email or target
- `startDate`, `endDate` - Date range filter

### GET /logs/:id

Get log details.

### GET /logs/stats

Get activity statistics.

### GET /logs/user/:userId/timeline

Get activity timeline for a specific user.

---

## Analytics

### GET /analytics/overview

Get platform overview metrics.

### GET /analytics/revenue

Get revenue analytics with charts data.

**Query Parameters:**
- `startDate`, `endDate`

### GET /analytics/users

Get user growth and demographics analytics.

### GET /analytics/content

Get content creation analytics.

### GET /analytics/gifts

Get gift usage and revenue analytics.

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional details if available"
}
```

**Common Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (not an admin)
- `404` - Not Found
- `500` - Internal Server Error
