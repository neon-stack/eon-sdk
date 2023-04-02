import { RestHandler, rest } from 'msw';

import ElementUuid from './index.js';

export const patchableElementHandlers: RestHandler[] = [
  rest.patch(`http://localhost/${ElementUuid.PatchableElement}`, (_req, res, ctx) => {
    return res(ctx.status(204));
  }),
];
