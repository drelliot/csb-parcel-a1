//@flow

import toposort from '../toposort';

function idGenerator(fn) {
  let id = 0;
  return () => fn(++id);
}

describe('foo', () => {
  const nextEdgeID = idGenerator(n => '$' + n.toString(36));
  const nextNodeID = idGenerator(n => (n + 9).toString(36).toUpperCase());

  it('works with single context and model', () => {
    const model = {
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
        list: ['$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9', '$10'],
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
    const ctx = {
      ports: {
        input: 0,
        output: {l: -1, r: -1},
      },
      values: {
        A: -1,
        B: -1,
        C: -1,
        D: -1,
        E: -1,
        F: -1,
        G: {l: -1, r: -1},
      },
      edges: {
        $1: _ => ctx.ports.input,
        $2: n => n + 1,
        $3: n => n + 1,
        $4: n => n,
        $5: n => n * 10,
        $6: n => n + 1,
        $7: n => n + 1,
        $8: n => n,
        $9: (l, r) => ({l, r}),
        $a: x => {
          ctx.ports.output = x;
        },
      },
      storages: {},
      seq: [],
    };
    const sortedNodes = toposort(model.edges.refTo);
    console.log('sortedNodes', sortedNodes);

    for (const edge of sortedNodes) {
      ctx.storages[edge] = {edge, current: -1, deps: {}};
      for (const dep of model.edges.refBy[edge]) {
        ctx.storages[edge].deps[dep] = ctx.storages[dep];
      }
      ctx.seq.push(iter.bind(edge));
    }

    console.log(doSeq(1, ctx));
    console.log(doSeq(2, ctx));

    function doSeq(input, ctx) {
      ctx.ports.input = input;
      ctx.seq.forEach(f => f(ctx));
      return ctx.ports.output;
    }
    function iter(ctx) {
      const deps = [];
      for (const depKey in ctx.storages[this].deps) {
        deps.push(ctx.storages[this].deps[depKey].current);
      }
      const result = ctx.edges[this](...deps);
      ctx.storages[this].current = result;
    }
  });
});
