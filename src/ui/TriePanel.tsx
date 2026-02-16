import type { TrieGraph, TrieGraphNode } from '../mpt/types';
import type { SimulationStep } from '../mpt/simulator';
import { TrieGraphView } from './trieGraph/TrieGraphView';

interface TriePanelProps {
  graph: TrieGraph;
  activeNodeId?: string;
  changedNodeIds: string[];
  selectedNodeId?: string;
  currentStep?: SimulationStep;
  onSelectNode: (node: TrieGraphNode) => void;
  onSelectNodeId?: (nodeId: string) => void;
  debugMode: boolean;
}

export function TriePanel(props: TriePanelProps) {
  return <TrieGraphView {...props} />;
}
