import { Service } from 'typedi';

import { Response401UnauthorizedError } from '~/Error/Response401UnauthorizedError';
import { Response403ForbiddenError } from '~/Error/Response403ForbiddenError';
import { Response404NotFoundError } from '~/Error/Response404NotFoundError';
import { ResponseError } from '~/Error/ResponseError';
import { Logger } from '~/Service/Logger';
import { WebSdkConfiguration } from '~/Service/WebSdkConfiguration';
import { HttpRequestMethod } from '~/Type/Enum/HttpRequestMethod';

@Service()
class FetchHelper {
  constructor(
    private logger: Logger,
    private sdkConfiguration: WebSdkConfiguration,
  ) {}

  createResponseErrorFromBadResponse(response: Response, data: Record<string, unknown>): ResponseError {
    let errorInstance: ResponseError | null = null;

    if (response.status == 401) {
      errorInstance = new Response401UnauthorizedError('Sever returned 401 unauthorized.');
    }
    if (response.status == 403) {
      errorInstance = new Response403ForbiddenError('Sever returned 403 forbidden.');
    }
    if (response.status == 404) {
      errorInstance = new Response404NotFoundError('Sever returned 404 not found.');
    }

    if (errorInstance == null) errorInstance = new ResponseError('Generic response error.');

    if ('type' in data) {
      errorInstance.setType(String(data.type));
    }
    if ('title' in data) {
      errorInstance.setTitle(String(data.title));
    }
    if ('detail' in data) {
      errorInstance.setDetail(String(data.detail));
    }
    if ('status' in data && errorInstance.getStatus() == null) {
      errorInstance.setStatus(Number(data.status));
    }

    return errorInstance;
  }

  addAuthorizationHeader(headers: HeadersInit): void {
    if (this.sdkConfiguration.hasToken()) {
      headers['Authorization'] = `Bearer ${this.sdkConfiguration.getToken()}`;
    }
  }

  addAcceptJsonAndProblemJsonHeader(headers: HeadersInit): void {
    headers['Accept'] = 'application/json, application/problem+json';
  }

  addContentTypeJsonHeader(headers: HeadersInit): void {
    headers['Content-Type'] = 'application/json';
  }

  getDefaultGetOptions(): RequestInit {
    const headers = {};
    this.addAuthorizationHeader(headers);
    this.addAcceptJsonAndProblemJsonHeader(headers);
    return {
      method: HttpRequestMethod.GET,
      headers: headers,
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    };
  }

  getDefaultPostOptions(body: string): RequestInit {
    const headers = {};
    this.addAuthorizationHeader(headers);
    this.addAcceptJsonAndProblemJsonHeader(headers);
    this.addContentTypeJsonHeader(headers);
    return {
      method: HttpRequestMethod.POST,
      headers: headers,
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: body,
    };
  }

  buildUrl(url: string): string {
    return `${this.sdkConfiguration.getApiHost()}${url}`;
  }

  runWrappedFetch(url: string, init?: RequestInit | undefined): Promise<Response> {
    url = `${this.sdkConfiguration.getApiHost()}${url}`;
    this.logger.debug(`Executing HTTP ${init?.method ?? '-'} request against url ${url} .`);
    return fetch(url, init);
  }
}

export { FetchHelper };
