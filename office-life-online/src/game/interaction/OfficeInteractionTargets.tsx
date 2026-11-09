import { useCallback } from 'react';
import { InteractionTarget } from './InteractionTarget';

interface OfficeTask {
  id: string;
  title: string;
  description: string;
}

const TASKS: Record<string, OfficeTask> = {
  coffee: { id: 'coffee', title: 'Pha nước', description: 'Đang chuẩn bị cà phê...' },
  water: { id: 'water', title: 'Lấy nước', description: 'Đang lấy nước...' },
  vending: { id: 'vending', title: 'Mua đồ', description: 'Đang mua đồ...' },
  fridge: { id: 'fridge', title: 'Lấy đồ', description: 'Đang lấy đồ từ tủ lạnh...' },
  printer: { id: 'printer', title: 'In tài liệu', description: 'Máy in đang xử lý tài liệu...' },
  meeting: { id: 'meeting', title: 'Tham gia họp', description: 'Đang tham gia cuộc họp...' },
  report: { id: 'report', title: 'Nộp báo cáo', description: 'Đang nộp báo cáo...' },
};

export function OfficeInteractionTargets() {
  const interact = useCallback((taskId: string) => {
    window.dispatchEvent(new CustomEvent('office-task-open', { detail: TASKS[taskId] }));
  }, []);

  return (
    <>
      <InteractionTarget id="office-coffee-machine" label="Pha nước" position={[-8.3, 0, -4.35]} onInteract={() => interact('coffee')} children={null} />
      <InteractionTarget id="office-water-cooler" label="Lấy nước" position={[-8.6, 0, -1.55]} onInteract={() => interact('water')} children={null} />
      <InteractionTarget id="office-vending-machine" label="Mua đồ" position={[-7.35, 0, -3.6]} onInteract={() => interact('vending')} children={null} />
      <InteractionTarget id="office-fridge" label="Lấy đồ" position={[-5.7, 0, -4.45]} onInteract={() => interact('fridge')} children={null} />
      <InteractionTarget id="office-printer" label="In tài liệu" position={[8.4, 0, 1.35]} onInteract={() => interact('printer')} children={null} />
      <InteractionTarget id="office-meeting-table" label="Tham gia họp" position={[6, 0, -4]} onInteract={() => interact('meeting')} children={null} />
      <InteractionTarget id="office-management-desk" label="Nộp báo cáo" position={[6.6, 0, 2.2]} onInteract={() => interact('report')} children={null} />
    </>
  );
}
