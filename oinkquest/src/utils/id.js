// Identificador único local (tempo + aleatório). Evita colisões de Date.now() em registros rápidos.
export function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
