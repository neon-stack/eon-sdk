import { Service } from 'typedi';

import { NetworkError, ParseError } from '../../Error/index.js';
import { FetchHelper, Logger } from '../../Service/index.js';
import { Data, UniqueUserIdentifier, Uuid, validateUuidFromString } from '../../Type/Definition/index.js';

/**
 * The post register endpoint is used to create new user accounts.
 *
 * **⚠️ Warning**: This is an internal class. You should not use it directly.
 *
 * @see [Further documentation](https://ember-nexus.github.io/web-sdk/#/endpoints/user?id=postregisterendpoint)
 * @see [Ember Nexus API: Register New Account Endpoint](https://ember-nexus.github.io/api/#/api-endpoints/user/post-register)
 *
 * @internal
 */
@Service()
class PostRegisterEndpoint {
  constructor(
    private logger: Logger,
    private fetchHelper: FetchHelper,
  ) {}

  postRegister(uniqueUserIdentifier: UniqueUserIdentifier, password: string, data: Data = {}): Promise<Uuid> {
    return Promise.resolve()
      .then(() => {
        const url = this.fetchHelper.buildUrl(`/register`);
        this.logger.debug(`Executing HTTP POST request against url ${url} .`);
        return fetch(
          url,
          this.fetchHelper.getDefaultPostOptions(
            JSON.stringify({
              type: 'User',
              uniqueUserIdentifier: uniqueUserIdentifier,
              password: password,
              data: data,
            }),
          ),
        );
      })
      .catch((error) => {
        throw new NetworkError(`Experienced generic network error during creating resource.`, error);
      })
      .then(async (response: Response) => {
        if (response.ok && response.status === 201) {
          if (response.headers.has('Location')) {
            const location = response.headers.get('Location') as string;
            const rawUuid = location.split('/').at(-1) as string;
            return validateUuidFromString(rawUuid);
          }
        }
        const contentType = response.headers.get('Content-Type');
        if (contentType === null) {
          throw new ParseError('Response does not contain content type header.');
        }
        if (!contentType.includes('application/problem+json')) {
          throw new ParseError("Unable to parse response as content type is not 'application/problem+json'.");
        }
        const data = await response.json();
        throw this.fetchHelper.createResponseErrorFromBadResponse(response, data);
      })
      .catch((error) => {
        this.logger.error(error.message, error);
        throw error;
      });
  }
}

export { PostRegisterEndpoint };
