import axios from 'axios'

export const handleServiceError = (error: unknown): never => {
  if (axios.isCancel(error)) {
    throw error
  }

  const toast = useToast()
  const responseData = axios.isAxiosError(error) ? error.response?.data : undefined

  const title = responseData?.message || 'error'
  let message = ''

  if (axios.isAxiosError(error) && error.response?.status === 422 && responseData?.errors) {
    message = responseData.errors.map((err: { message: string }) => err.message).join(', ')
  } else {
    const fallback = error instanceof Error ? error.message : String(error)
    message = responseData?.message || fallback || 'Terjadi kesalahan'
    if (message === title) message = ''
  }

  toast.add({
    title: title,
    description: message,
    icon: 'i-lucide-circle-x',
    color: 'error'
  })

  throw new Error()
}
