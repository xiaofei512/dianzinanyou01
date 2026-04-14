import { ProviderError } from '@/lib/providers/types';

export class ApiError extends Error {
  statusCode: number;
  code: string;
  provider?: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', provider?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.provider = provider;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      provider: this.provider,
    };
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = '未授权访问', provider?: string) {
    super(message, 401, 'UNAUTHORIZED', provider);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = '访问被拒绝', provider?: string) {
    super(message, 403, 'FORBIDDEN', provider);
    this.name = 'ForbiddenError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = '请求频率超限，请稍后重试', provider?: string) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', provider);
    this.name = 'RateLimitError';
  }
}

export class ProviderTimeoutError extends ApiError {
  constructor(message: string = '服务响应超时，请稍后重试', provider?: string) {
    super(message, 504, 'PROVIDER_TIMEOUT', provider);
    this.name = 'ProviderTimeoutError';
  }
}

export class ProviderServiceError extends ApiError {
  constructor(message: string = '服务暂时不可用，请稍后重试', provider?: string) {
    super(message, 502, 'PROVIDER_ERROR', provider);
    this.name = 'ProviderServiceError';
  }
}

export function createErrorFromResponse(response: Response, provider: string): ApiError {
  switch (response.status) {
    case 401:
      return new UnauthorizedError('API Key 无效或已过期', provider);
    case 403:
      return new ForbiddenError('无权限访问该 API', provider);
    case 429:
      return new RateLimitError('请求频率超限，请稍后重试', provider);
    case 504:
      return new ProviderTimeoutError('服务响应超时', provider);
    case 500:
    case 502:
    case 503:
      return new ProviderServiceError('服务暂时不可用', provider);
    default:
      return new ApiError(`请求失败 (${response.status})`, response.status, 'UNKNOWN_ERROR', provider);
  }
}

export function createErrorFromProviderError(error: ProviderError): ApiError {
  if (error.statusCode) {
    return new ApiError(error.message, error.statusCode, error.code || 'PROVIDER_ERROR', error.provider);
  }
  return new ApiError(error.message, 500, 'PROVIDER_ERROR', error.provider);
}
