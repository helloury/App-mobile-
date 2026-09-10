import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Missoes() {
  const insets = useSafeAreaInsets();

  const [tarefas, setTarefas] = useState([
    { id: '1', titulo: 'Dia Sem Delivery', desc: 'Faça refeições em casa hoje.', concluida: false },
    { id: '2', titulo: 'Registrar Todas as Compras', desc: 'Anote cada saída do dia no app.', concluida: true },
    { id: '3', titulo: 'Revisar Assinaturas', desc: 'Verifique se há gastos automáticos esquecidos.', concluida: false },
  ]);

  function alternarMissao(id) {
    setTarefas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t))
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.tituloTela}>Missões do Dia</Text>

        {tarefas.map((item) => (
          <View key={item.id} style={[styles.cardMissao, item.concluida && styles.cardConcluido]}>
            <View style={styles.infoMissao}>
              <Text style={[styles.tituloMissao, item.concluida && styles.textoRiscado]}>
                {item.titulo}
              </Text>
              <Text style={styles.descMissao}>{item.desc}</Text>
            </View>
            <TouchableOpacity
              style={[styles.botaoCheck, item.concluida && styles.botaoCheckAtivo]}
              onPress={() => alternarMissao(item.id)}
            >
              <Text style={styles.textoCheck}>{item.concluida ? '✓' : ''}</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  tituloTela: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginVertical: 14,
  },
  cardMissao: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  cardConcluido: {
    backgroundColor: '#E9ECEF',
    opacity: 0.7,
  },
  infoMissao: {
    flex: 1,
    paddingRight: 10,
  },
  tituloMissao: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  textoRiscado: {
    textDecorationLine: 'line-through',
  },
  descMissao: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  botaoCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CED4DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoCheckAtivo: {
    backgroundColor: '#20C997',
    borderColor: '#20C997',
  },
  textoCheck: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});