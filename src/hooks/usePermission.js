import { useAuth } from './useAuth'
import { ROLE_PERMISSIONS } from '../config/roles.config'

export const usePermission = () => {
  const { role } = useAuth()

  const hasPermission = (permission) => {
    if (!role) return false
    const permissions = ROLE_PERMISSIONS[role] || []
    return permissions.includes(permission)
  }

  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission))
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
