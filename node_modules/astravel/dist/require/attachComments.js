"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attachComments = attachComments;

var _defaultTraveler = require("./defaultTraveler");

function attachCommentsToNode(traveler, state, parent, children, findHeadingComments) {
  var index = state.index;
  var comments = state.comments;
  var comment = comments[index];
  var boundComments, trailingComments;

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
    var start = children[0].start;

    while (comment != null && (comment.type[0] === 'B' || comment.type[0] === 'M') && comment.end <= start) {
      boundComments.push(comment);
      comment = comments[++index];
    }

    if (boundComments.length !== 0 && parent.comments == null) parent.comments = boundComments;
  }

  for (var i = 0, length = children.length; comment != null && i < length; i++) {
    var child = children[i];
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

var traveler = _defaultTraveler.defaultTraveler.makeChild({
  Program: Block,
  BlockStatement: Block,
  ClassBody: Block,
  ObjectExpression: function ObjectExpression(node, state) {
    attachCommentsToNode(this, state, node, node.properties, true);
  },
  ArrayExpression: function ArrayExpression(node, state) {
    attachCommentsToNode(this, state, node, node.elements, true);
  },
  SwitchStatement: function SwitchStatement(node, state) {
    attachCommentsToNode(this, state, node, node.cases, false);
  },
  SwitchCase: function SwitchCase(node, state) {
    attachCommentsToNode(this, state, node, node.consequent, false);
  }
});

function attachComments(node, comments) {
  traveler[node.type](node, {
    comments: comments,
    index: 0
  });
  return node;
}
//# sourceMappingURL=attachComments.js.map