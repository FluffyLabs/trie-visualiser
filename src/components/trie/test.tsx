import React, { useEffect, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";

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

// Build Cytoscape graph data from treeData, ensuring each node is only connected to its own children
const buildCytoscapeGraphData = (
  node: TreeNode,
  parentId: string | null = null,
  elements: cytoscape.ElementDefinition[] = [],
) => {
  const id = node.name;

  // Add the node to elements
  elements.push({
    data: {
      id,
      label: node.attributes
        ? `${node.name}\n${Object.entries(node.attributes)
            .map(([key, val]) => `${key}: ${val}`)
            .join(", ")}`
        : node.name,
    },
  });

  // Connect the node to its parent if applicable
  if (parentId) {
    elements.push({
      data: { id: `${parentId}-${id}`, source: parentId, target: id },
    });
  }

  // Ensure each node only connects to its direct children and no other unrelated nodes
  if (node.children && node.children.length > 0) {
    const limitedChildren = node.children.slice(0, 2); // Limit to two child nodes
    limitedChildren.forEach((child) => {
      buildCytoscapeGraphData(child, id, elements); // Pass the current node's ID as the parentId
    });
  }

  return elements;
};

const GraphComponent: React.FC<GraphComponentProps> = ({ treeData }) => {
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
        name: "breadthfirst", // Hierarchical layout
        directed: true, // Ensures child nodes are below parent nodes
        padding: 10, // Padding around the layout
        spacingFactor: 1.5, // Increase spacing between nodes
        avoidOverlap: true, // Prevent nodes from overlapping
        animate: true, // Animate the layout changes
      });
      layout.run();
    }
  }, [elements, cyInstance]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <CytoscapeComponent
        elements={elements}
        style={{ width: "100%", height: "100%" }}
        cy={(cy) => setCyInstance(cy)} // Reference to the Cytoscape instance
        layout={{ name: "preset" }} // Preset layout initially (layout controlled by effect)
        stylesheet={[
          {
            selector: "node",
            style: {
              width: nodeWidth,
              height: nodeHeight,
              label: "data(label)",
              "text-valign": "center",
              "text-halign": "center",
              "background-color": "#0074D9",
              color: "#fff",
              "font-size": "12px",
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
    </div>
  );
};

export default GraphComponent;
