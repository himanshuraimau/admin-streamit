# Database Schema

Complete database schema for StreamIt Admin platform.

## Schema Overview

The database is organized into several logical groups:

1. **Authentication & Users** - User accounts and sessions
2. **Creator System** - Creator applications and verification
3. **Content** - Posts, comments, likes, streams
4. **Payments** - Coins, purchases, gifts
5. **Discounts** - Promotional and reward codes
6. **Moderation** - Reports, admin logs, settings

## Core Tables

### User
Main user table with roles and moderation fields.

```prisma
model User {
  id            String
  name          String
  email         String    @unique
  username      String    @unique
  role          UserRole  @default(USER)  // USER, CREATOR, ADMIN
  isSuspended   Boolean   @default(false)
  createdAt     DateTime
}
```

**Key Fields:**
- `role` - USER, CREATOR, ADMIN, SUPER_ADMIN
- `isSuspended` - Whether user is suspended
- `suspendedReason` - Why user was suspended
- `suspendedBy` - Admin ID who suspended
- `suspensionExpiresAt` - null = permanent

### Session
User authentication sessions.

```prisma
model Session {
  id        String
  token     String   @unique
  userId    String
  expiresAt DateTime
}
```

## Creator System

### CreatorApplication
Applications to become a creator.

```prisma
model CreatorApplication {
  id              String
  userId          String            @unique
  status          ApplicationStatus @default(DRAFT)
  submittedAt     DateTime?
  reviewedAt      DateTime?
  reviewedBy      String?           // Admin ID
  rejectionReason String?
}
```

**Status Flow:**
```
DRAFT → PENDING → UNDER_REVIEW → APPROVED/REJECTED
```

### IdentityVerification
ID verification for creator applications.

```prisma
model IdentityVerification {
  id                   String
  creatorApplicationId String @unique
  idType               IDType  // AADHAAR, PASSPORT, DRIVERS_LICENSE
  idDocumentUrl        String
  selfiePhotoUrl       String
  isVerified           Boolean @default(false)
}
```

### FinancialDetails
Bank details for payouts.

```prisma
model FinancialDetails {
  id                   String
  creatorApplicationId String @unique
  accountHolderName    String
  accountNumber        String  // Encrypted
  ifscCode             String
  panNumber            String  // Encrypted
  isVerified           Boolean @default(false)
}
```

## Content Models

### Post
User posts with media.

```prisma
model Post {
  id              String
  content         String?
  type            PostType  // TEXT, IMAGE, VIDEO, MIXED
  authorId        String
  isHidden        Boolean   @default(false)
  hiddenReason    String?
  hiddenBy        String?   // Admin ID
  likesCount      Int       @default(0)
  commentsCount   Int       @default(0)
}
```

**Moderation Fields:**
- `isHidden` - Hidden by admin
- `hiddenReason` - Why it was hidden
- `hiddenBy` - Admin who hid it
- `isFlagged` - Flagged for review
- `flagCount` - Number of flags

### Comment
Comments on posts (with nesting).

```prisma
model Comment {
  id           String
  content      String
  userId       String
  postId       String
  parentId     String?   // For replies
  isHidden     Boolean   @default(false)
  likesCount   Int       @default(0)
}
```

### Stream
Live streams (for creators only).

```prisma
model Stream {
  id                  String
  title               String
  userId              String  @unique
  isLive              Boolean @default(false)
  isChatEnabled       Boolean @default(true)
  isChatFollowersOnly Boolean @default(false)
}
```

## Payment Models

### CoinWallet
User's coin balance.

```prisma
model CoinWallet {
  id          String
  userId      String @unique
  balance     Int    @default(0)
  totalEarned Int    @default(0)  // For creators
  totalSpent  Int    @default(0)  // For users
}
```

### CoinPackage
Packages available for purchase.

```prisma
model CoinPackage {
  id          String
  name        String
  coins       Int
  price       Int     // In paise
  bonusCoins  Int     @default(0)
  isActive    Boolean @default(true)
}
```

### CoinPurchase
Purchase transactions.

```prisma
model CoinPurchase {
  id             String
  userId         String
  packageId      String
  coins          Int
  bonusCoins     Int
  amount         Int
  status         PurchaseStatus  // PENDING, COMPLETED, FAILED, REFUNDED
  transactionId  String?         // External payment ID
  orderId        String
}
```

**Status Flow:**
```
PENDING → COMPLETED/FAILED
COMPLETED → REFUNDED (if refund processed)
```

### Gift
Virtual gifts.

```prisma
model Gift {
  id           String
  name         String
  coinPrice    Int
  imageUrl     String
  animationUrl String?
  isActive     Boolean @default(true)
}
```

### GiftTransaction
Gift sends.

```prisma
model GiftTransaction {
  id         String
  senderId   String
  receiverId String
  giftId     String
  coinAmount Int
  quantity   Int     @default(1)
  streamId   String?
  message    String?
}
```

## Discount System

### DiscountCode
Promotional and reward codes.

