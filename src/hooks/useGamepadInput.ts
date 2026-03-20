import { useEffect, useRef } from 'react';

export function useGamepadInput(enabled: boolean = true) {
  const rafRef = useRef<number | null>(null);
  const prevButtonsRef = useRef<boolean[]>([]);

  useEffect(() => {
    if (!enabled) return;

    function poll() {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0];

      if (gp) {
        const buttons = gp.buttons.map(b => b.pressed);
        const prev = prevButtonsRef.current;

        function justPressed(index: number) {
          return buttons[index] && !prev[index];
        }

        const focusables = Array.from(
          document.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => el.offsetParent !== null);

        const active = document.activeElement as HTMLElement | null;
        const idx = active ? focusables.indexOf(active) : -1;

        if (justPressed(12)) {
          const next = focusables[(idx - 1 + focusables.length) % focusables.length];
          next?.focus();
        }
        if (justPressed(13)) {
          const next = focusables[(idx + 1) % focusables.length];
          next?.focus();
        }
        if (justPressed(0) || justPressed(2)) {
          active?.click();
        }
        if (justPressed(1)) {
          const closeBtn = document.querySelector<HTMLElement>('[data-close]');
          closeBtn?.click();
        }

        prevButtonsRef.current = buttons;
      }

      rafRef.current = requestAnimationFrame(poll);
    }

    rafRef.current = requestAnimationFrame(poll);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);
}
