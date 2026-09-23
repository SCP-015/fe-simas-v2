import { apiService } from './api-service'
import { handleServiceError } from '../composables/error-helper'
import type { Transfer } from '../types/transfer'
import type { ApiResponse } from '../types/api'

export class TransferService {
  private get authHeaders() {
    return { headers: { Authorization: `Bearer ${useAuth().state.token}` } }
  }

  async getAll(page = 1, perPage = 10, q = '', status = '', sortBy = '', order = ''): Promise<ApiResponse<Transfer[]>> {
    try {
      let url = `/transfer?page=${page}&limit=${perPage}&q=${q}`
      if (status) url += `&status=${status}`
      if (sortBy) url += `&sortBy=${sortBy}`
      if (order) url += `&order=${order}`
      const response = await apiService.client.get<ApiResponse<Transfer[]>>(
        url,
        this.authHeaders
      )
      return response.data
    } catch (error) {
      return handleServiceError(error)
    }
  }

  async getById(id: number): Promise<ApiResponse<Transfer>> {
    try {
      const response = await apiService.client.get<ApiResponse<Transfer>>(
        `/transfer/${id}`,
        this.authHeaders
      )
      return response.data
    } catch (error) {
      return handleServiceError(error)
    }
  }

  /** Links a transfer row to the Asset(s) already created (via the Asset create form, pre-filled from this row). */
  async merge(id: number, assetIds: number[]): Promise<ApiResponse<Transfer>> {
    try {
      const response = await apiService.client.post<ApiResponse<Transfer>>(
        `/transfer/${id}/merge`,
        { assetIds },
        this.authHeaders
      )
      return response.data
    } catch (error) {
      return handleServiceError(error)
    }
  }
}

export const transferService = new TransferService()
