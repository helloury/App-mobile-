import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { gastosStore } from '../../store/gastosStore';

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Dados trazidos do Onboarding
  const salarioRecebido = parseFloat(params.salario || '0');
  const moradiaRecebida = parseFloat(params.moradia || '0');
  const contasRecebidas = parseFloat(params.contas || '0');
  const streamingsRecebido = parseFloat(params.streamings || '0');
  const tetoLivreRecebido = parseFloat(params.tetoLivre || '0');
  const diaCiclo = params.diaVirada || '1';


const tetoInicial = parseFloat(params.tetoLivre || '0');
const [limiteMensal] = useState(tetoInicial);

  const [gastos, setGastos] = useState(gastosStore.obterGastos());
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  useEffect(() => {
    const desinscrever = gastosStore.inscrever((novaLista) => {
      setGastos(novaLista);
    });
    return () => desinscrever();
  }, []);

  // Total gasto baseado somente nas entradas reais
  const totalGasto = gastos.reduce((acc, curr) => acc + curr.valor, 0);
  const dinheiroDisponivel = Math.max(0, limiteMensal - totalGasto);

  // Barra de consumo: cheia no início e vai esvaziando conforme gasta
  const porcentagemDisponivel = limiteMensal > 0
    ? Math.max(0, Math.min(100, (dinheiroDisponivel / limiteMensal) * 100))
    : 0;

  const corBarra = porcentagemDisponivel > 40 ? '#20C997' : porcentagemDisponivel > 15 ? '#FFC107' : '#DC3545';

  // Categorias base com contagem zerada inicial
  const categoriasBase = ['Alimentação', 'Transporte', 'Lazer', 'Contas'];
  const categoriasCalculadas = categoriasBase.map((catNome, index) => {
    const totalCat = gastos
      .filter((g) => g.categoria.toLowerCase() === catNome.toLowerCase())
      .reduce((acc, curr) => acc + curr.valor, 0);

    return {
      id: String(index + 1),
      nome: catNome,
      gastoTotal: totalCat,
    };
  });

  // Filtragem dos registros da tela
  const gastosExibidos = categoriaSelecionada
    ? gastos.filter((g) => g.categoria.toLowerCase() === categoriaSelecionada.toLowerCase())
    : gastos;

  function abrirAnaliseMeses() {
    Alert.alert(
      'Análise do Ciclo',
      `Consumo Atual: R$ ${totalGasto.toFixed(2)} do teto de R$ ${limiteMensal.toFixed(2)}.\nO ciclo reinicia todo dia ${diaCiclo}.`
    );
  }

  function confirmarExclusao(item) {
    Alert.alert(
      'Excluir Registro',
      `Deseja remover "${item.titulo}" no valor de R$ ${item.valor.toFixed(2)}?`,
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
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Dinheiro Disponível e Teto */}
        <View style={styles.cardUnificado}>
          <View style={styles.cabecalhoValores}>
            <View>
              <Text style={styles.labelSaldo}>Dinheiro Disponível</Text>
              <Text style={[styles.valorDisponivel, { color: corBarra }]}>
                R$ {dinheiroDisponivel.toFixed(2)}
              </Text>
            </View>
            <View style={styles.blocoLimite}>
              <Text style={styles.labelLimite}>Teto Mensal</Text>
              <Text style={styles.valorLimite}>R$ {limiteMensal.toFixed(2)}</Text>
            </View>
          </View>

          {/* Barra de Consumo Dinâmica */}
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
              {porcentagemDisponivel.toFixed(0)}% restante do orçamento
            </Text>
            <Text style={styles.textoGastoTotal}>Total Gasto: R$ {totalGasto.toFixed(2)}</Text>
          </View>

          {/* Botão de Análise de Meses */}
          <TouchableOpacity
            style={styles.botaoAnalise}
            onPress={abrirAnaliseMeses}
            activeOpacity={0.8}
          >
            <Text style={styles.iconeAnalise}>📈</Text>
            <Text style={styles.textoBotaoAnalise}>Análise dos Outros Meses vs Teto</Text>
          </TouchableOpacity>
        </View>

        {/* Resumo Base do Onboarding */}
        <View style={styles.cardParametros}>
          <Text style={styles.tituloParametros}>Resumo Base do Ciclo (Dia {diaCiclo})</Text>
          <View style={styles.gradeParametros}>
            <View style={styles.itemParametro}>
              <Text style={styles.rotuloParametro}>Salário Base</Text>
              <Text style={styles.dadoParametro}>R$ {salarioRecebido.toFixed(2)}</Text>
            </View>
            <View style={styles.itemParametro}>
              <Text style={styles.rotuloParametro}>Moradia</Text>
              <Text style={styles.dadoParametro}>R$ {moradiaRecebida.toFixed(2)}</Text>
            </View>
            <View style={styles.itemParametro}>
              <Text style={styles.rotuloParametro}>Contas</Text>
              <Text style={styles.dadoParametro}>R$ {contasRecebidas.toFixed(2)}</Text>
            </View>
            <View style={styles.itemParametro}>
              <Text style={styles.rotuloParametro}>Assinaturas</Text>
              <Text style={styles.dadoParametro}>R$ {streamingsRecebido.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Categorias e Respectivos Gastos */}
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
            const estaAtiva = categoriaSelecionada === cat.nome;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.cardCategoria, estaAtiva && styles.cardCategoriaAtivo]}
                onPress={() => setCategoriaSelecionada(estaAtiva ? null : cat.nome)}
                activeOpacity={0.7}
              >
                <Text style={[styles.nomeCategoria, estaAtiva && styles.textoBranco]}>
                  {cat.nome}
                </Text>
                <Text style={[styles.valorCategoria, estaAtiva && styles.textoBranco]}>
                  R$ {cat.gastoTotal.toFixed(2)}
                </Text>
                <Text style={[styles.dicaCategoria, estaAtiva && styles.textoBrancoTransparente]}>
                  {estaAtiva ? 'Filtrado ✓' : 'Toque p/ ver'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Registros Recentes */}
        <Text style={styles.tituloSecao}>
          {categoriaSelecionada
            ? `Registros em "${categoriaSelecionada}"`
            : 'Registros Recentes'}
        </Text>

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
      onLongPress={() => confirmarExclusao(item)}
      delayLongPress={400}
    >
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.tituloGasto} numberOfLines={1}>
          {item.titulo}
        </Text>
        <View style={styles.badgeCategoria}>
          <Text style={styles.textoBadge}>{item.categoria}</Text>
        </View>
      </View>
      <View style={styles.colunaPreco}>
        <Text style={styles.valorGasto}>- R$ {item.valor.toFixed(2)}</Text>
        <Text style={styles.dataGasto}>{item.data}</Text>
      </View>
    </TouchableOpacity>
        ))
        )}
      </ScrollView>
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
  },
  labelLimite: {
    fontSize: 12,
    color: '#ADB5BD',
  },
  valorLimite: {
    fontSize: 16,
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
    marginBottom: 8,
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
});