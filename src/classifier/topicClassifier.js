export function detectTopic(text) {
  const t = text.toLowerCase();

  const rules = [
    { topic: "arrays", keys: ["array", "nums", "subarray", "prefix", "two sum", "indices"] },
    { topic: "strings", keys: ["string", "substring", "palindrome", "anagram", "char"] },
    { topic: "trees", keys: ["tree", "binary tree", "bst", "node", "left", "right", "traversal"] },
    { topic: "graphs", keys: ["graph", "edges", "bfs", "dfs", "adjacent"] },
    { topic: "dp", keys: ["dynamic programming", "dp", "memo", "tabulation", "knapsack"] },
    { topic: "hashmap", keys: ["hash", "map", "dictionary", "frequency"] },
    { topic: "stack_queue", keys: ["stack", "queue", "monotonic"] },
    { topic: "sorting_searching", keys: ["sort", "sorted", "binary search", "search"] }
  ];

  for (const r of rules) {
    for (const k of r.keys) {
      if (t.includes(k)) return r.topic;
    }
  }
  return "general";
}