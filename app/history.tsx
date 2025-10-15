import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, Text, Searchbar, Chip, useTheme } from 'react-native-paper';
import { useTransactions } from '../context/TransactionContext';
import { Transaction } from '../types';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { TransactionItem } from '../components/TransactionItem';

// Main Transaction History Screen
export default function HistoryScreen() {
  const { transactions } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const theme = useTheme();

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.notes && transaction.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType =
      selectedType === 'all' || transaction.type === selectedType;
    return matchesSearch && matchesType;
  });

  const renderItem = useCallback(
    ({ item, index }: { item: Transaction; index: number }) => (
      <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
        <TransactionItem transaction={item} />
      </Animated.View>
    ),
    [theme.colors.primary, theme.colors.error]
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search transactions"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <View style={styles.filterContainer}>
        <Chip
          selected={selectedType === 'all'}
          onPress={() => setSelectedType('all')}
          style={styles.filterChip}
        >
          All
        </Chip>
        <Chip
          selected={selectedType === 'income'}
          onPress={() => setSelectedType('income')}
          style={styles.filterChip}
        >
          Income
        </Chip>
        <Chip
          selected={selectedType === 'expense'}
          onPress={() => setSelectedType('expense')}
          style={styles.filterChip}
        >
          Expense
        </Chip>
      </View>
      <FlatList
        data={filteredTransactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#a0aec0' }}>
            No transactions found
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e8ff',
  },
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#c7d2fe',
    borderRadius: 14,
    marginHorizontal: 4,
  },
});
