import { Row, TrieInput } from "@/components/trie-input";
import ExampleModal from "@/components/trie-input/example-modal";
import { blake2bTrieHasher } from "@/components/trie/blake2b.node";
import Trie from "@/components/trie";
import { parseStateKey, trieToTreeUI } from "@/components/trie/utils";
import { InMemoryTrieType } from "@/types/trie";
import { InMemoryTrie, BytesBlob } from "@typeberry/trie";
import { useState } from "react";

const DEFAULT_ROWS_DATA: Row[] = [
  {
    id: "1",
    action: "add",
    key: "5dffe0e2c9f089d30e50b04ee562445cf2c0e7e7d677580ef0ccf2c6fa3522dd",
    value:
      "bb11c256876fe10442213dd78714793394d2016134c28a64eb27376ddc147fc6044df72bdea44d9ec66a3ea1e6d523f7de71db1d05a980e001e9fa",
    isSubmitted: true,
  },
  {
    id: "2",
    action: "add",
    key: "df08871e8a54fde4834d83851469e635713615ab1037128df138a6cd223f1242",
    value: "b8bded4e1c",
    isSubmitted: true,
  },
];

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
  const [rowsData, setRowsData] = useState<Row[]>(DEFAULT_ROWS_DATA);
  const [trie, setTrie] = useState<InMemoryTrieType>(getTrie(DEFAULT_ROWS_DATA));
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
