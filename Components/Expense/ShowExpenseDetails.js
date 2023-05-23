import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from "react-native-root-toast";
import notifee from '@notifee/react-native';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
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
  Switch
} from "react-native";

import {
  db,
  collection,
  addDoc,
  getDocs,
  getDoc,
  storage,
  auth,
  doc,
  updateDoc,
  setDoc
} from '../../Firebase/config';

import DateTimePicker from "@react-native-community/datetimepicker";

import { useState, useEffect, useContext } from "react";

import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import uploadImg from "../../Assets/uploadReceiptIcon.png";
// import { TouchableOpacity } from 'react-native-web';
import * as ImagePicker from 'react-native-image-picker';
import Background from "../Background";
import { green } from "../Constants";
import SmsAndroid from 'react-native-get-sms-android';

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
let downloadURL = ""
const { width, height } = Dimensions.get("window");

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function ShowExpenseDetails({ route, navigation }) {

  const [expenseRecId, setExpenseRecId] = useState(route.params.expenseRecId);
  const [expenseRec, setExpenseRec] = useState(route.params.expenseRec);
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState([]);
  const [imagePath, setImagePath] = useState();
  const [datePicker, setDatePicker] = useState(false);
  const [isCatModalVisible, setVisibilityOfCatModal] = useState(false);
  const [isImgModalVisible, setVisibilityOfImgModal] = useState(false);
  const [date, setDate] = useState(expenseRec.expDate.toDate());
  const [previousExpAmt, setPreviousExpAmt] = useState()
  const [accBalance, setAccBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(expenseRec.expCategory);
  const [userExpCategories, setUserExpCategories] = useState([]);

  const [description, setDescription] = useState("");

  const [isEnabled, setIsEnabled] = useState(expenseRec.groupExp);

  async function onDisplayNotification(category,limit) {
		// Request permissions (required for iOS)
		await notifee.requestPermission()
	
		// Create a channel (required for Android)
		const channelId = await notifee.createChannel({
		  id: 'default',
		  name: 'Default Channel',
		});
	
		// Display a notification
		await notifee.displayNotification({
		  title: 'Budget Exceeded',
		  body: 'Budget planned exceeded for '+category+' by '+limit,
		  android: {
			channelId,
			pressAction: {
			  id: 'default',
			},
		  },
		});
	  }

	const toggleSwitch = (val) => {

		if (amount > 0) {
			setIsEnabled(previousState => !previousState);
			console.log(isEnabled)
			if (val) {
				navigation.navigate("AddGrpExpMembers", {
					splitAmount: amount,
					previous_screen: 'ShowExpenseDetails',
          grpMembersList : expenseRec.groupExp ? expenseRec.grpMembersList : []
				})
			}
		}
		else {
			alert("Please Enter Expense Amount!")
		}
	}

  useEffect(() => {
    setDate(expenseRec.expDate.toDate());
    setAmount(expenseRec.expAmount);
    setSelectedCategory(expenseRec.expCategory);
    let imageSrc = ""
    if (expenseRec.expImage)
      imageSrc = expenseRec.expImage;
    else
      imageSrc = pickedImagePath;
    setPickedImagePath(imageSrc);
    const loadData = async () => {
      const catList = [];
      try {
        const user = await getDoc(doc(db, "User", auth.currentUser.uid));
        user.data().expCategories.forEach((item) => {
          //   console.log(doc.id, JSON.stringify(doc.data()));
          getcat = { label: item, value: item };
          // console.log(getcat);
          catList.push(getcat);
        });
        // console.log(user.data() , "user");
        // catList.push(user.data().expCategories);
        catList.push({ label: "Other", value: "Other" });
        setCategory(catList);
        setAccBalance(user.data().accBalance);
        setUserExpCategories(user.data().expCategories);
        // console.log(user.data().expCategories, "userExpCategories");
        // console.log(category);

      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }

    console.log(route.params, 'route.params');
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

	useEffect(() => {

		if (route.params && route.params.grpMembersList) {

      const tempExp  = expenseRec;
      tempExp.grpMembersList = route.params.grpMembersList;
			console.log(route.params.grpMembersList, 'route.params.grpMembersList');
			setExpenseRec(tempExp);
		}
	}, [route.params]);


  const updateRecord = async () => {


    try {
      if (amount == 0) {
        // Add a Toast on screen.
        let toast = Toast.show("Please enter amount.", {
          duration: Toast.durations.LONG,
        });

        // You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
        setTimeout(function hideToast() {
          Toast.hide(toast);
        }, 800);
      }
      else if (selectedCategory == "") {
        // Add a Toast on screen.
        let toast = Toast.show("Please select category.", {
          duration: Toast.durations.LONG,
        });

        // You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
        setTimeout(function hideToast() {
          Toast.hide(toast);
        }, 800);
      }
      else if (isEnabled && (route.params==null || (route.params!=null && (route.params.grpMembersList==null || (route.params.grpMembersList!=null && route.params.grpMembersList.length==0))))){
				// alert('Please add group members to split an expense.')
				// Add a Toast on screen.
				let toast = Toast.show("Please add group members to split an expense.", {
					duration: Toast.durations.LONG,
				});

				// You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
				setTimeout(function hideToast() {
					Toast.hide(toast);
				}, 800);

			}
      else {
        if (pickedImagePath != Image.resolveAssetSource(uploadImg).uri) {
          //concerting image to blob image
          const blobImage = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
              resolve(xhr.response);
            };
            xhr.onerror = function () {
              reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", pickedImagePath, true);
            xhr.send(null);
          });

          //set metadata of image
          /**@type */
          const metadata = {
            contentType: "image/jpeg",
          };

          // Upload file and metadata to the object 'images/mountains.jpg'
          const storageRef = ref(storage, "expImages/" + Date.now());
          const uploadTask = uploadBytesResumable(
            storageRef,
            blobImage,
            metadata
          );

          // Listen for state changes, errors, and completion of the upload.
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Get task progress, expluding the number of bytes uploaded and the total number of bytes to be uploaded
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
              // A full list of error codes is available at
              // https://firebase.google.com/docs/storage/web/handle-errors
              switch (error.code) {
                case "storage/unauthorized":
                  // User doesn't have permission to access the object
                  break;
                case "storage/canceled":
                  // User canceled the upload
                  break;

                // ...

                case "storage/unknown":
                  // Unknown error occurred, inspect error.serverResponse
                  break;
              }
            },
            () => {
              // Upload completed successfully, now we can get the download URL
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                console.log("File available at", downloadURL);
              });
            }
          );
        }

        // console.log(selectedCategory);
        if (pickedImagePath != Image.resolveAssetSource(uploadImg).uri) {
          // Assuming db and auth are initialized properly
          const docRef = doc(db, 'User', auth.currentUser.uid, 'Expense', expenseRecId);
          setPickedImagePath(downloadURL);

          const updatedData = {
            expAmount: amount,
            expDate: date,
            expCategory: selectedCategory,
            expDescription: description,
            groupExp : isEnabled
          };

          if (pickedImagePath != Image.resolveAssetSource(uploadImg).uri && pickedImagePath != expenseRec.expImage) {
            updatedData.expImage = pickedImagePath;
          }

          if (pickedImagePath == expenseRec.expImage) {
            updatedData.expImage = expenseRec.expImage;
          }

          if (isEnabled) {
            updatedData.grpMembersList = (route.params!=null && route.params.grpMembersList!=null && route.params.grpMembersList.length>0) ? route.params.grpMembersList : expenseRec.grpMembersList;
          }

          await setDoc(docRef, updatedData);
        }
        else {
          // Assuming db and auth are initialized properly
          const docRef = doc(db, 'User', auth.currentUser.uid, 'Expense', expenseRecId);

          const updatedData = {
            expAmount: amount,
            expDate: date,
            expCategory: selectedCategory,
            expDescription: description,
            groupExp : isEnabled
          };
          if (isEnabled) {
            updatedData.grpMembersList = (route.params!=null && route.params.grpMembersList!=null && route.params.grpMembersList.length>0) ? route.params.grpMembersList : expenseRec.grpMembersList;
          }
          await setDoc(docRef, updatedData);
        }

        console.log("Previous income amount------>", previousExpAmt);

        //Update budget
				const recordId = months[date.getMonth()] + "" + date.getFullYear();
				console.log(recordId);
				const document = await getDoc(doc(db, "User", auth.currentUser.uid, "Budget", recordId));
	
				if(document.data())
				{
					const categoryWiseBudget = document.data()
					var isCategoryBudgetSet = false;
					var isPreExpAmtAdded = false;
					var otherExpIdx = -1;
					var savingsIdx = -1;
					var done = false;
					var doneSubtracting = false;
		
					if (categoryWiseBudget.method === 'Envelop Method') {
						console.log('Inside : ', categoryWiseBudget.method)
	
            if(expenseRec.expCategory==selectedCategory)
            {
              categoryWiseBudget.budget.forEach((item, idx) => {
                if (item.category == selectedCategory) {
                  item.budgetSpent = item.budgetSpent - parseFloat(expenseRec.expAmount) + parseFloat(amount);
                  if(item.budgetSpent>item.budgetPlanned)
									onDisplayNotification(item.category,item.budgetSpent-item.budgetPlanned);
								isCategoryBudgetSet = true;
                }
      
                if (item.category == "Additional Expenses") {
                  otherExpIdx = idx;
                }
              });
      
              if (!isCategoryBudgetSet && otherExpIdx > -1) {
                categoryWiseBudget.budget[otherExpIdx].budgetSpent = categoryWiseBudget.budget[otherExpIdx].budgetSpent - parseFloat(expenseRec.expAmount) + parseFloat(amount);
                if(categoryWiseBudget.budget[otherExpIdx].budgetSpent>categoryWiseBudget.budget[otherExpIdx].budgetPlanned)
								  onDisplayNotification(selectedCategory,categoryWiseBudget.budget[otherExpIdx].budgetSpent-categoryWiseBudget.budget[otherExpIdx].budgetPlanned)
						}
            }
            else
            {
              categoryWiseBudget.budget.forEach((item, idx) => {

                if (item.category == expenseRec.expCategory) {
                  item.budgetSpent = item.budgetSpent - parseFloat(expenseRec.expAmount) ;
                  isPreExpAmtAdded = true;
                }

                if (item.category == selectedCategory) {
                  item.budgetSpent = item.budgetSpent + parseFloat(amount);
                  if(item.budgetSpent>item.budgetPlanned)
									 onDisplayNotification(item.category,item.budgetSpent-item.budgetPlanned);
                  isCategoryBudgetSet = true;
                }
      
                if (item.category == "Additional Expenses") {
                  otherExpIdx = idx;
                }
              });
      
              if (!isPreExpAmtAdded && otherExpIdx > -1) {
                categoryWiseBudget.budget[otherExpIdx].budgetSpent = categoryWiseBudget.budget[otherExpIdx].budgetSpent - parseFloat(expenseRec.expAmount);
              }
              if (!isCategoryBudgetSet && otherExpIdx > -1) {
                categoryWiseBudget.budget[otherExpIdx].budgetSpent = categoryWiseBudget.budget[otherExpIdx].budgetSpent + parseFloat(amount);
                if(categoryWiseBudget.budget[otherExpIdx].budgetSpent>categoryWiseBudget.budget[otherExpIdx].budgetPlanned)
								  onDisplayNotification(selectedCategory,categoryWiseBudget.budget[otherExpIdx].budgetSpent-categoryWiseBudget.budget[otherExpIdx].budgetPlanned)
						
              }
            }
						
					}
					else if (categoryWiseBudget.method === 'Zero Based Budgeting') {
	
						console.log('Inside : ', categoryWiseBudget.method)

            if(expenseRec.expCategory==selectedCategory)
            {
              categoryWiseBudget.budget.forEach((item, idx) => {
                if (item.category == selectedCategory) {
                  item.budgetSpent = item.budgetSpent - parseFloat(expenseRec.expAmount) + parseFloat(amount);
                  if(item.budgetSpent>item.budgetPlanned)
									 onDisplayNotification(item.category,item.budgetSpent-item.budgetPlanned);
                  isCategoryBudgetSet = true;
                }
      
                if (item.category == "Savings") {
                  savingsIdx = idx;
                }
              });
      
              if (!isCategoryBudgetSet && savingsIdx > -1) {
                categoryWiseBudget.budget[savingsIdx].budgetSpent = categoryWiseBudget.budget[savingsIdx].budgetSpent - parseFloat(expenseRec.expAmount) + parseFloat(amount);
                // categoryWiseBudget.budget[savingsIdx].budgetPlanned = categoryWiseBudget.budget[savingsIdx].budgetPlanned + parseFloat(expenseRec.expAmount) - parseFloat(amount);
                if(categoryWiseBudget.budget[savingsIdx].budgetSpent>categoryWiseBudget.budget[savingsIdx].budgetPlanned)
								  onDisplayNotification(selectedCategory,categoryWiseBudget.budget[savingsIdx].budgetSpent-categoryWiseBudget.budget[savingsIdx].budgetPlanned)
						
                console.log('deducted from Other exp', categoryWiseBudget.budget[savingsIdx].budgetSpent)
              }
      
            }
            else
            {
              categoryWiseBudget.budget.forEach((item, idx) => {
                if (item.category == expenseRec.expCategory) {
                  item.budgetSpent = item.budgetSpent - parseFloat(expenseRec.expAmount) ;
                  isPreExpAmtAdded = true;
                }
                if (item.category == selectedCategory) {
                  item.budgetSpent = item.budgetSpent  + parseFloat(amount);
                  if(item.budgetSpent>item.budgetPlanned)
									 onDisplayNotification(item.category,item.budgetSpent-item.budgetPlanned);
                  isCategoryBudgetSet = true;
                }
      
                if (item.category == "Savings") {
                  savingsIdx = idx;
                }
              });
      
              if (!isPreExpAmtAdded && savingsIdx > -1) {
                categoryWiseBudget.budget[savingsIdx].budgetSpent = categoryWiseBudget.budget[savingsIdx].budgetSpent - parseFloat(expenseRec.expAmount) ;
                // categoryWiseBudget.budget[savingsIdx].budgetSpent = categoryWiseBudget.budget[savingsIdx].budgetPlanned + parseFloat(expenseRec.expAmount) ;
                console.log('Added from Other exp', categoryWiseBudget.budget[savingsIdx].budgetSpent)
              }
              if (!isCategoryBudgetSet && savingsIdx > -1) {
                categoryWiseBudget.budget[savingsIdx].budgetSpent = categoryWiseBudget.budget[savingsIdx].budgetSpent  + parseFloat(amount);
                if(categoryWiseBudget.budget[savingsIdx].budgetSpent>categoryWiseBudget.budget[savingsIdx].budgetPlanned)
								  onDisplayNotification(selectedCategory,categoryWiseBudget.budget[savingsIdx].budgetSpent-categoryWiseBudget.budget[savingsIdx].budgetPlanned)
						
                // categoryWiseBudget.budget[savingsIdx].budgetSpent = categoryWiseBudget.budget[savingsIdx].budgetPlanned  - parseFloat(amount);
                console.log('deducted from Other exp', categoryWiseBudget.budget[savingsIdx].budgetSpent)
              }
      
            }

					}
					else {
						console.log('Inside : ', categoryWiseBudget)

            if(expenseRec.expCategory==selectedCategory)
            {
              categoryWiseBudget.budget.needs.forEach((item, idx) => {
                if (item.category == selectedCategory) {
                  item.budgetSpent = item.budgetSpent - parseFloat(expenseRec.expAmount) + parseFloat(amount);
                  if(item.budgetSpent>item.budgetPlanned)
									  onDisplayNotification(item.category,item.budgetSpent-item.budgetPlanned);
                  isCategoryBudgetSet = true;
                  done = true;
                }
              });
      
              if (!done) {
                categoryWiseBudget.budget.wants.forEach((item, idx) => {
                  if (item.category == selectedCategory) {
                    item.budgetSpent = item.budgetSpent - parseFloat(expenseRec.expAmount) + parseFloat(amount);
                    if(item.budgetSpent>item.budgetPlanned)
									    onDisplayNotification(item.category,item.budgetSpent-item.budgetPlanned);
                    isCategoryBudgetSet = true;
                    done = true;
                  }
                });
      
              }
      
              if (!done) {
                categoryWiseBudget.budget.savings.forEach((item, idx) => {
                  if (item.category == selectedCategory) {
                    item.budgetSpent = item.budgetSpent - parseFloat(expenseRec.expAmount) + parseFloat(amount);
                    if(item.budgetSpent>item.budgetPlanned)
                      onDisplayNotification(item.category,item.budgetSpent-item.budgetPlanned);
                    isCategoryBudgetSet = true;
                    done = true;
                  }
      
                  if (item.category == "Other Savings") {
                    otherExpIdx = idx;
                  }
                });
      
                if (!isCategoryBudgetSet && otherExpIdx > -1) {
                  categoryWiseBudget.budget.savings[otherExpIdx].budgetSpent = categoryWiseBudget.budget.savings[otherExpIdx].budgetSpent - parseFloat(expenseRec.expAmount) + parseFloat(amount);
                  done = true;
                  if(categoryWiseBudget.budget[otherExpIdx].budgetSpent>categoryWiseBudget.budget[otherExpIdx].budgetPlanned)
								    onDisplayNotification(selectedCategory,categoryWiseBudget.budget[otherExpIdx].budgetSpent-categoryWiseBudget.budget[otherExpIdx].budgetPlanned)
                }
              }
            }
            else
            {


              categoryWiseBudget.budget.needs.forEach((item, idx) => {
                if (item.category == expenseRec.expCategory) {
                  item.budgetSpent = item.budgetSpent - parseFloat(expenseRec.expAmount) ;
                  isPreExpAmtAdded = true;
                  doneSubtracting == true;
                }
                if (item.category == selectedCategory) {
                  item.budgetSpent = item.budgetSpent + parseFloat(amount);
                  if(item.budgetSpent>item.budgetPlanned)
                  onDisplayNotification(item.category,item.budgetSpent-item.budgetPlanned);
                  isCategoryBudgetSet = true;
                  done = true;
                }
              });
      
              if (!done || !doneSubtracting) {
                categoryWiseBudget.budget.wants.forEach((item, idx) => {
                  if (item.category == expenseRec.expCategory) {
                    item.budgetSpent = item.budgetSpent - parseFloat(expenseRec.expAmount) ;
                    isPreExpAmtAdded = true;
                    doneSubtracting == true;
                  }
                  if (item.category == selectedCategory) {
                    item.budgetSpent = item.budgetSpent + parseFloat(amount);
                    if(item.budgetSpent>item.budgetPlanned)
                    onDisplayNotification(item.category,item.budgetSpent-item.budgetPlanned);
                    isCategoryBudgetSet = true;
                    done = true;
                  }
                });
      
              }
      
              if (!done || !doneSubtracting) {
                categoryWiseBudget.budget.savings.forEach((item, idx) => {
                  if (item.category == expenseRec.expCategory) {
                    item.budgetSpent = item.budgetSpent - parseFloat(expenseRec.expAmount) ;
                    isPreExpAmtAdded = true;
                    doneSubtracting == true;
                  }
                  if (item.category == selectedCategory) {
                    item.budgetSpent = item.budgetSpent + parseFloat(amount);
                    if(item.budgetSpent>item.budgetPlanned)
                    onDisplayNotification(item.category,item.budgetSpent-item.budgetPlanned);
                    isCategoryBudgetSet = true;
                    done = true;
                  }
      
                  if (item.category == "Other Savings") {
                    otherExpIdx = idx;
                  }
                });
      
                if (!isPreExpAmtAdded && otherExpIdx > -1) {
                  categoryWiseBudget.budget.savings[otherExpIdx].budgetSpent = categoryWiseBudget.budget.savings[otherExpIdx].budgetSpent - parseFloat(expenseRec.expAmount) ;
                  done = true;
                }
                if (!isCategoryBudgetSet && otherExpIdx > -1) {
                  categoryWiseBudget.budget.savings[otherExpIdx].budgetSpent = categoryWiseBudget.budget.savings[otherExpIdx].budgetSpent + parseFloat(amount);
                  if(categoryWiseBudget.budget[otherExpIdx].budgetSpent>categoryWiseBudget.budget[otherExpIdx].budgetPlanned)
								    onDisplayNotification(selectedCategory,categoryWiseBudget.budget[otherExpIdx].budgetSpent-categoryWiseBudget.budget[otherExpIdx].budgetPlanned)
						      done = true;
                }
              }
            }
						
					}
		
					await setDoc(doc(db, "User", auth.currentUser.uid, "Budget", recordId), categoryWiseBudget);
		
				}

				//add category to user expense categories if not present
				if(!userExpCategories.includes(selectedCategory))
				{
					userExpCategories.push(selectedCategory);
					await updateDoc(doc(db, "User", auth.currentUser.uid), {
						expCategories : userExpCategories,
					});
				}


        
        //update account balance
        await updateDoc(doc(db, "User", auth.currentUser.uid), {
          accBalance: parseFloat(accBalance) + parseFloat(expenseRec.expAmount) - parseFloat(amount) + ""
        });

        const querySnapshot = await getDocs(collection(db, "expense"));
        querySnapshot.forEach((doc) => {
          console.log(doc.id, JSON.stringify(doc.data()));
        });

        alert("Record Added Successfully");
        navigation.navigate("Root");
      }

    } catch (e) {
      console.error("Error adding document: ", e);
    }
    // console.log("Date",date)

  }


  //   { label: 'Salary', value: 'Salary' },
  //   { label: 'Rent', value: 'Rent' },
  //   { label: 'Bonus', value: 'Bonus' },
  //   { label: 'Allowance', value: 'Allowance' },
  //   { label: 'Other', value: 'Other' }

  const get_category_list = async () => {
    const catList = [];
    try {
      const querySnapshot = await getDocs(collection(db, "ExpCategory"));
      querySnapshot.forEach((doc) => {

        catName = doc.data();
        getcat = { label: catName.ExpCatName, value: catName.ExpCatName };

        catList.push(getcat);
      });


      catList.map((getcat) => setCategory([...category, getcat]));

    } catch (e) {
      console.error("Error adding document: ", e);
    }
    return catList;
  };

  const addCategoryToFD = async (value) => {
    try {
      const docRef = await addDoc(collection(db, "ExpCategory"), {
        expCatName: value,
      });

      const querySnapshot = await getDocs(collection(db, "Expense"));
      querySnapshot.forEach((doc) => {
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };



  const [pickedImagePath, setPickedImagePath] = useState(
    Image.resolveAssetSource(uploadImg).uri
  );

  // This function is triggered when the "Select an image" button pressed
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
        // console.log(result.assets[0].uri, "file");
        setPickedImagePath(result.assets[0].uri);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const sendReminder = async() => {

    if (isEnabled) {
      const document = await getDoc(doc(db, "User", auth.currentUser.uid));
      const userName = document.data().name;
      expenseRec.grpMembersList.forEach((item) => {

        if(userName != item.name)
        {
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
  }

  return (
    <ImageBackground
      source={require('../../Assets/Background.jpg')}
      style={{ width: width, height: height, marginTop: insets.top }}
    >
      <Text style={styles.Title}>Edit Expense</Text>
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <ScrollView>
            <View style={styles.container1}>
              <View style={styles.inputPair}>
                <Text style={styles.head}>Amount: </Text>
                <TextInput
                  testID="setAmtId"
                  keyboardType="numeric"
                  style={styles.inputText}
                  defaultValue={expenseRec.expAmount}
                  onChangeText={(val) => {
                    setPreviousExpAmt(amount);
                    setAmount(val);
                  }}
                />
              </View>

              {datePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={expenseRec.expDate.toDate()}
                  mode={"date"}
                  textColor={green}
                  display={"default"}
                  is24Hour={true}
                  onChange={onDateSelected}
                  style={styles.datePicker}
                />
              )}

              <View style={styles.inputPair}>
                <Text style={styles.head}>Date: </Text>
                {!datePicker && (
                  <View style={styles.inputText}>
                    <Pressable testID="showDatePicker" style={styles.dateButton} onPress={showDatePicker}>
                      <Text>{date.getDate() + ' / ' + (date.getMonth() + 1) + ' / ' + date.getFullYear()}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.container1}>
              <Text style={styles.headCenter}>Select Category</Text>

              <Dropdown
                testID="setSelectedCatId"
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
                placeholder="Category"
                textColor={green}
                searchPlaceholder="Search..."
                value={selectedCategory}
                onChange={(item) => {
                  if (item.value != "Other") setSelectedCategory(item.value);
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
                  <TouchableOpacity
                    testID="addCategory"
										onPress={() => {
											setVisibilityOfCatModal(!isCatModalVisible);
											setCategory([
												...category,
												{ label: selectedCategory, value: selectedCategory },
											]);
										}}
										style={{
											backgroundColor: green,
											borderRadius: 200,
											alignItems: 'center',
											width: "60%",
											paddingVertical: 5,
											marginVertical: 10,
											alignSelf: 'center',
											//marginTop:30,
										}}>
										<Text style={{ color: "white", fontSize: 20, fontWeight: 'bold', margin: 0 }}> Add Category </Text>
									</TouchableOpacity>

                </View>
              </View>
            </Modal>

            <View style={[styles.grpExpcontainer, styles.container1]}>
							<Text style={styles.grpExpText}>Group Expense : </Text>
							<Switch
								trackColor={{ false: '#767577', true: 'lightgreen' }}
								thumbColor={isEnabled ? green : 'white'}
								onValueChange={(val) => toggleSwitch(val)}
								value={isEnabled}
							/>
              {isEnabled && ((expenseRec.groupExp && expenseRec.grpMembersList) || (route.params && route.params.grpMembersList)) && <TouchableOpacity style={styles.sendReminder} onPress={() => sendReminder()}>
								<Text style={styles.sendReminderText}>Remind Members</Text>
							</TouchableOpacity>}
						</View>

            <View style={styles.container2}>
              <Text style={styles.head}>Add note</Text>
              <TextInput
                placeholder="Description"
                style={styles.input1}
                defaultValue={expenseRec.expDescription}
                onChangeText={(value) => {
                  setDescription(value);
                }}
              />
              {/* {console.log(imagePath)} */}
              <Text style={styles.headCenter}>Add Image</Text>

              <Modal
                testID="imgModal"
                animationType="slide"
                transparent
                visible={isImgModalVisible}
                presentationStyle="overFullScreen"
                onDismiss={() => {
                  setVisibilityOfCatModal(!isImgModalVisible);
                }}
              >
                <View style={styles.viewWrapper}>
                  <View style={styles.modalView}>
                    <TouchableOpacity testID="showImagePicker" onPress={showImagePicker} style={styles.selImg}>
                      <Text style={{ color: "white", fontSize: 15, fontWeight: 'bold' }}> Upload image </Text>
                    </TouchableOpacity>

                    <TouchableOpacity testID="openCamera" onPress={openCamera} style={styles.selImg}>
                      <Text style={{ color: "white", fontSize: 15, fontWeight: 'bold' }}> Take Photo </Text>
                    </TouchableOpacity>

                    <TouchableOpacity testID="closeImagePicker" onPress={() => {
                      setVisibilityOfImgModal(!isImgModalVisible);
                    }}>
                      <Text style={{ color: green, fontSize: 15, marginTop: 30 }}> Close </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              <TouchableOpacity
                testID="setVisibilityOfImgModal"
                onPress={() => {
                  console.log("image clicked");
                  setVisibilityOfImgModal(true);
                }}
              >
                {pickedImagePath !== "" && (
                  <Image
                    testID="selectOtherImg"
                    source={{ uri: pickedImagePath }}
                    style={{ width: 50, height: 50, margin: 15, alignSelf: 'center' }}
                    onPress={() => {
                      console.log("image clicked");
                      setVisibilityOfImgModal(true);
                    }}
                  />
                )}
              </TouchableOpacity>

            </View>


            <TouchableOpacity
              testID="saveExpenseBtn"
              style={{
                backgroundColor: green,
                borderRadius: 200,
                alignItems: 'center',
                width: 250,
                paddingVertical: 5,
                marginVertical: 10,
                alignSelf: 'center',
                //marginTop:30,

              }} onPress={() => {
                updateRecord()
              }}>
              <Text style={{ color: "white", fontSize: 20, fontWeight: 'bold' }}> Save </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </ImageBackground>
  )
}


const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: height * 0.8,
    width: width,
    backgroundColor: "#fff",
    marginTop: 5,
  },

  mainContainer: {
    padding: 25,
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
    marginTop: 20,
  },

  container2: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 15,
    shadowOpacity: 0.5,
    shadowColor: "black",
    shadowOffset: {
      // height:5,
      //width:5
    },

    elevation: 5,
    backgroundColor: "white",
    marginTop: 30,
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
    color: green,
  },

  inputText: {
    padding: 0,
    borderRadius: 5,
    color: green,
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
    color: green,
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
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    marginBottom: 8,
  },

  // text: {
  //   fontSize: 25,
  //   color: 'red',
  //   padding: 3,
  //   marginBottom: 10,
  //   textAlign: 'center'
  // },

  dateButton: {
    padding: 7,
    alignSelf: "center",
    borderRadius: 5,
    flexDirection: 'row',
    width: 180,
    alignItems: 'center',
    backgroundColor: 'rgb(220,220, 220)',
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
    backgroundColor: green,
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
		color: green,
		fontWeight: 'bold'
	},
  sendReminder : {
    padding : 5,
  },
  sendReminderText : {
    color : '#B43757',
    fontSize : 14,
    fontWeight : 'bold',
    textDecorationLine : 'underline',
  }
});

export default ShowExpenseDetails;