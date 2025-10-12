import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, SafeAreaView, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SegmentedControl from '@react-native-segmented-control/segmented-control'; 
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { PieChart } from 'react-native-svg-charts';
import { G, Text as SvgText } from 'react-native-svg';
import Modal from 'react-native-modal'; // NEW IMPORT

// --- IMPORT SCREENS ---
import LoginScreen from './LoginScreen'; 
import WelcomeScreen from './WelcomeScreen'; 

// --- CONFIGURATION & HELPER FUNCTIONS ---

const Stack = createNativeStackNavigator();

const DATE_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric' };

const STORAGE_KEY = '@expense_tracker';
const INCOME_KEY = '@income_tracker'; // NEW KEY for income
const BUDGET_KEY = '@monthly_budget';
const CATEGORY_LIST_KEY = '@user_categories'; 
const INCOME_SOURCES_KEY = '@income_sources'; // NEW KEY for income sources

const FOOD_THRESHOLD_AMOUNT = 30;
const ANOMALY_MULTIPLIER = 3;

const BASE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Other'];
const BASE_INCOME_SOURCES = ['Salary', 'Freelance', 'Investment', 'Other Income'];

let CATEGORY_RULES = {
    'pizza': 'Food', 'burger': 'Food', 'coffee': 'Food', 'mcdonalds': 'Food',
    'gas': 'Travel', 'petrol': 'Travel', 'flight': 'Travel', 'bus': 'Travel',
    'rent': 'Bills', 'electricity': 'Bills', 'internet': 'Bills', 'phone bill': 'Bills',
    'amazon': 'Shopping', 'shirt': 'Shopping', 'shoes': 'Shopping', 'clothing': 'Shopping',
};

// --- ASYNC STORAGE ---
const saveExpenses = async (expenses) => {
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); } 
    catch (e) { console.error("Failed to save expenses:", e); }
};
const loadExpenses = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) { console.error("Failed to load expenses:", e); return []; }
};

const saveIncome = async (income) => {
    try { await AsyncStorage.setItem(INCOME_KEY, JSON.stringify(income)); } 
    catch (e) { console.error("Failed to save income:", e); }
};
const loadIncome = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(INCOME_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) { console.error("Failed to load income:", e); return []; }
};

const saveBudget = async (budget) => {
    try { await AsyncStorage.setItem(BUDGET_KEY, String(budget)); } 
    catch (e) { console.error("Failed to save budget:", e); }
};
const loadBudget = async () => {
    try {
        const value = await AsyncStorage.getItem(BUDGET_KEY);
        return value != null ? parseFloat(value) : 3000;
    } catch (e) { console.error("Failed to load budget:", e); return 3000; }
};

const saveCategories = async (categories) => {
    try {
        await AsyncStorage.setItem(CATEGORY_LIST_KEY, JSON.stringify(categories));
    } catch (e) { console.error("Failed to save categories:", e); }
};
const loadCategories = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(CATEGORY_LIST_KEY);
        const savedCategories = jsonValue != null ? JSON.parse(jsonValue) : [];
        return [...new Set([...BASE_CATEGORIES, ...savedCategories])];
    } catch (e) { console.error("Failed to load categories:", e); return BASE_CATEGORIES; }
};

const saveIncomeSources = async (sources) => {
    try {
        await AsyncStorage.setItem(INCOME_SOURCES_KEY, JSON.stringify(sources));
    } catch (e) { console.error("Failed to save income sources:", e); }
};
const loadIncomeSources = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(INCOME_SOURCES_KEY);
        const savedSources = jsonValue != null ? JSON.parse(jsonValue) : [];
        return [...new Set([...BASE_INCOME_SOURCES, ...savedSources])];
    } catch (e) { return BASE_INCOME_SOURCES; }
};

// --- AUTO-CATEGORIZATION ---
const autoCategorize = (text, amount, currentCategoryList) => {
    if (!text) return currentCategoryList.includes('Other') ? 'Other' : currentCategoryList[0];
    const normalizedText = text.toLowerCase(); 

    for (const keyword in CATEGORY_RULES) {
        if (normalizedText.includes(keyword)) { return CATEGORY_RULES[keyword]; }
    }
    if (amount <= FOOD_THRESHOLD_AMOUNT && currentCategoryList.includes('Food')) {
        return 'Food'; 
    }
    return currentCategoryList.includes('Other') ? 'Other' : currentCategoryList[0]; 
};

