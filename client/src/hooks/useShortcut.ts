import { useEffect } from "react";

interface ShortcutConfig {
  keys: string[];
  callback: () => void;
  description?: string;
}

export const useShortcut = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const keyStates: { [key: string]: boolean } = {};
    const activeShortcuts: { [key: string]: boolean } = {};

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      keyStates[key] = true;

      // Check each shortcut
      shortcuts.forEach((shortcut) => {
        const shortcutKey = shortcut.keys.join("+");

        // Check if all keys in the shortcut are pressed
        const allKeysPressed = shortcut.keys.every(
          (k) => keyStates[k.toLowerCase()],
        );

        if (allKeysPressed && !activeShortcuts[shortcutKey]) {
          event.preventDefault();
          activeShortcuts[shortcutKey] = true;
          shortcut.callback();
        }
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      keyStates[key] = false;

      // Reset active shortcuts when any key is released
      shortcuts.forEach((shortcut) => {
        const shortcutKey = shortcut.keys.join("+");

        // Reset the shortcut if any of its keys are no longer pressed
        if (!shortcut.keys.every((k) => keyStates[k.toLowerCase()])) {
          activeShortcuts[shortcutKey] = false;
        }
      });
    };

    // Reset all key states when window loses focus
    const handleBlur = () => {
      Object.keys(keyStates).forEach((key) => {
        keyStates[key] = false;
      });
      Object.keys(activeShortcuts).forEach((key) => {
        activeShortcuts[key] = false;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [shortcuts]);
};

// Hook específico para el shortcut de estadísticas del catálogo
export const useCatalogStatsShortcut = (callback: () => void) => {
  useShortcut([
    {
      keys: ["Shift", "C"],
      callback,
      description: "Mostrar/ocultar estadísticas del catálogo",
    },
  ]);
};

// Hook para el shortcut de búsqueda
export const useSearchShortcut = (callback: () => void) => {
  useShortcut([
    {
      keys: ["Control", "K"],
      callback,
      description: "Abrir búsqueda",
    },
  ]);
};

// Hook para el shortcut de crear producto
export const useCreateShortcut = (callback: () => void) => {
  useShortcut([
    {
      keys: ["Control", "N"],
      callback,
      description: "Crear nuevo producto",
    },
  ]);
};

// Hook para el shortcut de refrescar
export const useRefreshShortcut = (callback: () => void) => {
  useShortcut([
    {
      keys: ["F5"],
      callback,
      description: "Refrescar datos",
    },
  ]);
};
