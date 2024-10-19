import { Node } from "@/types/tree";

export const TooltipContent = ({ label, value, valueHash, nodeKey }: Node) => {
  return (
    <div>
      <div>
        <strong>Hash:</strong> {label}
      </div>
      {nodeKey && (
        <div>
          <strong>Truncated key:</strong> {nodeKey}
        </div>
      )}
      {value && (
        <div>
          <strong>Value:</strong> {value}
        </div>
      )}
      {valueHash && (
        <div>
          <strong>Value Hash:</strong> {valueHash}
        </div>
      )}
    </div>
  );
};
