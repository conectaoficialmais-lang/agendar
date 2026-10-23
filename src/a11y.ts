import { useEffect } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

type ClickableProps = {
  role: 'button';
  tabIndex: 0;
  onClick: () => void;
  onKeyDown: (e: ReactKeyboardEvent) => void;
};

/**
 * Torna um elemento não-botão (um <div> clicável) operável por teclado como um
 * botão: foco por Tab e ativação por Enter/Espaço.
 */
export function clickable(onClick: () => void): ClickableProps {
  return {
    role: 'button',
    tabIndex: 0,
    onClick,
    onKeyDown: (e) => {
      // Só ativa quando o foco está no próprio elemento — assim Enter/Espaço em
      // um checkbox/estrela interno não borbulha e dispara a ação do card.
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
  };
}

/** Fecha um overlay/modal com a tecla Esc enquanto ele estiver montado. */
export function useEscape(onClose: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
}
