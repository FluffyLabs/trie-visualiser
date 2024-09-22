import Tree from "react-d3-tree";
import { trieToTreeUI } from "./utils";
import { InMemoryTrieType } from "../../types/trie";
import nodeElementFunc from "./NodeElement";
import { useRef } from "react";

export const Trie = ({ trie }: { trie?: InMemoryTrieType }) => {
  const treeContainer = useRef<HTMLDivElement>(null);
  if (!trie) {
    return;
  }

  const data = trieToTreeUI(trie.root, trie.nodes);
  const bounding = treeContainer.current?.getBoundingClientRect();

  return (
    <div ref={treeContainer} className="w-full h-full">
      <Tree
        data={data}
        orientation="vertical"
        renderCustomNodeElement={nodeElementFunc}
        enableLegacyTransitions
        transitionDuration={400}
        dimensions={
          bounding && {
            width: bounding.width,
            height: bounding.height,
          }
        }
        translate={
          bounding && {
            x: bounding.width / 2.5,
            y: bounding.height / 2,
          }
        }
      />
    </div>
  );
};
