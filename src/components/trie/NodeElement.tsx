import React from "react";
import { CustomNodeElementProps } from "react-d3-tree";

const DEFAULT_NODE_CIRCLE_RADIUS = 15;

const textLayout = {
  title: {
    textAnchor: "start",
    x: 40,
  },
  attribute: {
    x: 40,
    dy: "1.2em",
  },
};

export type NodeElementProps = CustomNodeElementProps;

const NodeElement: React.FunctionComponent<NodeElementProps> = ({
  nodeDatum,
  toggleNode,
  onNodeClick,
  onNodeMouseOver,
  onNodeMouseOut,
}) => (
  <>
    <circle
      r={DEFAULT_NODE_CIRCLE_RADIUS}
      onClick={(evt) => {
        toggleNode();
        onNodeClick(evt);
      }}
      onMouseOver={onNodeMouseOver}
      onMouseOut={onNodeMouseOut}
    ></circle>
    <g className="rd3t-label">
      <text className="rd3t-label__title" {...textLayout.title}>
        {nodeDatum.name}
      </text>
      <text className="rd3t-label__attributes">
        {nodeDatum.attributes &&
          Object.entries(nodeDatum.attributes).map(
            ([labelKey, labelValue], i) => (
              <tspan key={`${labelKey}-${i}`} {...textLayout.attribute}>
                {labelKey}:{" "}
                {typeof labelValue === "boolean"
                  ? labelValue.toString()
                  : labelValue}
              </tspan>
            )
          )}
      </text>
    </g>
  </>
);

export default NodeElement;
