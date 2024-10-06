import { Row, TrieInput } from "@/components/trie-input";
import ExampleModal from "@/components/trie-input/example-modal";
import { blake2bTrieHasher } from "@/components/trie/blake2b.node";
import Trie, { TreeNode } from "@/components/trie";
import { parseStateKey, trieToTreeUI } from "@/components/trie/utils";
import { InMemoryTrieType } from "@/types/trie";
import { InMemoryTrie, BytesBlob } from "@typeberry/trie";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import NodeDetails from "@/components/node-details";

const DEFAULT_ROWS_DATA: Row[] = [
  {
    id: "1",
    action: "insert",
    key: "5dffe0e2c9f089d30e50b04ee562445cf2c0e7e7d677580ef0ccf2c6fa3522dd",
    value:
      "bb11c256876fe10442213dd78714793394d2016134c28a64eb27376ddc147fc6044df72bdea44d9ec66a3ea1e6d523f7de71db1d05a980e001e9fa",
    isSubmitted: true,
    isHidden: false,
    isEditing: false,
  },
  {
    id: "2",
    action: "insert",
    key: "df08871e8a54fde4834d83851469e635713615ab1037128df138a6cd223f1242",
    value: "b8bded4e1c",
    isSubmitted: true,
    isHidden: false,
    isEditing: false,
  },
];

const getTrie = (data: { key: string; value: string; action: "insert" | "remove" | "" }[]) => {
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

const findNodeByHash = (data: TreeNode[], hash: string): TreeNode | undefined => {
  for (const item of data) {
    if (item.name === hash) {
      return item;
    }
    if (item.children) {
      const found = findNodeByHash(item.children, hash);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

export const TriePage = () => {
  const [selectedNodeHash, setSelectedNodeHash] = useState<string | null>(null);
  const [rowsData, setRowsData] = useState<Row[]>(DEFAULT_ROWS_DATA);
  const [trie, setTrie] = useState<InMemoryTrieType>(getTrie(DEFAULT_ROWS_DATA));
  const [error, setError] = useState<string>();
  const [hideEmpty, setHideEmpty] = useState<boolean>(false);
  const data = trie && trieToTreeUI(trie.root, trie.getRoot(), trie.nodes, hideEmpty);

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

  const onNodeSelect = (node: string) => {
    setSelectedNodeHash(node);
  };

  const closeNodeDetails = () => {
    setSelectedNodeHash(null);
  };

  return (
    <div className="p-3 flex flex-row h-full">
      <div className="border-r-2 flex-col">
        <div>
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
        </div>
        <div className="flex items-center space-x-2 my-3">
          <Checkbox id="hideEmpty" onCheckedChange={(ev) => setHideEmpty(ev as boolean)} />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Hide empty nodes
          </label>
        </div>
        <div style={{ maxHeight: "calc(100% - 70px)" }} className="overflow-y-scroll">
          <TrieInput initialRows={rowsData} onChange={onChange} />
        </div>
      </div>

      <div className="flex flex-col h-full w-full overflow-hidden">
        <div className="flex flex-row h-full w-full">
          {data && <Trie treeData={data} onNodeSelect={onNodeSelect} />}
        </div>
        <div className="flex flex-row h-[300px] w-full">
          {selectedNodeHash && (
            <NodeDetails node={data && findNodeByHash([data], selectedNodeHash)} onClose={closeNodeDetails} />
          )}
        </div>
      </div>
    </div>
  );
};
