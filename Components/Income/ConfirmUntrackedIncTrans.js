import React from 'react'
import {
	SafeAreaView,
	StyleSheet,
	Text,
	View,
	PermissionsAndroid,
	AppState,
	FlatList,
	TouchableOpacity,
	Image,
	BackHandler,
	Alert
} from 'react-native';

import {
	db,
	collection,
	addDoc,
	getDocs,
	getDoc,
	storage,
	auth,
	doc,
	updateDoc
  } from '../../Firebase/config';

const ConfirmUntrackedIncTrans = ({ route, navigation }) => {

    const [messageList, setMessageList] = React.useState([]);
    const [transactionList, setTransactionList] = React.useState([]);
    const [extraData, setExtraData] = React.useState(false);

    React.useEffect(() => {
        setMessageList(route.params.messageList);
        setExtraData(true);
        setExtraData(false);
		BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
		return () => {
		  BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
		};
    }, []);

	const saveAllRecords = () => {
		messageList.forEach((item) => {
			saveToDB(item);
			alert("All income transactions saved successfully!!")
		});
		navigation.navigate("Income");
	}

	const saveToDB = async(item) => {

		try{

			const user = await getDoc(doc(db, "User", auth.currentUser.uid));

			const docRef = await addDoc(collection(doc(db, "User", auth.currentUser.uid), "Income"), {
				incAmount: item.amount,
				incDate: new Date(item.date),
				incCategory: "Other",
				incDescription : ""
			  });

			  //update account balance
			  await updateDoc(doc(db,"User",auth.currentUser.uid), {
                accBalance :parseFloat(user.data().accBalance) + parseFloat(item.amount) +""
              });

			  console.log("Saved To DB");
		}
		catch(e)
		{
			console.log("Error To DB");
		}
		
	}

	function handleBackButtonClick() {

		if(messageList.length>0)
		{
			Alert.alert('Accept Transactions Alert', 'Do you want accept all transactions?', [
				{
					text: 'No',
					onPress: () => {console.log('Cancel Pressed'); navigation.navigate("Income");},
					style: 'cancel',
				},
				{ 
					text: 'Yes', 
					onPress: () => saveAllRecords(),
				},
			]);
		}
		else
		{
			navigation.navigate("Income");
		}
		return true;
	}
	

    const getDate = (timestamp) => {
        const tempDate = new Date(timestamp);
        return tempDate.getDate() + ' / ' + (tempDate.getMonth() + 1) + ' / ' + tempDate.getFullYear();
    }

    const onDelete = (item) => {
        const filterData = messageList.filter(curr => curr !== item);
        console.log(filterData);
        console.log(filterData.length);
        setMessageList(filterData);
    }
	
    const onAcceptAll = () => {
        console.log("AcceptAll");
        transactionList.push(...messageList);
        console.log(transactionList);
		saveAllRecords();
		navigation.navigate("Income", {
			transactionList : transactionList
		});
		
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.title}>
                <Text style={styles.titleText}>Untracked Incoming Transactions!</Text>
            </View>

            <View style={styles.transactions}>
                {messageList.length > 0 && <FlatList
                    data={messageList}
                    renderItem={({ item, index }) =>
                        <View style={styles.transactionContainer}>
                            <View style={styles.transactionContainerHeader}>
                                <Text style={styles.divider}>Transaction {index + 1}</Text>
                            </View>
                            <View style={styles.transactionContainerAlign}>
                                <View style={styles.transactionContainerContent}>
                                    <Text style={styles.bold}>Date</Text>
                                    <Text>{getDate(item.date)}</Text>
                                </View>
                                <View style={styles.transactionContainerContent}>
                                    <Text style={styles.bold}>Amount</Text>
                                    <Text>{item.amount}</Text>
                                </View>
                                <View style={styles.transactionContainerAlign}>
                                    {/* <TouchableOpacity style={[styles.transactionContainerButn, styles.btnAccept]} onPress={() => onAccept(item)}>
                                        <Image source={require('../../Assets/check.png')} style={styles.btn} />
                                    </TouchableOpacity> */}
                                    <TouchableOpacity style={[styles.transactionContainerButn, styles.btnDelete]} onPress={() => onDelete(item)}>
                                        <Image source={require('../../Assets/reject.png')} style={styles.btn} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    }
                    enableEmptySections={true}
                    extraData={extraData}
                />}
            </View>
			
            <TouchableOpacity  style={[styles.btnAcceptAll, messageList.length>0 ? styles.enabled : styles.disabled]} disabled={ messageList.length>0 ? false : true} onPress={() => onAcceptAll()} >
                <Text style={styles.btnAcceptAllText}>Accept All Transactions</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default ConfirmUntrackedIncTrans;


const styles = StyleSheet.create({

	container: {
		padding: 0
	},

	title: {
		backgroundColor: "rgba(0,0,0,0.2)",
		height: "8%",
		padding: 5,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center"
	},

	titleText: {
		textAlign: "center",
		fontSize: 18,
		fontWeight: "bold",
	},
	transactions: {
		height: "85.5%",
	},
	transactionContainer: {
		backgroundColor: "rgba(0,0,0,0.03)",
		borderRadius: 10,
		marginHorizontal: 5,
		marginVertical: 2,
		flexDirection: "column",
		justifyContent: "space-around",
		alignItems: "center",
	},
	transactionContainerHeader: {
		width: "100%",
		flexDirection: "column",
		justifyContent: "center",
	},
	divider: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		padding: 5,
		marginHorizontal: 10,
		fontWeight: "bold",
	},
	transactionContainerAlign: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		padding: 5,
	},
	transactionContainerContent: {
		flexDirection: "column",
		alignItems: "center",
		flexBasis: 0,
		flexGrow: 1,
	},
	bold: {
		fontWeight: "bold"
	},
	transactionContainerButn: {
		textAlign: 'center',
		padding: 5,
		width: 35,
		height: 35,
		marginHorizontal: 10,
		borderRadius: 40,
		flexDirection: "column",
		justifyContent: "center",

	},
	btn: {
		width: 25,
		height: 25,
		tintColor: "white"
	},
	btnAccept: {
		backgroundColor: "green",
	},
	btnDelete: {
		backgroundColor: "red",
	},
	btnAcceptAll: {
		backgroundColor: "green",
		height: "5.5%",
		borderRadius: 10,
		margin: 5,
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center"
	},
	btnAcceptAllText: {
		textAlign: "center",
		color: "white",
		fontSize: 15,
		fontWeight: "bold"
	},
	disabled: {
		opacity: 0.7
	  },
	  enabled: {
		  opacity: 1
	  }

});