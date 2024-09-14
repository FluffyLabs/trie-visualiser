import Tree from "react-d3-tree";
import { trieToTreeUI } from "./utils";
import { InMemoryTrieType } from "../../types/trie";
import NodeElement from "./NodeElement";

export const Trie = ({ trie }: { trie: InMemoryTrieType }) => {
  const data = trieToTreeUI(trie.root, trie.nodes);

  return <Tree data={data} orientation="vertical" zoom={0.2} renderCustomNodeElement={NodeElement} />;
};
