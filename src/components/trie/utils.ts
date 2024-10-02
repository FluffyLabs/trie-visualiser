import { TreeNode } from ".";
import { TrieNodeType, NodeType, StateKey, WriteableNodesDbType, TrieHash } from "../../types/trie";
import { Bytes } from "@typeberry/trie";

export const truncateString = (str: string, maxLength: number = 20) =>
  str.length >= maxLength ? str.substring(0, 4) + "..." + str.substring(str.length - 4) : str;

const shouldRenderNode = (node: TrieHash, hideEmpty: boolean) => {
  return hideEmpty ? node.toString() !== "0x0000000000000000000000000000000000000000000000000000000000000000" : true;
};
export function trieToTreeUI(
  root: TrieNodeType | null,
  nodes: WriteableNodesDbType,
  hideEmpty: boolean,
): TreeNode | undefined {
  if (root === null) {
    return undefined;
  }

  const kind = root.getNodeType();
  if (kind === NodeType.Branch) {
    const branch = root.asBranchNode();
    const leftHash = branch.getLeft();
    const rightHash = branch.getRight();
    const left = trieToTreeUI(nodes.get(leftHash), nodes, hideEmpty);
    const right = trieToTreeUI(nodes.get(rightHash), nodes, hideEmpty);
    const children = [];

    if (shouldRenderNode(leftHash, hideEmpty)) {
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
    if (shouldRenderNode(rightHash, hideEmpty)) {
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
      children,
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
