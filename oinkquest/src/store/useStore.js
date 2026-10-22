import { useEffect, useState } from 'react';

// Faz o componente re-renderizar sempre que qualquer um dos stores mudar.
// Depois é só ler os dados direto do store durante o render.
export function useStore(...stores) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const cancelar = stores.map((s) => s.inscrever(() => setTick((t) => t + 1)));
    return () => cancelar.forEach((c) => c());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
