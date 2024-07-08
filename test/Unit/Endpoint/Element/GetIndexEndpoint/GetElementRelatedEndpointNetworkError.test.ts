import { expect } from 'chai';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import { Container } from 'typedi';

import { GetIndexEndpoint } from '../../../../../src/Endpoint/Element';
import { NetworkError } from '../../../../../src/Error';
import { Logger, WebSdkConfiguration } from '../../../../../src/Service';
import { TestLogger } from '../../../TestLogger';

const mockServer = setupServer(
  http.get('http://mock-api/', () => {
    return Response.error();
  }),
);

const testLogger: TestLogger = new TestLogger();
Container.set(Logger, testLogger);
Container.get(WebSdkConfiguration).setApiHost('http://mock-api');

test('GetIndexEndpoint should handle network error', async () => {
  mockServer.listen();
  await expect(Container.get(GetIndexEndpoint).getIndex()).to.eventually.be.rejectedWith(NetworkError);

  expect(testLogger.assertDebugHappened('Executing HTTP GET request against url http://mock-api/?page=1&pageSize=25 .'))
    .to.be.true;

  expect(testLogger.assertErrorHappened('Experienced generic network error during fetching resource.')).to.be.true;

  mockServer.close();
});
