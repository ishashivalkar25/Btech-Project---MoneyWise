import { React, useState, useEffect } from 'react'
import { StyleSheet, Pressable, ScrollView, TextInput, Switch, Text, Dimensions, Image, View, Button, Modal, TouchableOpacity } from 'react-native'
import Background from '../Background';
import { darkGreen } from "../Constants";
import * as ImagePicker from "react-native-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
	db,
	collection,
	addDoc,
	getDocs,
	getDoc,
	storage,
	auth,
	doc, setDoc
} from '../../Firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import uploadImg from "../../Assets/uploadReceiptIcon.png";
import Toast from "react-native-root-toast";
import SmsAndroid from 'react-native-get-sms-android';

const { width, height } = Dimensions.get("window");
let downloadURL = ""

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function ScanBills({ route, navigation }) {

	const [file, setFile] = useState(null);
	const [fetchedData, setFetchedData] = useState("")
	const [ocrCategory, setOcrCategory] = useState(null)
	const [ocrAmount, setOcrAmount] = useState(null)
	const [ocrDate, setOcrDate] = useState(null)
	const [isImgModalVisible, setVisibilityOfImgModal] = useState(false);
	const [pickedImagePath, setPickedImagePath] = useState(
		Image.resolveAssetSource(uploadImg).uri
	);
	const [date, setDate] = useState(new Date());
	const [amount, setAmount] = useState(0);
	const [description, setDescription] = useState("");
	const [mounted, setMounted] = useState(false);
	const [category, setCategory] = useState([]);
	const [isCatModalVisible, setVisibilityOfCatModal] = useState(false);
	const [userExpCategories, setUserExpCategories] = useState([]);
	const [grpMembersList, setGrpMembersList] = useState([]);

	const [datePicker, setDatePicker] = useState(false);

	const [isEnabled, setIsEnabled] = useState(false);

	const toggleSwitch = (val) => {

		if (amount > 0) {
			setIsEnabled(previousState => !previousState);
			console.log(isEnabled)
			if (val) {
				navigation.navigate("AddGrpExpMembers", {
					splitAmount: amount,
					previous_screen: 'ScanBills'
				})
			}
		}
		else {
			alert("Please Enter Expense Amount!")
		}
	}

	useEffect(() => {

		if (route.params && route.params.grpMembersList) {
			console.log(route.params.grpMembersList, 'route.params.grpMembersList');
			setGrpMembersList(grpMembersList);
		}
	}, [route.params])


	useEffect(() => {
		if (fetchedData != "") {
			var flag = false;
			userExpCategories.forEach((item) => {
				if (item.toUpperCase() == fetchedData.document.inference.prediction.category.value.toUpperCase()) {
					setOcrCategory(item);
					setSelectedCategory(item);
					flag = true;
				}
			})

			if (!flag) {
				setOcrCategory(fetchedData.document.inference.prediction.category.value);
				setSelectedCategory(fetchedData.document.inference.prediction.category.value);
			}
			setAmount(fetchedData.document.inference.prediction.total_amount.value + "");
			setOcrAmount(fetchedData.document.inference.prediction.total_amount.value)
			setOcrDate(fetchedData.document.inference.prediction.date.value)
			console.log(ocrCategory, ocrAmount, ocrDate, typeof (new Date(ocrDate)), '-------------------------------')
		}
	}, [fetchedData])

	useEffect(() => {
		const loadData = async () => {
			const catList = [];
			try {
				const user = await getDoc(doc(db, "User", auth.currentUser.uid));
				user.data().expCategories.forEach((item) => {
					//   console.log(doc.id, JSON.stringify(doc.data()));
					getcat = { label: item, value: item };
					console.log(getcat);
					catList.push(getcat);
				});
				// console.log(user.data() , "user");
				// catList.push(user.data().expCategories);
				catList.push({ label: "other", value: "other" });
				setCategory(catList);
				setUserExpCategories(user.data().expCategories);
				console.log(user.data().expCategories, "userExpCategories");
				// console.log(category);
			} catch (e) {
				console.error("Error adding document: ", e);
			}
			setMounted(true);
		}

		loadData();
	}
		, []);


	function showDatePicker() {
		setDatePicker(true);
	}


	function onDateSelected(event, value) {
		setDate(value);
		setDatePicker(false);
	}

	const [selectedCategory, setSelectedCategory] = useState("");

	const showImagePicker = () => {
		ImagePicker.launchImageLibrary()
			.then((result) => {
				if (result) {
					setPickedImagePath(result.assets[0].uri);
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	// This function is triggered when the "Open camera" button pressed
	const openCamera = () => {
		ImagePicker.launchCamera()
			.then((result) => {
				console.log(result.assets[0].uri, "file");
				setPickedImagePath(result.assets[0].uri);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const handleFilePick = async () => {
		try {
			const result = await DocumentPicker.pick({
				type: [DocumentPicker.types.allFiles],
			});
			setFile(result);
			console.log(result[0].uri);
		} catch (err) {
			console.log(err);
		}
	};

	const makeRequest = async () => {

		const fileUri = pickedImagePath;
		// const fileName = Platform.OS === 'android' ? file.split('/').pop() : 'Receipt.jpg';
		// const fileData = await RNFetchBlob.fs.readFile(fileUri, 'base64');
		const mimeType = 'image/jpeg';

		// if(fileUri)
		// {
		const data = new FormData();
		data.append('document', { uri: fileUri, type: 'image/jpeg', name: 'receipt', });
		console.log(data._parts)

		const config = {
			method: 'POST',
			url: 'http://192.168.203.144/products/mindee/expense_receipts/v4/predict',
			headers: {
				Authorization: '4da01f1a7338330c1fcf93e3db139a16',
			},
			data,
		};
		// }

		try {
			// const response = await fetch(config);
			let xhr = new XMLHttpRequest();


			xhr.addEventListener("readystatechange", function () {
				if (this.readyState === 4) {
					console.log("Response ", this.responseText.document);
					setFetchedData(JSON.parse(this.responseText));
				}
			});

			xhr.open("POST", "https://api.mindee.net/v1/products/mindee/expense_receipts/v4/predict");
			xhr.setRequestHeader("Authorization", "4da01f1a7338330c1fcf93e3db139a16");
			xhr.setRequestHeader('content-type', 'multipart/form-data');

			xhr.send(data);
		} catch (error) {
			console.log(error);
		}
	};

	const saveExpense = async () => {

		console.log(grpMembersList, 'grpMembersListIn')
		try {
			if (amount == 0) {
				let toast = Toast.show("Please enter amount.", {
					duration: Toast.durations.LONG,
				});
				setTimeout(function hideToast() {
					Toast.hide(toast);
				}, 800);
				return;
			}

			if (selectedCategory == "") {
				let toast = Toast.show("Please select category.", {
					duration: Toast.durations.LONG,
				});
				setTimeout(function hideToast() {
					Toast.hide(toast);
				}, 800);
				return;
			}

			if (isEnabled && !route.params && route.params.grpMembersList) {
				alert('Please add group members to split an expense.')
				// Add a Toast on screen.
				let toast = Toast.show("Please add group members to split an expense.", {
					duration: Toast.durations.LONG,
				});

				// You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
				setTimeout(function hideToast() {
					Toast.hide(toast);
				}, 800);

				return;
			}

			let promise = Promise.resolve();
			if (pickedImagePath != Image.resolveAssetSource(uploadImg).uri) {
				promise = new Promise((resolve, reject) => {
					const xhr = new XMLHttpRequest();
					xhr.onload = function () {
						const blobImage = xhr.response;
						const metadata = {
							contentType: "image/jpeg",
						};
						const storageRef = ref(storage, "ExpImages/" + Date.now());
						const uploadTask = uploadBytesResumable(storageRef, blobImage, metadata);
						uploadTask.on(
							"state_changed",
							(snapshot) => {
								const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

								// console.log("Upload is " + progress + "% done");
								switch (snapshot.state) {
									case "paused":
										console.log("Upload is paused");
										break;
									case "running":
										console.log("Upload is running");
										break;
								}
							},
							(error) => {
								switch (error.code) {
									case "storage/unauthorized":
										reject(new Error("User doesn't have permission to access the object"));
										break;
									case "storage/canceled":
										reject(new Error("User canceled the upload"));
										break;
									case "storage/unknown":
										reject(new Error("Unknown error occurred, inspect error.serverResponse"));
										break;
									default:
										reject(error);
										break;
								}
							},
							async () => {
								downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
								console.log("File available at", downloadURL);
								setPickedImagePath(downloadURL);
								resolve();
							}
						);
					};
					xhr.onerror = function () {
						reject(new Error("Network request failed"));
					};
					xhr.responseType = "blob";
					xhr.open("GET", pickedImagePath, true);
					xhr.send(null);
				});
			}


			try {
				await promise;
				setPickedImagePath(downloadURL);
				let data_1 = {
					expAmount: amount,
					expDate: date,
					expCategory: selectedCategory,
					expDescription: description,
					groupExp: isEnabled,
				};
				if (pickedImagePath != Image.resolveAssetSource(uploadImg).uri && downloadURL != "") {
					data_1.expImage = downloadURL;
				}

				if (isEnabled) {
					data_1.grpMembersList = route.params.grpMembersList;
				}


				// const docRef = await addDoc(
				// 	collection(doc(db, "User", auth.currentUser.uid), "Expense"), data_1);

				const docRef = await addDoc(
					collection(doc(db, "User", auth.currentUser.uid), "Expense"), data_1);

				const querySnapshotExp = await getDocs(collection(db, "Expense"));
				querySnapshotExp.forEach((doc) => {
					// console.log(doc.id, JSON.stringify(doc.data()));
				});

				//Update budget
				const recordId = months[date.getMonth()] + "" + date.getFullYear();
				console.log(recordId);
				const document = await getDoc(doc(db, "User", auth.currentUser.uid, "Budget", recordId));

				const categoryWiseBudget = document.data()
				var isCategoryBudgetSet = false;
				var otherExpIdx = -1;
				var savingsIdx = -1;
				var done = false;

				console.log(categoryWiseBudget);
				if (categoryWiseBudget.method === 'Envelop Method') {
					categoryWiseBudget.budget.forEach((item, idx) => {
						if (item.category == selectedCategory) {
							item.budgetSpent = item.budgetSpent + parseFloat(amount);
							isCategoryBudgetSet = true;
						}

						if (item.category == "Other Expenses") {
							otherExpIdx = idx;
						}
					});

					if (!isCategoryBudgetSet && otherExpIdx > -1) {
						categoryWiseBudget.budget[otherExpIdx].budgetSpent = categoryWiseBudget.budget[otherExpIdx].budgetSpent + parseFloat(amount);
					}
				}
				else if (categoryWiseBudget.method === 'Zero Based Budgeting') {
					categoryWiseBudget.budget.forEach((item, idx) => {
						if (item.category == selectedCategory) {
							item.budgetSpent = item.budgetSpent + parseFloat(amount);
							isCategoryBudgetSet = true;
						}

						if (item.category == "Other Expenses") {
							otherExpIdx = idx;
						}

						if (item.category == "Savings") {
							savingsIdx = idx;
						}
					});

					if (!isCategoryBudgetSet && otherExpIdx > -1) {
						categoryWiseBudget.budget[otherExpIdx].budgetSpent = categoryWiseBudget.budget[otherExpIdx].budgetSpent + parseFloat(amount);
						categoryWiseBudget.budget[savingsIdx].budgetSpent = categoryWiseBudget.budget[savingsIdx].budgetPlanned - parseFloat(amount);
					}
					else {
						categoryWiseBudget.budget[savingsIdx].budgetSpent = categoryWiseBudget.budget[savingsIdx].budgetPlanned - parseFloat(amount);
					}
				}
				else {
					categoryWiseBudget.needs.forEach((item, idx) => {
						if (item.category == selectedCategory) {
							item.budgetSpent = item.budgetSpent + parseFloat(amount);
							isCategoryBudgetSet = true;
							done = true;
						}

						if (item.category == "Other Needs") {
							otherExpIdx = idx;
						}
					});

					if (!isCategoryBudgetSet && otherExpIdx > -1) {
						categoryWiseBudget.needs[otherExpIdx].budgetSpent = categoryWiseBudget.needs[otherExpIdx].budgetSpent + parseFloat(amount);
						done = true;
					}

					if (!done) {
						categoryWiseBudget.wants.forEach((item, idx) => {
							if (item.category == selectedCategory) {
								item.budgetSpent = item.budgetSpent + parseFloat(amount);
								isCategoryBudgetSet = true;
								done = true;
							}

							if (item.category == "Other Wants") {
								otherExpIdx = idx;
							}
						});

						if (!isCategoryBudgetSet && otherExpIdx > -1) {
							categoryWiseBudget.wants[otherExpIdx].budgetSpent = categoryWiseBudget.wants[otherExpIdx].budgetSpent + parseFloat(amount);
							done = true;
						}

					}

					if (!done) {
						categoryWiseBudget.needs.forEach((item, idx) => {
							if (item.category == selectedCategory) {
								item.budgetSpent = item.budgetSpent + parseFloat(amount);
								isCategoryBudgetSet = true;
								done = true;
							}

							if (item.category == "Other Savings") {
								otherExpIdx = idx;
							}
						});

						if (!isCategoryBudgetSet && otherExpIdx > -1) {
							categoryWiseBudget.savings[otherExpIdx].budgetSpent = categoryWiseBudget.savings[otherExpIdx].budgetSpent + parseFloat(amount);
							done = true;
						}
					}
				}

				await setDoc(doc(db, "User", auth.currentUser.uid, "Budget", recordId), categoryWiseBudget);

				const querySnapshot = await getDocs(collection(db, "expense"));
				querySnapshot.forEach((doc) => {
					console.log(doc.id, JSON.stringify(doc.data()));
				});

				if (isEnabled) {
					const document = await getDoc(doc(db, "User", auth.currentUser.uid));
					const userName = document.data().name;
					route.params.grpMembersList.forEach((item) => {

						if (userName != item.name) {
							const message = `${userName} has split a bill with you. Kindly pay amount of Rs.${item.amount}.`
							SmsAndroid.autoSend(
								item.contactNo,
								message,
								(fail) => {
									console.log('Failed with this error: ' + fail);
								},
								(success) => {
									console.log('SMS sent successfully');
								},
							);
						}

					})

				}

				alert("Record Added Successfully");
				navigation.navigate("Root");

			} catch (error_1) {
				console.error("Error adding document: ", error_1);
				throw error_1;
			}



		} catch (e) {
			console.error("Error adding document: ", e);
		}
	};


	return (
		<Background>

			<View style={styles.container2}>

				<Text style={styles.headCenter}>Add Image</Text>

				<Modal
					animationType="slide"
					transparent
					visible={isImgModalVisible}
					presentationStyle="overFullScreen"
					onDismiss={() => {
						setVisibilityOfImgModal(!isImgModalVisible);
					}}
				>
					<View style={styles.viewWrapper}>
						<View style={styles.modalView}>
							<TouchableOpacity onPress={showImagePicker} style={styles.selImg}>
								<Text style={{ color: "white", fontSize: 15, fontWeight: 'bold' }}> Upload image </Text>
							</TouchableOpacity>

							<TouchableOpacity onPress={openCamera} style={styles.selImg}>
								<Text style={{ color: "white", fontSize: 15, fontWeight: 'bold' }}> Take Photo </Text>
							</TouchableOpacity>

							<TouchableOpacity onPress={() => {
								setVisibilityOfImgModal(!isImgModalVisible);
							}}>
								<Text style={{ color: darkGreen, fontSize: 15, marginTop: 30 }}> Close </Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
				<TouchableOpacity
					onPress={() => {
						console.log("image clicked");
						setVisibilityOfImgModal(true);
					}}
				>
					{pickedImagePath !== "" && (
						<Image
							source={{ uri: pickedImagePath }}
							style={{ width: 50, height: 50, margin: 15, alignSelf: 'center' }}
							onPress={() => {
								console.log("image clicked");
								setVisibilityOfImgModal(true);
							}}
						/>
					)}
				</TouchableOpacity>

				<TouchableOpacity
					onPress={makeRequest}
					style={{
						backgroundColor: darkGreen,
						borderRadius: 200,
						alignItems: 'center',
						width: 250,
						paddingVertical: 5,
						marginVertical: 10,
						alignSelf: 'center',
						//marginTop:30,
					}}>
					<Text style={{ color: "white", fontSize: 20, fontWeight: 'bold', margin: 0 }}> Save </Text>
				</TouchableOpacity>
			</View>

			<View style={styles.container2}>

				<Text style={styles.headCenter}>Fetched Data</Text>

				{(ocrCategory !== null && ocrAmount != null && ocrDate != null) && (
					<View style={styles.mainContainer}>
						<ScrollView>
							<View style={styles.container1}>
								<View style={styles.inputPair}>
									<Text style={styles.head}>Amount:</Text>
									<TextInput
										keyboardType="numeric"
										style={styles.inputText}
										defaultValue={(ocrAmount).toString()}
										onChangeText={setAmount}
									/>
								</View>

								{console.log(new Date(ocrDate), '**********************123*****************************************')}
								{datePicker && (
									<DateTimePicker
										value={new Date(ocrDate)}
										mode={"date"}
										display={Platform.OS === "ios" ? "spinner" : "default"}
										is24Hour={true}
										onChange={onDateSelected}
										style={styles.datePicker}
									/>
								)}

								<View View style={styles.inputPair}>
									<Text style={styles.head}>Date: </Text>
									{!datePicker && (
										<View style={styles.inputText}>
											<Pressable style={styles.dateButton} onPress={showDatePicker}>
												<Text>{date != null ? (date.getDate() + ' / ' + (date.getMonth() + 1) + ' / ' + date.getFullYear()) : ocrDate}</Text>
											</Pressable>
										</View>
									)}
								</View>
							</View>

							<View style={styles.container1}>
								<Text style={styles.headCenter}>Select Category</Text>

								<Dropdown

									style={styles.dropdown}
									placeholderStyle={styles.placeholderStyle}
									selectedTextStyle={styles.selectedTextStyle}
									inputSearchStyle={styles.inputSearchStyle}
									iconStyle={styles.iconStyle}
									data={category}
									search
									maxHeight={300}
									labelField="label"
									valueField="value"
									placeholder={ocrCategory}
									searchPlaceholder="Search..."
									value={ocrCategory}
									onChange={(item) => {
										if (item.value != "other") setSelectedCategory(item.value);
										else {
											setVisibilityOfCatModal(true);
										}
									}}
								/>
							</View>


							<Modal
								animationType="slide"
								transparent
								visible={isCatModalVisible}
								presentationStyle="overFullScreen"
								onDismiss={() => {
									setVisibilityOfCatModal(!isCatModalVisible);
								}}
							>
								<View style={styles.viewWrapper}>
									<View style={styles.modalView}>
										<TextInput
											placeholder="Enter Category"
											style={styles.textInput}
											onChangeText={(value) => {
												setSelectedCategory(value);
											}}
										/>

										{/** This button is responsible to close the modal */}
										<Button
											title="Add Category"
											onPress={() => {
												setVisibilityOfCatModal(!isCatModalVisible);
												setCategory([
													...category,
													{ label: selectedCategory, value: selectedCategory },
												]);
												// addCategoryToFD(selectedCategory);
											}}
										/>
									</View>
								</View>
							</Modal>

							<View style={[styles.grpExpcontainer, styles.container1]}>
								<Text style={styles.grpExpText}>Group Expense : </Text>
								<Switch
									trackColor={{ false: '#767577', true: 'lightgreen' }}
									thumbColor={isEnabled ? 'green' : 'white'}
									onValueChange={(val) => toggleSwitch(val)}
									value={isEnabled}
								/>
							</View>
							<View style={styles.container2}>
								<Text style={styles.head}>Add note</Text>
								<TextInput
									placeholder="Description"
									style={styles.input1}
									onChangeText={(value) => {
										setDescription(value);
									}}
								/>

							</View>


							<TouchableOpacity
								onPress={saveExpense}
								style={{
									backgroundColor: darkGreen,
									borderRadius: 200,
									alignItems: 'center',
									width: 250,
									paddingVertical: 5,
									marginVertical: 10,
									alignSelf: 'center',
									//marginTop:30,

								}}>
								<Text style={{ color: "white", fontSize: 20, fontWeight: 'bold', margin: 0 }}> Save </Text>
							</TouchableOpacity>
						</ScrollView>
					</View>)}

			</View>
		</Background>
	);
}


const styles = StyleSheet.create({
	container: {
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		height: height * 0.7,
		width: width,
		backgroundColor: "#fff",
		margin: 15,

	},

	mainContainer: {
		padding: 5,
		flex: 1,
		height: "100%",
		justifyContent: "space-between"
	},

	container1: {
		width: "100%",
		alignSelf: "center",
		borderRadius: 15,
		shadowOpacity: 0.5,
		shadowColor: "black",
		shadowOffset: {
			height: 5,
			width: 5
		},
		elevation: 5,
		backgroundColor: "white",
		marginVertical: 5,
	},

	container2: {
		width: "100%",
		alignSelf: "center",
		borderRadius: 15,
		shadowOpacity: 0.5,
		shadowColor: "black",
		shadowOffset: {
			height: 5,
			width: 5
		},
		elevation: 5,
		backgroundColor: "white",
		marginVertical: 5,
		paddingTop: 5,
		paddingLeft: 20,
		paddingRight: 20,
	},
	container_btn_block: {
		flexDirection: 'row',
		paddingBottom: 10,
		paddingTop: 10,
		justifyContent: "space-around",
	},
	container2_btn: {
		padding: 15,
		flexGrow: 1,
		flexShrink: 0,
		flexBasis: 100,
		borderRadius: 10,
		backgroundColor: "#841584",
		color: "white",
		width: 150,
		margin: 5,
	},

	Title: {
		color: "white",
		fontSize: 50,
		fontWeight: "bold",
		marginVertical: 20,
		alignSelf: "center",
	},

	inputPair: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 10
	},

	head: {
		// marginTop:15,
		fontWeight: "bold",
		fontSize: 16,
		color: darkGreen,
	},

	inputText: {
		padding: 0,
		borderRadius: 5,
		color: darkGreen,
		paddingHorizontal: 5,
		width: '60%',
		height: 35,
		backgroundColor: 'rgb(220,220, 220)',

	},

	input1: {
		borderWidth: 1,
		borderColor: '#777',
		borderRadius: 10,
		padding: 10,
		width: "100%",
		height: 80,
		marginTop: 10,
		marginBottom: 15,
		textAlignVertical: "top",
		textAlign: 'left'
	},

	headCenter: {
		marginTop: 10,
		fontWeight: "bold",
		alignSelf: "center",
		color: darkGreen,
		fontSize: 16
	},

	dropDownStyle: {
		width: '85%',
		backgroundColor: 'rgba(0,0,0,0.2)',
		padding: 5,
		alignSelf: "center",
		borderRadius: 6,
		justifyContent: 'space-between',
		alignItems: 'center'
	},

	dropDownIcon: {
		resizeMode: 'contain',
	},

	modal: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "white",
		height: 300,
		width: "80%",
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#fff",
		marginTop: 80,
		marginLeft: 40,
	},

	//cat modal styles
	viewWrapper: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(0, 0, 0, 0.2)",
	},

	modalView: {
		alignItems: "center",
		justifyContent: "center",
		position: "absolute",
		top: "50%",
		left: "50%",
		elevation: 5,
		transform: [{ translateX: -(width * 0.4) }, { translateY: -90 }],
		height: 180,
		width: width * 0.8,
		backgroundColor: "#fff",
		borderRadius: 7,
	},

	textInput: {
		width: "80%",
		borderRadius: 5,
		paddingVertical: 8,
		paddingHorizontal: 16,
		marginBottom: 8,
		backgroundColor: "red",
	},

	// text: {
	//   fontSize: 25,
	//   color: 'red',
	//   padding: 3,
	//   marginBottom: 10,
	//   textAlign: 'center'
	// },

	// Style for iOS ONLY...
	datePicker: {
		justifyContent: "center",
		alignItems: "flex-start",
		width: 320,
		height: 50,
		display: "flex",
	},

	dateLabel: {
		marginTop: 15,
	},

	dateButton: {

		padding: 7,
		alignSelf: "center",
		borderRadius: 5,
		flexDirection: 'row',
		width: 180,
		alignItems: 'center',
		// backgroundColor: 'rgb(220,220, 220)',
	},


	catItem: {
		padding: 10,
		backgroundColor: "skyblue",
		fontSize: 14,
		marginHorizontal: 10,
		marginTop: 24,
	},

	dropdown: {
		margin: 10,
		width: '85%',
		backgroundColor: 'rgba(0,0,0,0.2)',
		padding: 5,
		alignSelf: "center",
		borderRadius: 6,
		// flexDirection:'row',
		alignItems: 'center'
	},

	icon: {
		marginRight: 5,
	},
	placeholderStyle: {
		fontSize: 14,
	},
	selectedTextStyle: {
		fontSize: 14,
	},
	iconStyle: {
		width: 20,
		height: 20,
	},
	inputSearchStyle: {
		height: 40,
		fontSize: 16,
	},

	selImg: {
		backgroundColor: darkGreen,
		borderRadius: 10,
		alignItems: 'center',
		width: 150,
		paddingVertical: 5,
		marginVertical: 10,
		alignSelf: 'center',
		marginTop: 5,
	},
	grpExpcontainer: {
		backgroundColor: 'rgba(0,0,0,0.2)',
		borderRadius: 10,
		flexDirection: "row",
		justifyContent: 'space-between',
		alignItems: "center",
		marginVertical: 5,
		height: 50,
		paddingHorizontal: 20,
	},
	grpExpText: {
		color: darkGreen,
		fontWeight: 'bold'
	}
});