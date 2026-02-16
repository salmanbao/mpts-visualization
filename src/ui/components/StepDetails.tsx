import type { SimulationStep } from '../../mpt/simulator';
import { nibblesToString, shortHex } from '../../mpt/bytes';
import type { FormattedStep } from '../utils/stepFormat';

interface StepDetailsProps {
  step?: SimulationStep;
  formatted?: FormattedStep;
  debugMode: boolean;
  onRevealDbKey?: (key: string) => void;
  onFocusNode?: (nodeId: string) => void;
}

function stepValueSize(step: SimulationStep, key?: string): number | undefined {
  if (!key) {
    return undefined;
  }
  return step.dbEntries.find((entry) => entry.keyHex === key)?.valueSize;
}

export function StepDetails(props: StepDetailsProps) {
  const step = props.step;
  const formatted = props.formatted;
  if (!step || !formatted) {
    return <div className="event-details-empty">No step selected.</div>;
  }

  const remainingPath = step.keyNibbles.length > 0 ? nibblesToString(step.keyNibbles) : '-';
  const dbSize = stepValueSize(step, formatted.dbKey);

  return (
    <div className="event-details">
      <h4>Step Details</h4>
      <p className="event-detail-summary">
        {formatted.index + 1}. {formatted.message}
      </p>

      <div className="event-kv">
        <span>Category</span>
        <span>{formatted.category}</span>
        <span>Badge</span>
        <span>{formatted.badge}</span>
        <span>Consumed</span>
        <span>{step.consumed}</span>
      </div>

      {(formatted.dbAction || formatted.dbKey) && (
        <section className="event-details-section">
          <h5>DB</h5>
          <div className="event-kv">
            <span>Action</span>
            <span>{formatted.dbAction ?? '-'}</span>
            <span>Hash key</span>
            <span className="event-inline">
              <code>{formatted.dbKey ? shortHex(formatted.dbKey, 12) : '-'}</code>
              {formatted.dbKey && (
                <button
                  type="button"
                  className="mini-button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(formatted.dbKey!);
                  }}
                >
                  copy
                </button>
              )}
            </span>
            <span>Value bytes</span>
            <span>{dbSize ?? step.activeNode?.rlpSize ?? '-'}</span>
            <span>Node type</span>
            <span>{formatted.nodeType ?? '-'}</span>
            <span>Cache</span>
            <span>{step.cacheHit ? 'hit' : 'miss/na'}</span>
          </div>
          {formatted.dbKey && (
            <button type="button" className="mini-button" onClick={() => props.onRevealDbKey?.(formatted.dbKey!)}>
              Reveal in DB
            </button>
          )}
        </section>
      )}

      {(formatted.trieNodeId || formatted.nodeType) && (
        <section className="event-details-section">
          <h5>Trie</h5>
          <div className="event-kv">
            <span>Node type</span>
            <span>{formatted.nodeType ?? '-'}</span>
            <span>Node id</span>
            <span>
              <code>{formatted.trieNodeId ? shortHex(formatted.trieNodeId, 12) : '-'}</code>
            </span>
            <span>Remaining path</span>
            <span>
              <code>{remainingPath}</code>
            </span>
            <span>Ref mode</span>
            <span>{step.activeNode?.refKind ?? '-'}</span>
          </div>
          {formatted.trieNodeId && (
            <button type="button" className="mini-button" onClick={() => props.onFocusNode?.(formatted.trieNodeId!)}>
              Focus node
            </button>
          )}
        </section>
      )}

      {props.debugMode && (
        <section className="event-details-section">
          <h5>Raw Step (Debug)</h5>
          <pre className="event-raw-json">{JSON.stringify(step, null, 2)}</pre>
        </section>
      )}
    </div>
  );
}
