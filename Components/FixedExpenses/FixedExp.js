import React from 'react';
import { useState, useEffect } from 'react';
import {
	StyleSheet,
	View,
	Button,
	TextInput,
	Pressable,
	Dimensions,
	Modal,
	Image,
	TouchableOpacity,
	ImageBackground,
	ScrollView,
	FlatList,
} from 'react-native';
import {
	auth,
	db,
	collection,
	getDocs,
	getDoc,
	doc,
	updateDoc,
	deleteDoc 
} from '../../Firebase/config';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { darkGreen } from '../Constants';
import { NavigationScreenProp } from '@react-navigation/native';
// import {useNavigation} from '@react-navigation/core';
import {
	useTheme,
	Avatar,
	Title,
	Caption,
	Paragraph,
	Drawer,
	Text,
	TouchableRipple,
	Switch
} from 'react-native-paper';
//notifications import
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';

const { width, height } = Dimensions.get('window');

const FixedExp = ({ navigation, route }) => {

	const [fixedExpenses, setFixedExpenses] = useState([]);
	const [extraData, setExtraData] = useState(false);
	const [isEnabled, setIsEnabled] = React.useState(false);
	const [ExpName,setExpName] = React.useState();
	const [date,setDate] = React.useState();


	React.useEffect(() => {

		if (route.params != null) {
			console.log(route.params.FixedExp);
		}
		console.log("changes")
	}, [route.params]);

	React.useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			fetchFixedExp();
		});

		// Return the function to unsubscribe from the event so it gets removed on unmount
		return unsubscribe;
	}, [navigation]);

	const fetchFixedExp = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, "User", "o4qWuRGsfDRbSyuA1OO2yljfjDr1", "FixedExpenses"));
			const tempFixedExp = []
			querySnapshot.forEach((doc) => {
				// doc.data() is never undefined for query doc snapshots
				console.log(doc.id, " => ", doc.data());
				tempFixedExp.push({ id : doc.id, ...doc.data()});
			});
			setFixedExpenses(tempFixedExp);
			console.log(tempFixedExp)
		}
		catch (e) {
			console.log(e)
		}
	}

	const deleteFixedExp = async(item) => {
		
		// deletefrom database
		try {
			await deleteDoc(doc(db, "User", "o4qWuRGsfDRbSyuA1OO2yljfjDr1", "FixedExpenses", item.id));
			console.log("Deleted")
		}
		catch(e)
		{
			console.log("Error")
		}

		const filterData = fixedExpenses.filter(curr => curr !== item);
        console.log(filterData);
        console.log(filterData.length);
        setFixedExpenses(filterData);
		
	}

	React.useEffect(() => {
		console.log(fixedExpenses, "fixedExpenses");
		setExtraData(true);
		setExtraData(false);
	}, [fixedExpenses])

	const getDateFormat = (date) => {
		const tempDate = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
		return tempDate.getDate() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
	}

	async function onCreateTriggerNotification() {

		// Create a channel (required for Android)
		const channelId = await notifee.createChannel({
		  id: 'default',
		  name: 'Default Channel',
		});
		
		
		// Create a time-based trigger
		const trigger = {
		  id:ExpName,
		  type: TriggerType.TIMESTAMP,
		  timestamp: notifyTime  , 
		};
		
		// Create a trigger notification
		await notifee.createTriggerNotification({
		  title: 'Time to pay fixed expense',
		  body: ExpName,
		  android: {
			channelId,
		  },
		}, trigger);
		
		}

	async function cancelNotifee(notificationId) {
		console.log('canceling notification', notificationId)

		await notifee.cancelTriggerNotification(notificationId);
	  }


	const toggleSwitch = (item, val) => {
		setIsEnabled(previousState => !previousState);
		console.log(val, "Val")

		if (val) {
			// navigation.navigate("AddGrpExpMembers", {
			// 	splitAmount: 1000,
			// })
			item.status='Paid'
			// setExtraData(true)
			// setExtraData(false)
			updateFixedExpStatus(item,"Paid");
			notifee.getTriggerNotifications();
			console.log(notifee.getTriggerNotifications());
			cancelNotifee(item.ExpName);
		}
		else
		{
			item.status='Unpaid'
			updateFixedExpStatus(item,"Unpaid");
			setExpName(item.ExpName);
			setDate(item.dueDate);
			onCreateTriggerNotification()
		}
	}

	const updateFixedExpStatus = async(item, status) => {

		try {
			await updateDoc(doc(db, "User", "o4qWuRGsfDRbSyuA1OO2yljfjDr1", "FixedExpenses", item.id), {
				status : status
			});
			console.log("Update")
		}
		catch(e)
		{
			console.log("Error")
		}

		console.log("Update")
	}

	return (
		<ImageBackground
			source={require('../../Assets/background.jpg')}
			style={{ width: width, height: height }}>
			<View>
				<Text style={styles.Title}>Fixed Expense</Text>
				<View style={styles.container}>
					<View style={styles.mainContainer}>
						{console.log(fixedExpenses, "item")}
						<FlatList
							data={fixedExpenses}
							renderItem={({ item }) =>
								<View style={styles.fixedExpContainer}>
									<View style={[styles.fixedExpContainerView, styles.divider]}>
										<View style={styles.inputPair}>
											<Text style={styles.fixedExpContainerText}>Expense Name : </Text>
											<Text style={styles.fixedExpContainerVal}>{item.ExpName}</Text>
										</View>
										<TouchableOpacity onPress={() => deleteFixedExp(item)}>
											<Image source={require('../../Assets/remove.png')} style={styles.buttonImg} />
										</TouchableOpacity>
									</View>
									<View style={styles.fixedExpContainerView}>
										<View style={styles.inputPair}>
											<Text style={styles.fixedExpContainerText}>Category : </Text>
											<Text style={styles.fixedExpContainerVal}>{item.category}</Text>
										</View>
										<View style={styles.inputPair}>
											<Text style={styles.fixedExpContainerText}>Paid </Text>
											<Switch
												trackColor={{ false: '#767577', true: 'lightgreen' }}
												thumbColor={(item.status==='Unpaid') ? 'green' : 'white'}
												onValueChange={(val) => toggleSwitch(item, val)}
												value={(item.status==='Unpaid') ?false:true}
											/>
										</View>
									</View>
									<View style={styles.fixedExpContainerView}>
										<View style={styles.inputPair}>
											<Text style={styles.fixedExpContainerText}>Amount : </Text>
											<Text style={styles.fixedExpContainerVal}>{item.amount}</Text>
										</View>
										<View style={styles.inputPair}>
											<Text style={styles.fixedExpContainerText}>Due Date : </Text>
											<Text style={styles.fixedExpContainerVal}>{getDateFormat(item.dueDate)}</Text>
										</View>
									</View>
								</View>
							}

							extraData={true}
						/>

					</View>

					{/* <View style={styles.mainContainer}>

						<View style={styles.container1}>
							<Title style={styles.ExpName}>Expense Name:</Title>
							<View style={styles.inputPair}>
								<Caption style={styles.caption}>Category: </Caption>
								<Text style={styles.caption}>Deu Date:</Text>
							</View>
							<View style={styles.inputPair}>
								<Text style={styles.amt}>2500</Text>
							</View>
						</View>
					</View> */}
					<View
						style={{
							position: 'absolute',
							justifyContent: 'center',
							alignItems: 'center',
							right: 20,
							bottom: 20,
						}}>
						<View
							style={{
								width: 70,
								height: 70,
								borderRadius: 35,
								backgroundColor: '#006A42',
								justifyContent: 'center',
								alignItems: 'center',
								alignSelf: 'center',
								marginTop: 5,
								marginBottom: 5,
							}}
							onStartShouldSetResponder={() => {
								navigation.navigate('AddFixedExp');
							}}>
							<Image
								source={require('../../Assets/add.png')}
								style={{ width: 30, height: 30 }}
								onPress={() => console.log('image pressed')}
							/>
						</View>
					</View>
				</View>
			</View>
		</ImageBackground>
	);
};

