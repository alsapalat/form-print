import { useCallback, useRef } from 'react';

export function useDragAndDrop(dispatch, currentPage, snap) {
  const dragRef = useRef(null);

  const handleDragStartNew = useCallback((e, variableName) => {
    dragRef.current = { variable: variableName };
    e.dataTransfer.setData('text/plain', variableName);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const data = dragRef.current;
      dragRef.current = null;
      if (!data) return;

      const overlayRect = e.currentTarget.getBoundingClientRect();
      let x = e.clientX - overlayRect.left;
      let y = e.clientY - overlayRect.top;
      if (snap) ({ x, y } = snap(x, y));
      dispatch({
        type: 'ADD',
        payload: { variable: data.variable, x, y, page: currentPage },
      });
    },
    [dispatch, currentPage, snap],
  );

  return { handleDragStartNew, handleDragOver, handleDrop };
}
