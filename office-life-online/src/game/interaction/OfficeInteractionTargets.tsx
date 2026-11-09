import { useCallback } from 'react';
import { InteractionTarget } from './InteractionTarget';

interface OfficeTask {
  id: string;
  title: string;
  description: string;
}

const TASKS: Record<string, OfficeTask> = {
  coffee: {
    id: 'coffee',
    title: 'Pha nước',
    description: 'Đang chuẩn bị cà phê...',
  },
  water: {
    id: 'water',
    title: 'Lấy nước',
    description: 'Đang lấy nước...',
  },
  vending: {
    id: 'vending',
    title: 'Mua đồ',
    description: 'Đang mua đồ...',
  },
  fridge: {
    id: 'fridge',
    title: 'Lấy đồ',
    description: 'Đang lấy đồ từ tủ lạnh...',
  },
  printer: {
    id: 'printer',
    title: 'In tài liệu',
    description: 'Máy in đang xử lý tài liệu...',
  },
};

export function OfficeInteractionTargets() {
  const openTask = useCallback((task: OfficeTask) => {
    window.dispatchEvent(
      new CustomEvent('office-task-open', { detail: task }),
    );
  }, []);

  return (
    <>
      <InteractionTarget
        id="office-coffee-machine"
        label="Pha nước"
        position={[-8.3, 0, -4.35]}
        onInteract={() => openTask(TASKS.coffee)}
        children={null}
      />

      <InteractionTarget
        id="office-water-cooler"
        label="Lấy nước"
        position={[-8.6, 0, -1.55]}
        onInteract={() => openTask(TASKS.water)}
        children={null}
      />

      <InteractionTarget
        id="office-vending-machine"
        label="Mua đồ"
        position={[-7.35, 0, -3.6]}
        onInteract={() => openTask(TASKS.vending)}
        children={null}
      />

      <InteractionTarget
        id="office-fridge"
        label="Lấy đồ"
        position={[-5.7, 0, -4.45]}
        onInteract={() => openTask(TASKS.fridge)}
        children={null}
      />

      <InteractionTarget
        id="office-printer"
        label="In tài liệu"
        position={[8.4, 0, 1.35]}
        onInteract={() => openTask(TASKS.printer)}
        children={null}
      />
    </>
  );
}