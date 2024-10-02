import React, { useEffect, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape, { BaseLayoutOptions } from "cytoscape";
import dagre from "cytoscape-dagre";
import elk from "cytoscape-elk";
import { truncateString } from "./utils";
import cytoscapePopper from "cytoscape-popper";
import tippy, { GetReferenceClientRect } from "tippy.js";
import "tippy.js/dist/tippy.css"; // For styling
import "tippy.js/themes/light-border.css";
import "tippy.js/animations/scale.css";

// Use Dagre and ELK layouts for Cytoscape
cytoscape.use(dagre);
cytoscape.use(elk);

// Tippy factory for popovers (tooltips)
function tippyFactory(ref: { getBoundingClientRect: GetReferenceClientRect }, content: HTMLElement) {
  const dummyDomEle = document.createElement("div");

  const tip = tippy(dummyDomEle, {
    theme: "light-border",
    animation: "scale",
    getReferenceClientRect: ref.getBoundingClientRect,
    trigger: "manual",
    content: content,
    maxWidth: "none",
    arrow: true,
    placement: "top",
    hideOnClick: false,
    sticky: "reference",
    interactive: true,
    appendTo: document.body,
  });

  return tip;
}

cytoscape.use(cytoscapePopper(tippyFactory));

export interface TreeNode {
  name: string;
  children?: TreeNode[];
  attributes?: { [key: string]: string };
}

interface GraphComponentProps {
  treeData: TreeNode;
}

const nodeWidth = 200;
const nodeHeight = 50;

// Generate a unique ID based on the node's position in the tree
const generateNodeId = (_node: TreeNode, parentId: string | null, index: number): string => {
  return parentId ? `${parentId}-${index}` : `root-${index}`;
};

// Build Cytoscape graph data from treeData, ensuring each node is only connected to its children
const buildCytoscapeGraphData = (
  node: TreeNode,
  parentId: string | null = null,
  index: number = 0,
  elements: cytoscape.ElementDefinition[] = [],
) => {
  const uniqueId = generateNodeId(node, parentId, index);

  // Insert the node into elements
  elements.push({
    data: {
      id: uniqueId,
      label: node.attributes
        ? `${node.name}\n${Object.entries(node.attributes)
            .map(([key, val]) => `${key}: ${val}`)
            .join(", ")}`
        : node.name, // Display the name, even if not unique
    },
  });

  // Connect the node to its parent if applicable
  if (parentId) {
    elements.push({
      data: { id: `${parentId}-${uniqueId}`, source: parentId, target: uniqueId },
    });
  }

  // Ensure each node connects to its direct children
  if (node.children && node.children.length > 0) {
    node.children.forEach((child, childIndex) => {
      buildCytoscapeGraphData(child, uniqueId, childIndex, elements); // Pass the current node's ID as the parentId
    });
  }

  return elements;
};

const Trie: React.FC<GraphComponentProps> = ({ treeData }) => {
  const [elements, setElements] = useState<cytoscape.ElementDefinition[]>([]);
  const [cyInstance, setCyInstance] = useState<cytoscape.Core | null>(null);

  useEffect(() => {
    const graphElements = buildCytoscapeGraphData(treeData);
    setElements(graphElements);
  }, [treeData]);

  // Layout and node tooltip creation
  useEffect(() => {
    if (cyInstance) {
      const layout = cyInstance.layout({
        name: "breadthfirst", // Hierarchical layout
        directed: true, // Ensures child nodes are below parent nodes
        padding: 1, // Padding around the layout
        spacingFactor: 1.2, // Increase spacing between nodes
        avoidOverlap: true, // Prevent nodes from overlapping
        animate: true, // Animate the layout changes
        circle: false, // Disable circle layout
        animationDuration: 1000,
        acyclicer: "greedy",
        ranker: "tight-tree",
        rankDir: "TB", // Top-to-bottom layout direction
        nodeSep: 50, // Space between nodes
        edgeSep: 50, // Space between edges
        rankSep: 100, // Space between ranks (levels of hierarchy)
        disableOptimalOrderHeuristic: true,
        sort: () => 1, // Ensure sorting consistency
        elk: {
          algorithm: "mrtree",
          "org.eclipse.elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
        },
      } as BaseLayoutOptions);

      // Keep track of created tippy instances
      const tippyInstances: cytoscapePopper.PopperInstance[] = [];

      cyInstance.nodes().forEach((node) => {
        const tip = node.popper({
          content: () => {
            const content = document.createElement("div");
            content.innerHTML = `Hash: ${node
              .data("label")
              .split("value")
              .join("<br> Value")
              .split("valueHash")
              .join("<br> ValueHash")}`;
            return content;
          },
        });

        // Store the tippy instance for cleanup later
        tippyInstances.push(tip);

        // Show/hide tooltips on hover
        node.on("mouseover", () => {
          if ("show" in tip && typeof tip.show === "function") {
            tip.show();
          }
        });

        node.on("mouseout", () => {
          if ("hide" in tip && typeof tip.hide === "function") {
            tip.hide();
          }
        });
      });

      layout.run();

      // Cleanup tooltips and listeners on component unmount or element change
      return () => {
        tippyInstances.forEach((tip) => {
          if ("destroy" in tip && typeof tip.destroy === "function") {
            tip.destroy();
          }
        });
      };
    }
  }, [elements, cyInstance]);

  return (
    <CytoscapeComponent
      elements={elements}
      style={{ width: "100%", height: "100%" }}
      cy={(cy) => setCyInstance(cy)} // Reference to the Cytoscape instance
      layout={{ name: "preset" }} // Preset layout initially (layout controlled by effect)
      autoungrabify={true}
      stylesheet={[
        {
          selector: "node",
          style: {
            width: nodeWidth,
            height: nodeHeight,
            label: function (element: { data: (arg0: string) => string }) {
              return truncateString(element.data("label"), 20);
            },
            "text-valign": "center",
            "text-halign": "center",
            "background-color": (element: { data: (arg0: string) => string }) => {
              if (element.data("label") === "0x0000000000000000000000000000000000000000000000000000000000000000") {
                return "#c9c9c9";
              }

              if (element.data("label").includes("value")) {
                return "#00bcd4";
              }

              return "#55b3f3";
            },
            color: "#fff",
            "font-family": "monospace",
            "font-size": "26px",
            "border-width": 2,
            "border-color": "#333",
            shape: "roundrectangle",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
          },
        },
      ]}
    />
  );
};

export default Trie;
