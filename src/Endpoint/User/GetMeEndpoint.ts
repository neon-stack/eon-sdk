import { Service } from 'typedi';

import { ElementParser } from '~/Service/ElementParser';
import { FetchHelper } from '~/Service/FetchHelper';
import { Logger } from '~/Service/Logger';
import { RequestProblemParser } from '~/Service/RequestProblemParser';
import { Node } from '~/Type/Definition/Node';
import { RequestProblem } from '~/Type/Definition/RequestProblem';
import { RequestProblemCategory } from '~/Type/Enum/RequestProblemCategory';

@Service()
class GetMeEndpoint {
  constructor(
    private logger: Logger,
    private fetchHelper: FetchHelper,
    private elementParser: ElementParser,
    private requestProblemParser: RequestProblemParser,
  ) {}

  async getMe(): Promise<Node> {
    return new Promise((resolve, reject) => {
      this.fetchHelper
        .runWrappedFetch('/me', this.fetchHelper.getDefaultGetOptions())
        .then(async (response) => {
          const data = await response.json();
          if (response.ok) {
            const me = this.elementParser.rawElementToNodeOrRelation(data) as Node;
            resolve(me);
            return;
          }
          const requestProblem = this.requestProblemParser.rawRequestProblemToRequestProblem(data);
          this.logger.error(requestProblem);
          reject(requestProblem);
          return;
        })
        .catch((error) => {
          const requestProblem = {
            category: RequestProblemCategory.ClientSide,
            title: `Encountered network problem`,
            detail: `See exception for details.`,
            exception: error,
          } as RequestProblem;
          this.logger.error(requestProblem);
          reject(requestProblem);
        });
    });
  }
}

export default GetMeEndpoint;