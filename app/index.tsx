import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, Button } from 'react-native-paper';
import { useTransactions } from '../context/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { TransactionItem } from '../components/TransactionItem';

export default function HomeScreen() {
  const { transactions } = useTransactions();
  const theme = useTheme();

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Currency formatter for INR
  const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <ScrollView style={styles.container}>
      <Animated.View entering={FadeInUp.delay(200).duration(1000)}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={[styles.balanceAmount, { color: theme.colors.primary }]}>
              {formatINR(balance)}
            </Text>
          </Card.Content>
        </Card>
      </Animated.View>

      <View style={styles.summaryContainer}>
        <Animated.View style={styles.summaryCard} entering={FadeInUp.delay(400).duration(1000)}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="arrow-up-circle" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryAmount, { color: theme.colors.primary }]}>
                {formatINR(totalIncome)}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>
        <Animated.View style={styles.summaryCard} entering={FadeInUp.delay(600).duration(1000)}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="arrow-down-circle" size={24} color={theme.colors.error} />
              </View>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryAmount, { color: theme.colors.error }]}>
                {formatINR(totalExpenses)}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(800).duration(1000)}>
        <Card style={styles.card}>
          <Card.Title title="Recent Transactions" />
          <Card.Content>
            {recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push('/history')}>View All</Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f3e8ff',
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#fffbfe',
    elevation: 0,
    shadowColor: '#bdbdbd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  summaryIconContainer: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
