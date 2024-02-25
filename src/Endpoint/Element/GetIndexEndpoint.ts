import { Service } from 'typedi';

import { CollectionParser } from '~/Service/CollectionParser';
import { FetchHelper } from '~/Service/FetchHelper';
import { Logger } from '~/Service/Logger';
import { RequestProblemParser } from '~/Service/RequestProblemParser';
import { Collection } from '~/Type/Definition/Collection';
import { RequestProblem } from '~/Type/Definition/RequestProblem';
import { RequestProblemCategory } from '~/Type/Enum/RequestProblemCategory';

@Service()
class GetIndexEndpoint {
  constructor(
    private logger: Logger,
    private fetchHelper: FetchHelper,
    private collectionParser: CollectionParser,
    private requestProblemParser: RequestProblemParser,
  ) {}

  async getIndex(page: number = 1, pageSize: number = 25): Promise<Collection> {
    return new Promise((resolve, reject) => {
      this.fetchHelper
        .runWrappedFetch(`/?page=${page}&pageSize=${pageSize}`, this.fetchHelper.getDefaultGetOptions())
        .then(async (response) => {
          const data = await response.json();
          if (response.ok) {
            const collection = this.collectionParser.rawCollectionToCollection(data);
            resolve(collection);
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

export default GetIndexEndpoint;