# JAME$ Purchasing Agent

A full-stack purchasing management system for tracking purchase groups, orders, and products.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router, Vite |
| Backend | Laravel 12 |
| Database | MySQL 8 |
| Infrastructure | Docker, Docker Compose |

## Getting Started

### Requirements

- Docker
- Docker Compose

### Run the project

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api |
| MySQL | localhost:3309 |

### Run migrations & seeders

```bash
docker compose exec server php artisan migrate
docker compose exec server php artisan db:seed
```

## Features

### Purchase Groups
- Create and manage purchase groups with statuses: `open`, `closed`, `completed`
- Set start and end dates for each group
- Filter orders by purchase group

### Orders
- Create orders linked to a purchase group
- Auto-generated unique shipping number (SHA-256 hash, first 6 characters)
- Track shipping status (Pending / Shipped)
- Track order completion status (Ongoing / Finished)
- Add multiple order items per order with auto-calculated prices
- View full order detail including itemised totals and grand total
- Total amount summary displayed at the bottom of the orders table

### Products
- Manage products with cost price and selling price
- Soft delete support (deleted products are hidden but preserved in order history)

### Reference Data (seeded)

**Platforms:** 社群, 臉書, 親友, 其他

**Shipping Methods:** 交便貨, 店到店, 面交

## Project Structure

```
PurchasingAgent/
├── compose.yaml
├── backend/                  # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── OrderController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   └── PurchaseGroupController.php
│   │   │   └── Requests/
│   │   └── Models/
│   │       ├── Order.php
│   │       ├── OrderItem.php
│   │       ├── Platform.php
│   │       ├── Product.php
│   │       ├── PurchaseGroup.php
│   │       └── ShippingMethod.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
└── frontend/                 # React + Vite
    └── src/
        ├── api.js
        ├── components/
        │   └── Layout.jsx
        └── pages/
            ├── Orders.jsx
            ├── Products.jsx
            └── PurchaseGroups.jsx
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchase-groups` | List all purchase groups |
| POST | `/api/purchase-groups` | Create a purchase group |
| PATCH | `/api/purchase-groups/{id}` | Update a purchase group |
| DELETE | `/api/purchase-groups/{id}` | Delete a purchase group |
| GET | `/api/orders` | List all orders (with items) |
| POST | `/api/orders` | Create an order |
| PATCH | `/api/orders/{id}` | Update an order |
| DELETE | `/api/orders/{id}` | Delete an order |
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create a product |
| PATCH | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |
| GET | `/api/platforms` | List available platforms |
| GET | `/api/shipping-methods` | List available shipping methods |
