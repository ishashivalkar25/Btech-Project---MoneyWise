import React from 'react'
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Image } from 'react-native'

import { selectContactPhone } from 'react-native-select-contact';
import { PermissionsAndroid, Platform } from 'react-native';
import { NavigationRouteContext } from '@react-navigation/native';



const AddGrpExpMembers = ({ route, navigation}) => {

    const [membersList, setMembersList] = React.useState([]);
    const [extraData, setExtraData] = React.useState(false);

    const getPhoneNumber = async () => {
        // on android we need to explicitly request for contacts permission and make sure it's granted
        // before calling API methods
        if (Platform.OS === 'android') {
            const request = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            );

            // denied permission
            if (request === PermissionsAndroid.RESULTS.DENIED) throw Error("Permission Denied");

            // user chose 'deny, don't ask again'
            else if (request === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) throw Error("Permission Denied");
        }

        // Here we are sure permission is granted for android or that platform is not android
        const selection = await selectContactPhone().
            then(function (selection) {
                console.log('Successfully Fetched Contact');
                if (!selection) {
                    return null;
                }

                let { contact, selectedPhone } = selection;

                const phoneNo = selectedPhone.number.replaceAll(" ", "");
                const tempMember = { contactName: contact.name, contactNo: phoneNo, amount: 0 };

                if (validatePhoneNo(phoneNo) && validateMember(tempMember)) {
                    setMembersList([...membersList, tempMember])
                    setExtraData(true);
                }
                console.log(`Selected ${selectedPhone.type} phone number ${phoneNo} from ${contact.name}`);
                // membersList.push({contactName : contact.name, contactNo : selectedPhone.number});

                return selectedPhone.number;
            })
            .catch(function (error) {
                console.log('There has been a problem with your fetch operation: ' + error.message);
                // ADD THIS THROW error
                // throw error;
                return null;
            });

        if (!selection) {
            return null;
        }

        // let { contact, selectedPhone } = selection;

        // const phoneNo = selectedPhone.number.replaceAll(" ", "");
        // const tempMember = { contactName: contact.name, contactNo: phoneNo, amount: 0 };

        // if (validatePhoneNo(phoneNo) && validateMember(tempMember)) {
        //     setMembersList([...membersList, tempMember])
        //     setExtraData(true);
        // }
        // console.log(`Selected ${selectedPhone.type} phone number ${phoneNo} from ${contact.name}`);
        // // membersList.push({contactName : contact.name, contactNo : selectedPhone.number});

        // return selectedPhone.number;
    }

    const validateMember = (member) => {

        var flag = true;
        membersList.forEach((item) => {
            if (item.contactName == member.contactName && item.contactNo == member.contactNo) {
                alert("Member is already added to list");
                flag = false;
            }
        });
        console.log("here")
        return flag;
    }
    const validatePhoneNo = (phoneNo) => {
        var phoneNoRegex = /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

        console.log(phoneNo);
        if (phoneNoRegex.test(phoneNo)) {
            return true;
        }
        else {
            alert("Please select valid contact!");
            return false;
        }
    }

    React.useEffect(() => {
        console.log(membersList, "12");
        setExtraData(true);
    }, [membersList])


    React.useEffect(() => {
        addUser();
    }, [])

    const addUser = async() =>
    {
        try{
            const document = await getDoc(doc(db, "User", auth.currentUser.uid));
            const userName = document.data().name;
            setMembersList([{ contactName: userName, contactNo: phoneNo, amount: 0 }]);
        }catch(e)
        {
            console.log(e);
        }
        
    }

    const deleteMember = (item) => {
        const filterData = membersList.filter(curr => curr !== item);
        console.log(filterData);
        console.log(filterData.length);
        setMembersList(filterData);

    }

    const splitEvenly = () => {

        const splitAmount = route.params.splitAmount;

        const members = membersList.length;

        const splitPerHead = parseFloat((parseFloat(splitAmount) / members).toFixed(2));

        var totalAmount = 0;
        membersList.forEach((item, index) => {
            if (index == membersList.length - 1) {
                item.amount = parseFloat((splitAmount - totalAmount).toFixed(2));
            }
            else {
                item.amount = splitPerHead;
                totalAmount = totalAmount + splitPerHead;
            }
        });
        console.log(membersList, "121");
        setExtraData(true);
        setExtraData(false);
    }

    const validateSplit = () => {
        var totalAmount = 0;
        membersList.forEach((item) => {
            totalAmount = totalAmount + item.amount;
        });
        console.log(totalAmount);
        const splitAmount = route.params.splitAmount;
        if (totalAmount < splitAmount) {
            alert(`${splitAmount - totalAmount} less than total`)
        }
        else if (totalAmount > splitAmount) {
            alert(`Exceeds total by ${totalAmount - splitAmount}`);
        }
        else {

            navigation.navigate('Manual', {grpMembersList : membersList});
            alert('Saved');
        }
    }
    return (
        <View style={styles.container}>
            <View style={styles.splitAmt}>
                <Text style={styles.splitAmtText}>Total</Text>
                <Text style={styles.splitAmtVal}>{route.params.splitAmount}</Text>
            </View>
            {membersList.length == 0 && (<View style={styles.memberContainer}>
                <Text style={styles.emptyList}>Please Add Members!</Text>
            </View>)}
            {membersList.length > 0 && (<TouchableOpacity style={styles.splitEvenlyBtn} onPress={() => splitEvenly()}>
                <Text style={styles.splitEvenlyBtnText}>Split Evenly</Text>
            </TouchableOpacity>)}
            <FlatList
                data={membersList}
                renderItem={({ item, index }) =>
                    <View style={styles.memberContainer}>
                        <View style={styles.memberContent}>
                            <Text style={styles.memberText}>{item.contactName}</Text>
                            <TextInput
                                style={[styles.memberText, styles.memberContri]}
                                onChangeText={(text) => {
                                    item.amount = parseFloat(text);;
                                    // membersList[index].amount = parseFloat(text);
                                    // setMembersList(membersList);
                                    console.log(membersList, '22')
                                }}
                                editable={true}
                                placeholder="0.0"
                                keyboardType="numeric"
                            >{item.amount}</TextInput>
                        </View>
                        <TouchableOpacity onPress={() => deleteMember(item)}>
                            <Image source={require('../../Assets/close_icon.png')} style={styles.cancelMemberBtn} />
                        </TouchableOpacity>
                    </View>
                }
                extraData={extraData}
            />


            <TouchableOpacity style={styles.addMembersBtn} onPress={getPhoneNumber}>
                <Image source={require('../../Assets/new-user.png')} style={{ width: 30, height: 30, tintColor: "white" }} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitGrpExpBtn, (membersList != null && membersList.length > 0) ? styles.enabled : styles.disabled]} disabled={(membersList != null && membersList.length > 0) ? false : true} onPress={() => validateSplit()}>
                <Text style={styles.submitGrpExpBtnText}>Save Split</Text>
            </TouchableOpacity>
        </View>
    )
}

