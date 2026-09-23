import { apiService } from './api-service'
import { handleServiceError } from '../composables/error-helper'
import type { Role, RolePayload, Permission } from '../types/role'
import type { ApiResponse } from '../types/api'

export class RoleService {
  private get authHeaders() {
    return { headers: { Authorization: `Bearer ${useAuth().state.token}` } }
  }

  async getAll(page = 1, perPage = 10, q = '', sortBy = '', order = ''): Promise<ApiResponse<Role[]>> {
    try {
      let url = `/role?page=${page}&limit=${perPage}&q=${q}`
      if (sortBy) url += `&sortBy=${sortBy}`
      if (order) url += `&order=${order}`
      const response = await apiService.client.get<ApiResponse<Role[]>>(
        url,
        this.authHeaders
      )
      return response.data
    } catch (error) {
      return handleServiceError(error)
    }
  }

  async getById(id: number): Promise<ApiResponse<Role>> {
    try {
      const response = await apiService.client.get<ApiResponse<Role>>(
        `/role/${id}`,
        this.authHeaders
      )
      return response.data
    } catch (error) {
      return handleServiceError(error)
    }
  }

  async create(payload: RolePayload): Promise<ApiResponse<Role>> {
    try {
      const response = await apiService.client.post<ApiResponse<Role>>(
        `/role`,
        payload,
        this.authHeaders
      )
      return response.data
    } catch (error) {
      return handleServiceError(error)
    }
  }

  async update(id: number, payload: Partial<RolePayload>): Promise<ApiResponse<Role>> {
    try {
      const response = await apiService.client.put<ApiResponse<Role>>(
        `/role/${id}`,
        payload,
        this.authHeaders
      )
      return response.data
    } catch (error) {
      return handleServiceError(error)
    }
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await apiService.client.delete<ApiResponse<null>>(
        `/role/${id}`,
        this.authHeaders
      )
      return response.data
    } catch (error) {
      return handleServiceError(error)
    }
  }

  async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
    try {
      const response = await apiService.client.get<ApiResponse<Permission[]>>(
        `/role/permissions`,
        this.authHeaders
      )
      return response.data
    } catch (error) {
      return handleServiceError(error)
    }
  }
}

export const roleService = new RoleService()
