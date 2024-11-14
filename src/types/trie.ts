import { BytesBlob, TrieHash, type Bytes } from "@typeberry/trie";

export type TrieHasher = {
  hashConcat(n: Uint8Array, r?: Uint8Array[]): TrieHash;
};

type BranchNodeType = {
  node: TrieNodeType;
  getLeft: () => TrieHash;
  getRight: () => TrieHash;
};

type StringLiteral<Type> = Type extends string ? (string extends Type ? never : Type) : never;
declare const __OPAQUE_TYPE__: unique symbol;
type WithOpaque<Token extends string> = {
  readonly [__OPAQUE_TYPE__]: Token;
};
type Opaque<Type, Token extends string> = Token extends StringLiteral<Token> ? Type & WithOpaque<Token> : never;
type TruncatedStateKey = Opaque<Bytes<31>, "stateKey">;
type Hash = Bytes<32>;
type ValueHash = Opaque<Hash, "trieValue">;

type LeafNodeType = {
  node: TrieNodeType;
  getKey(): TruncatedStateKey;
  getValueLength(): number;
  getValue(): BytesBlob;
  getValueHash(): ValueHash;
};

export type TrieNodeType = {
  readonly data: Uint8Array;
  getNodeType(): NodeType;
  asBranchNode(): BranchNodeType;
  asLeafNode(): LeafNodeType;
};

export enum NodeType {
  /** Branch node (left & right subtree hashes) */
  Branch = 0,
  /** Leaf node (value hash) */
  Leaf = 1,
  /** Embedded leaf node (value len + value) */
  EmbedLeaf = 2,
}

export type NodesDbType = {
  readonly hasher: TrieHasher;
  readonly nodes: Map<string, TrieNodeType>;

  get(hash: TrieHash): TrieNodeType | null;
  hashNode(n: TrieNodeType): TrieHash;
  hashCompatStr(hash: TrieHash): string;
};

export type WriteableNodesDbType = NodesDbType & {
  remove(hash: TrieHash): void;
  insert(node: TrieNodeType, hash?: TrieHash): TrieHash;
};
