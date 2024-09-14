import { TrieNodeType, NodeType, StateKey, WriteableNodesDbType } from "../../types/trie";
import { RawNodeDatum } from "react-d3-tree";
import { Bytes } from "@typeberry/trie";

const truncateHashString = (str: string) => str.substring(0, 4) + "..." + str.substring(str.length - 4);

export function trieToTreeUI(
  root: TrieNodeType | null,
  nodes: WriteableNodesDbType,
): RawNodeDatum | RawNodeDatum[] | undefined {
  if (root === null) {
    return undefined;
  }

  const kind = root.getNodeType();
  if (kind === NodeType.Branch) {
    const branch = root.asBranchNode();
    const leftHash = branch.getLeft();
    const rightHash = branch.getRight();
    const left = trieToTreeUI(nodes.get(leftHash), nodes);
    const right = trieToTreeUI(nodes.get(rightHash), nodes);
    return {
      name: "Root",
      children: [
        {
          name: truncateHashString(leftHash.toString()),
          children:
            Array.isArray(left) || left === undefined
              ? left
              : nodes.get(leftHash)?.getNodeType() === NodeType.Branch
                ? left.children
                : [left],
        },
        {
          name: truncateHashString(rightHash.toString()),
          children:
            Array.isArray(right) || right === undefined
              ? right
              : nodes.get(rightHash)?.getNodeType() === NodeType.Branch
                ? right.children
                : [right],
        },
      ],
    };
  }

  const leaf = root.asLeafNode();
  const valueLength = leaf.getValueLength();
  const value =
    valueLength > 0
      ? `'${truncateHashString(leaf.getValue().toString())}'(len:${valueLength})`
      : `'<hash>${truncateHashString(leaf.getValueHash().toString())}'`;

  // return { name: `Leaf('${leaf.getKey().toString()}',${value})` };
  return {
    name: `Leaf('${truncateHashString(leaf.getKey().toString())}',${value})`,
  };
}

export const HASH_BYTES = 32;

export function parseStateKey(v: string): StateKey {
  return Bytes.parseBytesNoPrefix(v, HASH_BYTES) as StateKey;
}
