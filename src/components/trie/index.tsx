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
import "./index.scss";

cytoscape.use(dagre);
cytoscape.use(elk);

function tippyFactory(ref: { getBoundingClientRect: GetReferenceClientRect }, content: HTMLElement) {
  // Since tippy constructor requires DOM element/elements, create a placeholder
  const dummyDomEle = document.createElement("div");

  const tip = tippy(dummyDomEle, {
    theme: "light-border",
    animation: "scale",
    getReferenceClientRect: ref.getBoundingClientRect,
    trigger: "manual", // mandatory
    // dom element inside the tippy:
    content: content,
    maxWidth: "none",
    // your own preferences:
    arrow: true,
    placement: "top",
    hideOnClick: false,
    sticky: "reference",
    // if interactive:
    interactive: true,
    appendTo: document.body, // or append dummyDomEle to document.body
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

// Generate a unique ID based on the node's name and some identifier
const generateNodeId = (_node: TreeNode, parentId: string | null, index: number): string => {
  // You can change this logic based on your requirements
  return parentId ? `${parentId}-${index}` : `root-${index}`;
};

// Build Cytoscape graph data from treeData, ensuring each node is only connected to its own children
const buildCytoscapeGraphData = (
  node: TreeNode,
  parentId: string | null = null,
  index: number = 0,
  elements: cytoscape.ElementDefinition[] = [],
) => {
  const uniqueId = generateNodeId(node, parentId, index);

  // Insert the node to elements
  elements.push({
    data: {
      id: uniqueId, // Unique ID for Cytoscape
      label: node.name,
      ...node.attributes,
    },
  });

  // Connect the node to its parent if applicable
  if (parentId) {
    elements.push({
      data: { id: `${parentId}-${uniqueId}`, source: parentId, target: uniqueId },
    });
  }

  // Ensure each node only connects to its direct children
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

  // Update the layout when elements change
  useEffect(() => {
    if (cyInstance) {
      const layout = cyInstance.layout({
        name: "elk", // Hierarchical layout
        directed: true, // Ensures child nodes are below parent nodes
        padding: 1, // Padding around the layout
        spacingFactor: 1.2, // Increase spacing between nodes
        avoidOverlap: true, // Prevent nodes from overlapping
        animate: true, // Animate the layout changes
        circle: false, // Disable circle layout
        // grid: true,
        // name: "dagre",
        // animate: true,
        animationDuration: 1000,
        // name: "breadthfirst",
        acyclicer: "greedy",
        ranker: "tight-tree",
        rankDir: "TB", // Top-to-bottom layout direction
        // align: "UL", // Align nodes to the left, ensuring children are ordered
        nodeSep: 50, // Space between nodes
        edgeSep: 50, // Space between edges
        rankSep: 100, // Space between ranks (levels of hierarchy),
        disableOptimalOrderHeuristic: true,
        sort: () => 1,
        elk: {
          algorithm: "mrtree",
          "org.eclipse.elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
          // "org.eclipse.elk.layered.nodePlacement.bk.fixedAlignment": "LEFT", // Align first child to the left, second to the right

          //   "elk.spacing.nodeNode": 10,
          //   "elk.padding": new ElkPadding(),
        },
      } as BaseLayoutOptions);

      // Keep track of created tippy instances
      const tippyInstances: cytoscapePopper.PopperInstance[] = [];

      cyInstance.nodes().forEach((node) => {
        const tip = node.popper({
          content: () => {
            const content = document.createElement("div");
            content.innerHTML = `<strong>Hash:</strong> ${node.data("label")}<br>${node.data("valueHash") ? `<strong>Value hash:</strong> ${node.data("valueHash")}` : `<strong>Value:</strong> ${node.data("value")}`}<br><strong>Key:</strong> ${node.data("key")}`;

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

              if (element.data("value") || element.data("valueHash")) {
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
