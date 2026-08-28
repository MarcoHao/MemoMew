import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { db } from '../db';

interface GraphNode {
  id: string;
  name: string;
  type: string;
  description?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
}

const GraphView: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    const data = await db.getGraphData();
    setNodes(data.nodes);
    setLinks(data.links);
  };

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const colorScale = d3.scaleOrdinal<string, string>()
      .domain(['人物', '组织', '地点', '概念', '技术', '事件', '其他'])
      .range(['#e76f51', '#2a9d8f', '#e9c46a', '#f4a261', '#264653', '#e63946', '#a8dadc']);

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id((d: any) => d.id)
        .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.6);

    const linkLabel = svg.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .text((d: any) => d.type)
      .attr('font-size', '10px')
      .attr('fill', '#94a3b8')
      .attr('text-anchor', 'middle');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event: any, d: GraphNode) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: GraphNode) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: GraphNode) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    node.append('circle')
      .attr('r', 20)
      .attr('fill', (d: any) => colorScale(d.type) || '#94a3b8')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('class', 'transition-all duration-200');

    node.append('text')
      .text((d: any) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr('font-size', '11px')
      .attr('fill', '#475569')
      .attr('font-weight', '500');

    node.append('text')
      .text((d: any) => d.type)
      .attr('text-anchor', 'middle')
      .attr('dy', 48)
      .attr('font-size', '9px')
      .attr('fill', '#94a3b8');

    node.on('click', (event: any, d: GraphNode) => {
      setSelectedNode(d);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => (d.source as GraphNode).x!)
        .attr('y1', (d: any) => (d.source as GraphNode).y!)
        .attr('x2', (d: any) => (d.target as GraphNode).x!)
        .attr('y2', (d: any) => (d.target as GraphNode).y!);

      linkLabel
        .attr('x', (d: any) => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr('y', (d: any) => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return (
    <div className="flex-1 flex relative">
      <svg ref={svgRef} className="w-full h-full" style={{ minHeight: 0 }} />

      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-xl p-3 shadow-sm border border-cream-200">
        <h4 className="text-xs font-semibold text-slate-600 mb-2">实体类型</h4>
        <div className="space-y-1">
          {['人物', '组织', '地点', '概念', '技术', '事件'].map(type => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: d3.scaleOrdinal<string, string>()
                .domain(['人物', '组织', '地点', '概念', '技术', '事件', '其他'])
                .range(['#e76f51', '#2a9d8f', '#e9c46a', '#f4a261', '#264653', '#e63946', '#a8dadc'])(type)
              }} />
              <span className="text-xs text-slate-500">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedNode && (
        <div className="absolute top-4 right-4 w-64 bg-white/95 backdrop-blur rounded-xl p-4 shadow-lg border border-cream-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-slate-700">{selectedNode.name}</h3>
            <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <span className="inline-block px-2 py-0.5 bg-cream-100 text-slate-500 text-xs rounded-full mb-2">{selectedNode.type}</span>
          {selectedNode.description && <p className="text-sm text-slate-600 mt-2">{selectedNode.description}</p>}
        </div>
      )}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <div className="text-4xl mb-2">🕸️</div>
            <p className="text-sm">还没有知识图谱数据</p>
            <p className="text-xs mt-1">创建笔记后会自动构建图谱</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphView;
