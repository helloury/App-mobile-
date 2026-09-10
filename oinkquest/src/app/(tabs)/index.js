import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Dashboard() {
  const insets = useSafeAreaInsets();

  // Dados para demonstração (serão substituídos pelo banco local)
  const statusGeral = {
    saldoDisponivel: 750,
    limiteMensal: 1200,
  };

  const categorias = [
    { id: '1', nome: 'Alimentação', gasto: 280, limite: 400 },
    { id: '2', nome: 'Transporte', gasto: 120, limite: 200 },
    { id: '3', nome: 'Lazer', gasto: 50, limite: 150 },
    { id: '4', nome: 'Contas', gasto: 300, limite: 450 },
  ];

  const ultimosGastos = [
    { id: '1', titulo: 'Almoço', categoria: 'Alimentação', valor: 45, data: 'Hoje' },
    { id: '2', titulo: 'Recarga Transporte', categoria: 'Transporte', valor: 20, data: 'Hoje' },
    { id: '3', titulo: 'Cinema', categoria: 'Lazer', valor: 35, data: 'Ontem' },
    { id: '4', titulo: 'Supermercado', categoria: 'Alimentação', valor: 110, data: '03/09' },
  ];

  const valorMaximoGrafico = Math.max(...ultimosGastos.map((g) => g.valor), 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cartão de Resumo e Saldo */}
        <View style={styles.cardResumo}>
          <Text style={styles.labelResumo}>Orçamento Livre do Mês</Text>
          <Text style={styles.valorResumo}>R$ {statusGeral.saldoDisponivel},00</Text>
          <Text style={styles.subResumo}>Teto planejado: R$ {statusGeral.limiteMensal},00</Text>
        </View>

        {/* Carrossel de Categorias */}
        <Text style={styles.tituloSecao}>Progresso por Categoria</Text>
        <View style={styles.carrosselWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categorias.map((cat) => {
              const perc = Math.min((cat.gasto / cat.limite) * 100, 100);
              return (
                <View key={cat.id} style={styles.cardCategoria}>
                  <Text style={styles.nomeCategoria}>{cat.nome}</Text>
                  <Text style={styles.valoresCategoria}>R$ {cat.gasto} / {cat.limite}</Text>
                  <View style={styles.barraFundo}>
                    <View style={[styles.barraPreenchimento, { width: `${perc}%` }]} />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Mini Gráfico Comparativo */}
        <Text style={styles.tituloSecao}>Comparativo dos Últimos Gastos</Text>
        <View style={styles.graficoContainer}>
          {ultimosGastos.map((item) => {
            const alturaPerc = (item.valor / valorMaximoGrafico) * 100;
            return (
              <View key={item.id} style={styles.colunaGrafico}>
                <Text style={styles.valorBarra}>R${item.valor}</Text>
                <View style={styles.trilhoBarra}>
                  <View style={[styles.barraGraficoPreenchida, { height: `${alturaPerc}%` }]} />
                </View>
                <Text style={styles.rotuloBarra} numberOfLines={1}>{item.titulo}</Text>
              </View>
            );
          })}
        </View>

        {/* Histórico Recente de Gastos */}
        <Text style={styles.tituloSecao}>Histórico Recente</Text>
        {ultimosGastos.map((item) => (
          <View key={item.id} style={styles.linhaGasto}>
            <View>
              <Text style={styles.tituloGasto}>{item.titulo}</Text>
              <View style={styles.badgeCategoria}>
                <Text style={styles.textoBadge}>{item.categoria}</Text>
              </View>
            </View>
            <View style={styles.colunaPreco}>
              <Text style={styles.valorGasto}>- R$ {item.valor},00</Text>
              <Text style={styles.dataGasto}>{item.data}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Branco Porcelana limpo
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  cardResumo: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 16,
    elevation: 2,
  },
  labelResumo: {
    fontSize: 13,
    color: '#6C757D',
  },
  valorResumo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginVertical: 4,
  },
  subResumo: {
    fontSize: 12,
    color: '#ADB5BD',
  },
  tituloSecao: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 10,
    marginTop: 4,
  },
  carrosselWrapper: {
    height: 90,
    marginBottom: 16,
  },
  cardCategoria: {
    backgroundColor: '#FFFFFF',
    width: 140,
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    justifyContent: 'center',
    elevation: 1,
  },
  nomeCategoria: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#495057',
  },
  valoresCategoria: {
    fontSize: 11,
    color: '#6C757D',
    marginVertical: 6,
  },
  barraFundo: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barraPreenchimento: {
    height: '100%',
    backgroundColor: '#E83E8C', // Rosa Cerejeira
    borderRadius: 3,
  },
  graficoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 135,
    marginBottom: 16,
    elevation: 1,
  },
  colunaGrafico: {
    alignItems: 'center',
    width: 60,
  },
  valorBarra: {
    fontSize: 10,
    color: '#6C757D',
    marginBottom: 4,
  },
  trilhoBarra: {
    height: 70,
    width: 14,
    backgroundColor: '#F1F3F5',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barraGraficoPreenchida: {
    width: '100%',
    backgroundColor: '#E83E8C',
    borderRadius: 7,
  },
  rotuloBarra: {
    fontSize: 10,
    color: '#495057',
    marginTop: 6,
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
});