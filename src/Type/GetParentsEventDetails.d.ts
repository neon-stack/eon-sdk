import { v4 as uuidv4 } from 'uuid';

import Node from './Node.js';
import Relation from './Relation.js';

type GetParentsEventDetails = {
  uuid: typeof uuidv4;
  elements: Promise<Array<Node | Relation>> | null;
};

export default GetParentsEventDetails;