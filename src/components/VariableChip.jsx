import './VariableChip.css';

export default function VariableChip({ name, onDragStart, onTap }) {
  return (
    <div
      className="variable-chip"
      draggable
      onDragStart={(e) => onDragStart(e, name)}
      onClick={() => onTap?.(name)}
    >
      {`{{${name}}}`}
    </div>
  );
}
