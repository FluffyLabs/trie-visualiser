import React from "react";
import { TreeNode } from "../trie";
import { XIcon } from "lucide-react";

// Define the component props
interface NodeDetailsProps {
  node?: TreeNode;
  onClose: () => void;
}

// NodeDetails component
const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onClose }) => {
  return (
    <div className="p-4 border border-gray-300 rounded-md shadow-md w-full relative">
      <button className="absolute top-2 right-2" onClick={onClose}>
        <XIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
      </button>
      <div className="mb-2">
        <span className="font-bold">Node Hash:</span> {node?.name}
      </div>
      {node?.attributes?.value && (
        <div className="mb-2">
          <span className="font-bold">Value:</span> {node?.attributes?.value}
        </div>
      )}
      {node?.attributes?.valueHash && (
        <div className="mb-2">
          <span className="font-bold">Value Hash:</span> {node?.attributes?.valueHash}
        </div>
      )}
      {node?.attributes?.keyHash && (
        <div className="mb-2">
          <span className="font-bold">Key Hash:</span> {node?.attributes?.keyHash}
        </div>
      )}
    </div>
  );
};

export default NodeDetails;
