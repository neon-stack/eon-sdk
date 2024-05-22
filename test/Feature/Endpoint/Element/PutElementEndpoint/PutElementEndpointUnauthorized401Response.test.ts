import { expect } from 'chai';
import { HttpResponse, http } from 'msw';
// eslint-disable-next-line import/no-unresolved
import { setupServer } from 'msw/node';
import { Container } from 'typedi';

import { TestLogger } from '../../../TestLogger';

import { PutElementEndpoint } from '~/Endpoint/Element/PutElementEndpoint';
import { Response401UnauthorizedError } from '~/Error/Response401UnauthorizedError';
import { Logger } from '~/Service/Logger';
import { WebSdkConfiguration } from '~/Service/WebSdkConfiguration';
import { Data } from '~/Type/Definition/Data';
import { validateUuidFromString } from '~/Type/Definition/Uuid';

const mockServer = setupServer(
  http.put('http://mock-api/bc4fa52e-c651-402b-a90b-665e96a8bd23', () => {
    return HttpResponse.json(
      {
        type: 'http://ember-nexus-api/error/401/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail:
          "Authorization for the request failed due to possible problems with the token (incorrect or expired), password (incorrect or changed), the user's unique identifier, or the user's status (e.g., missing, blocked, or deleted).",
      },
      {
        status: 401,
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
  const uuid = validateUuidFromString('bc4fa52e-c651-402b-a90b-665e96a8bd23');
  const data: Data = {
    new: 'Data',
  };
  await expect(Container.get(PutElementEndpoint).putElement(uuid, data)).to.eventually.be.rejectedWith(
    Response401UnauthorizedError,
  );

  expect(
    testLogger.assertDebugHappened(
      'Executing HTTP PUT request against url http://mock-api/bc4fa52e-c651-402b-a90b-665e96a8bd23 .',
    ),
  ).to.be.true;

  expect(testLogger.assertErrorHappened('Sever returned 401 unauthorized.')).to.be.true;

  mockServer.close();
});
