import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { useTransactions } from '../context/TransactionContext';
import { Text, SegmentedButtons, useTheme } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';

type ChartType = 'pie' | 'bar' | 'line';

export default function ChartsScreen() {
  const { transactions } = useTransactions();
  const [chartType, setChartType] = useState<ChartType>('pie');
  const theme = useTheme();

  const screenWidth = Dimensions.get('window').width;
  const expensesByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount], index) => ({
      name: category,
      amount,
      color: `hsl(${index * 37}, 70%, 65%)`,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    })
  );

  const barChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
      },
    ],
  };

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
        ],
      },
    ],
  };

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <View style={styles.chartCard}>
            <PieChart
              data={pieChartData}
              width={screenWidth - 48}
              height={240}
              chartConfig={{
                color: (opacity = 1) => `rgba(99, 71, 249, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="20"
              absolute
            />
          </View>
        );
      case 'bar':
        return (
          <View style={styles.chartCard}>
            <BarChart
              data={barChartData}
              width={screenWidth - 48}
              height={240}
              yAxisLabel="₹"
              chartConfig={{
                backgroundGradientFrom: '#f3e8ff',
                backgroundGradientTo: '#f3e8ff',
                color: (opacity = 1) => "#22d3ee",
                labelColor: (opacity = 1) => theme.colors.text,
                propsForBackgroundLines: { stroke: "#e4e4e7" },
              }}
              verticalLabelRotation={22}
            />
          </View>
        );
      case 'line':
        return (
          <View style={styles.chartCard}>
            <LineChart
              data={lineChartData}
              width={screenWidth - 48}
              height={220}
              yAxisLabel="₹"
              chartConfig={{
                backgroundGradientFrom: '#fbc2eb',
                backgroundGradientTo: '#e0e7ff',
                color: (opacity = 1) => "#6347f9",
                labelColor: (opacity = 1) => theme.colors.text,
                propsForDots: {
                  r: '4',
                  stroke: '#6347f9'
                }
              }}
              bezier
            />
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View entering={FadeInUp.delay(150).duration(850)}>
        <Text style={styles.title}>Expense Analytics</Text>
        <SegmentedButtons
          value={chartType}
          onValueChange={(value) => setChartType(value as ChartType)}
          buttons={[
            { value: 'pie', label: 'Pie Chart' },
            { value: 'bar', label: 'Bar Chart' },
            { value: 'line', label: 'Line Chart' },
          ]}
          style={styles.segmentedButtons}
        />
        {renderChart()}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#f3e8ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    color: '#6347f9'
  },
  segmentedButtons: {
    marginBottom: 20,
    marginTop: 10,
  },
  chartCard: {
    borderRadius: 20,
    backgroundColor: '#fffbfe',
    padding: 16,
    shadowColor: '#bb9cf2',
    shadowOpacity: 0.18,
    shadowRadius: 17,
    marginBottom: 24,
  },
});
