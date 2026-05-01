# 🏛️ WebPOS Firebase Architecture

## Overview

WebPOS Firebase menggunakan **Modular Service-Based Architecture** dengan Firebase sebagai backend dan React sebagai frontend.
┌────────────────────────────────────────────────────────┐ │ PRESENTATION LAYER │ │ (React Components, Pages, UI Elements) │ └────────────────┬─────────────────────────────────────┘ │ ┌────────────────┴─────────────────────────────────────┐ │ BUSINESS LOGIC LAYER │ │ (Services, Validation, Business Rules) │ └────────────────┬─────────────────────────────────────┘ │ ┌────────────────┴─────────────────────────────────────┐ │ DATA ACCESS LAYER │ │ (Firebase Firestore, Auth, Storage) │ └────────────────────────────────────────────────────────┘

---

## 🧩 Module Structure

### 1. **Authentication Module**
- AuthContext.jsx - Global auth state
- authService.js - Firebase auth operations
- useAuth.js - Custom hook
- LoginForm.jsx - Login UI component

### 2. **Kasir (Transaction) Module** - Coming Soon
- transactionService.js
- transactionSchema.js
- TransactionForm.jsx

### 3. **Produk (Product) Module** - Coming Soon
- productService.js
- productSchema.js
- ProductList.jsx

---

## 🔐 Security Rules

All data flows through service layer, never directly from UI to Firebase.

## 🚀 Deployment Architecture

---

For detailed documentation, see ROLES_PERMISSIONS.md