// --- CHART UTILITIES ---
const categoryColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#333333', '#C9CBCE'];
let colorIndex = 0;
const getColor = () => {
    const color = categoryColors[colorIndex % categoryColors.length];
    colorIndex++;
    return color;
};

// --- BAR CHART COMPONENT ---
const CategoryBar = ({ category, amount, maxAmount, isIncome = false }) => {
    const barWidth = (amount / maxAmount) * 100;
    const expenseColorMap = { 'Food': '#4CAF50', 'Travel': '#007BFF', 'Shopping': '#FFC107', 'Bills': '#DC3545', 'Other': '#6c757d' };
    const barColor = isIncome ? '#00B894' : expenseColorMap[category] || '#6c757d';

    return (
        <View style={barStyles.barRow}>
            <Text style={barStyles.categoryLabel}>{category}</Text>
            <View style={barStyles.barContainer}>
                <View style={[barStyles.barFill, { width: `${barWidth}%`, backgroundColor: barColor }]} />
            </View>
            <Text style={barStyles.amountLabel}>${amount.toFixed(0)}</Text>
        </View>
    );
};

// --- PIE CHART UTILITY ---
const PieChartLabels = ({ slices, total }) => {
    return slices.map((slice, index) => {
        const { pieCentroid, data } = slice;
        if (data.amount / total < 0.05) return null; // Only show label if > 5%
        return (
            <SvgText
                key={index}
                x={pieCentroid[0]}
                y={pieCentroid[1]}
                fill={'white'}
                textAnchor={'middle'}
                alignmentBaseline={'middle'}
                fontSize={14}
                fontWeight={'bold'}
            >
                {data.key}
            </SvgText>
        )
    });
};


