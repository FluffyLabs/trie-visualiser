import { Row, TrieInput } from "@/components/trie-input";
import ExampleModal, { examples } from "@/components/trie-input/example-modal";
import { blake2bTrieHasher } from "@/components/trie/blake2b.node";
import Trie, { TreeNode } from "@/components/trie";
import { parseStateKey, trieToTreeUI } from "@/components/trie/utils";
import { InMemoryTrieType } from "@/types/trie";
import { InMemoryTrie, BytesBlob } from "@typeberry/trie";
import { useCallback, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import NodeDetails from "@/components/node-details";

const DEFAULT_ROWS_DATA: Row[] = examples[0].rows;

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

  const onNodeSelect = useCallback((node: string) => {
    setSelectedNodeHash(node);
  }, []);

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
        <div className="grow flex flex-row w-full  overflow-hidden">
          {data && <Trie treeData={data} onNodeSelect={onNodeSelect} />}
        </div>
        {selectedNodeHash && (
          <div className="flex flex-row h-[500px] w-full">
            <NodeDetails node={data && findNodeByHash([data], selectedNodeHash)} onClose={closeNodeDetails} />
          </div>
        )}
      </div>
    </div>
  );
};
