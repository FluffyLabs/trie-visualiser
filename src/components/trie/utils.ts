import { TreeNode } from ".";
import { TrieNodeType, NodeType, StateKey, WriteableNodesDbType, TrieHash } from "../../types/trie";
import { Bytes } from "@typeberry/trie";

export const truncateString = (str: string, maxLength: number = 20) =>
  str.length >= maxLength ? str.substring(0, 4) + "..." + str.substring(str.length - 4) : str;

const shouldRenderNode = (node: TrieHash, hideEmpty: boolean) => {
  return hideEmpty ? !isEmptyNode(node) : true;
};

function isEmptyNode(node: TrieHash) {
  return node.toString() === "0x0000000000000000000000000000000000000000000000000000000000000000";
}
export function trieToTreeUI(
  root: TrieNodeType | null,
  hash: TrieHash,
  nodes: WriteableNodesDbType,
  hideEmpty: boolean,
): TreeNode | undefined {
  if (isEmptyNode(hash)) {
    return {
      name: "0x0000000000000000000000000000000000000000000000000000000000000000",
    };
  }

  if (root === null) {
    return undefined;
  }

  const kind = root.getNodeType();
  if (kind === NodeType.Branch) {
    const branch = root.asBranchNode();
    const leftHash = branch.getLeft();
    const rightHash = branch.getRight();

    const left = trieToTreeUI(nodes.get(leftHash), leftHash, nodes, hideEmpty);
    const right = trieToTreeUI(nodes.get(rightHash), rightHash, nodes, hideEmpty);

    return {
      name: hash.toString(),
      children: [
        shouldRenderNode(leftHash, hideEmpty) ? left : null,
        shouldRenderNode(rightHash, hideEmpty) ? right : null,
      ].filter((x) => x) as TreeNode[],
    };
  }

  const leaf = root.asLeafNode();
  const valueLength = leaf.getValueLength();

  return {
    name: hash.toString(),
    attributes: {
      key: leaf.getKey().toString()
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
