import { expect } from 'chai';
import { HttpResponse, http } from 'msw';
// eslint-disable-next-line import/no-unresolved
import { setupServer } from 'msw/node';
import { Container } from 'typedi';

import { TestLogger } from '../../../TestLogger';

import { PutElementEndpoint } from '~/Endpoint/Element/PutElementEndpoint';
import { Response404NotFoundError } from '~/Error/Response404NotFoundError';
import { Logger } from '~/Service/Logger';
import { WebSdkConfiguration } from '~/Service/WebSdkConfiguration';
import { Data } from '~/Type/Definition/Data';
import { validateUuidFromString } from '~/Type/Definition/Uuid';

const mockServer = setupServer(
  http.put('http://mock-api/75c81302-4168-48b5-b12c-588db22303c2', () => {
    return HttpResponse.json(
      {
        type: 'http://ember-nexus-api/error/404/not-found',
        title: 'NotFound',
        status: 404,
        detail: 'Requested element was not found.',
      },
      {
        status: 404,
        headers: {
          'Content-Type': 'application/problem+json; charset=utf-8',
        },
      },
    );
  }),
);

const testLogger: TestLogger = new TestLogger();
Container.set(Logger, testLogger);
Container.get(WebSdkConfiguration).setApiHost('http://mock-api');

test('PutElementEndpoint should handle bad response error', async () => {
  mockServer.listen();
  const uuid = validateUuidFromString('75c81302-4168-48b5-b12c-588db22303c2');
  const data: Data = {
    new: 'Data',
  };

  await expect(Container.get(PutElementEndpoint).putElement(uuid, data)).to.eventually.be.rejectedWith(
    Response404NotFoundError,
  );

  expect(
    testLogger.assertDebugHappened(
      'Executing HTTP PUT request against url http://mock-api/75c81302-4168-48b5-b12c-588db22303c2 .',
    ),
  ).to.be.true;

  expect(testLogger.assertErrorHappened('Sever returned 404 not found.')).to.be.true;

  mockServer.close();
});
