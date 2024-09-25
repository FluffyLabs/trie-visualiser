import { TrieNodeType, NodeType, StateKey, WriteableNodesDbType } from "../../types/trie";
import { RawNodeDatum } from "react-d3-tree";
import { Bytes } from "@typeberry/trie";

export const truncateString = (str: string, maxLength: number = 20) =>
  str.length >= maxLength ? str.substring(0, 4) + "..." + str.substring(str.length - 4) : str;

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
    const children = [];

    if (left !== undefined) {
      children.push({
        name: leftHash.toString(),
        children:
          Array.isArray(left) || left === undefined
            ? left
            : nodes.get(leftHash)?.getNodeType() === NodeType.Branch
              ? left.children
              : [left],
      });
    }
    if (right !== undefined) {
      children.push({
        name: rightHash.toString(),
        children:
          Array.isArray(right) || right === undefined
            ? right
            : nodes.get(rightHash)?.getNodeType() === NodeType.Branch
              ? right.children
              : [right],
      });
    }
    return {
      name: "Root",
      children: [
        {
          name: leftHash.toString(),
          children:
            Array.isArray(left) || left === undefined
              ? left
              : nodes.get(leftHash)?.getNodeType() === NodeType.Branch
                ? left.children
                : [left],
        },
        {
          name: rightHash.toString(),
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

  // return { name: `Leaf('${leaf.getKey().toString()}',${value})` };
  return {
    name: leaf.getKey().toString(),
    attributes: {
      ...(valueLength > 0
        ? { value: `${leaf.getValue()}; length: ${valueLength}` }
        : { valueHash: `${leaf.getValueHash()}` }),
    },
  };
}

export const HASH_BYTES = 32;

export function parseStateKey(v: string): StateKey {
  return Bytes.parseBytesNoPrefix(v, HASH_BYTES) as StateKey;
}
