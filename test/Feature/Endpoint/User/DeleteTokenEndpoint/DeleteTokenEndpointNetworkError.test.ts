import { expect } from 'chai';
import { http } from 'msw';
// eslint-disable-next-line import/no-unresolved
import { setupServer } from 'msw/node';
import { Container } from 'typedi';

import { TestLogger } from '../../../TestLogger';

import { DeleteTokenEndpoint } from '~/Endpoint/User/DeleteTokenEndpoint';
import { NetworkError } from '~/Error/NetworkError';
import { Logger } from '~/Service/Logger';
import { WebSdkConfiguration } from '~/Service/WebSdkConfiguration';

const mockServer = setupServer(
  http.delete('http://mock-api/token', () => {
    return Response.error();
  }),
);

const testLogger: TestLogger = new TestLogger();
Container.set(Logger, testLogger);
Container.get(WebSdkConfiguration).setApiHost('http://mock-api');

test('DeleteTokenEndpoint should handle network error', async () => {
  mockServer.listen();
  await expect(Container.get(DeleteTokenEndpoint).deleteToken()).to.eventually.be.rejectedWith(NetworkError);

  expect(testLogger.assertDebugHappened('Executing HTTP DELETE request against url http://mock-api/token .')).to.be
    .true;

  expect(testLogger.assertErrorHappened('Experienced generic network error during deleting resource.')).to.be.true;

  mockServer.close();
});