```prisma
model DiscountCode {
  id                 String
  code               String       @unique
  discountType       DiscountType // PERCENTAGE, FIXED
  discountValue      Int
  codeType           CodeType     // PROMOTIONAL, REWARD
  ownerId            String?      // For reward codes
  maxRedemptions     Int?
  currentRedemptions Int          @default(0)
  expiresAt          DateTime?
  isActive           Boolean      @default(true)
}
```

**Code Types:**
- **PROMOTIONAL** - Created by admins, can be used by anyone
- **REWARD** - Given to specific users, one-time use

**Discount Types:**
- **PERCENTAGE** - % off (value 1-100)
- **FIXED** - Fixed amount off in paise

### DiscountRedemption
Tracks code usage.

```prisma
model DiscountRedemption {
  id                String
  discountCodeId    String
  userId            String
  purchaseId        String @unique
  bonusCoinsAwarded Int
}
```

## Moderation Models

### Report
User reports.

```prisma
model Report {
  id             String
  reason         ReportReason  // SPAM, HARASSMENT, etc.
  description    String?
  reporterId     String
  reportedUserId String
  postId         String?
  commentId      String?
  streamId       String?
  status         ReportStatus  // PENDING, RESOLVED, DISMISSED
  reviewedBy     String?       // Admin ID
  resolution     String?
}
```

**Report Reasons:**
- SPAM
- HARASSMENT
- HATE_SPEECH
- NUDITY
- VIOLENCE
- COPYRIGHT
- MISINFORMATION
- SELF_HARM
- OTHER

**Status Flow:**
```
PENDING → UNDER_REVIEW → RESOLVED/DISMISSED
```

### AdminActivityLog
Audit trail for admin actions.

```prisma
model AdminActivityLog {
  id             String
  adminId        String
  action         AdminAction
  targetType     String  // "user", "post", "payment", etc.
  targetId       String
  description    String
  affectedUserId String?
  metadata       Json?
  ipAddress      String?
}
```

**Admin Actions:**
- User: SUSPENDED, UNSUSPENDED, ROLE_CHANGED, DELETED
- Content: POST_HIDDEN, POST_DELETED, COMMENT_HIDDEN, etc.
- Creator: APPLICATION_APPROVED, APPLICATION_REJECTED
- Payment: PAYMENT_REFUNDED
- Gifts: CREATE_GIFT, UPDATE_GIFT, DELETE_GIFT
- Reports: REPORT_REVIEWED, REPORT_RESOLVED
- System: SETTING_UPDATED, ANNOUNCEMENT_CREATED

### SystemSetting
Platform configuration.

```prisma
model SystemSetting {
  id          String
  key         String  @unique
  value       String
  description String?
  isPublic    Boolean @default(false)
  updatedBy   String  // Admin ID
}
```

### Announcement
Platform announcements.

```prisma
model Announcement {
  id         String
  title      String
  content    String
  type       AnnouncementType  // INFO, WARNING, MAINTENANCE
  isActive   Boolean           @default(true)
  startsAt   DateTime?
  endsAt     DateTime?
  targetRole UserRole?         // null = all users
  isPinned   Boolean           @default(false)
  createdBy  String            // Admin ID
}
```

## Enums

### UserRole
```
USER         - Regular user
CREATOR      - Approved creator
ADMIN        - Platform admin
SUPER_ADMIN  - Super admin
```

### ApplicationStatus
```
DRAFT        - Not submitted
PENDING      - Submitted, awaiting review
UNDER_REVIEW - Being reviewed
APPROVED     - Approved
REJECTED     - Rejected
```

### PurchaseStatus
```
PENDING   - Payment initiated
COMPLETED - Payment successful
FAILED    - Payment failed
REFUNDED  - Refunded by admin
```

### ReportStatus
```
PENDING      - New report
UNDER_REVIEW - Being reviewed
RESOLVED     - Action taken
DISMISSED    - No action needed
```

## Relationships

### User Relationships
- One-to-one: CoinWallet, Stream, CreatorApplication
- One-to-many: Posts, Comments, Likes, CoinPurchases, GiftsSent, GiftsReceived
- Many-to-many: Following/Followers (via Follow), Blocking/Blocked (via Block)

### Creator Application Flow
```
User → CreatorApplication → IdentityVerification
                          → FinancialDetails
                          → CreatorProfile
```

### Payment Flow
```
User → CoinPurchase → CoinPackage
                   → DiscountRedemption → DiscountCode
```

### Content Moderation Flow
```
User → Post → Report → AdminActivityLog
```

## Indexes

Key indexes for performance:

- **User**: role, isSuspended, email, username
- **Post**: authorId, createdAt, isHidden, isFlagged
- **Comment**: userId, postId, isHidden
- **CoinPurchase**: userId + status, transactionId
- **Report**: status, reporterId, reportedUserId
- **AdminActivityLog**: adminId, action, createdAt

## Migrations

Run migrations:
```bash
bun db:migrate:deploy  # Production
bun db:migrate         # Development
```

View in Prisma Studio:
```bash
bun db:studio
```
