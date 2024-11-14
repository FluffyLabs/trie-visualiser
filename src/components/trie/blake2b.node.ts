import blake2b from "blake2b";
import { Bytes, TrieHash } from "@typeberry/trie";
import { TrieHasher } from "@/types/trie";
import { HASH_BYTES } from "./utils";

export const blake2bTrieHasher: TrieHasher = {
  hashConcat(n: Uint8Array, rest?: Uint8Array[]): TrieHash {
    const hasher = blake2b(HASH_BYTES);
    hasher?.update(n);
    for (const v of rest ?? []) {
      hasher?.update(v);
    }
    const out = Bytes.zero(HASH_BYTES);
    hasher?.digest(out.raw);
    return out as TrieHash;
  },
};
