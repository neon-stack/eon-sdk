import { expect } from 'chai';
import { HttpResponse, http } from 'msw';
// eslint-disable-next-line import/no-unresolved
import { setupServer } from 'msw/node';
import { Container } from 'typedi';

import PostIndexEndpoint from '~/Endpoint/Element/PostIndexEndpoint';
import { ParseError } from '~/Error/ParseError';
import { Logger } from '~/Service/Logger';
import { WebSdkConfiguration } from '~/Service/WebSdkConfiguration';
import { NodeWithOptionalId } from '~/Type/Definition/NodeWithOptionalId';

import { TestLogger } from '../../../TestLogger';

const mockServer = setupServer(
  http.post('http://mock-api/', () => {
    return HttpResponse.text('Some content which can not be interpreted as JSON.', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }),
);

const testLogger: TestLogger = new TestLogger();
Container.set(Logger, testLogger);
Container.get(WebSdkConfiguration).setApiHost('http://mock-api');

test('PostIndexEndpoint should handle bad response error', async () => {
  mockServer.listen();
  const element: NodeWithOptionalId = {
    type: 'Data',
    data: {
      hello: 'world',
    },
  };
  await expect(Container.get(PostIndexEndpoint).postIndex(element)).to.eventually.be.rejectedWith(ParseError);

  expect(testLogger.assertDebugHappened('Executing HTTP POST request against url http://mock-api/ .')).to.be.true;

  expect(testLogger.assertErrorHappened("Unable to parse response as content type is not 'application/problem+json'."))
    .to.be.true;

  mockServer.close();
});
