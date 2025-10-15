import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// This component should be placed at app/add.tsx or app/add/index.tsx
export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Formatted amount (shows as ₹12,345.00 if amount is entered)
  const formattedAmount =
    amount && !isNaN(Number(amount))
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount))
      : '';

  // Correctly typed callback for the DateTimePicker
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleAddExpense = () => {
    // Save expense logic here (with amount, description, date)
    // Example:
    // addExpense({ amount: Number(amount), description, date });
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        label="Amount (₹)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ marginBottom: 8 }}
      />
      {/* Show formatted rupees value if any */}
      {formattedAmount ? (
        <Text style={{ color: '#6347f9', fontWeight: 'bold', marginBottom: 12 }}>
          {formattedAmount}
        </Text>
      ) : null}
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        style={{ marginBottom: 16 }}
      />
      <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={{ marginBottom: 16 }}>
        Pick Date: {date.toDateString()}
      </Button>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <Button mode="contained" onPress={handleAddExpense}>
        Add Expense
      </Button>
    </View>
  );
}
