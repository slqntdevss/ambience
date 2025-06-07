"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultTraveler = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var ForInStatement, FunctionDeclaration, RestElement, BinaryExpression, ArrayExpression, Block, MethodDefinition;
var ignore = Function.prototype;

var Found = function Found(node, state) {
  (0, _classCallCheck2["default"])(this, Found);
  this.node = node;
  this.state = state;
};

var defaultTraveler = {
  go: function go(node, state) {
    if (this[node.type]) {
      this[node.type](node, state);
    }
  },
  find: function find(predicate, node, state) {
    var finder = Object.create(this);

    finder.go = function (node, state) {
      if (predicate(node, state)) {
        throw new Found(node, state);
      }

      this[node.type](node, state);
    };

    try {
      finder.go(node, state);
    } catch (error) {
      if (error instanceof Found) {
        return error;
      } else {
        throw error;
      }
    }
  },
  makeChild: function makeChild() {
    var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var traveler = Object.create(this);
    traveler["super"] = this;

    for (var key in properties) {
      traveler[key] = properties[key];
    }

    return traveler;
  },
  Program: Block = function Block(node, state) {
    var body = node.body;

    if (body != null) {
      var length = body.length;

      for (var i = 0; i < length; i++) {
        this.go(body[i], state);
      }
    }
  },
  BlockStatement: Block,
  StaticBlock: Block,
  EmptyStatement: ignore,
  ExpressionStatement: function ExpressionStatement(node, state) {
    this.go(node.expression, state);
  },
  IfStatement: function IfStatement(node, state) {
    this.go(node.test, state);
    this.go(node.consequent, state);

    if (node.alternate != null) {
      this.go(node.alternate, state);
    }
  },
  LabeledStatement: function LabeledStatement(node, state) {
    this.go(node.label, state);
    this.go(node.body, state);
  },
  BreakStatement: function BreakStatement(node, state) {
    if (node.label) {
      this.go(node.label, state);
    }
  },
  ContinueStatement: function ContinueStatement(node, state) {
    if (node.label) {
      this.go(node.label, state);
    }
  },
  WithStatement: function WithStatement(node, state) {
    this.go(node.object, state);
    this.go(node.body, state);
  },
  SwitchStatement: function SwitchStatement(node, state) {
    this.go(node.discriminant, state);
    var cases = node.cases,
        length = cases.length;

    for (var i = 0; i < length; i++) {
      this.go(cases[i], state);
    }
  },
  SwitchCase: function SwitchCase(node, state) {
    if (node.test != null) {
      this.go(node.test, state);
    }

    var statements = node.consequent,
        length = statements.length;

    for (var i = 0; i < length; i++) {
      this.go(statements[i], state);
    }
  },
  ReturnStatement: function ReturnStatement(node, state) {
    if (node.argument) {
      this.go(node.argument, state);
    }
  },
  ThrowStatement: function ThrowStatement(node, state) {
    this.go(node.argument, state);
  },
  TryStatement: function TryStatement(node, state) {
    this.go(node.block, state);

    if (node.handler != null) {
      this.go(node.handler, state);
    }

    if (node.finalizer != null) {
      this.go(node.finalizer, state);
    }
  },
  CatchClause: function CatchClause(node, state) {
    if (node.param != null) {
      this.go(node.param, state);
    }

    this.go(node.body, state);
  },
  WhileStatement: function WhileStatement(node, state) {
    this.go(node.test, state);
    this.go(node.body, state);
  },
  DoWhileStatement: function DoWhileStatement(node, state) {
    this.go(node.body, state);
    this.go(node.test, state);
  },
  ForStatement: function ForStatement(node, state) {
    if (node.init != null) {
      this.go(node.init, state);
    }

    if (node.test != null) {
      this.go(node.test, state);
    }

    if (node.update != null) {
      this.go(node.update, state);
    }

    this.go(node.body, state);
  },
  ForInStatement: ForInStatement = function ForInStatement(node, state) {
    this.go(node.left, state);
    this.go(node.right, state);
    this.go(node.body, state);
  },
  DebuggerStatement: ignore,
  FunctionDeclaration: FunctionDeclaration = function FunctionDeclaration(node, state) {
    if (node.id != null) {
      this.go(node.id, state);
    }

    var params = node.params;

    if (params != null) {
      for (var i = 0, length = params.length; i < length; i++) {
        this.go(params[i], state);
      }
    }

    this.go(node.body, state);
  },
  VariableDeclaration: function VariableDeclaration(node, state) {
    var declarations = node.declarations,
        length = declarations.length;

    for (var i = 0; i < length; i++) {
      this.go(declarations[i], state);
    }
  },
  VariableDeclarator: function VariableDeclarator(node, state) {
    this.go(node.id, state);

    if (node.init != null) {
      this.go(node.init, state);
    }
  },
  ArrowFunctionExpression: function ArrowFunctionExpression(node, state) {
    var params = node.params;

    if (params != null) {
      for (var i = 0, length = params.length; i < length; i++) {
        this.go(params[i], state);
      }
    }

    this.go(node.body, state);
  },
  ThisExpression: ignore,
  ArrayExpression: ArrayExpression = function ArrayExpression(node, state) {
    var elements = node.elements,
        length = elements.length;

    for (var i = 0; i < length; i++) {
      var element = elements[i];

      if (element != null) {
        this.go(elements[i], state);
      }
    }
  },
  ObjectExpression: function ObjectExpression(node, state) {
    var properties = node.properties,
        length = properties.length;

    for (var i = 0; i < length; i++) {
      this.go(properties[i], state);
    }
  },
  Property: function Property(node, state) {
    this.go(node.key, state);

    if (node.value != null) {
      this.go(node.value, state);
    }
  },
  FunctionExpression: FunctionDeclaration,
  SequenceExpression: function SequenceExpression(node, state) {
    var expressions = node.expressions,
        length = expressions.length;

    for (var i = 0; i < length; i++) {
      this.go(expressions[i], state);
    }
  },
  UnaryExpression: function UnaryExpression(node, state) {
    this.go(node.argument, state);
  },
  UpdateExpression: function UpdateExpression(node, state) {
    this.go(node.argument, state);
  },
  AssignmentExpression: function AssignmentExpression(node, state) {
    this.go(node.left, state);
    this.go(node.right, state);
  },
  BinaryExpression: BinaryExpression = function BinaryExpression(node, state) {
    this.go(node.left, state);
    this.go(node.right, state);
  },
  LogicalExpression: BinaryExpression,
  ConditionalExpression: function ConditionalExpression(node, state) {
    this.go(node.test, state);
    this.go(node.consequent, state);
    this.go(node.alternate, state);
  },
  NewExpression: function NewExpression(node, state) {
    this.CallExpression(node, state);
  },
  CallExpression: function CallExpression(node, state) {
    this.go(node.callee, state);
    var args = node['arguments'],
        length = args.length;

    for (var i = 0; i < length; i++) {
      this.go(args[i], state);
    }
  },
  MemberExpression: function MemberExpression(node, state) {
    this.go(node.object, state);
    this.go(node.property, state);
  },
  Identifier: ignore,
  PrivateIdentifier: ignore,
  Literal: ignore,
  ForOfStatement: ForInStatement,
  ClassDeclaration: function ClassDeclaration(node, state) {
    if (node.id) {
      this.go(node.id, state);
    }

    if (node.superClass) {
      this.go(node.superClass, state);
    }

    this.go(node.body, state);
  },
  ClassBody: Block,
  ImportDeclaration: function ImportDeclaration(node, state) {
    var specifiers = node.specifiers,
        length = specifiers.length;

    for (var i = 0; i < length; i++) {
      this.go(specifiers[i], state);
    }

    this.go(node.source, state);
  },
  ImportNamespaceSpecifier: function ImportNamespaceSpecifier(node, state) {
    this.go(node.local, state);
  },
  ImportDefaultSpecifier: function ImportDefaultSpecifier(node, state) {
    this.go(node.local, state);
  },
  ImportSpecifier: function ImportSpecifier(node, state) {
    this.go(node.imported, state);
    this.go(node.local, state);
  },
  ExportDefaultDeclaration: function ExportDefaultDeclaration(node, state) {
    this.go(node.declaration, state);
  },
  ExportNamedDeclaration: function ExportNamedDeclaration(node, state) {
    if (node.declaration) {
      this.go(node.declaration, state);
    }

    var specifiers = node.specifiers,
        length = specifiers.length;

    for (var i = 0; i < length; i++) {
      this.go(specifiers[i], state);
    }

    if (node.source) {
      this.go(node.source, state);
    }
  },
  ExportSpecifier: function ExportSpecifier(node, state) {
    this.go(node.local, state);
    this.go(node.exported, state);
  },
  ExportAllDeclaration: function ExportAllDeclaration(node, state) {
    this.go(node.source, state);
  },
  MethodDefinition: MethodDefinition = function MethodDefinition(node, state) {
    this.go(node.key, state);
    this.go(node.value, state);
  },
  PropertyDefinition: MethodDefinition,
  ClassExpression: function ClassExpression(node, state) {
    this.ClassDeclaration(node, state);
  },
  Super: ignore,
  RestElement: RestElement = function RestElement(node, state) {
    this.go(node.argument, state);
  },
  SpreadElement: RestElement,
  YieldExpression: function YieldExpression(node, state) {
    if (node.argument) {
      this.go(node.argument, state);
    }
  },
  TaggedTemplateExpression: function TaggedTemplateExpression(node, state) {
    this.go(node.tag, state);
    this.go(node.quasi, state);
  },
  TemplateLiteral: function TemplateLiteral(node, state) {
    var quasis = node.quasis,
        expressions = node.expressions;

    for (var i = 0, length = expressions.length; i < length; i++) {
      this.go(expressions[i], state);
    }

    for (var _i = 0, _length = quasis.length; _i < _length; _i++) {
      this.go(quasis[_i], state);
    }
  },
  TemplateElement: ignore,
  ObjectPattern: function ObjectPattern(node, state) {
    var properties = node.properties,
        length = properties.length;

    for (var i = 0; i < length; i++) {
      this.go(properties[i], state);
    }
  },
  ArrayPattern: ArrayExpression,
  AssignmentPattern: function AssignmentPattern(node, state) {
    this.go(node.left, state);
    this.go(node.right, state);
  },
  MetaProperty: function MetaProperty(node, state) {
    this.go(node.meta, state);
    this.go(node.property, state);
  },
  AwaitExpression: function AwaitExpression(node, state) {
    this.go(node.argument, state);
  }
};
exports.defaultTraveler = defaultTraveler;
//# sourceMappingURL=defaultTraveler.js.map