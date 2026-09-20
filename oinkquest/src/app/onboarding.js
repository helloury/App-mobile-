import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function Onboarding() {
  const insets = useSafeAreaInsets();

  // 1. Configuração de Perfil
  const [salario, setSalario] = useState('');
  const [rendasExtras, setRendasExtras] = useState([]);
  const [mostrarCampoExtra, setMostrarCampoExtra] = useState(false);
  const [valorExtraTemp, setValorExtraTemp] = useState('');

  // 2. Gastos Fixos Pré-Categorizados
  const [gastosFixos, setGastosFixos] = useState({
    moradia: '',
    contas: '',
    streamings: '',
  });

  // 4. Virada do Mês (1 a 31)
  const [diaVirada, setDiaVirada] = useState(1);

  // Auxiliares de Cálculo
  const parseNum = (txt) => {
    if (!txt) return 0;
    const n = parseFloat(String(txt).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  const totalRendas = useMemo(() => {
    const sal = parseNum(salario);
    const extras = rendasExtras.reduce((acc, curr) => acc + curr.valor, 0);
    return sal + extras;
  }, [salario, rendasExtras]);

  const totalGastosFixos = useMemo(() => {
    return (
      parseNum(gastosFixos.moradia) +
      parseNum(gastosFixos.contas) +
      parseNum(gastosFixos.streamings)
    );
  }, [gastosFixos]);

  // Teto automático
  const tetoCalculado = Math.max(0, totalRendas - totalGastosFixos);
  const percComprometido = totalRendas > 0 
    ? Math.min(100, (totalGastosFixos / totalRendas) * 100) 
    : 0;

  function adicionarRendaExtra() {
    const v = parseNum(valorExtraTemp);
    if (v <= 0) {
      Alert.alert('Aviso', 'Digite um valor válido para a renda extra.');
      return;
    }
    setRendasExtras((prev) => [...prev, { id: String(Date.now()), valor: v }]);
    setValorExtraTemp('');
    setMostrarCampoExtra(false);
  }

  function concluir() {
    router.replace({
      pathname: '/',
      params: {
        salario: salario || '0',
        rendaExtraTotal: rendasExtras.reduce((acc, curr) => acc + curr.valor, 0).toString(),
        moradia: gastosFixos.moradia || '0',
        contas: gastosFixos.contas || '0',
        streamings: gastosFixos.streamings || '0',
        tetoLivre: tetoCalculado.toString(),
        diaVirada: diaVirada.toString(),
      },
    });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.iconeHeader}>🐷</Text>
          <Text style={styles.tituloHeader}>Configuração da Jornada</Text>
          <Text style={styles.subtituloHeader}>
            Ajuste seus valores base do mês. Seus dados poderão ser ajustados mais tarde no app.
          </Text>
        </View>

        {/* Configuração de Perfil */}
        <View style={styles.cardSecao}>
          <Text style={styles.tituloPasso}>1. Renda Mensal</Text>
          <Text style={styles.labelCampo}>Salário Principal</Text>
          <View style={styles.inputMonetarioWrapper}>
            <Text style={styles.cifrao}>R$</Text>
            <TextInput
              style={styles.inputMonetario}
              placeholder="0,00"
              placeholderTextColor="#ADB5BD"
              keyboardType="numeric"
              value={salario}
              onChangeText={setSalario}
            />
          </View>

          {/* Rendas Extras */}
          {rendasExtras.map((item, idx) => (
            <View key={item.id} style={styles.linhaExtra}>
              <Text style={styles.textoLinhaExtra}>+ Renda Extra #{idx + 1}</Text>
              <Text style={styles.valorLinhaExtra}>R$ {item.valor.toFixed(2)}</Text>
            </View>
          ))}

          {mostrarCampoExtra ? (
            <View style={styles.formAdicionarExtra}>
              <TextInput
                style={styles.inputPequeno}
                placeholder="Valor (R$)"
                placeholderTextColor="#ADB5BD"
                keyboardType="numeric"
                value={valorExtraTemp}
                onChangeText={setValorExtraTemp}
              />
              <TouchableOpacity style={styles.btnAcaoExtra} onPress={adicionarRendaExtra}>
                <Text style={styles.txtBtnAcaoExtra}>Adicionar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAcaoExtra, styles.btnCancelarExtra]}
                onPress={() => setMostrarCampoExtra(false)}
              >
                <Text style={styles.txtBtnCancelarExtra}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.btnAdicionarExtra}
              onPress={() => setMostrarCampoExtra(true)}
            >
              <Text style={styles.txtBtnAdicionarExtra}>+ Adicionar Renda Extra Fixa</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* PASSO 2: Gastos Fixos e Assinaturas */}
        <View style={styles.cardSecao}>
          <Text style={styles.tituloPasso}>2. Gastos Fixos e Assinaturas</Text>
          <Text style={styles.descSecao}>
            Isole o dinheiro que já começa o mês comprometido:
          </Text>

          <View style={styles.linhaCampoFixo}>
            <Text style={styles.labelFixo}>🏠 Aluguel / Moradia</Text>
            <TextInput
              style={styles.inputFixo}
              placeholder="R$ 0,00"
              placeholderTextColor="#ADB5BD"
              keyboardType="numeric"
              value={gastosFixos.moradia}
              onChangeText={(moradia) =>
                setGastosFixos((prev) => ({ ...prev, moradia }))
              }
            />
          </View>

          <View style={styles.linhaCampoFixo}>
            <Text style={styles.labelFixo}>💡 Contas Básicas (Luz, Água, Net)</Text>
            <TextInput
              style={styles.inputFixo}
              placeholder="R$ 0,00"
              placeholderTextColor="#ADB5BD"
              keyboardType="numeric"
              value={gastosFixos.contas}
              onChangeText={(contas) =>
                setGastosFixos((prev) => ({ ...prev, contas }))
              }
            />
          </View>

          <View style={styles.linhaCampoFixo}>
            <Text style={styles.labelFixo}>📺 Assinaturas de Streaming / Planos</Text>
            <TextInput
              style={styles.inputFixo}
              placeholder="R$ 0,00"
              placeholderTextColor="#ADB5BD"
              keyboardType="numeric"
              value={gastosFixos.streamings}
              onChangeText={(streamings) =>
                setGastosFixos((prev) => ({ ...prev, streamings }))
              }
            />
          </View>
        </View>

        {/* Teto Mensal Livre  */}
        <View style={styles.cardSecao}>
          <Text style={styles.tituloPasso}>3. Teto Mensal Livre</Text>
          <Text style={styles.descSecao}>
            Calculado automaticamente (Renda total - Gastos Fixos):
          </Text>

          {/* Visor Fixo Não Clicável */}
          <View style={styles.visorTetoFixo}>
            <Text style={styles.valorTetoFixo}>R$ {tetoCalculado.toFixed(2)}</Text>
            <Text style={styles.subtextoTeto}>Valor estimado disponível para gastos diários</Text>
          </View>

          {/* Barra de Proporção Livre vs Comprometido */}
          <View style={styles.barraProporcaoTrilho}>
            <View style={[styles.barraComprometida, { width: `${percComprometido}%` }]} />
          </View>
          <View style={styles.legendaProporcao}>
            <Text style={styles.txtLegenda}>Comprometido: R$ {totalGastosFixos.toFixed(2)}</Text>
            <Text style={styles.txtLegenda}>Renda Total: R$ {totalRendas.toFixed(2)}</Text>
          </View>
        </View>

        {/* Virada do Mês */}
        <View style={styles.cardSecao}>
          <Text style={styles.tituloPasso}>4. Virada do Mês (O Ciclo)</Text>
          <Text style={styles.descSecao}>
            Selecione o dia em que o ciclo mensal reinicia:
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carrosselDias}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => {
              const selecionado = diaVirada === dia;
              return (
                <TouchableOpacity
                  key={dia}
                  style={[styles.botaoDia, selecionado && styles.botaoDiaSelecionado]}
                  onPress={() => setDiaVirada(dia)}
                >
                  <Text style={[styles.textoDia, selecionado && styles.textoDiaSelecionado]}>
                    {dia}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={styles.resumoCiclo}>
            O ciclo mensal fechará todo dia <Text style={styles.destaqueDia}>{diaVirada}</Text>.
          </Text>
        </View>

        {/* Botão de Conclusão */}
        <TouchableOpacity style={styles.btnIniciar} activeOpacity={0.8} onPress={concluir}>
          <Text style={styles.txtBtnIniciar}>Começar Jornada</Text>
        </TouchableOpacity>
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
    paddingTop: 8,
  },
  header: {
    alignItems: 'center',
    marginVertical: 14,
  },
  iconeHeader: {
    fontSize: 40,
    marginBottom: 6,
  },
  tituloHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtituloHeader: {
    fontSize: 13,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  cardSecao: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 1,
  },
  tituloPasso: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 4,
  },
  descSecao: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 12,
    lineHeight: 16,
  },
  labelCampo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  inputMonetarioWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  cifrao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C757D',
    marginRight: 6,
  },
  inputMonetario: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  linhaExtra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  textoLinhaExtra: {
    fontSize: 13,
    color: '#6C757D',
  },
  valorLinhaExtra: {
    fontSize: 13,
    fontWeight: '600',
    color: '#20C997',
  },
  btnAdicionarExtra: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  txtBtnAdicionarExtra: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E83E8C',
  },
  formAdicionarExtra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  inputPequeno: {
    flex: 1,
    height: 40,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#212529',
  },
  btnAcaoExtra: {
    backgroundColor: '#E83E8C',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtBtnAcaoExtra: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  btnCancelarExtra: {
    backgroundColor: '#E9ECEF',
  },
  txtBtnCancelarExtra: {
    color: '#6C757D',
    fontWeight: 'bold',
  },
  linhaCampoFixo: {
    marginBottom: 10,
  },
  labelFixo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  inputFixo: {
    height: 44,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#212529',
  },
  // Visor travado (somente leitura)
  visorTetoFixo: {
    backgroundColor: '#FFF0F5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFD6E5',
  },
  valorTetoFixo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#E83E8C',
  },
  subtextoTeto: {
    fontSize: 11,
    color: '#6C757D',
    marginTop: 4,
  },
  barraProporcaoTrilho: {
    height: 8,
    backgroundColor: '#20C997',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  barraComprometida: {
    height: '100%',
    backgroundColor: '#DC3545', 
  },
  legendaProporcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  txtLegenda: {
    fontSize: 11,
    color: '#6C757D',
  },
  carrosselDias: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  botaoDia: {
    width: 40,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  botaoDiaSelecionado: {
    backgroundColor: '#E83E8C',
  },
  textoDia: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  textoDiaSelecionado: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resumoCiclo: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 6,
  },
  destaqueDia: {
    fontWeight: 'bold',
    color: '#212529',
  },
  btnIniciar: {
    backgroundColor: '#E83E8C',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    elevation: 2,
  },
  txtBtnIniciar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});