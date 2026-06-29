import React, { useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
  ReactFlowProvider,
} from 'reactflow';
import dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';
import TopicNode from './TopicNode';
import TopicPopupCard from './TopicPopupCard';

// ── Node dimensions (must match the rendered card) ───────────────────────────
const NODE_WIDTH = 208; // w-52 = 208px
const NODE_HEIGHT = 160; // approximate card height

const nodeTypes = { customTopicNode: TopicNode };

// ── Dagre auto-layout ─────────────────────────────────────────────────────────
const getLayoutedElements = (topics, edges, direction = 'LR') => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,    // LR = left-to-right
    nodesep: 60,           // vertical gap between nodes in same rank
    ranksep: 100,          // horizontal gap between ranks
    marginx: 40,
    marginy: 40,
  });

  topics.forEach((t) => {
    g.setNode(t.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((e) => {
    g.setEdge(e.source, e.target);
  });

  dagre.layout(g);

  const layoutedNodes = topics.map((t, index) => {
    const pos = g.node(t.id);
    return {
      id: t.id,
      type: 'customTopicNode',
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: { topic: t, onClick: t._onClick, index },
    };
  });

  return layoutedNodes;
};

// ── Style server-provided edges ───────────────────────────────────────────────
// Replaces the old buildEdges() which created a sequential chain client-side.
// Now we receive real prerequisite edges from the API and just apply visual styling.
const styleEdges = (rawEdges) =>
  (rawEdges || []).map((e) => ({
    id: e.id || `e-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    animated: e.targetStatus === 'learning',
    style: {
      stroke:
        e.sourceStatus === 'mastered' && e.targetStatus !== 'unstarted'
          ? '#10B981'
          : e.targetStatus === 'learning'
            ? '#FBBF24'
            : '#CBD5E1',
      strokeWidth: 2.5,
      strokeDasharray: e.targetStatus === 'unstarted' ? '6 3' : undefined,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
      color:
        e.sourceStatus === 'mastered' && e.targetStatus !== 'unstarted'
          ? '#10B981'
          : e.targetStatus === 'learning'
            ? '#FBBF24'
            : '#CBD5E1',
    },
  }));

// ── Inner component (needs ReactFlowProvider context) ────────────────────────
const RoadmapCanvasInner = ({
  topics,
  serverEdges,       // ← real prerequisite edges from /api/roadmap/:sessionId
  onNodeClick,
  selectedTopic,
  onClosePopup,
  onStartTopic,
  onQuizTopic,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const layout = useCallback(
    (topicList, rawServerEdges) => {
      if (!topicList?.length) {
        setNodes([]);
        setEdges([]);
        return;
      }
      // Attach click handler via a temp field
      const enriched = topicList.map((t) => ({ ...t, _onClick: onNodeClick }));
      // Pass plain {source, target} edges to dagre so layout respects dependencies
      const edgesForDagre = (rawServerEdges || []).map((e) => ({
        source: e.source,
        target: e.target,
      }));
      const styledEdges = styleEdges(rawServerEdges);
      const lnodes = getLayoutedElements(enriched, edgesForDagre);
      setNodes(lnodes);
      setEdges(styledEdges);
      // Fit view after a tick to ensure layout is applied to DOM
      setTimeout(() => fitView({ padding: 0.08, maxZoom: 1.1, duration: 400 }), 50);
    },
    [onNodeClick, setNodes, setEdges, fitView]
  );

  useEffect(() => {
    layout(topics, serverEdges);
  }, [topics, serverEdges, layout]);

  return (
    <div className="flex-1 min-h-[520px] rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark relative overflow-hidden shadow-inner flex flex-col">
      <div className="flex-grow relative z-0 h-[520px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.08, maxZoom: 1.1 }}
          defaultViewport={{ x: 40, y: 40, zoom: 0.9 }}
          minZoom={0.2}
          maxZoom={1.8}
          zoomOnScroll={true}
          panOnScroll={false}
          zoomOnDoubleClick={false}
          selectNodesOnDrag={false}
          panOnDrag={true}
          nodesDraggable={true}
          className="w-full h-full"
          proOptions={{ hideAttribution: true }}
        >
          {/* Subtle dot grid background */}
          <Background
            color="currentColor"
            className="text-slate-200 dark:text-[#333333]"
            gap={24}
            size={1.5}
            style={{ opacity: 0.6 }}
          />

          {/* Controls */}
          <Controls
            showInteractive={false}
            className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark text-[#333333] dark:text-white rounded-xl shadow-md overflow-hidden"
          />

          {/* Mini-map */}
          <MiniMap
            nodeColor={(n) => {
              const s = n.data?.topic?.status;
              return s === 'mastered' ? '#10B981' : s === 'learning' ? '#FBBF24' : '#CBD5E1';
            }}
            maskColor="rgba(0,0,0,0.04)"
            className="rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-md overflow-hidden"
            style={{ bottom: 12, right: 12 }}
          />

          {/* Legend */}
          <Panel position="top-right">
            <div className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-[#EAE8E1]/60 dark:border-slate-700/40 shadow-sm text-[10px] font-semibold text-[#555555]">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /><span>Mastered</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /><span>Active</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" /><span>Locked</span></span>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Topic popup */}
      {selectedTopic && (
        <TopicPopupCard
          topic={selectedTopic}
          onClose={onClosePopup}
          onStart={onStartTopic}
          onQuiz={onQuizTopic}
        />
      )}
    </div>
  );
};

// ── Outer component wraps in ReactFlowProvider ────────────────────────────────
const RoadmapCanvas = (props) => (
  <ReactFlowProvider>
    <RoadmapCanvasInner {...props} />
  </ReactFlowProvider>
);

export default RoadmapCanvas;
