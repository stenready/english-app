import { FetchError, ofetch, type FetchOptions } from 'ofetch'
import i18n from '@/plugins/i18n'
import httpStatus from '@/constants/httpStatus'
import restUrls from '@/constants/restUrls'
import { AppError } from '@/errors/AppError'
import errorCodes from '@/errors/errorCodes'
import { useAuthStore } from '@/stores/auth'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = Omit<FetchOptions<'json'>, 'method'> & {
  method?: HttpMethod
  skipAuthRefresh?: boolean
}

type CallOptions = Omit<RequestOptions, 'method' | 'body'>
type RequestBody = RequestOptions['body']

interface RefreshResponse {
  data: {
    accessToken: string
  }
}

export interface GraphqlError {
  message: string
  path?: (string | number)[]
  extensions?: Record<string, unknown>
}

interface GraphqlResponse<TData> {
  data?: TData
  errors?: GraphqlError[]
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const GRAPHQL_PATH = '/graphql'
const TOKEN_TYPE = 'Bearer'
const AUTHORIZATION_HEADER = 'Authorization'
const ACCEPT_LANGUAGE_HEADER = 'Accept-Language'
// Sends the httpOnly refresh cookie cross-origin and lets the browser store Set-Cookie
const CREDENTIALS_MODE = 'include'
const OPERATION_NAME_REGEX = /(?:query|mutation|subscription)\s+(\w+)/
const REFRESH_LOCK_NAME = 'auth-refresh'

// The lock is shared by all tabs of the origin: only one refresh runs at a time
const refreshAccessToken = async (sentToken: string | null): Promise<void> => {
  await navigator.locks.request(REFRESH_LOCK_NAME, async () => {
    const authStore = useAuthStore()

    // Another tab or request refreshed the token while this one waited for the lock
    if (authStore.accessToken && authStore.accessToken !== sentToken) {
      return
    }

    try {
      const { data } = await ofetch<RefreshResponse>(restUrls.AUTH_REFRESH, {
        baseURL: BASE_URL,
        method: 'POST',
        credentials: CREDENTIALS_MODE,
        retry: false,
      })

      if (!data?.accessToken) {
        throw new AppError('Refresh response has no accessToken', {
          code: errorCodes.UNAUTHORIZED,
        })
      }

      authStore.setToken(data.accessToken)
    } catch (error) {
      authStore.setToken(null)
      throw error
    }
  })
}

// On app start: no request if a token is stored; otherwise try the refresh cookie
export const restoreSession = async (): Promise<void> => {
  if (useAuthStore().accessToken) {
    return
  }

  await refreshAccessToken(null).catch(() => {
    // No valid refresh cookie: the user is simply not logged in
  })
}

const apiFetch = ofetch.create({
  baseURL: BASE_URL,
  retry: false,
  credentials: CREDENTIALS_MODE,
  onRequest({ options }) {
    const { accessToken } = useAuthStore()

    options.headers.set(ACCEPT_LANGUAGE_HEADER, i18n.global.locale.value)

    if (accessToken) {
      options.headers.set(AUTHORIZATION_HEADER, `${TOKEN_TYPE} ${accessToken}`)
    }
  },
})

const isAuthEndpoint = (path: string): boolean =>
  path.includes(restUrls.AUTH_REFRESH)

const request = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { skipAuthRefresh, ...fetchOptions } = options
  const sentToken = useAuthStore().accessToken

  try {
    return await apiFetch<T>(path, fetchOptions)
  } catch (error) {
    const canRefresh =
      error instanceof FetchError &&
      error.statusCode === httpStatus.UNAUTHORIZED &&
      !skipAuthRefresh &&
      !isAuthEndpoint(path)

    if (!canRefresh) {
      throw AppError.from(error)
    }

    try {
      await refreshAccessToken(sentToken)

      return await apiFetch<T>(path, fetchOptions)
    } catch (retryError) {
      throw AppError.from(retryError)
    }
  }
}

export const rest = Object.assign(
  <T>(url: string, options?: RequestOptions) => request<T>(url, options),
  {
    get: <T>(url: string, options?: CallOptions) =>
      request<T>(url, { ...options, method: 'GET' }),

    post: <T>(url: string, body?: RequestBody, options?: CallOptions) =>
      request<T>(url, { ...options, body, method: 'POST' }),

    put: <T>(url: string, body?: RequestBody, options?: CallOptions) =>
      request<T>(url, { ...options, body, method: 'PUT' }),

    patch: <T>(url: string, body?: RequestBody, options?: CallOptions) =>
      request<T>(url, { ...options, body, method: 'PATCH' }),

    delete: <T>(url: string, options?: CallOptions) =>
      request<T>(url, { ...options, method: 'DELETE' }),
  },
)

const getOperationName = (query: string): string =>
  query.match(OPERATION_NAME_REGEX)?.[1] ?? ''

export const graphql = async <
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  query: string,
  variables?: TVariables,
  options?: CallOptions,
): Promise<TData> => {
  const operationName = getOperationName(query)

  const path = operationName ? `${GRAPHQL_PATH}/${operationName}` : GRAPHQL_PATH

  const response = await request<GraphqlResponse<TData>>(path, {
    ...options,
    method: 'POST',
    body: { query, variables },
  })

  if (response.errors?.length) {
    throw new AppError(
      response.errors.map((error) => error.message).join('; '),
      { code: errorCodes.GRAPHQL, details: response.errors },
    )
  }

  return response.data as TData
}
