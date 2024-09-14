import {
  TrieNodeType,
  NodeType,
  StateKey,
  WriteableNodesDbType,
} from "../../types/trie";
import { RawNodeDatum } from "react-d3-tree";
import { Bytes } from "@typeberry/trie";

export function trieToTreeUI(
  root: TrieNodeType | null,
  nodes: WriteableNodesDbType
): RawNodeDatum | RawNodeDatum[] | undefined {
  if (root === null) {
    return undefined;
  }

  const kind = root.getNodeType();
  if (kind === NodeType.Branch) {
    const branch = root.asBranchNode();
    const leftHash = branch.getLeft();
    const rightHash = branch.getRight();
    // const indent = (v: string) =>
    //   v
    //     .split("\n")
    //     .map((v) => `\t\t${v}`)
    //     .join("\n");
    const left = trieToTreeUI(nodes.get(leftHash), nodes);
    const right = trieToTreeUI(nodes.get(rightHash), nodes);
    console.log(left, leftHash);
    return {
      name: "Branch",
      children: [
        {
          name: leftHash.toString(),
          children: Array.isArray(left) || left === undefined ? left : [left],
        },
        {
          name: rightHash.toString(),
          children:
            Array.isArray(right) || right === undefined ? right : [right],
        },
      ],
    };
  }

  const leaf = root.asLeafNode();
  const valueLength = leaf.getValueLength();
  const value =
    valueLength > 0
      ? `'${leaf.getValue()}'(len:${valueLength})`
      : `'<hash>${leaf.getValueHash()}'`;

  return { name: `Leaf('${leaf.getKey().toString()}',${value})` };
}

export const HASH_BYTES = 32;

export function parseStateKey(v: string): StateKey {
  return Bytes.parseBytesNoPrefix(v, HASH_BYTES) as StateKey;
}
