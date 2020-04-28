import * as React from 'react';
import { Graph, Dnd } from '@antv/x6';
import CellMap from '../components/cells';
import { DataItem } from '../data/cells';

export default function patchDnd(
  container: HTMLDivElement | null,
  graph: Graph,
  cellData: DataItem[]
): void {
  if (!container) return;

  (container.childNodes as NodeListOf<HTMLElement>).forEach((node, index) => {
    const itemData = cellData[index];
    const dnd = new Dnd<DataItem>(node, {
      data: itemData,
      getGraph: (): Graph => graph,
      createDragElement: ({ data }): HTMLDivElement => {
        const elem = document.createElement('div');
        if (typeof data === 'undefined') return elem;

        const { width, height, scale } = data.style;
        elem.style.width = `${width * scale}px`;
        elem.style.height = `${height * scale}px`;
        elem.style.border = '1px dashed #000';
        elem.style.cursor = 'move';
        return elem;
      },
      createPreviewElement: ({ data }): HTMLDivElement => {
        const elem = document.createElement('div');
        if (typeof data === 'undefined') return elem;

        const { width, height, scale } = data.style;
        elem.style.width = `${width * scale}px`;
        elem.style.height = `${height * scale}px`;
        elem.style.border = '1px dashed #000';
        elem.style.cursor = 'move';
        return elem;
      },
    });

    dnd.on('dragPrepare', ({ dragElement }) => {
      dragElement.style.margin = '0';
    });

    dnd.on('drop', ({ data, targetPosition }) => {
      if (typeof data === 'undefined') return;

      const { width, height, scale } = data.style;
      const { x, y } = targetPosition;
      const Cell = CellMap[data.type];
      const cell = graph.addNode({
        x,
        y,
        data,
        width: width * scale,
        height: height * scale,
        shape: 'react',
        component: (newData) => {
          if (!cell) return null;
          const { label } = newData.data;
          return <Cell label={label} scale={scale} />;
        },
      });

      graph.unSelectCells(graph.getSelectedCells()).selectCell(cell);
    });
  });
}
