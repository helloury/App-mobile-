import FormConfiguracao from '../components/FormConfiguracao';

// Primeira abertura do app: só aparece uma vez.
export default function Onboarding() {
  return <FormConfiguracao modo="inicio" />;
}
