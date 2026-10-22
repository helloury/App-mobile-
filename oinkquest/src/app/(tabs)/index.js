import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gastosStore, somar } from '../../store/gastosStore';
import { categoriasStore } from '../../store/categoriasStore';
import { configStore, calcularResumo } from '../../store/configStore';
import { useStore } from '../../store/useStore';
import { exportarBackup, importarBackup } from '../../store/backup';
import { formatar, paraCentavos, paraTexto } from '../../utils/dinheiro';
import {
  hojeISO,
  cicloContendo,
  cicloAnterior,
  dentroDoCiclo,
  rotuloCiclo,
  rotuloData,
  paraBR,
  deBR,
} from '../../utils/datas';

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  useStore(gastosStore, configStore, categoriasStore);

  const config = configStore.obter();
  const resumo = calcularResumo(config);
  const limiteMensal = resumo.teto;
  const diaCiclo = config.diaVirada;
  const ciclo = cicloContendo(hojeISO(), diaCiclo);

  const [modalTetoVisivel, setModalTetoVisivel] = useState(false);
  const [novoTetoInput, setNovoTetoInput] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  const [gastoEditando, setGastoEditando] = useState(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editValor, setEditValor] = useState('');
  const [editData, setEditData] = useState('');

  const [modalBackupVisivel, setModalBackupVisivel] = useState(false);
  const [textoRestaurar, setTextoRestaurar] = useState('');

  // Só entram nos cálculos os gastos do ciclo atual
  const todosGastos = gastosStore.obterGastos();
  const gastosCiclo = todosGastos.filter((g) => dentroDoCiclo(g.dataGasto, ciclo));
  const totalGasto = somar(gastosCiclo);
  const dinheiroDisponivel = Math.max(0, limiteMensal - totalGasto);

  const porcentagemDisponivel = limiteMensal > 0
    ? Math.max(0, Math.min(100, (dinheiroDisponivel / limiteMensal) * 100))
    : 0;

  const corBarra = limiteMensal === 0
    ? '#CED4DA'
    : porcentagemDisponivel > 40
    ? '#20C997'
    : porcentagemDisponivel > 15
    ? '#FFC107'
    : '#DC3545';

  const categoriasCalculadas = categoriasStore
    .obterCategorias()
    .filter((c) => c.tipo === 'base')
    .map((cat) => ({
      id: cat.id,
      nome: cat.nome,
      gastoTotal: somar(gastosCiclo.filter((g) => g.categoriaId === cat.id)),
    }));

  const gastosExibidos = (categoriaSelecionada
    ? gastosCiclo.filter((g) => g.categoriaId === categoriaSelecionada)
    : gastosCiclo
  )
    .slice()
    .sort((a, b) => b.dataGasto.localeCompare(a.dataGasto) || b.criadoEm - a.criadoEm);

  const nomeFiltro = categoriaSelecionada ? categoriasStore.nomeDe(categoriaSelecionada) : null;

  function salvarNovoTeto() {
    if (!novoTetoInput.trim()) {
      Alert.alert('Aviso', 'Informe um valor de teto válido.');
      return;
    }
    configStore.definirTetoManual(paraCentavos(novoTetoInput));
    setNovoTetoInput('');
    setModalTetoVisivel(false);
  }

  function usarTetoAutomatico() {
    configStore.definirTetoManual(null);
    setNovoTetoInput('');
    setModalTetoVisivel(false);
  }

  function abrirEdicaoGasto(item) {
    setGastoEditando(item);
    setEditTitulo(item.titulo);
    setEditValor(paraTexto(item.valorCentavos));
    setEditData(paraBR(item.dataGasto));
  }

  function salvarEdicaoGasto() {
    const valorCentavos = paraCentavos(editValor);
    if (valorCentavos <= 0) {
      Alert.alert('Aviso', 'Digite um valor maior que zero.');
      return;
    }
    const dataGasto = deBR(editData);
    if (!dataGasto) {
      Alert.alert('Aviso', 'Data inválida. Use o formato dd/mm/aaaa.');
      return;
    }
    gastosStore.atualizarGasto(gastoEditando.id, {
      titulo: editTitulo.trim() || gastoEditando.titulo,
      valorCentavos,
      dataGasto,
    });
    setGastoEditando(null);
  }

  function confirmarExclusao(item) {
    Alert.alert(
      'Excluir Registro',
      `Deseja remover "${item.titulo}" de ${formatar(item.valorCentavos)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => gastosStore.removerGasto(item.id),
        },
      ]
    );
  }

  // Compara os 3 últimos ciclos (incluindo o atual) com o teto
  function abrirAnaliseMeses() {
    let c = ciclo;
    const linhas = [];
    for (let i = 0; i < 3; i += 1) {
      const total = somar(todosGastos.filter((g) => dentroDoCiclo(g.dataGasto, c)));
      const dif = limiteMensal - total;
      linhas.push(
        `${rotuloCiclo(c)}${i === 0 ? ' (atual)' : ''}\nGasto: ${formatar(total)} · ${
          dif >= 0 ? 'sobraram' : 'estourou'
        } ${formatar(Math.abs(dif))}`
      );
      c = cicloAnterior(c, diaCiclo);
    }
    Alert.alert('Análise dos Ciclos', `Teto: ${formatar(limiteMensal)}\n\n${linhas.join('\n\n')}`);
  }

  async function exportar() {
    try {
      await Share.share({ title: 'Backup OinkQuest', message: exportarBackup() });
    } catch (e) {
      Alert.alert('Aviso', 'Não foi possível exportar o backup.');
    }
  }

  function confirmarRestauracao() {
    if (!textoRestaurar.trim()) {
      Alert.alert('Aviso', 'Cole aqui o texto do backup.');
      return;
    }
    Alert.alert(
      'Restaurar backup',
      'Isso substitui todos os dados atuais pelos do backup. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            const r = await importarBackup(textoRestaurar);
            if (r.ok) {
              setTextoRestaurar('');
              setModalBackupVisivel(false);
              Alert.alert('Pronto', 'Backup restaurado com sucesso.');
            } else {
              Alert.alert('Aviso', r.erro);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Card do Orçamento Livre */}
        <View style={styles.cardUnificado}>
          <View style={styles.cabecalhoValores}>
            <View>
              <Text style={styles.labelSaldo}>Dinheiro Disponível</Text>
              <Text style={[styles.valorDisponivel, { color: corBarra }]}>
                {formatar(dinheiroDisponivel)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.blocoLimite}
              onPress={() => setModalTetoVisivel(true)}
              activeOpacity={0.7}
            >
              <View style={styles.linhaRotuloEditar}>
                <Text style={styles.labelLimite}>Teto Mensal</Text>
                <Text style={styles.iconeEditar}> ✏️</Text>
              </View>
              <Text style={styles.valorLimite}>{formatar(limiteMensal)}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.trilhoBarra}>
            <View
              style={[
                styles.preenchimentoBarra,
                { width: `${porcentagemDisponivel}%`, backgroundColor: corBarra },
              ]}
            />
          </View>

          <View style={styles.infoBarra}>
            <Text style={styles.textoPorcentagem}>
              {limiteMensal > 0
                ? `${porcentagemDisponivel.toFixed(0)}% restante do orçamento`
                : 'Nenhum teto configurado'}
            </Text>
            <Text style={styles.textoGastoTotal}>Total Gasto: {formatar(totalGasto)}</Text>
          </View>

          {limiteMensal === 0 ? (
            <TouchableOpacity
              style={styles.botaoDefinirTeto}
              onPress={() => setModalTetoVisivel(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.textoBotaoDefinirTeto}>+ Definir Teto do Mês</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.botaoAnalise}
              onPress={abrirAnaliseMeses}
              activeOpacity={0.8}
            >
              <Text style={styles.iconeAnalise}>📈</Text>
              <Text style={styles.textoBotaoAnalise}>Análise dos Outros Meses vs Teto</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Resumo do Ciclo */}
        <View style={styles.cardParametros}>
          <Text style={styles.tituloParametros}>
            Ciclo atual: {rotuloCiclo(ciclo)} (vira dia {diaCiclo})
          </Text>
          <View style={styles.gradeParametros}>
            <View style={styles.itemParametro}>
              <Text style={styles.rotuloParametro}>Salário Base</Text>
              <Text style={styles.dadoParametro}>{formatar(config.salarioCentavos)}</Text>
            </View>
            <View style={styles.itemParametro}>
              <Text style={styles.rotuloParametro}>Moradia</Text>
              <Text style={styles.dadoParametro}>{formatar(resumo.moradia)}</Text>
            </View>
            <View style={styles.itemParametro}>
              <Text style={styles.rotuloParametro}>Contas</Text>
              <Text style={styles.dadoParametro}>{formatar(resumo.contas)}</Text>
            </View>
            <View style={styles.itemParametro}>
              <Text style={styles.rotuloParametro}>Assinaturas</Text>
              <Text style={styles.dadoParametro}>{formatar(resumo.streamings)}</Text>
            </View>
          </View>
        </View>

        {/* Categorias de Gastos */}
        <View style={styles.secaoTituloLinha}>
          <Text style={styles.tituloSecao}>Categorias de Gastos</Text>
          {categoriaSelecionada && (
            <TouchableOpacity onPress={() => setCategoriaSelecionada(null)}>
              <Text style={styles.btnLimparFiltro}>Ver Todos</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.gradeCategorias}>
          {categoriasCalculadas.map((cat) => {
            const estaAtiva = categoriaSelecionada === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.cardCategoria, estaAtiva && styles.cardCategoriaAtivo]}
                onPress={() => setCategoriaSelecionada(estaAtiva ? null : cat.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.nomeCategoria, estaAtiva && styles.textoBranco]}>
                  {cat.nome}
                </Text>
                <Text style={[styles.valorCategoria, estaAtiva && styles.textoBranco]}>
                  {formatar(cat.gastoTotal)}
                </Text>
                <Text style={[styles.dicaCategoria, estaAtiva && styles.textoBrancoTransparente]}>
                  {estaAtiva ? 'Filtrado ✓' : 'Toque p/ ver'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Histórico do ciclo */}
        <View style={styles.secaoTituloLinha}>
          <Text style={styles.tituloSecao}>
            {nomeFiltro ? `Registros em "${nomeFiltro}"` : 'Registros do Ciclo'}
          </Text>
          {gastosExibidos.length > 0 && (
            <Text style={styles.dicaExcluir}>Toque para editar · Segure para excluir</Text>
          )}
        </View>

        {gastosExibidos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.textoVazio}>Nenhum registro encontrado.</Text>
            <Text style={styles.subtextoVazio}>
              Use a aba "Registrar" para adicionar gastos reais.
            </Text>
          </View>
        ) : (
          gastosExibidos.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.linhaGasto}
              activeOpacity={0.7}
              onPress={() => abrirEdicaoGasto(item)}
              onLongPress={() => confirmarExclusao(item)}
              delayLongPress={350}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.tituloGasto} numberOfLines={1}>
                  {item.titulo}
                </Text>
                <View style={styles.badgeCategoria}>
                  <Text style={styles.textoBadge}>{categoriasStore.nomeDe(item.categoriaId)}</Text>
                </View>
              </View>
              <View style={styles.colunaPreco}>
                <Text style={styles.valorGasto}>- {formatar(item.valorCentavos)}</Text>
                <Text style={styles.dataGasto}>{rotuloData(item.dataGasto)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Backup dos dados */}
        <View style={styles.cardBackup}>
          <Text style={styles.tituloBackup}>Backup dos dados</Text>
          <Text style={styles.descBackup}>
            Seus dados ficam só neste aparelho. Exporte uma cópia para não perdê-los.
          </Text>
          <View style={styles.linhaBackup}>
            <TouchableOpacity style={styles.botaoBackup} onPress={exportar} activeOpacity={0.8}>
              <Text style={styles.textoBotaoBackup}>Exportar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botaoBackup}
              onPress={() => setModalBackupVisivel(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.textoBotaoBackup}>Restaurar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal para Restaurar Backup */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalBackupVisivel}
        onRequestClose={() => setModalBackupVisivel(false)}
      >
        <View style={styles.fundoModal}>
          <View style={styles.conteudoModal}>
            <Text style={styles.tituloModal}>Restaurar Backup</Text>
            <Text style={styles.subtituloModal}>
              Cole abaixo o texto exportado anteriormente. Os dados atuais serão substituídos.
            </Text>
            <TextInput
              style={styles.inputRestaurar}
              placeholder="Cole o backup aqui..."
              placeholderTextColor="#ADB5BD"
              multiline
              value={textoRestaurar}
              onChangeText={setTextoRestaurar}
            />
            <View style={styles.acoesModal}>
              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoCancelarModal]}
                onPress={() => setModalBackupVisivel(false)}
              >
                <Text style={styles.textoBotaoCancelarModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoSalvarModal]}
                onPress={confirmarRestauracao}
              >
                <Text style={styles.textoBotaoSalvarModal}>Restaurar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Editar Registro */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={gastoEditando !== null}
        onRequestClose={() => setGastoEditando(null)}
      >
        <View style={styles.fundoModal}>
          <View style={styles.conteudoModal}>
            <Text style={styles.tituloModal}>Editar Registro</Text>
            <Text style={styles.subtituloModal}>Altere a descrição, o valor ou a data do gasto.</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Descrição"
              placeholderTextColor="#ADB5BD"
              value={editTitulo}
              onChangeText={setEditTitulo}
              maxLength={35}
            />
            <TextInput
              style={styles.inputModal}
              placeholder="R$ 0,00"
              placeholderTextColor="#ADB5BD"
              keyboardType="numeric"
              value={editValor}
              onChangeText={setEditValor}
            />
            <TextInput
              style={styles.inputModal}
              placeholder="dd/mm/aaaa"
              placeholderTextColor="#ADB5BD"
              value={editData}
              onChangeText={setEditData}
              maxLength={10}
            />
            <View style={styles.acoesModal}>
              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoCancelarModal]}
                onPress={() => setGastoEditando(null)}
              >
                <Text style={styles.textoBotaoCancelarModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoSalvarModal]}
                onPress={salvarEdicaoGasto}
              >
                <Text style={styles.textoBotaoSalvarModal}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Ajuste do Teto */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalTetoVisivel}
        onRequestClose={() => setModalTetoVisivel(false)}
      >
        <View style={styles.fundoModal}>
          <View style={styles.conteudoModal}>
            <Text style={styles.tituloModal}>Definir Teto Mensal</Text>
            <Text style={styles.subtituloModal}>
              Insira o limite total livre que você pretende gastar neste ciclo.
              {'\n'}Cálculo automático (renda − gastos fixos): {formatar(resumo.tetoCalculado)}
            </Text>

            <TextInput
              style={styles.inputModal}
              placeholder="R$ 0,00"
              placeholderTextColor="#ADB5BD"
              keyboardType="numeric"
              value={novoTetoInput}
              onChangeText={setNovoTetoInput}
              autoFocus={true}
            />

            {resumo.tetoManual && (
              <TouchableOpacity onPress={usarTetoAutomatico}>
                <Text style={styles.linkAutomatico}>Voltar ao teto automático</Text>
              </TouchableOpacity>
            )}

            <View style={styles.acoesModal}>
              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoCancelarModal]}
                onPress={() => setModalTetoVisivel(false)}
              >
                <Text style={styles.textoBotaoCancelarModal}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoSalvarModal]}
                onPress={salvarNovoTeto}
              >
                <Text style={styles.textoBotaoSalvarModal}>Salvar Teto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  cardUnificado: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cabecalhoValores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labelSaldo: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '600',
  },
  valorDisponivel: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 2,
  },
  blocoLimite: {
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  linhaRotuloEditar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelLimite: {
    fontSize: 11,
    color: '#ADB5BD',
  },
  iconeEditar: {
    fontSize: 10,
  },
  valorLimite: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 2,
  },
  trilhoBarra: {
    height: 12,
    backgroundColor: '#E9ECEF',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 14,
  },
  preenchimentoBarra: {
    height: '100%',
    borderRadius: 6,
  },
  infoBarra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },
  textoPorcentagem: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6C757D',
  },
  textoGastoTotal: {
    fontSize: 11,
    color: '#ADB5BD',
  },
  botaoDefinirTeto: {
    backgroundColor: '#E83E8C',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoDefinirTeto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  botaoAnalise: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#FFD6E5',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 8,
  },
  iconeAnalise: {
    fontSize: 14,
  },
  textoBotaoAnalise: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E83E8C',
  },
  cardParametros: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 1,
  },
  tituloParametros: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C757D',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  gradeParametros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemParametro: {
    alignItems: 'center',
  },
  rotuloParametro: {
    fontSize: 10,
    color: '#ADB5BD',
  },
  dadoParametro: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 2,
  },
  secaoTituloLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tituloSecao: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#343A40',
  },
  dicaExcluir: {
    fontSize: 10,
    color: '#ADB5BD',
  },
  btnLimparFiltro: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E83E8C',
  },
  gradeCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  cardCategoria: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    elevation: 1,
  },
  cardCategoriaAtivo: {
    backgroundColor: '#E83E8C',
  },
  nomeCategoria: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#495057',
  },
  valorCategoria: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212529',
    marginVertical: 4,
  },
  dicaCategoria: {
    fontSize: 10,
    color: '#ADB5BD',
  },
  textoBranco: {
    color: '#FFFFFF',
  },
  textoBrancoTransparente: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  linhaGasto: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
  },
  tituloGasto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  badgeCategoria: {
    backgroundColor: '#FFF0F5',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  textoBadge: {
    fontSize: 11,
    color: '#E83E8C',
    fontWeight: 'bold',
  },
  colunaPreco: {
    alignItems: 'flex-end',
  },
  valorGasto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC3545',
  },
  dataGasto: {
    fontSize: 11,
    color: '#ADB5BD',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginVertical: 6,
  },
  textoVazio: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C757D',
  },
  subtextoVazio: {
    fontSize: 11,
    color: '#ADB5BD',
    marginTop: 4,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  conteudoModal: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  tituloModal: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtituloModal: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
    marginBottom: 16,
  },
  inputModal: {
    height: 48,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E83E8C',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  acoesModal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  botaoModal: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  botaoCancelarModal: {
    backgroundColor: '#F1F3F5',
  },
  textoBotaoCancelarModal: {
    color: '#6C757D',
    fontWeight: '600',
  },
  botaoSalvarModal: {
    backgroundColor: '#E83E8C',
  },
  textoBotaoSalvarModal: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardBackup: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginTop: 10, elevation: 1 },
  tituloBackup: { fontSize: 13, fontWeight: 'bold', color: '#343A40' },
  descBackup: { fontSize: 11, color: '#6C757D', marginTop: 4, marginBottom: 10 },
  linhaBackup: { flexDirection: 'row', gap: 8 },
  botaoBackup: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#FFD6E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotaoBackup: { fontSize: 12, fontWeight: 'bold', color: '#E83E8C' },
  inputRestaurar: {
    height: 140,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    padding: 12,
    fontSize: 12,
    color: '#212529',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  linkAutomatico: { fontSize: 12, fontWeight: '600', color: '#E83E8C', marginBottom: 12 },
});