// --- MAIN HOMESCREEN COMPONENT ---
function HomeScreen({ route, navigation }) { 
    const { user } = route.params;

    // INPUT STATES
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Digital');
    const [isRecurring, setIsRecurring] = useState(false);
    const [category, setCategory] = useState('Other');
    const [newCategoryName, setNewCategoryName] = useState(''); 
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [isAddingIncome, setIsAddingIncome] = useState(false); // NEW toggle for income mode

    // INCOME INPUT STATES
    const [incomeSource, setIncomeSource] = useState('Salary');
    const [newIncomeSource, setNewIncomeSource] = useState('');
    const [showIncomeSourceInput, setShowIncomeSourceInput] = useState(false);

    // DATE PICKER STATES
    const [date, setDate] = useState(new Date()); 
    const [showDatePicker, setShowDatePicker] = useState(false); 
    
    // CORE DATA STATES
    const [allExpenses, setAllExpenses] = useState([]); 
    const [allIncome, setAllIncome] = useState([]); // NEW Income state
    const [budget, setBudget] = useState(3000); 
    const [isLoading, setIsLoading] = useState(true); 
    const [userCategories, setUserCategories] = useState(BASE_CATEGORIES);
    const [incomeSources, setIncomeSources] = useState(BASE_INCOME_SOURCES);

    // MODAL STATES
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // FILTER STATE
    const timeFrames = ['30 Days', 'This Month', 'This Year'];
    const [timeFilter, setTimeFilter] = useState(timeFrames[0]);

    // --- EFFECT HOOKS ---
    
    // 1. Load Data on Startup
    useEffect(() => {
        loadBudget().then(data => setBudget(data));
        loadExpenses().then(data => setAllExpenses(data));
        loadIncome().then(data => setAllIncome(data));
        loadCategories().then(data => setUserCategories(data));
        loadIncomeSources().then(data => {
            setIncomeSources(data);
            setIsLoading(false); 
        });
    }, []); 

    // 2. Save Budget when it changes
    useEffect(() => { saveBudget(budget); }, [budget]);
    
    // 3. Auto-Categorization Logic 
    useEffect(() => {
        const numericAmount = parseFloat(amount) || 0;
        const predictedCategory = autoCategorize(description, numericAmount, userCategories);
        setCategory(predictedCategory);
    }, [description, amount, userCategories]); 
    
    // --- TIME FILTERING & CALCULATIONS ---
    const filterTransactionsByTime = (transactions) => {
        const now = new Date();
        const cutoff = new Date();

        if (timeFilter === '30 Days') { cutoff.setDate(now.getDate() - 30); } 
        else if (timeFilter === 'This Month') { cutoff.setDate(1); } 
        else if (timeFilter === 'This Year') { cutoff.setMonth(0); cutoff.setDate(1); } 
        else { return transactions; }

        return transactions.filter(t => new Date(t.date) >= cutoff);
    };

    const filteredExpenses = filterTransactionsByTime(allExpenses);
    const filteredIncome = filterTransactionsByTime(allIncome);
    
    const totalExpenses = filteredExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = filteredIncome.reduce((sum, t) => sum + t.amount, 0); // NEW Total Income
    const netBalance = totalIncome - totalExpenses; // NEW Net Balance

    // Expense Pie Data
    const getCategoryTotals = (transactions, isIncome = false) => {
        const totals = {};
        transactions.forEach(t => {
            const key = isIncome ? t.source : t.category;
            totals[key] = (totals[key] || 0) + t.amount;
        });
        
        colorIndex = 0; 
        return Object.keys(totals).map(key => ({ 
            key, 
            amount: totals[key],
            svg: { fill: getColor() },
            arc: { outerRadius: '95%', padAngle: totals[key] / totalIncome > 0.05 ? 0.05 : 0 }
        }));
    };

    const expensePieData = getCategoryTotals(filteredExpenses);
    const incomePieData = getCategoryTotals(filteredIncome, true);
    
    // Bar Chart Data (Uses expensePieData for expense breakdown)
    const sortedExpenseTotals = [...expensePieData].sort((a, b) => b.amount - a.amount);
    const highestSpending = sortedExpenseTotals.length > 0 ? sortedExpenseTotals[0] : {amount: 1};
    
    // --- BADGE LOGIC ---
    const getBadgeStatus = () => {
        if (budget <= 0) return { message: "Set a budget to earn badges!", color: '#6c757d' };
        const percent = (totalExpenses / budget) * 100;

        if (totalExpenses === 0) { return { message: "💎 Perfect User: Zero Spend!", color: '#007BFF' }; } 
        else if (percent >= 100) { return { message: "🚨 Budget Breaker: You Crossed The Limit!", color: '#DC3545' }; } 
        else if (percent < 80) { return { message: "✅ Saver: Great Job Staying Under Budget!", color: '#28A745' }; } 
        else { return { message: "🔔 Watcher: Close to the limit.", color: '#FFC107' }; }
    };
    const badgeStatus = getBadgeStatus();
    
    const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;
    const subscriptions = filteredExpenses.filter(e => e.isRecurring);

    // --- HANDLERS ---
    const handleAddTransaction = () => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0 || !description.trim()) {
            Alert.alert('Error', 'Please enter a valid amount and description!');
            return; 
        }

        const newTransaction = {
            id: Date.now().toString(), amount: numericAmount, 
            date: date.toLocaleDateString(undefined, DATE_OPTIONS), description: description.trim(),
            type: isAddingIncome ? 'income' : 'expense',
            category: isAddingIncome ? incomeSource : category, // Source for income, category for expense
            paymentMethod: isAddingIncome ? undefined : paymentMethod,
            isRecurring: isAddingIncome ? undefined : isRecurring,
        };

        if (isAddingIncome) {
            setAllIncome(prevIncome => {
                const updatedIncome = [newTransaction, ...prevIncome];
                saveIncome(updatedIncome); return updatedIncome;
            });
        } else {
            setAllExpenses(prevExpenses => {
                const updatedExpenses = [newTransaction, ...prevExpenses];
                saveExpenses(updatedExpenses); return updatedExpenses;
            });
        }

        // Clear input states
        setAmount(''); setDescription(''); setIsAddingIncome(false);
        setPaymentMethod('Digital'); setCategory(userCategories[0] || 'Other'); setIncomeSource(incomeSources[0] || 'Salary');
        setDate(new Date()); 
    };

    const handleTransactionDelete = (id, type) => {
        const confirmDelete = () => {
            if (type === 'expense') {
                setAllExpenses(prevExpenses => {
                    const updatedExpenses = prevExpenses.filter(e => e.id !== id);
                    saveExpenses(updatedExpenses);
                    return updatedExpenses;
                });
            } else if (type === 'income') {
                setAllIncome(prevIncome => {
                    const updatedIncome = prevIncome.filter(i => i.id !== id);
                    saveIncome(updatedIncome);
                    return updatedIncome;
                });
            }
            setModalVisible(false);
        };
        Alert.alert("Confirm Delete", "Are you sure you want to delete this transaction?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", onPress: confirmDelete, style: "destructive" },
        ]);
    };
    
    // Custom Category Handlers
    const handleAddCategory = () => {
        if (!newCategoryName.trim()) { Alert.alert('Error', 'Please enter a name.'); return; }
        const newCat = newCategoryName.trim();
        if (!userCategories.includes(newCat)) {
            const updatedCats = [...userCategories, newCat];
            setUserCategories(updatedCats);
            saveCategories(updatedCats.filter(c => !BASE_CATEGORIES.includes(c)));
            Alert.alert('Success', `${newCat} added to categories.`);
        }
        setNewCategoryName('');
        setShowCategoryInput(false);
    };

    const handleAddIncomeSource = () => {
        if (!newIncomeSource.trim()) { Alert.alert('Error', 'Please enter a name.'); return; }
        const newSource = newIncomeSource.trim();
        if (!incomeSources.includes(newSource)) {
            const updatedSources = [...incomeSources, newSource];
            setIncomeSources(updatedSources);
            saveIncomeSources(updatedSources.filter(s => !BASE_INCOME_SOURCES.includes(s)));
            Alert.alert('Success', `${newSource} added to income sources.`);
        }
        setNewIncomeSource('');
        setShowIncomeSourceInput(false);
    };


    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const openTransactionModal = (transaction) => {
        setSelectedTransaction(transaction);
        setModalVisible(true);
    };

    // --- LOADING RENDER ---
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Loading Finote...</Text>
            </SafeAreaView>
        );
    }
    
    // --- UI RENDER ---
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>{user.character.emoji} {user.name}'s Tracker</Text>

                {/* NET BALANCE DISPLAY */}
                <View style={[styles.netBalanceContainer, { backgroundColor: netBalance >= 0 ? '#4CAF50' : '#DC3545' }]}>
                    <Text style={styles.netBalanceLabel}>Net Balance ({timeFilter})</Text>
                    <Text style={styles.netBalanceAmount}>${netBalance.toFixed(2)}</Text>
                </View>

                {/* BADGE / ALERT MESSAGE */}
                <Text style={[styles.badgeMessage, { backgroundColor: badgeStatus.color }]}>
                    {badgeStatus.message} 
                    {budget > 0 && ` (${Math.round((totalExpenses / budget) * 100)}% Spent)`}
                </Text>
                
                {/* TIME FILTER */}
                <View style={styles.filterContainer}>
                    <SegmentedControl
                        values={timeFrames}
                        selectedIndex={timeFrames.indexOf(timeFilter)}
                        onChange={(event) => {
                            setTimeFilter(timeFrames[event.nativeEvent.selectedSegmentIndex]);
                        }}
                        tintColor="#007BFF"
                    />
                </View>

                {/* BUDGET INPUT */}
                <View style={styles.budgetForm}>
                    <TextInput
                        style={styles.budgetInput}
                        placeholder="Set Monthly Budget ($)"
                        keyboardType="numeric"
                        onChangeText={(text) => setBudget(parseFloat(text) || 0)} 
                        value={budget.toString()}
                    />
                </View>
                
                {/* PIE CHARTS CONTAINER */}
                <View style={styles.pieChartsContainer}>
                    {/* EXPENSE PIE CHART */}
                    <View style={styles.pieChartWrapper}>
                        <Text style={styles.pieChartTitle}>Expenses</Text>
                        <PieChart
                            style={styles.pieChart}
                            data={expensePieData}
                            valueAccessor={({ item }) => item.amount}
                            outerRadius={'95%'}
                        >
                             <PieChartLabels total={totalExpenses} />
                        </PieChart>
                        <Text style={styles.pieChartTotal}>${totalExpenses.toFixed(2)}</Text>
                    </View>

                    {/* INCOME PIE CHART */}
                    <View style={styles.pieChartWrapper}>
                        <Text style={styles.pieChartTitle}>Income</Text>
                        <PieChart
                            style={styles.pieChart}
                            data={incomePieData}
                            valueAccessor={({ item }) => item.amount}
                            outerRadius={'95%'}
                        >
                            <PieChartLabels total={totalIncome} />
                        </PieChart>
                         <Text style={styles.pieChartTotal}>${totalIncome.toFixed(2)}</Text>
                    </View>
                </View>


                {/* EXPENSE/INCOME INPUT FORM */}
                <View style={styles.transactionModeContainer}>
                    <TouchableOpacity 
                        onPress={() => setIsAddingIncome(false)} 
                        style={[styles.transactionModeButton, !isAddingIncome && styles.transactionModeActive]}
                    >
                        <Text style={styles.transactionModeText}>Add Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setIsAddingIncome(true)} 
                        style={[styles.transactionModeButton, isAddingIncome && styles.transactionModeActive]}
                    >
                        <Text style={styles.transactionModeText}>Add Income</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={[styles.form, isAddingIncome && styles.incomeFormBackground]}>
                    <TextInput
                        style={styles.input}
                        placeholder={isAddingIncome ? "Source Description (e.g., Monthly Salary)" : "Expense Description (e.g., Pizza)"}
                        value={description}
                        onChangeText={setDescription}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Amount ($)"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    
                    {/* DATE PICKER */}
                    <View style={styles.datePickerContainer}>
                        <Text style={styles.dateLabel}>Date: {date.toLocaleDateString(undefined, DATE_OPTIONS)}</Text>
                        <Button onPress={() => setShowDatePicker(true)} title="Select Date" color="#007BFF" />
                        {showDatePicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={date}
                                mode={'date'}
                                display="default"
                                onChange={onDateChange}
                            />
                        )}
                    </View>

                    {/* CATEGORY / SOURCE PICKER */}
                    <View style={styles.categoryPickerRow}>
                        <Text style={styles.toggleLabel}>{isAddingIncome ? 'Source:' : 'Category:'}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPickerScroll}>
                            {(isAddingIncome ? incomeSources : userCategories).map(item => (
                                <TouchableOpacity
                                    key={item}
                                    onPress={() => isAddingIncome ? setIncomeSource(item) : setCategory(item)}
                                    style={[styles.catButton, (isAddingIncome ? incomeSource : category) === item && styles.catButtonActive]}
                                >
                                    <Text style={[styles.catButtonText, (isAddingIncome ? incomeSource : category) === item && {color: 'white'}]}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* ADD CUSTOM CATEGORY / SOURCE BUTTONS */}
                    <TouchableOpacity onPress={() => isAddingIncome ? setShowIncomeSourceInput(true) : setShowCategoryInput(true)} style={styles.addNewCategoryButton}>
                        <Text style={styles.addNewCategoryText}>+ Add New {isAddingIncome ? 'Source' : 'Category'}</Text>
                    </TouchableOpacity>

                    {showCategoryInput && !isAddingIncome && (
                        <View style={styles.newCategoryInputContainer}>
                            <TextInput style={styles.newCategoryInput} placeholder="New Category Name" value={newCategoryName} onChangeText={setNewCategoryName}/>
                            <Button title="Save" onPress={handleAddCategory} color="#4CAF50" />
                        </View>
                    )}
                    {showIncomeSourceInput && isAddingIncome && (
                         <View style={styles.newCategoryInputContainer}>
                            <TextInput style={styles.newCategoryInput} placeholder="New Source Name" value={newIncomeSource} onChangeText={setNewIncomeSource}/>
                            <Button title="Save" onPress={handleAddIncomeSource} color="#4CAF50" />
                        </View>
                    )}

                    {/* EXPENSE ONLY TOGGLES */}
                    {!isAddingIncome && (
                        <>
                            <View style={styles.toggleContainer}>
                                <Text style={styles.toggleLabel}>Method:</Text>
                                <TouchableOpacity onPress={() => setPaymentMethod('Cash')} style={[styles.toggleButton, paymentMethod === 'Cash' && styles.toggleActive]}>
                                    <Text style={styles.toggleText}>💰 Cash</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setPaymentMethod('Digital')} style={[styles.toggleButton, paymentMethod === 'Digital' && styles.toggleActive]}>
                                    <Text style={styles.toggleText}>💳 Digital</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.toggleContainer}>
                                <Text style={styles.toggleLabel}>Subscription:</Text>
                                <TouchableOpacity onPress={() => setIsRecurring(!isRecurring)} style={[styles.toggleButton, isRecurring && styles.toggleActiveRecurring]}>
                                    <Text style={styles.toggleText}>{isRecurring ? '✅ YES' : '❌ NO'}</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                    
                    <Button title={isAddingIncome ? "Add Income" : "Add Expense"} onPress={handleAddTransaction} color={isAddingIncome ? "#00B894" : "#4CAF50"}/>
                </View>

                {/* CATEGORY ANALYSIS (Bar Chart) */}
                <Text style={styles.insightsTitle}>Expense Category Analysis ({timeFilter})</Text>
                <View style={styles.barChartContainer}>
                    {sortedExpenseTotals.map((item) => (
                        <CategoryBar key={item.key} category={item.key} amount={item.amount} maxAmount={highestSpending.amount} />
                    ))}
                </View>
                
                {/* TRANSACTION HISTORY */}
                <Text style={styles.insightsTitle}>Transaction History ({filteredExpenses.length + filteredIncome.length} Total)</Text>
                <View style={styles.list}>
                    {[...filteredExpenses, ...filteredIncome].sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => {
                        const isAnomaly = item.type === 'expense' && item.amount > averageExpense * ANOMALY_MULTIPLIER;
                        const isIncome = item.type === 'income';

                        return (
                            <TouchableOpacity key={item.id} style={styles.listItem} onPress={() => openTransactionModal(item)}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {isAnomaly && (<Text style={styles.anomalyIcon}>⚠️</Text>)}
                                    <Text style={styles.itemCategory}>{item.description || item.category || item.source}</Text>
                                    <Text style={styles.itemDate}> ({item.date})</Text>
                                </View>
                                <Text style={[styles.itemAmount, isIncome ? styles.itemAmountIncome : styles.itemAmountExpense, isAnomaly && styles.anomalyAmount]}>
                                    {isIncome ? '⬆️' : (item.paymentMethod === 'Cash' ? '⬇️💰' : '⬇️💳')} ${item.amount.toFixed(2)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                
                {/* TRANSACTION MANAGEMENT MODAL */}
                <Modal 
                    isVisible={isModalVisible} 
                    onBackdropPress={() => setModalVisible(false)}
                    animationIn="slideInUp"
                    animationOut="slideOutDown"
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Manage Transaction</Text>
                        {selectedTransaction && (
                            <>
                                <Text style={styles.modalDetail}>Type: {selectedTransaction.type === 'income' ? 'Income' : 'Expense'}</Text>
                                <Text style={styles.modalDetail}>Amount: ${selectedTransaction.amount.toFixed(2)}</Text>
                                <Text style={styles.modalDetail}>Description: {selectedTransaction.description}</Text>
                                <Text style={styles.modalDetail}>Date: {selectedTransaction.date}</Text>
                                <View style={styles.modalButtonContainer}>
                                    <Button 
                                        title="Delete" 
                                        onPress={() => handleTransactionDelete(selectedTransaction.id, selectedTransaction.type)} 
                                        color="#DC3545"
                                    />
                                    {/* Note: Edit feature complexity requires a larger form, so we prioritize Delete/View for MVP */}
                                    <Button title="Close" onPress={() => setModalVisible(false)} color="#6c757d" />
                                </View>
                            </>
                        )}
                    </View>
                </Modal>

            </ScrollView>
        </SafeAreaView>
    );
}

// --- MAIN NAVIGATION CONTAINER (The Default Export) ---
export default function App() {
    const [userProfile, setUserProfile] = useState(null);
    const handleLogin = (profile) => { setUserProfile(profile); };

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login">
                    {props => <LoginScreen {...props} onLogin={handleLogin} />}
                </Stack.Screen>
                <Stack.Screen 
                    name="Home" 
                    component={HomeScreen} 
                    initialParams={{ user: userProfile }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// --- STYLESHEETS ---

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f4' },
    scrollContent: { paddingTop: 30, paddingHorizontal: 20, paddingBottom: 50 },
    loadingText: {textAlign: 'center', fontSize: 24, marginTop: 100, color: '#007BFF', fontWeight: 'bold'},
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },

    // NEW BALANCE STYLES
    netBalanceContainer: { padding: 15, borderRadius: 8, marginVertical: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
    netBalanceLabel: { fontSize: 16, color: 'white', fontWeight: 'bold' },
    netBalanceAmount: { fontSize: 30, color: 'white', fontWeight: '900' },

    // TRANSACTION MODE STYLES
    transactionModeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    transactionModeButton: { flex: 1, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginHorizontal: 5, backgroundColor: '#fff' },
    transactionModeActive: { backgroundColor: '#007BFF', borderColor: '#007BFF' },
    transactionModeText: { fontWeight: 'bold', color: '#333' },

    // PIE CHART STYLES
    pieChartsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
    pieChartWrapper: { alignItems: 'center', width: '48%' },
    pieChartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    pieChart: { height: 150, width: 150, position: 'relative' },
    pieChartTotal: { position: 'absolute', top: 80, zIndex: 10, textAlign: 'center', fontSize: 14, color: '#333' },
    gaugeContainer: { alignItems: 'center', marginVertical: 20, marginBottom: 40, position: 'relative' },
    totalSpentAmountLarge: { fontSize: 36, fontWeight: 'bold', color: '#333', position: 'absolute', top: 110, zIndex: 10, textAlign: 'center' },
    
    // MODAL STYLES
    modalContent: { backgroundColor: 'white', padding: 22, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
    modalDetail: { fontSize: 16, marginBottom: 8, color: '#555' },
    modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '80%', marginTop: 20 },

    // INPUT FORM STYLES
    incomeFormBackground: { backgroundColor: '#e6ffef' }, // Light green for income
    form: { padding: 15, borderRadius: 8, backgroundColor: '#fff', marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
    input: { height: 50, borderColor: '#ccc', borderWidth: 1, paddingHorizontal: 15, marginBottom: 10, borderRadius: 8, backgroundColor: '#fff', fontSize: 18 },
    categoryPickerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15, paddingHorizontal: 5, flexWrap: 'wrap' },
    categoryPickerScroll: { maxHeight: 100, marginTop: 5 },
    catButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: '#eee', marginRight: 8, marginBottom: 8 },
    catButtonActive: { backgroundColor: '#007BFF', borderColor: '#007BFF', borderWidth: 1 },
    catButtonText: { color: '#333', fontWeight: 'bold', fontSize: 14 },
    addNewCategoryButton: { backgroundColor: '#e0f7fa', padding: 10, borderRadius: 5, marginBottom: 10 },
    addNewCategoryText: { textAlign: 'center', color: '#007BFF', fontWeight: 'bold' },
    newCategoryInputContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    newCategoryInput: { height: 40, borderColor: '#ccc', borderWidth: 1, paddingHorizontal: 10, flex: 1, marginRight: 10, borderRadius: 5 },
    datePickerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5, paddingVertical: 5, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
    dateLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
    toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 5 },
    toggleLabel: { fontSize: 16, fontWeight: 'bold', width: '30%' },
    toggleButton: { padding: 8, borderRadius: 5, backgroundColor: '#eee', flex: 1, marginHorizontal: 5 },
    toggleActive: { backgroundColor: '#007BFF' },
    toggleActiveRecurring: { backgroundColor: '#FFC107' },
    toggleText: { color: '#333', textAlign: 'center', fontWeight: 'bold' },
    filterContainer: { marginBottom: 25, paddingHorizontal: 5 },
    
    // CHART/INSIGHT STYLES
    insightsTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15, color: '#333', marginTop: 20 },
    barChartContainer: { padding: 10, backgroundColor: '#fff', borderRadius: 8, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
    
    // TRANSACTION LIST STYLES
    list: { borderTopWidth: 1, borderTopColor: '#eee' },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10, borderRadius: 4, marginBottom: 4 },
    itemCategory: { fontSize: 16, color: '#555' },
    itemDate: { fontSize: 12, color: '#999' },
    itemAmount: { fontSize: 18, fontWeight: 'bold' },
    itemAmountIncome: { color: '#00B894' }, // Green for income
    itemAmountExpense: { color: '#DC3545' }, // Red for expense
    anomalyIcon: { fontSize: 18, marginRight: 8, color: '#DC3545' },
});

const barStyles = StyleSheet.create({
    barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 5 },
    categoryLabel: { width: 80, fontSize: 14, color: '#555' },
    barContainer: { flex: 1, height: 15, backgroundColor: '#eee', borderRadius: 4, marginHorizontal: 10, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 4 },
    amountLabel: { width: 50, fontSize: 14, fontWeight: 'bold', textAlign: 'right' }
});

