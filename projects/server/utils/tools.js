import { throwAppError } from './AppException.js';

export function serializedResponse(result) {
  const { status, data } = result;
  if (status === 200) {
    if (data.status === 'ok') {
      return {
        status: 'ok',
        data: data.data,
      };
    } else {
      throwAppError(data.message ?? data.msg ?? 'Proxy service fail');
    }
  } else {
    throwAppError('Proxy service fail', data.detail, status);
  }
}

export async function sendRequestWithCatch(func) {
  try {
    const res = await func();
    return serializedResponse(res);
  } catch (err) {
    console.warn('request error: ', err);
    throwAppError(
      err.message,
      err.response?.data?.detail ?? err.response?.statusText,
      err.response?.status,
    );
  }
}
