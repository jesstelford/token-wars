import { useEffect } from 'react';

export function useKeyboardNav(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const active = document.activeElement as HTMLElement | null;

      if (e.key === 'Escape') {
        const closeBtn = document.querySelector<HTMLElement>('[data-close]');
        closeBtn?.click();
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const focusables = Array.from(
          document.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => el.offsetParent !== null);

        if (focusables.length === 0) return;
        const idx = active ? focusables.indexOf(active) : -1;
        const next = e.key === 'ArrowDown'
          ? focusables[(idx + 1) % focusables.length]
          : focusables[(idx - 1 + focusables.length) % focusables.length];
        next?.focus();
        e.preventDefault();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
