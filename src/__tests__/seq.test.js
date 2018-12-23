//@flow

import toposort from '../toposort';

describe('foo', () => {
  class Ref {
    constructor(__) {
      this.__ = __;
    }
  }
  const Input = new Ref(0);
  const A = new Ref(0);
  const B = new Ref(1);
  const C = new Ref(2);
  const D = new Ref(10);
  const E = new Ref(11);
  const F = new Ref({l: 2, r: 11});
  const refs = {Input, A, B, C, D, E, F};
  const deps = {
    Input: ['A'],
    A: ['B'],
    B: ['C', 'D'],
    C: ['F'],
    D: ['E'],
    E: ['F'],
    F: ['Output'],
    Output: [],
  };

  const edges = {
    a: new Ref(['Input', 'A']),
    b: new Ref(['A', 'B']),
    c: new Ref(['B', 'C']),
    d: new Ref(['B', 'D']),
    e: new Ref(['D', 'E']),
    f: new Ref(['C', 'F']),
    g: new Ref(['E', 'F']),
    h: new Ref(['F', 'Output']),
  };
  const edgesRef = {
    a: [],
    b: ['a'],
    c: ['b'],
    d: ['b'],
    e: ['d'],
    f: ['c'],
    g: ['e'],
    h: ['f', 'g'],
  };
  const edgesRefRev = {
    a: ['b'],
    b: ['c', 'd'],
    c: ['f'],
    d: ['e'],
    e: ['g'],
    f: ['h'],
    g: ['h'],
    h: [],
  };
  const fns = {
    a: () => 1,
    b: n => n + 1,
    c: n => n + 1,
    d: n => n * 10,
    e: n => n + 1,
    f: l => l,
    g: r => r,
    h: (l, r) => ({l, r}),
  };
  const seq = [];
  const storages = {};
  const execs = {};
  const topo = toposort(edgesRefRev);
  for (const edge of topo) {
    storages[edge] = {edge, current: -1, deps: {}};
    for (const dep of edgesRef[edge]) {
      storages[edge].deps[dep] = storages[dep];
    }
    execs[edge] = () => {
      const deps = [];
      for (const depKey in storages[edge].deps) {
        deps.push(storages[edge].deps[depKey].current);
      }
      const result = fns[edge](...deps);
      storages[edge].current = result;
    };
    seq.push(execs[edge]);
  }
  const doSeq = () => {
    seq.forEach(f => f());
    return storages.h.current;
  };
  // console.log(storages)
  console.log(doSeq());
  fns.a = () => 2;
  console.log(doSeq());
  // console.log(storages)

  console.log(toposort(edgesRef));
  console.log(topo);
  console.log(toposort(deps));
  it('works', () => {
    console.log('okk');
  });
  //   throw new Error('[expect error]');
});
