import { expect } from 'chai';

import { GetElementRelatedEvent } from '../../../../src/BrowserEvent/Element';
import { Collection } from '../../../../src/Type/Definition';
import { validateUuidFromString } from '../../../../src/Type/Definition';

describe('GetElementRelatedEvent tests', () => {
  test('GetElementRelatedEvent returns correct type', () => {
    expect(GetElementRelatedEvent.type).to.equal('ember-nexus-get-element-related');
  });

  it('should return null when no element was set', async () => {
    const uuid = validateUuidFromString('3c47a37c-6d6b-48d8-aac0-c6bc0d0ecc94');
    const getElementRelatedEvent = new GetElementRelatedEvent(uuid);

    expect(getElementRelatedEvent.getCenterId()).to.equal(uuid);
    expect(getElementRelatedEvent.getRelated()).to.be.null;
  });

  it('should return promise when collection was set', async () => {
    const uuid = validateUuidFromString('3c47a37c-6d6b-48d8-aac0-c6bc0d0ecc94');
    const getElementRelatedEvent = new GetElementRelatedEvent(uuid);

    const collection: Collection = {
      id: validateUuidFromString('3c47a37c-6d6b-48d8-aac0-c6bc0d0ecc94'),
      totalNodes: 0,
      links: {
        first: '-',
        previous: null,
        next: null,
        last: '-',
      },
      nodes: [],
      relations: [],
    };

    const promise = new Promise<Collection>((resolve): void => {
      resolve(collection);
    });

    getElementRelatedEvent.setRelated(promise);

    expect(getElementRelatedEvent.getCenterId()).to.equal(uuid);
    expect(getElementRelatedEvent.getRelated()).to.equal(promise);
  });
});
