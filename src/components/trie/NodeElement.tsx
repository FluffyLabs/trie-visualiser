import { CustomNodeElementProps } from "react-d3-tree";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SyntheticEvent, useState } from "react";
import "./NodeElement.css";
import { truncateString } from "./utils";

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
  tooltipBox: {
    y: -140,
    x: -100,
    "stroke-width": "1",
    stroke: "#000000",
    width: "680",
    height: "100",
    fill: "white",
  },
  tooltip: {
    y: -140,
    x: -90,
    dy: "1.2em",
    "stroke-width": "1",
  },
  tooltipValue: {
    y: -100,
    x: -90,
    dy: "1.2em",
    "stroke-width": "1",
  },
};

export type NodeElementProps = CustomNodeElementProps;

const NodeElement = ({
  nodeDatum,
  toggleNode,
  onNodeClick,
  onNodeMouseOver,
  onNodeMouseOut,
}: NodeElementProps) => {
  const [isVisibleNode, setIsVisibleNode] = useState(false);
  const onMouseOver = (ev: SyntheticEvent) => {
    setIsVisibleNode(true);
    onNodeMouseOver(ev);
  };
  const onMouseOut = (ev: SyntheticEvent) => {
    setIsVisibleNode(false);

    onNodeMouseOut(ev);
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <>
            <circle
              r={DEFAULT_NODE_CIRCLE_RADIUS}
              onClick={(evt) => {
                toggleNode();
                onNodeClick(evt);
              }}
              onMouseOver={onMouseOver}
              onMouseOut={onMouseOut}
            ></circle>
            {isVisibleNode && (
              <g className="rd3t-custom-tooltip">
                <rect {...textLayout.tooltipBox}></rect>
                <text {...textLayout.tooltip}>Hash: {nodeDatum.name}</text>
                <text {...textLayout.tooltipValue}>
                  Value:{" "}
                  {nodeDatum.attributes?.value ||
                    nodeDatum.attributes?.valueHash ||
                    "<Empty>"}
                </text>
              </g>
            )}
            <g className="rd3t-label">
              <text className="rd3t-label__title" {...textLayout.title}>
                {truncateString(nodeDatum.name)}
              </text>
              {/* <text className="rd3t-label__attributes">
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
              </text> */}
            </g>
          </>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const nodeElementFunc = (props: NodeElementProps) => <NodeElement {...props} />;

export default nodeElementFunc;
