import React, { useEffect, useState, useRef } from "react";
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from "@xyflow/react";
import dagre from "dagre";
import { useSpring, animated } from "@react-spring/web";
import "@xyflow/react/dist/style.css";

interface TreeNode {
  name: string;
  children?: TreeNode[];
  attributes?: { [key: string]: string };
}

interface GraphComponentProps {
  treeData: TreeNode;
}

const nodeWidth = 200;
const nodeHeight = 50;

const getLayoutedElements = (nodes: Node[], layoutedEdges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB" }); // top to bottom layout

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  layoutedEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
      style: { width: nodeWidth, height: nodeHeight },
    };
  });

  return { layoutedNodes, layoutedEdges };
};

const buildGraphData = (node: TreeNode, parentId: string | null = null, nodes: Node[] = [], edges: Edge[] = []) => {
  const id = node.name;
  nodes.push({
    id,
    data: {
      label: `${node.name}${
        node.attributes
          ? `\n${Object.entries(node.attributes)
              .map(([key, val]) => `${key}: ${val}`)
              .join(", ")}`
          : ""
      }`,
    },
    position: { x: 0, y: 0 }, // Placeholder, layout handled by dagre
  });

  if (parentId) {
    edges.push({ id: `${parentId}-${id}`, source: parentId, target: id });
  }

  if (node.children) {
    node.children.forEach((child) => buildGraphData(child, id, nodes, edges));
  }

  return { nodes, edges };
};

// Animated Node component
const AnimatedNode = ({
  node,
  isNew,
  isRemoved,
  onRemove,
}: {
  node: Node;
  isNew: boolean;
  isRemoved?: boolean;
  onRemove?: () => void;
}) => {
  const springs = useSpring({
    from: isNew ? { opacity: 0, transform: "scale(0.5)" } : { opacity: 1, transform: "scale(1)" },
    to: isRemoved ? { opacity: 0, transform: "scale(0.5)" } : { opacity: 1, transform: "scale(1)" },
    config: { tension: 200, friction: 15 },
    onRest: () => {
      if (isRemoved && onRemove) {
        onRemove(); // Handle animation end for removal
      }
    },
  });

  return (
    <animated.div style={{ ...springs, width: nodeWidth, height: nodeHeight, ...node.style }}>
      {node.data.label}
    </animated.div>
  );
};

const GraphComponent: React.FC<GraphComponentProps> = ({ treeData }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [removedNodes, setRemovedNodes] = useState<Node[]>([]);
  const prevTreeData = useRef<TreeNode | null>(null);

  // Compare previous and current treeData to detect added and removed nodes
  const detectChanges = (prev: TreeNode | null, current: TreeNode) => {
    const prevNodeIds = new Set<string>();
    const currentNodeIds = new Set<string>();

    // Helper to recursively collect node ids
    const collectNodeIds = (node: TreeNode, nodeIds: Set<string>) => {
      nodeIds.add(node.name);
      if (node.children) {
        node.children.forEach((child) => collectNodeIds(child, nodeIds));
      }
    };

    if (prev) collectNodeIds(prev, prevNodeIds);
    collectNodeIds(current, currentNodeIds);

    const added = Array.from(currentNodeIds).filter((id) => !prevNodeIds.has(id));
    const removed = Array.from(prevNodeIds).filter((id) => !currentNodeIds.has(id));

    return { added, removed };
  };

  useEffect(() => {
    const { nodes: newGraphNodes, edges: newGraphEdges } = buildGraphData(treeData);
    const { layoutedNodes, layoutedEdges } = getLayoutedElements(newGraphNodes, newGraphEdges);

    // Detect changes
    const changes = detectChanges(prevTreeData.current, treeData);

    // Filter out removed nodes and start their animation
    const remainingNodes = layoutedNodes.filter((node) => !changes.removed.includes(node.id));

    // Set nodes with new ones being animated
    setNodes((prevNodes) => [
      ...remainingNodes,
      ...(changes.added
        .map((addedNodeId) => {
          const newNode = layoutedNodes.find((node) => node.id === addedNodeId);
          return newNode ? { ...newNode, data: { label: <AnimatedNode node={newNode} isNew={true} /> } } : null;
        })
        .filter(Boolean) as Node[]),
    ]);

    // Store removed nodes for animating out
    const removedNodesData = nodes.filter((node) => changes.removed.includes(node.id));
    setRemovedNodes(removedNodesData);

    setEdges(layoutedEdges);

    prevTreeData.current = treeData;
  }, [treeData]);

  // Handle node removal after animation
  const handleRemoveNode = (id: string) => {
    setRemovedNodes((prev) => prev.filter((node) => node.id !== id));
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <ReactFlow
        nodes={[
          ...nodes.map((node) => ({
            ...node,
            data: { label: <AnimatedNode node={node} isNew={false} /> },
          })),
          ...removedNodes.map((node) => ({
            ...node,
            data: {
              label: (
                <AnimatedNode node={node} isNew={false} isRemoved={true} onRemove={() => handleRemoveNode(node.id)} />
              ),
            },
          })),
        ]}
        edges={edges}
        fitView
        style={{ backgroundColor: "#fafafa" }}
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default GraphComponent;
