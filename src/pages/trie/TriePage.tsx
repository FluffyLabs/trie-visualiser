import { Trie } from "@/components/trie";
import { Row, TrieInput } from "@/components/trie-input";
import ExampleModal from "@/components/trie-input/example-modal";
import { blake2bTrieHasher } from "@/components/trie/blake2b.node";
import { parseStateKey } from "@/components/trie/utils";
import { InMemoryTrieType } from "@/types/trie";
import { InMemoryTrie, BytesBlob } from "@typeberry/trie";
import { useState } from "react";

const getTrie = (data: { key: string; value: string }[]) => {
  const defaultTrie = InMemoryTrie.empty(blake2bTrieHasher);

  for (const { key, value } of data) {
    const stateKey = parseStateKey(key);
    const val = BytesBlob.parseBlobNoPrefix(value);
    defaultTrie.set(stateKey, val);
  }
  return defaultTrie;
};
export const TriePage = () => {
  const [rowsData, setRowsData] = useState<Row[]>([]);
  const [trie, setTrie] = useState<InMemoryTrieType>();
  const [error, setError] = useState<string>();

  const onChange = (rows: Row[]) => {
    const input = rows.map(({ key, value }) => ({ key, value }));
    console.log("input", input);
    if (input.length === 0) {
      return;
    }

    setError("");
    try {
      setTrie(getTrie(input));
    } catch (error: unknown) {
      setError(error?.message);
    }
  };

  return (
    <div className="p-3 flex flex-row h-full">
      <div className="pr-3 border-r-2">
        <h1 className="my-2 mr-5 font-semibold inline-block">Trie Input</h1>
        <div className="inline-block">
          <ExampleModal
            onSelect={(rows) => {
              setRowsData(rows);
              onChange(rows);
            }}
          />
        </div>

        {error && <div className="text-red-500">{error}</div>}
        <TrieInput initialRows={rowsData} onChange={onChange} />
      </div>

      <div className="flex flex-row h-full w-full">
        <Trie trie={trie} />
      </div>
    </div>
  );
};
