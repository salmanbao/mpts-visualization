import type { TrieGraph, TrieGraphNode } from '../mpt/types';
import { TrieGraphView } from './trieGraph/TrieGraphView';

interface TriePanelProps {
  graph: TrieGraph;
  activeNodeId?: string;
  changedNodeIds: string[];
  selectedNodeId?: string;
  onSelectNode: (node: TrieGraphNode) => void;
  debugMode: boolean;
}

export function TriePanel(props: TriePanelProps) {
  return <TrieGraphView {...props} />;
}
