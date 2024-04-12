import { NodeWithOptionalId } from '~/Type/Definition/NodeWithOptionalId';
import { RelationWithOptionalId } from '~/Type/Definition/RelationWithOptionalId';
import { Uuid } from '~/Type/Definition/Uuid';
import { EventIdentifier } from '~/Type/Enum/EventIdentifier';
import { customEventDefaultInit } from '~/Type/Partial/CustomEventDefaultInit';

type PostElementEventDetails = {
  parentId: Uuid;
  element: NodeWithOptionalId | RelationWithOptionalId;
  result: Promise<Uuid> | null;
};

class PostElementEvent extends CustomEvent<PostElementEventDetails> {
  public static type = EventIdentifier.PostElement;
  constructor(parentId: Uuid, element: NodeWithOptionalId | RelationWithOptionalId) {
    super(PostElementEvent.type, {
      ...customEventDefaultInit,
      detail: {
        parentId: parentId,
        element: element,
        result: null,
      },
    });
  }

  getParentId(): Uuid {
    return this.detail.parentId;
  }

  getElement(): NodeWithOptionalId | RelationWithOptionalId {
    return this.detail.element;
  }

  getResult(): Promise<Uuid> | null {
    return this.detail.result;
  }

  setResult(result: Promise<Uuid> | null): PostElementEvent {
    this.detail.result = result;
    return this;
  }
}

export { PostElementEvent, PostElementEventDetails };
