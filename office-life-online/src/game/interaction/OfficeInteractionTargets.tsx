import { useCallback } from 'react';
import { InteractionTarget } from './InteractionTarget';

/**
 * Interaction points are positioned near the corresponding GLB objects.
 * These callbacks intentionally contain no gameplay/business logic yet.
 */
export function OfficeInteractionTargets() {
  const handlePlaceholder = useCallback((label: string) => {
    console.info(`[Office Interaction] ${label}: interaction triggered`);
  }, []);

  return (
    <>
      <InteractionTarget
        id="office-coffee-machine"
        label="Lấy cà phê"
        position={[-8.3, 0, -4.35]}
        onInteract={() => handlePlaceholder('Coffee machine')}
        children={null}
      />
      <InteractionTarget
        id="office-water-cooler"
        label="Lấy nước"
        position={[-8.6, 0, -1.55]}
        onInteract={() => handlePlaceholder('Water cooler')}
        children={null}
      />
      <InteractionTarget
        id="office-vending-machine"
        label="Máy bán hàng"
        position={[-7.35, 0, -3.6]}
        onInteract={() => handlePlaceholder('Vending machine')}
        children={null}
      />
      <InteractionTarget
        id="office-fridge"
        label="Mở tủ lạnh"
        position={[-5.7, 0, -4.45]}
        onInteract={() => handlePlaceholder('Fridge')}
        children={null}
      />
      <InteractionTarget
        id="office-printer"
        label="Sử dụng máy in"
        position={[8.4, 0, 1.35]}
        onInteract={() => handlePlaceholder('Printer')}
        children={null}
      />
    </>
  );
}
