import { v4 as uuidv4 } from 'uuid';

import Node from '../type/node.js';
import PatchElementEventDetails from '../type/patch-element-event-details.js';
import Relation from '../type/relation.js';

import Event from './index.js';

export default class PatchElementEvent extends CustomEvent<PatchElementEventDetails> {
  constructor(uuid: typeof uuidv4, data: Record<string, unknown>, loadNewData = false) {
    super(Event.PatchElementEvent, {
      detail: {
        uuid: uuid,
        data: data,
        loadNewData: loadNewData,
        element: null,
      },
      bubbles: true,
      cancelable: true,
    });
  }

  setElement(element: Promise<void | Node | Relation>): void {
    this.detail.element = element;
  }

  getElement(): Promise<void | Node | Relation> | null {
    return this.detail.element;
  }

  getUuid(): typeof uuidv4 {
    return this.detail.uuid;
  }

  getData(): Record<string, unknown> {
    return this.detail.data;
  }

  getLoadNewData(): boolean {
    return this.detail.loadNewData;
  }
}