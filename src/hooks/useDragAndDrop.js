import { useCallback } from 'react';

const MIME_NEW = 'application/form-print-new';
const MIME_MOVE = 'application/form-print-move';

export function useDragAndDrop(dispatch, currentPage, snap) {
  const handleDragStartNew = useCallback((e, variableName) => {
    e.dataTransfer.setData(MIME_NEW, variableName);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleDragStartMove = useCallback((e, placementId) => {
    e.dataTransfer.setData(MIME_MOVE, placementId);
    e.dataTransfer.effectAllowed = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData(
      'application/form-print-offset',
      JSON.stringify({ offsetX, offsetY }),
    );
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const overlayRect = e.currentTarget.getBoundingClientRect();

      const newVar = e.dataTransfer.getData(MIME_NEW);
      const moveId = e.dataTransfer.getData(MIME_MOVE);

      if (newVar) {
        let x = e.clientX - overlayRect.left;
        let y = e.clientY - overlayRect.top;
        if (snap) ({ x, y } = snap(x, y));
        dispatch({
          type: 'ADD',
          payload: { variable: newVar, x, y, page: currentPage },
        });
      } else if (moveId) {
        let offsetX = 0;
        let offsetY = 0;
        try {
          const raw = e.dataTransfer.getData('application/form-print-offset');
          if (raw) ({ offsetX, offsetY } = JSON.parse(raw));
        } catch {
          /* ignore */
        }
        let x = e.clientX - overlayRect.left - offsetX;
        let y = e.clientY - overlayRect.top - offsetY;
        if (snap) ({ x, y } = snap(x, y));
        dispatch({
          type: 'MOVE',
          payload: { id: moveId, x, y },
        });
      }
    },
    [dispatch, currentPage, snap],
  );

  return { handleDragStartNew, handleDragStartMove, handleDragOver, handleDrop };
}
