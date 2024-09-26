import { Row, TrieInput } from "@/components/trie-input";
import ExampleModal from "@/components/trie-input/example-modal";
import { blake2bTrieHasher } from "@/components/trie/blake2b.node";
import Trie from "@/components/trie";
import { parseStateKey, trieToTreeUI } from "@/components/trie/utils";
import { InMemoryTrieType } from "@/types/trie";
import { InMemoryTrie, BytesBlob } from "@typeberry/trie";
import { useState } from "react";

const getTrie = (data: { key: string; value: string; action: "add" | "remove" | "" }[]) => {
  const defaultTrie = InMemoryTrie.empty(blake2bTrieHasher) as InMemoryTrieType;
  const merged = data.filter(
    ({ key }, index) => !data.slice(index, data.length).some((r) => r.key === key && r.action === "remove"),
  );
  for (const { key, value } of merged) {
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
  const data = trie && trieToTreeUI(trie.root, trie.nodes);
  console.log(data);
  const onChange = (rows: Row[]) => {
    const input = rows.map(({ key, value, action }) => ({ key, value, action }));
    if (input.length === 0) {
      return;
    }

    setError("");
    try {
      setTrie(getTrie(input));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
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

      <div className="flex flex-row h-full w-full">{data && <Trie treeData={data} />}</div>
    </div>
  );
};
