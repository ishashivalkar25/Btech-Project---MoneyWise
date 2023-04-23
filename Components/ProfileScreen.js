import React from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity, Dimensions, Image, Text, ImageBackground } from 'react-native';
import {
	Title,
	Caption,
	TouchableRipple,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import { NavigationContainer } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const ProfileScreen = ({ navigation }) => {

	const [name, setName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [phoneNo, setPhoneNo] = React.useState("");
	const [DOB, setDOB] = React.useState(new Date());
	const [bankName, setBankName] = React.useState("");
	const [accBalance, setAccBalance] = React.useState(0.0);
	const [phoneNumberValidity, setPhoneNumberValidity] = React.useState(true);
	const [accBalanceValidity, setAccBalanceValidity] = React.useState(true);
	const [show, setShow] = React.useState(false);
	const [formattedDate, setFormattedDate] = React.useState("");
	const [isChanged, setChanged] = React.useState(false);

	const fetchUserDetails = async () => {
		try {
			const docRef = doc(db, "User", "o4qWuRGsfDRbSyuA1OO2yljfjDr1");
			const data = await getDoc(docRef);
			const userData = data.data();
			setName(userData.name);
			const tempDate = new Date(userData.DOB.seconds * 1000 + userData.DOB.nanoseconds / 1000000);

			console.log(tempDate, "userData.DOB");
			setDOB(tempDate);
			setEmail(userData.email);
			setBankName(userData.bankName);
			setAccBalance(userData.accBalance);
			setPhoneNo(userData.phoneNo);
			setFormattedDate(tempDate.getDate() + ' / ' + (tempDate.getMonth() + 1) + ' / ' + tempDate.getFullYear())
			console.log(userData);
		}
		catch (e) {
			console.log(e);
		}
	}

	React.useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			fetchUserDetails();
		});

		// Return the function to unsubscribe from the event so it gets removed on unmount
		return unsubscribe;
	}, [navigation]);


	// const ProfileScreen = () => {
	return (
		<View style={styles.container1}>
			<ImageBackground
				source={require('../Assets/BCurve.jpeg')} >
				<View style={{ marginLeft: 20 }}>
					<Text style={styles.welcome}> Welcome!</Text>
					<Title style={[styles.title, {
						marginTop: 15,
						marginBottom: 85,
					}]}>John Doe</Title>
				</View>
			</ImageBackground>

			<Animatable.View animation="fadeInUpBig" style={styles.container}>
				<View style={[styles.menuWrapper, styles.divider]}>
					<Text style={[{ color: "#006A42", marginLeft: 20, fontWeight: 'bold', fontSize: 17 }]}>Personal Details</Text>
					<View style={styles.menuItem}>
						<Image source={require("../Assets/profile1.png")} style={styles.menuItemImg} />
						<Text style={styles.menuItemText}>
							Isha Shivalkar
						</Text>
					</View>

					<View style={styles.menuItem}>
						<Image source={require("../Assets/email.png")} style={styles.menuItemImg} />
						<Text style={styles.menuItemText}>rutujap201@gmail.com
						</Text>
					</View>

					<View style={styles.menuItem}>
						<Image source={require("../Assets/telephone.png")} style={styles.menuItemImg} />
						<Text style={styles.menuItemText}>9767907903</Text>
					</View>

					<View style={styles.menuItem}>
						<Image source={require("../Assets/calendar.png")} style={styles.menuItemImg} />
						<Text style={styles.menuItemText}>05/02/2001</Text>
					</View>
				</View>

				<Text style={{ color: "#006A42", marginLeft: 20, fontWeight: 'bold', fontSize: 17, marginTop: 20 }}>Bank Details</Text>
				<View style={styles.bankDetailsContainer}>
					<Text style={styles.bankText} >Bank Name :</Text>
					<Text style={styles.bankData}>State Bank Of India</Text>
				</View>

				<View  style={styles.bankDetailsContainer}>
					<Text style={styles.bankText} >Balance :</Text>
					<Text style={styles.bankData}>5000</Text>
				</View>
			</Animatable.View>

		</View>

	);
};

export default ProfileScreen;

const styles = StyleSheet.create({
	container1: {
		flex: 1,
	},
	container: {
		backgroundColor: '#fff',
		borderRadius: 25,
		paddingHorizontal: 10,
		width: width,
		height: height,
		alignSelf: 'center',
		borderColor: 'black',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		justifyContent: "center",
		paddingLeft: 20,
		color: 'white',
	},
	caption: {
		fontSize: 14,
		lineHeight: 14,
		fontWeight: '500',
	},
	row: {
		flexDirection: 'row',
		marginBottom: 10,
	},
	menuWrapper: {
		marginTop: 8,
	},
	menuItem: {
		flexDirection: 'row',
		paddingVertical: 10,
		paddingHorizontal: 30,
		justifyContent:'flex-start', 
		alignItems:'center',
	},
	menuItemText: {
		color: '#777777',
		fontWeight: '600',
		fontSize: 16,
		lineHeight: 26,
		
		justifyContent: 'space-between',
	},
	menuItemImg: {
		height: 17, 
		width: 17, 
		marginRight : 30,
	},

	divider: {
		borderBottomColor: 'rgba(0,0,0,0.5)',
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	bankText: {
		color: '#777777',
		fontWeight: '600',
		fontSize: 16,
		lineHeight: 26,
		marginTop: 10
	},
	bankData: {
		marginLeft: 50,
		fontWeight: '600',
		fontSize: 16,
		lineHeight: 26,
		color: 'black',
	},

	welcome: {
		fontSize: 25,
		color: 'white',
		marginTop: 20,
		paddingLeft: 20,
	},

	bankDetailsContainer : {
		paddingHorizontal : 20
	}
});