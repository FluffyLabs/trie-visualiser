import { Node } from "@/types/tree";

export const TooltipContent = ({ label, value, valueHash, keyHash }: Node) => {
  return (
    <div>
      <div>
        <strong>Hash:</strong> {label}
      </div>
      {keyHash && (
        <div>
          <strong>Key:</strong> {keyHash}
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