export default AddGrpExpMembers;

const styles = StyleSheet.create({
    container: {
        height: "100%",
    },
    emptyList: {
        fontSize: 16,
        textAlign: "center",
        width: "100%"
    },
    splitAmt: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: 'center',
        padding: 5,
    },
    splitAmtText: {
        fontSize: 16,
        textDecorationLine: "underline",
    },
    splitAmtVal: {
        fontSize: 25,
        fontWeight: 'bold'
    },
    splitEvenlyBtn: {
        // backgroundColor:"pink"
    },
    splitEvenlyBtnText: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: "right",
        paddingHorizontal: 20,
        textDecorationLine: "underline",
    },
    addMembersBtn: {
        backgroundColor: "green",
        width: 60,
        height: 60,
        borderRadius: 30,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        position: 'absolute',
        right: 15,
        bottom: 50,
        zIndex: 1
    },
    memberContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
        paddingHorizontal: 20,
        paddingVertical: 5,
        height: 50,
        borderRadius: 10,
        margin: 5
    },
    memberContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "85%"
    },
    memberText: {
        fontSize: 15,
    },
    memberContri: {
        textDecorationLine: "underline",
        textDecorationStyle: 'dashed',
        padding: 0,
        margin: 0,
        textAlign: 'center'
    },
    cancelMemberBtn: {
        width: 15,
        height: 15,
        tintColor: "red"
    },
    submitGrpExpBtn: {
        backgroundColor: "green",
        padding: 10,
        borderRadius: 10,
        margin: "auto",
    },
    submitGrpExpBtnText: {
        fontSize: 15,
        textAlign: "center",
        color: "white",
        fontWeight: "bold"
    },
    disabled: {
        opacity: 0.7
    },
    enabled: {
        opacity: 1
    }
})
