import { expect } from 'chai';
import { HttpResponse, http } from 'msw';
// eslint-disable-next-line import/no-unresolved
import { setupServer } from 'msw/node';
import { Container } from 'typedi';

import { TestLogger } from '../../../TestLogger';

import { GetElementEndpoint } from '~/Endpoint/Element/GetElementEndpoint';
import { ParseError } from '~/Error/ParseError';
import { Logger } from '~/Service/Logger';
import { WebSdkConfiguration } from '~/Service/WebSdkConfiguration';
import { validateUuidFromString } from '~/Type/Definition/Uuid';

const mockServer = setupServer(
  http.get('http://mock-api/afaa7a87-e523-4bf0-afe8-d2a11802c549', () => {
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

test('GetElementEndpoint should handle bad response error', async () => {
  mockServer.listen();
  const uuid = validateUuidFromString('afaa7a87-e523-4bf0-afe8-d2a11802c549');

  await expect(Container.get(GetElementEndpoint).getElement(uuid)).to.eventually.be.rejectedWith(ParseError);

  expect(
    testLogger.assertDebugHappened(
      'Executing HTTP GET request against url http://mock-api/afaa7a87-e523-4bf0-afe8-d2a11802c549 .',
    ),
  ).to.be.true;

  expect(
    testLogger.assertErrorHappened(
      "Unable to parse response as content type is neither 'application/json' nor 'application/problem+json'.",
    ),
  ).to.be.true;

  mockServer.close();
});
