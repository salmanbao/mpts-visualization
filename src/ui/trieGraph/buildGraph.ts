import type { TrieGraph, TrieGraphEdge, TrieGraphNode } from '../../mpt/types';

export const TRIE_NODE_WIDTH = 226;
export const TRIE_NODE_HEIGHT = 108;

export interface TrieRenderNode {
  id: string;
  source: TrieGraphNode;
  width: number;
  height: number;
  title: string;
  summary: string;
  detail: string;
  meta: string;
  tooltip: string;
}

export interface TrieRenderEdge {
  id: string;
  source: string;
  target: string;
  refKind: TrieGraphEdge['refKind'];
  label: string;
}

export interface TrieRenderGraph {
  nodes: TrieRenderNode[];
  edges: TrieRenderEdge[];
  rootId?: string;
  signature: string;
}

function shortenMiddle(value: string, head: number, tail: number): string {
  if (value.length <= head + tail + 3) {
    return value;
  }
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

function shortNodeId(id: string): string {
  if (id.startsWith('0x')) {
    return shortenMiddle(id, 8, 6);
  }
  if (id.startsWith('embedded:')) {
    return shortenMiddle(id.replace('embedded:', 'emb:'), 10, 6);
  }
  return shortenMiddle(id, 10, 6);
}

function formatBranchSummary(node: TrieGraphNode): string {
  const indexes = (node.inspection.branchChildren ?? []).map((child) => child.index.toString(16));
  if (indexes.length === 0) {
    return 'children [none]';
  }
  const visible = indexes.slice(0, 6);
  const suffix = indexes.length > visible.length ? `,+${indexes.length - visible.length}` : '';
  return `children [${visible.join(',')}${suffix}]`;
}

function formatPathSummary(node: TrieGraphNode): string {
  const path = node.inspection.compactPath ?? '';
  if (!path) {
    return 'path (empty)';
  }
  return `path ${shortenMiddle(path, 12, 4)}`;
}

function sanitizeEdgeLabel(edge: TrieGraphEdge): string {
  const normalized = edge.label.replaceAll('â€¢', '|').replaceAll('•', '|');
  if (normalized.trim().length > 0) {
    return normalized;
  }
  return edge.refKind;
}

function buildTooltip(node: TrieGraphNode): string {
  const lines: string[] = [];
  lines.push(`type: ${node.type}`);
  lines.push(`id: ${node.id}`);
  lines.push(`ref: ${node.refKind}`);
  if (node.inspection.hashHex) {
    lines.push(`hash: ${node.inspection.hashHex}`);
  }
  if (node.inspection.compactPath) {
    lines.push(`path: ${node.inspection.compactPath}`);
  }
  if (node.inspection.valueHex) {
    lines.push(`value: ${node.inspection.valueHex}`);
  }
  lines.push(`rlpBytes: ${node.inspection.rlpSize}`);
  return lines.join('\n');
}

function buildNode(node: TrieGraphNode): TrieRenderNode {
  const summary = node.type === 'branch' ? formatBranchSummary(node) : formatPathSummary(node);
  const detail = node.detail;
  const metaRef = node.refKind === 'hash-ref' ? 'hash-ref' : 'embedded';
  const metaId = node.hashHex ? shortNodeId(node.hashHex) : shortNodeId(node.id);

  return {
    id: node.id,
    source: node,
    width: TRIE_NODE_WIDTH,
    height: TRIE_NODE_HEIGHT,
    title: `${node.type.toUpperCase()} ${metaId}`,
    summary,
    detail,
    meta: metaRef,
    tooltip: buildTooltip(node),
  };
}

function buildSignature(nodes: TrieRenderNode[], edges: TrieRenderEdge[]): string {
  const nodePart = nodes.map((node) => node.id).sort().join('|');
  const edgePart = edges.map((edge) => `${edge.source}>${edge.target}:${edge.label}`).sort().join('|');
  return `${nodePart}::${edgePart}`;
}

export function buildRenderGraph(graph: TrieGraph): TrieRenderGraph {
  const nodes = graph.nodes.map(buildNode);
  const edges = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    refKind: edge.refKind,
    label: sanitizeEdgeLabel(edge),
  }));
  return {
    nodes,
    edges,
    rootId: graph.rootId,
    signature: buildSignature(nodes, edges),
  };
}
