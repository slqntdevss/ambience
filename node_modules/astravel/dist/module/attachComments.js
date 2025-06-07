import { defaultTraveler } from "./defaultTraveler.js";

function attachCommentsToNode(traveler, state, parent, children, findHeadingComments) {
  let {
    index
  } = state;
  const {
    comments
  } = state;
  let comment = comments[index];
  let boundComments, trailingComments;

  if (comment == null) {
    return;
  }

  if (children == null || children.length === 0) {
    boundComments = parent.comments != null ? parent.comments : [];

    while (comment != null && comment.end <= parent.end) {
      boundComments.push(comment);
      comment = comments[++index];
    }

    state.index = index;

    if (boundComments.length !== 0 && parent.comments == null) {
      parent.comments = boundComments;
    }

    return;
  }

  if (findHeadingComments) {
    boundComments = parent.comments != null ? parent.comments : [];
    const {
      start
    } = children[0];

    while (comment != null && (comment.type[0] === 'B' || comment.type[0] === 'M') && comment.end <= start) {
      boundComments.push(comment);
      comment = comments[++index];
    }

    if (boundComments.length !== 0 && parent.comments == null) parent.comments = boundComments;
  }

  for (let i = 0, {
    length
  } = children; comment != null && i < length; i++) {
    const child = children[i];
    boundComments = [];

    while (comment != null && comment.end <= child.start) {
      boundComments.push(comment);
      comment = comments[++index];
    }

    if (comment != null && comment.loc != null && (comment.type[0] === 'L' || comment.type[0] === 'S')) {
      if (comment.loc.start.line === child.loc.end.line) {
        boundComments.push(comment);
        comment = comments[++index];
      }
    }

    if (boundComments.length !== 0) {
      child.comments = boundComments;
    }

    state.index = index;
    traveler[child.type](child, state);
    index = state.index;
    comment = comments[index];
  }

  trailingComments = [];

  while (comment != null && comment.end <= parent.end) {
    trailingComments.push(comment);
    comment = comments[++index];
  }

  if (trailingComments.length !== 0) {
    parent.trailingComments = trailingComments;
  }

  state.index = index;
}

function Block(node, state) {
  attachCommentsToNode(this, state, node, node.body, true);
}

let traveler = defaultTraveler.makeChild({
  Program: Block,
  BlockStatement: Block,
  ClassBody: Block,

  ObjectExpression(node, state) {
    attachCommentsToNode(this, state, node, node.properties, true);
  },

  ArrayExpression(node, state) {
    attachCommentsToNode(this, state, node, node.elements, true);
  },

  SwitchStatement(node, state) {
    attachCommentsToNode(this, state, node, node.cases, false);
  },

  SwitchCase(node, state) {
    attachCommentsToNode(this, state, node, node.consequent, false);
  }

});
export function attachComments(node, comments) {
  traveler[node.type](node, {
    comments,
    index: 0
  });
  return node;
}
//# sourceMappingURL=attachComments.js.map