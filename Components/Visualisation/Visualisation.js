import {
	LineChart,
	BarChart,
	PieChart,
	ProgressChart,
	ContributionGraph,
	StackedBarChart,
} from "react-native-chart-kit";
import { Dimensions, StyleSheet, TouchableOpacity, ScrollView} from "react-native";
import { View, Text, Button } from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import Background from "../Background";
import React, { useState } from 'react'
import { auth, db, collection, getDocs, doc } from "../../Firebase/config";
import { pink200 } from "react-native-paper/lib/typescript/src/styles/themes/v2/colors";
import MonthPicker from 'react-native-month-year-picker';

const { height, width } = Dimensions.get("window");

const Visualisation = () => {
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
	const [date, setDate] = React.useState(new Date());
	const [show, setShow] = React.useState(false);
	const [expenseRecords, setExpenseRecords] = useState([])
	const [incomeRecords, setIncomeRecords] = useState([])
	const [expenseRecordsDateWise, setExpenseRecordsDateWise] = useState([]);
	const [expenseRecordsMonthWise, setExpenseRecordsMonthWise] = React.useState([]);
	const [sortedMonthlyRecords, setsortedMonthlyRecords] = useState();
	const [expLabels, setExpLabels] = useState([]);
	const [expData, setExpData] = useState([]);
	const [incLabels, setIncLabels] = useState([]);
	const [incData, setIncData] = useState([]);

	const insets = useSafeAreaInsets();

	const showPicker = React.useCallback((value) => setShow(value), []);
	const onValueChange = React.useCallback(
        (event, newDate) => {
            const selectedDate = newDate || date;
            showPicker(false);
            setDate(selectedDate);
        },
        [date, showPicker],
    );

	React.useEffect(() => {
		fetchIncomeRecords();
		fetchExpenseRecords();
	}, []);

	React.useEffect(() => {
		fetchIncomeRecords();
		fetchExpenseRecords();
	}, [date]);

	React.useEffect(() => {

		filterExpRecordsMonthlyDateWise()
		filterIncRecordsMonthlyDateWise()
	}, [expenseRecords]);

	const getDateFormat = (timestamp) => {
		const tempDate = new Date(timestamp * 1000);
		// console.log(tempDate, "Templ Date");
		if (tempDate.getDate() < 10)
			return '0' + tempDate.getDate() + ' / ' + (tempDate.getMonth() + 1) + ' / ' + tempDate.getFullYear();
		else
			return tempDate.getDate() + ' / ' + (tempDate.getMonth() + 1) + ' / ' + tempDate.getFullYear();

	}

	const fetchIncomeRecords = async () => {
		try {
			const tempRecords = [];
			const querySnapshot = await getDocs(collection(doc(db, "User", auth.currentUser.uid), "Income"));
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				const record = {
					"key": doc.id,
					"incAmount": data.incAmount,
					"incDescription": data.incDescription,
					"incCategory": data.incCategory,
					"incDate": data.incDate
				};
				tempRecords.push(record);
			});
			setIncomeRecords(tempRecords);
			// filterRecordsDateWise();
			// console.log(expenseRecords, "data");
		}
		catch (e) {
			console.error("Error adding document: ", e);
		}
	}

	const fetchExpenseRecords = async () => {
		try {
			const tempRecords = [];
			const querySnapshot = await getDocs(collection(doc(db, "User", auth.currentUser.uid), "Expense"));
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				const record = {
					"key": doc.id,
					"expAmount": data.expAmount,
					"expDescription": data.expDescription,
					"expCategory": data.expCategory,
					"expDate": data.expDate
				};
				tempRecords.push(record);
			});
			setExpenseRecords(tempRecords);
			// filterRecordsDateWise();
			// console.log(expenseRecords, "data");
		}
		catch (e) {
			console.error("Error adding document: ", e);
		}
	}

	const filterExpRecordsMonthlyDateWise = () => {
		const dateWiseAmt = [];
		const dates = [];
		console.log(date, '********************------------------')
		const currMonth = date.getMonth();
		const currYear = date.getFullYear();

		expenseRecords.forEach((expenseRecord) => {

			const tempDate = getDateFormat(expenseRecord.expDate.seconds)
			const expDate = new Date(expenseRecord.expDate.seconds * 1000)
			const expMonth = expDate.getMonth()
			const expYear = expDate.getFullYear();
			// const currDate = new Date()
			

			if (!dates.includes(tempDate) && expMonth == currMonth && expYear == currYear) {
				dates.push(tempDate);
				const data = { "name": tempDate, "amount": Number(expenseRecord.expAmount) };
				dateWiseAmt.push(data);
			}
			else if (expMonth == currMonth && expYear == currYear) {
				dateWiseAmt.forEach((item) => {
					console.log(item.name, tempDate)
					if (item.name == tempDate) {
						item.amount += Number(expenseRecord.expAmount);
						console.log(item.amount)
					}

				})
			}

		})
		console.log(dateWiseAmt, "nonOrder");


		dateWiseAmt.sort((a, b) => {
			return (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0);
		});

		console.log(dateWiseAmt, "Ordered Exp");

		const tempData = [];
		const tempLabel = []

		dateWiseAmt.forEach((item) => {
			tempLabel.push(item.name.split("/")[0]);
			tempData.push(item.amount);
		})

		setExpLabels(tempLabel);
		setExpData(tempData);

		console.log(expData, 'expdata')
	}

	const filterIncRecordsMonthlyDateWise = () => {
		const dateWiseAmt = [];
		const dates = [];
		console.log(date, '********************------------------')
		const currMonth = date.getMonth();
		const currYear = date.getFullYear();

		incomeRecords.forEach((incomeRecord) => {

			const tempDate = getDateFormat(incomeRecord.incDate.seconds)
			const incDate = new Date(incomeRecord.incDate.seconds * 1000)
			const incMonth = incDate.getMonth()
			const incYear = incDate.getFullYear();

			if (!dates.includes(tempDate) && incMonth == currMonth && incYear==currYear) {
				dates.push(tempDate);
				const data = { "name": tempDate, "amount": Number(incomeRecord.incAmount) };
				dateWiseAmt.push(data);
			}
			else if (incMonth == currMonth && incYear==currYear) {
				dateWiseAmt.forEach((item) => {
					console.log(item.name, tempDate)
					if (item.name == tempDate) {
						item.amount += Number(incomeRecord.incAmount);
					}

				})
			}

		})

		console.log(dateWiseAmt, "nonOrder");

		dateWiseAmt.sort((a, b) => {
			return (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0);
		});

		console.log(dateWiseAmt, "ordered");

		const tempData = [];
		const tempLabel = []
		dateWiseAmt.forEach((item) => {
			tempLabel.push(item.name.split("/")[0]);
			tempData.push(item.amount);
		})
		setIncLabels(tempLabel);
		setIncData(tempData);

		console.log(incData, 'incdata')
	}


	return (
		<Background>
			<View style={{
				padding: 10,
				flex: 1,
				justifyContent: "center",
			}}>
				<View style={styles.time}>
					<TouchableOpacity onPress={() => showPicker(true)} style={styles.monthYear}>
						<Text style={styles.monthYearText}>{months[date.getMonth()] + " " + date.getFullYear()}</Text>
					</TouchableOpacity>
					{show && (
						<MonthPicker
							onChange={onValueChange}
							value={date}
							minimumDate={new Date(2020, 5)}
							maximumDate={new Date(2025, 5)}
							mode="short"
						/>
					)}
				</View>

				{/* <View style={styles.monthContainer}>
				
				<Text style={styles.month}>Month : {months[new Date().getMonth()]}</Text>
				</View> */}
				 
					<View style={styles.chartContainer}>
						<Text
							style={{
								color: "green", fontSize: 20, fontWeight: "bold", padding: 10,
							}}>Income Line Chart</Text>
						<ScrollView horizontal={true} contentContainerStyle={styles.displayChart}>
						<LineChart
							data={{
								labels: (incLabels.length == 0) ? [0] : incLabels,
								datasets: [
									{
										data: (incData.length == 0) ? [0] : incData,
									},
								],
							}}
							width={ Math.max(Dimensions.get("window").width * incData.length * 0.1 , Dimensions.get("window").width * 0.93)} // from react-native
							height={250}
							yAxisLabel="Rs "
							yAxisInterval={1} // optional, defaults to 1
							chartConfig={{
								backgroundColor: "#674188",
								backgroundGradientFrom: "#C3ACD0",
								backgroundGradientTo: "#674188",
								decimalPlaces: 2, // optional, defaults to 2dp
								color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
								labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
								propsForDots: {
									r: "4",
									strokeWidth: "2",
									stroke: "#ffa726"
								},
								propsForVerticalLabels: {
									color: 'green'
								},
								strokeWidth: 3,
							}}
							bezier
							style={{
								marginVertical: 8,
								borderRadius: 16,
							}}
						/>
						</ScrollView>
						
					</View>
				
				<View style={styles.chartContainer}>
					<Text
						style={{
							color: "green", fontSize: 20, fontWeight: "bold", padding : 10, 
						}}>Expense Line Chart</Text>
					<ScrollView horizontal={true} contentContainerStyle={styles.displayChart}>
						<LineChart
							data={{
								labels: (expLabels.length == 0) ? [0] : expLabels,
								datasets: [
									{
										data: (expData.length == 0) ? [0] : expData,
									},
								],
							}}
							width={Math.max(Dimensions.get("window").width * expData.length * 0.1, Dimensions.get("window").width * 0.93)}  // from react-native
							height={250}
							yAxisLabel="Rs "
							yAxisInterval={1} // optional, defaults to 1
							chartConfig={{
								backgroundColor: "#84D2C5",
								backgroundGradientFrom: "#2146C7",
								backgroundGradientTo: "#81C6E8",
								decimalPlaces: 2, // optional, defaults to 2dp
								color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
								labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
								propsForDots: {
									r: "4",
									strokeWidth: "2",
									stroke: "#ffa726"
								},
								propsForVerticalLabels: {
									color: 'green'
								},
								strokeWidth: 3,
							}}
							bezier
							style={{
								marginVertical: 8,
								borderRadius: 16,
								padding: 2,
							}}
						/>
					</ScrollView>
					
				</View>


			</View>
		</Background>
	);
};

export default Visualisation;

const styles = StyleSheet.create({

	chartContainer: {
		backgroundColor: 'rgba(255,255,255,0.9)',
		borderRadius : 20,
		padding : 1,
		alignItems : 'center',
		marginVertical:10,
		width : '100%',
		paddingHorizontal : 10
	},
	displayChart: {
		borderRadius : 20,
	},
	monthContainer : {
		borderRadius : 20,
		padding : 5,
		marginVertical : 5,
	},
	 month : { 
		color: "white", 
		fontSize: 25, 
		fontWeight: "bold", 
		textAlign: "center" ,
		textDecorationLine : 'underline',
	},
	time: {
        padding: 4,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    monthYear: {
        width: '50%',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 43,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
		backgroundColor: 'rgba(255,255,255,0.9)',
    },
    monthYearText: {
        textAlign: "center",
		fontWeight:'bold'
    },
   
})