export default FixedExp;

const styles = StyleSheet.create({
	Title: {
		color: 'white',
		fontSize: 40,
		fontWeight: 'bold',
		marginVertical: 20,
		alignSelf: 'center',
	},
	ExpName: {
		fontSize: 16,
		marginTop: 15,
		fontWeight: 'bold',
		// color: 'white',
	},
	caption: {
		fontSize: 15,
		lineHeight: 14,
		marginTop: 6,
		// color: 'white',
	},
	amt: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'red',
		marginTop: 10,
	},
	container: {
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		height: height * 0.8,
		width: width,
		backgroundColor: 'white',
		marginTop: 5,
	},

	mainContainer: {
		padding: 25,
		flex: 1,
		height: '100%',
		justifyContent: 'space-between',
	},

	fixedExpContainer: {
		borderRadius: 15,
		shadowOpacity: 0.5,
		shadowColor: 'black',
		marginVertical: 5,
		width: '100%',
		height: 130,
		padding: 15,
		shadowOffset: {
			height: 5,
			width: 5,
		},
		elevation: 5,
		backgroundColor: 'white',
		justifyContent: "center",
	},
	inputPair: {
		flexDirection: "row",
		alignItems: "center",
		// backgroundColor : "pink",
		paddingVertical: 10,
	},
	fixedExpContainerView: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	},
	fixedExpContainerText: {
		fontSize: 14,
		fontWeight: "bold",
		color: "green"
	},
	fixedExpContainerVal: {
		fontSize: 14,
		fontWeight: "bold",
		color: "grey"
	},

	divider: {
		borderBottomColor: 'rgba(0,0,0,0.5)',
		borderBottomWidth: StyleSheet.hairlineWidth,

	},
	buttonImg: {
		width: 25,
		height: 25,
		tintColor: "#cc1d10"
	},

});
