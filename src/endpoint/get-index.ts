import axios, { AxiosError } from 'axios';

import axiosErrorToSummaryObject from '../helper/axios-error-to-summary-object.js';
import jsonToPartialCollection from '../helper/json-to-partial-collection.js';
import logger from '../logger.js';
import Options from '../options.js';
import PartialCollection from '../type/partial-collection.js';

export default async function getIndex(page = 1, pageSize: null | number = null): Promise<PartialCollection> {
  const options = Options.getInstance();
  if (pageSize === null) {
    pageSize = options.pageSize;
  }
  return new Promise(function (resolve, reject) {
    axios
      .get(`${options.apiHost}?page=${page}&pageSize=${pageSize}`)
      .then((response) => {
        const collection = jsonToPartialCollection(response.data);
        logger.debug(`Loaded index.`, {
          page: page,
          pageSize: pageSize,
          collection: collection,
        });
        resolve(collection);
      })
      .catch(function (error: Error) {
        if (error instanceof AxiosError) {
          let messageDetail = error.message;
          try {
            if (error.response) {
              if (error.response.headers['content-type'] === 'application/problem+json') {
                messageDetail = `${error.response.data.title} - ${error.response.data.detail}`;
              }
            }
          } catch (error) {
            logger.error(`Encountered error while building error message: ${error.message}`);
          }
          error.message = `Encountered error while loading index: ${messageDetail}`;
          logger.error(error.message, axiosErrorToSummaryObject(error));
        } else {
          error.message = `Encountered error while loading index: ${error.message}`;
          logger.error(error);
        }
        reject(error);
      });
  });
}
