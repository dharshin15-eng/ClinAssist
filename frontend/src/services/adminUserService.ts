import { apiClient } from './apiClient';
import type { User, AdminCreateUserRequest, UserStatusUpdateRequest, AuditLog } from '../types';

export const adminUserService = {
  /**
   * Get list of all registered users (ADMIN only)
   */
  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/api/admin/users');
  },

  /**
   * Create a new DOCTOR or HOSPITAL_STAFF user (ADMIN only)
   */
  async createUser(request: AdminCreateUserRequest): Promise<User> {
    return apiClient.post<User>('/api/admin/users', request);
  },

  /**
   * Enable or disable a user account (ADMIN only)
   */
  async updateUserStatus(userId: string, enabled: boolean): Promise<User> {
    const request: UserStatusUpdateRequest = { enabled };
    return apiClient.patch<User>(`/api/admin/users/${userId}/status`, request);
  },

  /**
   * Get list of audit log events (ADMIN only)
   */
  async getAuditLogs(): Promise<AuditLog[]> {
    return apiClient.get<AuditLog[]>('/api/admin/audit-logs');
  }
};
