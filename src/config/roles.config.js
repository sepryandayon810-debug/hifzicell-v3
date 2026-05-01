/**
 * 🔐 Role-Based Access Control Configuration
 * Defines roles, permissions, and feature access
 */

export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  DEVELOPER: 'DEVELOPER',
  KASIR: 'KASIR',
}

export const ROLE_LABELS = {
  OWNER: '👑 Owner',
  ADMIN: '🔧 Admin',
  DEVELOPER: '👨‍💻 Developer',
  KASIR: '💼 Kasir',
}

export const ROLE_COLORS = {
  OWNER: 'from-red-500 to-red-600',
  ADMIN: 'from-gray-700 to-gray-800',
  DEVELOPER: 'from-blue-500 to-blue-600',
  KASIR: 'from-green-500 to-green-600',
}

export const PERMISSIONS = {
  // Transaction
  CREATE_TRANSACTION: 'create_transaction',
  VIEW_TRANSACTIONS: 'view_transactions',
  EDIT_TRANSACTION: 'edit_transaction',
  DELETE_TRANSACTION: 'delete_transaction',
  
  // Product
  CREATE_PRODUCT: 'create_product',
  VIEW_PRODUCT: 'view_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  
  // Cash
  MANAGE_CASH: 'manage_cash',
  VIEW_CASH: 'view_cash',
  
  // Debt
  MANAGE_DEBT: 'manage_debt',
  VIEW_DEBT: 'view_debt',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  GENERATE_REPORTS: 'generate_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // User Management
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  
  // Settings
  SYSTEM_SETTINGS: 'system_settings',
  AUDIT_LOG: 'audit_log',
  
  // Dev Tools
  DEV_CONSOLE: 'dev_console',
  API_TESTING: 'api_testing',
}

/**
 * Role-Permission Matrix
 */
export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [
    // All permissions
    ...Object.values(PERMISSIONS),
  ],
  
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_TRANSACTION,
    PERMISSIONS.VIEW_TRANSACTIONS,
    PERMISSIONS.EDIT_TRANSACTION,
    
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.VIEW_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    
    PERMISSIONS.MANAGE_CASH,
    PERMISSIONS.VIEW_CASH,
    
    PERMISSIONS.MANAGE_DEBT,
    PERMISSIONS.VIEW_DEBT,
    
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.AUDIT_LOG,
  ],
  
  [ROLES.DEVELOPER]: [
    PERMISSIONS.VIEW_TRANSACTIONS,
    PERMISSIONS.VIEW_PRODUCT,
    
    PERMISSIONS.VIEW_CASH,
    PERMISSIONS.VIEW_DEBT,
    
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORTS,
    
    PERMISSIONS.AUDIT_LOG,
    PERMISSIONS.DEV_CONSOLE,
    PERMISSIONS.API_TESTING,
  ],
  
  [ROLES.KASIR]: [
    PERMISSIONS.CREATE_TRANSACTION,
    PERMISSIONS.VIEW_TRANSACTIONS,
    
    PERMISSIONS.VIEW_PRODUCT,
  ],
}

/**
 * Features by Role (untuk sidebar/menu)
 */
export const ROLE_FEATURES = {
  [ROLES.OWNER]: [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Kasir', icon: '💳', path: '/kasir' },
    { name: 'Produk', icon: '📦', path: '/produk' },
    { name: 'Kas', icon: '💰', path: '/kas' },
    { name: 'Hutang', icon: '📋', path: '/hutang' },
    { name: 'Laporan', icon: '📈', path: '/laporan' },
    { name: 'Users', icon: '👥', path: '/users' },
    { name: 'Settings', icon: '⚙️', path: '/settings' },
  ],
  
  [ROLES.ADMIN]: [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Kasir', icon: '💳', path: '/kasir' },
    { name: 'Produk', icon: '📦', path: '/produk' },
    { name: 'Kas', icon: '💰', path: '/kas' },
    { name: 'Hutang', icon: '📋', path: '/hutang' },
    { name: 'Laporan', icon: '📈', path: '/laporan' },
  ],
  
  [ROLES.DEVELOPER]: [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Laporan', icon: '📈', path: '/laporan' },
    { name: 'Dev Tools', icon: '🛠️', path: '/dev-tools' },
  ],
  
  [ROLES.KASIR]: [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Input Transaksi', icon: '💳', path: '/kasir' },
  ],
}
