import FormConfiguracao from '../components/FormConfiguracao';

// Aberta pelo Painel (toque em "Ciclo atual") para alterar renda, gastos fixos e dia de virada.
export default function Configurar() {
  return <FormConfiguracao modo="editar" />;
}
