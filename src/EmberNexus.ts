import 'reflect-metadata';

import { LRUCache } from 'lru-cache';
import { Container } from 'typedi';

import GetElementChildrenEndpoint from '~/Endpoint/Element/GetElementChildrenEndpoint';
import GetElementEndpoint from '~/Endpoint/Element/GetElementEndpoint';
import { Logger } from '~/Service/Logger';
import { WebSdkConfiguration } from '~/Service/WebSdkConfiguration';
import { createChildrenCollectionIdentifier } from '~/Type/Definition/ChildrenCollectionIdentifier';
import { Collection } from '~/Type/Definition/Collection';
import { Node } from '~/Type/Definition/Node';
import { Relation } from '~/Type/Definition/Relation';
import { Uuid } from '~/Type/Definition/Uuid';

class EmberNexus {
  private elementCache: LRUCache<Uuid, Node | Relation>;
  private collectionCache: LRUCache<string, Collection>;

  constructor() {
    this.elementCache = new LRUCache<Uuid, Node | Relation>({
      max: Container.get(WebSdkConfiguration).getElementCacheMaxEntries(),
    });
    this.collectionCache = new LRUCache<string, Collection>({
      max: Container.get(WebSdkConfiguration).getCollectionCacheMaxEntries(),
    });
  }

  getElement(uuid: Uuid): Promise<Node | Relation> {
    return new Promise<Node | Relation>((resolve) => {
      if (this.elementCache.has(uuid)) {
        const element = this.elementCache.get(uuid);
        if (element !== undefined) {
          return resolve(element);
        }
      }
      return resolve(
        Container.get(GetElementEndpoint)
          .getElement(uuid)
          .then((element) => {
            this.elementCache.set(uuid, element);
            return element;
          }),
      );
    });
  }

  getElementChildren(parentUuid: Uuid, page: number = 1, pageSize: number | null = null): Promise<Collection> {
    if (pageSize === null) {
      pageSize = Container.get(WebSdkConfiguration).getCollectionPageSize();
    }
    const collectionCacheKey = createChildrenCollectionIdentifier(parentUuid, page, pageSize);
    return new Promise<Collection>((resolve) => {
      if (this.collectionCache.has(collectionCacheKey)) {
        const collection = this.collectionCache.get(collectionCacheKey);
        if (collection !== undefined) {
          return resolve(collection);
        }
      }
      return resolve(
        Container.get(GetElementChildrenEndpoint)
          .getElementChildren(parentUuid, page, pageSize as number)
          .then((collection) => {
            this.collectionCache.set(collectionCacheKey, collection);
            return collection;
          }),
      );
    });
  }
}

export { EmberNexus, Container, WebSdkConfiguration, Logger };
