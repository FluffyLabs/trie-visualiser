import React, { useState } from "react";
import { TreeNode } from "../trie";
import { XIcon } from "lucide-react";
import { Checkbox } from "../ui/checkbox";

// Define the component props
interface NodeDetailsProps {
  node?: TreeNode;
  onClose: () => void;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onClose }) => {
  const [isBinary, setIsBinary] = useState(false);

  const getNodeType = () => {
    return node?.attributes?.value || node?.attributes?.valueHash ? "Leaf" : "Branch";
  };

  const convertToBinary = (hexString: string) => {
    return parseInt(hexString, 16).toString(2).padStart(8, "0");
  };

  const displayValue = (value: string | undefined) => {
    if (!value) return "";
    return isBinary ? convertToBinary(value) : value;
  };

  const getNodeTypeColor = () => {
    if (getNodeType() === "Leaf") {
      return "#00bcd4";
    }
    if (node?.name === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      return "#c9c9c9";
    }
    return "#55b3f3";
  };

  return (
    <div
      className="p-4 border border-gray-300 rounded-md shadow-md w-full relative overflow-y-auto"
      style={{ maxHeight: "400px" }}
    >
      <button className="absolute top-2 right-2" onClick={onClose}>
        <XIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
      </button>
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <Checkbox checked={isBinary} onCheckedChange={(ev) => setIsBinary(ev as boolean)} />
          <span>Show as Binary</span>
        </label>
      </div>
      <div className="mb-2">
        <span className="font-bold">Node Type:</span>
        <span className="ml-2 px-2 py-1 rounded-full text-white" style={{ backgroundColor: getNodeTypeColor() }}>
          {getNodeType()}
        </span>
      </div>
      <div className="mb-2 break-words">
        <span className="font-bold">Node Hash:</span> {displayValue(node?.name)}
      </div>
      {node?.attributes?.value && (
        <div className="mb-2 break-words">
          <span className="font-bold">Value:</span> {displayValue(node?.attributes?.value)}
        </div>
      )}
      {node?.attributes?.valueHash && (
        <div className="mb-2 break-words">
          <span className="font-bold">Value Hash:</span> {displayValue(node?.attributes?.valueHash)}
        </div>
      )}
      {node?.attributes?.nodeKey && (
        <div className="mb-2 break-words">
          <span className="font-bold">Key Hash:</span> {displayValue(node?.attributes?.nodeKey)}
        </div>
      )}
    </div>
  );
};

export default NodeDetails;
