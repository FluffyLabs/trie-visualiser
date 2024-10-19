import { TreeNode } from ".";
import { TrieNodeType, NodeType, StateKey, WriteableNodesDbType, TrieHash } from "../../types/trie";
import { Bytes } from "@typeberry/trie";

export const truncateString = (str: string, maxLength: number = 20) =>
  str.length >= maxLength ? str.substring(0, 4) + "..." + str.substring(str.length - 4) : str;

const shouldRenderNode = (node: TrieHash, hideEmpty: boolean) => {
  return hideEmpty ? !isEmptyHash(node) : true;
};

export function isEmptyHash(node: TrieHash) {
  return isEmptyNodeName(node.toString());
}

export function isEmptyNodeName(name: string) {
  return name === "0x0000000000000000000000000000000000000000000000000000000000000000";
}
export function trieToTreeUI(
  root: TrieNodeType | null,
  hash: TrieHash,
  nodes: WriteableNodesDbType,
  hideEmpty: boolean,
  prefix: string = "",
): TreeNode | undefined {
  if (isEmptyHash(hash)) {
    return {
      name: "0x0000000000000000000000000000000000000000000000000000000000000000",
      attributes: {
        prefix,
      },
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

    const left = trieToTreeUI(nodes.get(leftHash), leftHash, nodes, hideEmpty, prefix + "0");
    const right = trieToTreeUI(nodes.get(rightHash), rightHash, nodes, hideEmpty, prefix + "1");

    return {
      name: hash.toString(),
      attributes: {
        prefix,
      },
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
      nodeKey: leaf.getKey().toString(),
      prefix,
      ...(valueLength > 0 ? { value: `${leaf.getValue()}`, valueLength } : { valueHash: `${leaf.getValueHash()}` }),
    },
  };
}

export const HASH_BYTES = 32;

export function parseStateKey(v: string): StateKey {
  return Bytes.parseBytesNoPrefix(v, HASH_BYTES) as StateKey;
}

export const getNodeTypeColor = (node: TreeNode) => {
  if (getNodeType(node) === "Leaf") {
    return "#00bcd4";
  }
  if (node?.name === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    return "#c9c9c9";
  }
  return "#55b3f3";
};

export const getNodeType = (node: TreeNode) => {
  return node?.attributes?.value || node?.attributes?.valueHash ? "Leaf" : "Branch";
};

export const trimEdgePrefix = (prefix: string) => {
  if (prefix.length <= 4) {
    return `0b${prefix}`;
  }

  const prefixLength = Math.floor((prefix.length - 1) / 4) * 4;

  const hexPart = parseInt(prefix.slice(0, prefixLength), 2).toString(16);
  const binaryPart = prefix.slice(prefixLength);

  return `0x${hexPart} ++ b${binaryPart}`;
};
