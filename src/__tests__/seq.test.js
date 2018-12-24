//@flow

import toposort from '../toposort';

function idGenerator(fn) {
  let id = 0;
  return () => fn(++id);
}

function input() {
  return this.ports.input;
}

function noop(x) {
  return x;
}

function output(x) {
  this.ports.output = x;
}

describe('foo', () => {
  const nextEdgeID = idGenerator(n => '$' + n.toString(36));
  const nextNodeID = idGenerator(n => (n + 9).toString(36).toUpperCase());
  function initModel() {
    const dict = () => ({});
    function addNodeAbstract(node, nodes, rels) {
      if (!nodes.list.includes(node)) {
        nodes.list.push(node);
      }
      if (!(node in nodes.refTo)) {
        nodes.refTo[node] = [];
      }
      if (!(node in nodes.refBy)) {
        nodes.refBy[node] = [];
      }
      if (!(node in rels.refTo)) {
        rels.refTo[node] = dict();
      }
      if (!(node in rels.refBy)) {
        rels.refBy[node] = dict();
      }
    }
    function isRefTo(from, to, nodes) {
      return nodes.refTo[from].indexOf(to) !== -1;
    }
    function isRefBy(from, to, nodes) {
      return nodes.refBy[to].indexOf(from) !== -1;
    }
    function linkNodesAbstract(from, to, nodes) {
      if (!isRefTo(from, to, nodes)) {
        nodes.refTo[from].push(to);
      }
      if (!isRefBy(from, to, nodes)) {
        nodes.refBy[to].push(from);
      }
    }
    const addNode = node => addNodeAbstract(node, model.nodes, model.nodeRel);
    const linkNode = ([from, to]) => linkNodesAbstract(from, to, model.nodes);
    const addEdge = edge => addNodeAbstract(edge, model.edges, model.edgeRel);
    const linkEdge = ([from, to]) => linkNodesAbstract(from, to, model.edges);
    const createNode = (result = String(nextNodeID())) => {
      addNode(result);
      return result;
    };
    const createEdge = (result = String(nextEdgeID())) => {
      addEdge(result);
      return result;
    };
    const link = (from, to) => {
      addNodeAbstract(from, model.nodes, model.nodeRel);
      addNodeAbstract(to, model.nodes, model.nodeRel);
      linkNodesAbstract(from, to, model.nodes);

      // if (!())
      let edge;
      if (!(to in model.nodeRel.refTo[from])) {
        edge = String(nextEdgeID());
        addNodeAbstract(edge, model.edges, model.edgeRel);
        model.nodeRel.refTo[from][to] = edge;
      } else {
        edge = String(model.nodeRel.refTo[from][to]);
      }
      if (!(from in model.nodeRel.refBy[to])) {
        model.nodeRel.refBy[to][from] = edge;
      }
      return edge;
    };
    const combine = (from, to) => {
      addNodeAbstract(from, model.edges, model.edgeRel);
      addNodeAbstract(to, model.edges, model.edgeRel);
      linkNodesAbstract(from, to, model.edges);
      // if (!())
      let edge;
      if (!(to in model.edgeRel.refTo[from])) {
        edge = String(nextEdgeID());
        addNodeAbstract(edge, model.edges, model.edgeRel);
        model.edgeRel.refTo[from][to] = edge;
      } else {
        edge = String(model.edgeRel.refTo[from][to]);
      }
      if (!(from in model.edgeRel.refBy[to])) {
        model.edgeRel.refBy[to][from] = edge;
      }
      return edge;
    };
    const model = {
      nodes: {
        list: [],
        refTo: dict(),
        refBy: dict(),
      },
      nodeRel: {
        refTo: dict(),
        refBy: dict(),
      },
      edgeRel: {
        refTo: dict(),
        refBy: dict(),
      },
      edges: {
        list: [],
        refTo: dict(),
        refBy: dict(),
      },
    };
    function createNetwork() {
      const net = {
        Input: createUnit({name: 'Input'}),
        Output: createUnit({name: 'Output'}),
      };
      const functions = {};
      function map(fn) {
        const newNode = createNode();
        const edge = link(this.node, newNode);
        functions[edge] = fn;
        return {
          name: undefined,
          node: newNode,
          map,
        };
      }
      function createUnit({name, node = createNode(name)} = {}) {
        return {
          name,
          node,
          map,
        };
      }
      function combineUnits(units, fn) {
        const newUnit = createUnit();
        const subNode = createNode(`${newUnit.node}'`);
        const links = units.map(unit => link(unit.node, subNode));
        const linkEdge = link(subNode, newUnit.node);

        for (const edge of links) {
          functions[edge] = noop;
        }

        functions[linkEdge] = fn;
        return newUnit;
      }
      return {
        net,
        createUnit,
        combineUnits,
        functions,
      };
    }
    const net = createNetwork();
    const Input = net.net.Input.node;
    const Output = net.net.Output.node;
    const A = net.net.Input.map(input);
    const B = A.map(n => n + 1);
    const C = A.map(n => n * 10);
    const D = C.map(n => n + 1);
    const E = D.map(n => n + 1);
    const F = B.map(n => n + 1);
    const G = net.combineUnits([E, F], (l, r) => ({
      l,
      r,
    }));
    // link(Input, A);
    // const $1 = link(A, B);
    // const $2 = link(A, C);
    // link(B, F);
    // link(C, D);
    // link(D, E);
    // link(E, G);
    // link(F, G);
    link(G.node, Output);
    // combine($1, $2);

    console.log('model', model);
    console.log('functions', net.functions);
    return model;
  }
  it('initModel()', () => {
    initModel();
  });
  it('works with single context and model', () => {
    const modelOld = {
      nodes: {
        list: ['Input', 'Output', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
        refTo: {
          Input: ['A'],
          Output: [],
          A: ['B', 'C'],
          B: ['F'],
          C: ['D'],
          D: ['E'],
          E: ['G'],
          F: ['G'],
          G: ['Output'],
        },
        refBy: {
          Input: [],
          Output: ['G'],
          A: ['Input'],
          B: ['A'],
          C: ['A'],
          D: ['C'],
          E: ['D'],
          F: ['B'],
          G: ['E', 'F'],
        },
      },
      edges: {
        list: ['$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9', '$a'],
        refTo: {
          $1: ['$2', '$5'],
          $2: ['$3'],
          $3: ['$4'],
          $4: ['$9'],
          $5: ['$6'],
          $6: ['$7'],
          $7: ['$8'],
          $8: ['$9'],
          $9: ['$a'],
          $a: [],
        },
        refBy: {
          $1: [],
          $2: ['$1'],
          $3: ['$2'],
          $4: ['$3'],
          $5: ['$1'],
          $6: ['$5'],
          $7: ['$6'],
          $8: ['$7'],
          $9: ['$4', '$8'],
          $a: ['$9'],
        },
      },
    };
    const modelNew = initModel();
    const model = modelOld;

    const ctx = initContext(model, {
      $1: input,
      $2: n => n + 1,
      $3: n => n + 1,
      $4: noop,
      $5: n => n * 10,
      $6: n => n + 1,
      $7: n => n + 1,
      $8: noop,
      $9: (l, r) => ({l, r}),
      $a: output,
    });

    console.log('sortedNodes', toposort(model.edges.refTo));
    console.log(doSeq(1));
    console.log(doSeq(2));
    function doSeq(input) {
      ctx.ports.input = input;
      for (const f of ctx.seq) {
        f();
      }
      return ctx.ports.output;
    }
    function iter(ctx) {
      const deps = [];
      for (const depKey of model.edges.refBy[this]) {
        deps.push(ctx.values[depKey].current);
      }
      ctx.values[this].current = ctx.edges[this](ctx, deps);
    }
    function initContext(model, edges) {
      const ctx = {
        ports: Object.create(null),
        values: Object.create(null),
        seq: [],
        edges: bindToCtx(edges),
      };
      for (const edge of toposort(model.edges.refTo)) {
        ctx.values[edge] = {current: null};
        ctx.seq.push(iter.bind(edge, ctx));
      }
      return ctx;
    }
    function bindToCtx(edges) {
      const result = Object.create(null);
      for (const key in edges) {
        result[key] = edges[key].apply.bind(edges[key]);
      }
      return result;
    }
  });
});
