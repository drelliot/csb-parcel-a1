//@flow

function assertCycle(item) {
  if (!item) return;
  throw new Error('found cycle in DAG');
}

function topologicalSortHelper(node, visited, temp, graph, result) {
  temp[node] = true;
  const neighbors = graph[node];
  for (let i = 0; i < neighbors.length; i++) {
    const n = neighbors[i];
    assertCycle(temp[n]);
    if (!visited[n]) {
      topologicalSortHelper(n, visited, temp, graph, result);
    }
  }
  temp[node] = false;
  visited[node] = true;
  result.push(node);
}

/**
 * Topological sort algorithm of a directed acyclic graph.<br><br>
 * Time complexity: O(|E| + |V|) where E is a number of edges
 * and |V| is the number of nodes.
 *
 * @param {Array} graph Adjacency list, which represents the graph.
 * @returns {Array} Ordered vertices.
 *
 * @example
 * var graph = {
 *     v1: ['v2', 'v5'],
 *     v2: [],
 *     v3: ['v1', 'v2', 'v4', 'v5'],
 *     v4: [],
 *     v5: []
 * };
 * var vertices = topsort(graph); // ['v3', 'v4', 'v1', 'v5', 'v2']
 */
export default graph => {
  const result = [];
  const visited = {};
  const temp = {};
  for (const node in graph) {
    if (!visited[node] && !temp[node]) {
      topologicalSortHelper(node, visited, temp, graph, result);
    }
  }
  return result.reverse();
};
