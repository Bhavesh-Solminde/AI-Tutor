import React, { useEffect } from 'react';
import ReactFlow, { Background, Controls, MarkerType, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import TopicNode from './TopicNode';
import TopicPopupCard from './TopicPopupCard';

const nodeTypes = {
  customTopicNode: TopicNode,
};

const getLayoutedElements = (topics, onNodeClick) => {
  const initialNodes = topics.map((topic, index) => ({
    id: topic.id,
    type: 'customTopicNode',
    position: { x: topic.x !== undefined ? topic.x : index * 220 + 50, y: topic.y !== undefined ? topic.y : 150 },
    data: { topic, onClick: onNodeClick },
  }));

  const initialEdges = [];

  const addEdge = (src, tgt) => {
    const isCompletedPath = src.status === 'mastered' && tgt.status !== 'unstarted';
    initialEdges.push({
      id: `edge-${src.id}-${tgt.id}`,
      source: src.id,
      target: tgt.id,
      type: 'smoothstep',
      animated: tgt.status === 'learning' || tgt.status === 'mastered',
      style: {
        stroke: isCompletedPath ? '#10B981' : tgt.status === 'learning' ? '#FBBF24' : '#CBD5E1',
        strokeWidth: 3,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isCompletedPath ? '#10B981' : tgt.status === 'learning' ? '#FBBF24' : '#CBD5E1',
        width: 15,
        height: 15,
      },
    });
  };

  topics.forEach((current, index) => {
    if (current.connectedTo) {
      const next = topics.find(t => t.id === current.connectedTo);
      if (next) {
        addEdge(current, next);
      }
    } else if (index < topics.length - 1 && !current.noSequentialEdge) {
      const next = topics[index + 1];
      addEdge(current, next);
    }
  });

  return { nodes: initialNodes, edges: initialEdges };
};

const RoadmapCanvas = ({ topics, onNodeClick, selectedTopic, onClosePopup, onStartTopic, onQuizTopic }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(topics, onNodeClick);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [topics, onNodeClick, setNodes, setEdges]);

  return (
    <div className="flex-1 min-h-[500px] rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark relative overflow-hidden shadow-inner flex flex-col">
      <div className="flex-grow relative z-0 h-[500px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={1.5}
          zoomOnScroll={false}
          panOnScroll={false}
          zoomOnDoubleClick={false}
          selectNodesOnDrag={false}
          panOnDrag={true}
          nodesDraggable={true}
          className="w-full h-full"
        >
          <Background 
            color="currentColor" 
            className="text-slate-200/50 dark:text-zinc-800/50" 
            gap={20} 
            size={1} 
          />
          <Controls 
            showInteractive={false} 
            className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark text-slate-800 dark:text-white rounded-lg shadow-md"
          />
        </ReactFlow>
      </div>

      {/* Popup details card */}
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

export default RoadmapCanvas;
