# 🔐 Role-Based Access Control (RBAC)

## Overview

WebPOS Firebase menggunakan 4 role utama dengan permission matrix yang jelas:
👑 OWNER - Full Access (100%) 🔧 ADMIN - Operational Management (85%) 👨‍💻 DEVELOPER - Technical Support (40%) 💼 KASIR - Transaction Entry (20%)

---

## 📊 Permission Matrix

| Feature | OWNER | ADMIN | DEVELOPER | KASIR |
|---------|-------|-------|-----------|-------|
| **TRANSACTION** |
| Create | ✅ | ✅ | ❌ | ✅ |
| Read | ✅ | ✅ | ✅ | ⚠️* |
| Edit | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |
| **PRODUCT** |
| Create | ✅ | ✅ | ❌ | ❌ |
| Read | ✅ | ✅ | ✅ | ✅ |
| Edit | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |
| **CASH** |
| Manage | ✅ | ✅ | ❌ | ❌ |
| View | ✅ | ✅ | ✅ | ❌ |
| **DEBT** |
| Create/Edit | ✅ | ✅ | ❌ | ❌ |
| View | ✅ | ✅ | ✅ | ❌ |
| **REPORTS** |
| View | ✅ | ✅ | ✅ | ❌ |
| Generate | ✅ | ✅ | ✅ | ❌ |
| Export | ✅ | ✅ | ❌ | ❌ |
| **ADMIN** |
| Manage Users | ✅ | ⚠️** | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |
| Dev Console | ✅ | ❌ | ✅ | ❌ |

*) Kasir hanya bisa lihat transaksi milik sendiri  
**) Admin hanya bisa manage user dengan role <= Admin

---

## 🔑 Demo Accounts
👑 OWNER Email: owner@hifzicell.com Password: demo123

🔧 ADMIN Email: admin@hifzicell.com Password: demo123

👨‍💻 DEVELOPER Email: dev@hifzicell.com Password: demo123

💼 KASIR Email: kasir@hifzicell.com Password: demo123

---

## 📚 How to Check Permissions

```javascript
import { usePermission } from '@hooks/usePermission'
import { PERMISSIONS } from '@config/roles.config'

function MyComponent() {
  const { hasPermission } = usePermission()
  
  if (hasPermission(PERMISSIONS.CREATE_PRODUCT)) {
    return <CreateProductButton />
  }
  
  return null
}

For detailed information, check the inline documentation in src/config/roles.config.js


