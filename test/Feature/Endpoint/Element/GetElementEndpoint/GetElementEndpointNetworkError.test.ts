import { expect } from 'chai';
import { http } from 'msw';
// eslint-disable-next-line import/no-unresolved
import { setupServer } from 'msw/node';
import { Container } from 'typedi';

import GetElementEndpoint from '~/Endpoint/Element/GetElementEndpoint';
import { NetworkError } from '~/Error/NetworkError';
import { Logger } from '~/Service/Logger';
import { WebSdkConfiguration } from '~/Service/WebSdkConfiguration';
import { validateUuidFromString } from '~/Type/Definition/Uuid';

import { TestLogger } from '../../../TestLogger';

const mockServer = setupServer(
  http.get('http://mock-api/df6604fb-72a1-4616-90b1-e72eee3aca6c', () => {
    return Response.error();
  }),
);

const testLogger: TestLogger = new TestLogger();
Container.set(Logger, testLogger);
Container.get(WebSdkConfiguration).setApiHost('http://mock-api');

test('GetElementEndpoint should handle network error', async () => {
  mockServer.listen();
  const uuid = validateUuidFromString('df6604fb-72a1-4616-90b1-e72eee3aca6c');

  await expect(Container.get(GetElementEndpoint).getElement(uuid)).to.eventually.be.rejectedWith(NetworkError);

  expect(
    testLogger.assertDebugHappened(
      'Executing HTTP GET request against url http://mock-api/df6604fb-72a1-4616-90b1-e72eee3aca6c .',
    ),
  ).to.be.true;

  expect(testLogger.assertErrorHappened('Experienced generic network error during fetching resource.')).to.be.true;

  mockServer.close();
});
