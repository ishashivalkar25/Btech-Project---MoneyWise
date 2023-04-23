import {React, useState, useEffect} from 'react'
import { StyleSheet,Pressable, ScrollView,TextInput, Text, Dimensions, Image, View ,Button, Modal, TouchableOpacity} from 'react-native'
import Background from '../Background';
import { darkGreen } from "../Constants";
import * as ImagePicker from "react-native-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  db,
  collection,
  addDoc,
  getDocs,
  storage,
  doc,
  auth
} from '../../Firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import uploadImg from "../../Assets/uploadReceiptIcon.png";
import Toast from "react-native-root-toast";

const { width, height } = Dimensions.get("window");

export default function ScanBills() {

  const [file, setFile] = useState(null);
  const [fetchedData,setFetchedData] = useState("")
  const [ocrCategory,setOcrCategory] = useState(null)
  const [ocrAmount,setOcrAmount] = useState(null)
  const [ocrDate,setOcrDate] = useState(null)
  const [isImgModalVisible, setVisibilityOfImgModal] = useState(false);
  const [pickedImagePath, setPickedImagePath] = useState(
    Image.resolveAssetSource(uploadImg).uri
  );
  const [date, setDate] = useState(null);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [mounted,setMounted] = useState(false);
  const [category, setCategory] = useState([]);
  const [isCatModalVisible, setVisibilityOfCatModal] = useState(false);

  
  const [datePicker, setDatePicker] = useState(false);

  useEffect(() => {
    if(fetchedData!="")
     {
      setOcrCategory(fetchedData.document.inference.prediction.category.value)
      setOcrAmount(fetchedData.document.inference.prediction.total_amount.value)
      setOcrDate(fetchedData.document.inference.prediction.date.value)
      console.log(ocrCategory,ocrAmount,ocrDate,typeof(new Date(ocrDate)))
     }
  }, [fetchedData])

  useEffect(()=>{
    const loadData=async () => {
      const catList = [];
      try {
        const querySnapshot = await getDocs(collection(db, "ExpCategory"));
        querySnapshot.forEach((doc) => {
          //   console.log(doc.id, JSON.stringify(doc.data()));
          const catName = doc.data();
          getcat = { label: catName.ExpCatName, value: catName.ExpCatName };
          console.log(getcat);
          catList.push(getcat);
        });

        catList.push({ label: "other", value: "other" });
        setCategory(catList);
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
    data.append('document', { uri: fileUri,type: 'image/jpeg',name: 'receipt',});
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
      else if(selectedCategory==""){
         // Add a Toast on screen.
         let toast = Toast.show("Please select category.", {
          duration: Toast.durations.LONG,
        });
  
        // You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
        setTimeout(function hideToast() {
          Toast.hide(toast);
        }, 800);
      }
      else
      {
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
        const storageRef = ref(storage, "ExpImages/" + Date.now());
        const uploadTask = uploadBytesResumable(
          storageRef,
          blobImage,
          metadata
        );
  
        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
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
  
      console.log(selectedCategory);
      if(pickedImagePath != Image.resolveAssetSource(uploadImg).uri)
        {
          const docRef = await addDoc(collection(doc(db,"User",auth.currentUser.uid), "Expense"), {
            expAmount: amount,
            expDate: date,
            expCategory: selectedCategory,
            expDescription: description,
            expImage: pickedImagePath,
          });
        }
        else{
          const docRef = await addDoc(collection(doc(db,"User",auth.currentUser.uid), "Expense"), {
            expAmount: amount,
            expDate: date,
            expCategory: selectedCategory,
            expDescription: description
          });
        }
  
      const querySnapshot = await getDocs(collection(db, "expense"));
      querySnapshot.forEach((doc) => {
        console.log(doc.id, JSON.stringify(doc.data()));
      });
      }
  
      alert("Record Added Successfully");
      props.navigation.replace("HomePage");
      
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
                   <Text style={{color: "white", fontSize: 15, fontWeight: 'bold'}}> Upload image </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={openCamera} style={styles.selImg}>
                   <Text style={{color: "white", fontSize: 15, fontWeight: 'bold'}}> Take Photo </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                  setVisibilityOfImgModal(!isImgModalVisible); }}>
                   <Text style={{color: darkGreen, fontSize: 15, marginTop:30}}> Close </Text>
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
                style={{ width: 50, height: 50, margin:15, alignSelf:'center'}}
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
            alignSelf:'center',
            //marginTop:30,
          }}>
        <Text style={{color: "white", fontSize: 20, fontWeight: 'bold', margin:0}}> Save </Text>
        </TouchableOpacity>
        </View>

        <View style={styles.container2}>
        
        <Text style={styles.headCenter}>Fetched Data</Text>

          {(ocrCategory!==null && ocrAmount!=null && ocrDate!=null) && (
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
     
           <View style={styles.inputPair}>
               <Text style={styles.head}>Date: </Text>
               {!datePicker && (
                 <View style={styles.inputText}>
                   <Pressable style={styles.dateButton} onPress={showDatePicker}>
                     <Text style={styles.textInput}>{date!=null ? (date.getDate() + ' / '+ (date.getMonth()+1) + ' / ' +date.getFullYear()) : ocrDate}</Text>
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
                 // renderLeftIcon={() => (
                 //   <AntDesign
                 //     style={styles.icon}
                 //     color="black"
                 //     name="Safety"
                 //     size={20}
                 //   />
                 // )}
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
     
     
           {/* <TouchableOpacity
           onPress={saveExpense}
           style={{
           backgroundColor: darkGreen,
           borderRadius: 200,
           alignItems: 'center',
           width: 250,
           paddingVertical: 5,
           marginVertical: 10,
           alignSelf:'center',
           //marginTop:30,
     
         }}>
         <Text style={{color: "white", fontSize: 20, fontWeight: 'bold', margin:0}}> Save </Text>
         </TouchableOpacity> */}
         </ScrollView>
           </View>
          )}
        </View>
        </Background>
      );
}


const styles = StyleSheet.create({

  mainContainer : {
    padding: 25,
    flex: 1,
    height:"100%",
    justifyContent: "space-between"
  },

  inputText: {
    borderRadius: 5,
    color: darkGreen,
    paddingHorizontal: 5,
    width: '60%',
    height:35,
    backgroundColor: 'rgb(220,220, 220)',
  },

  container1: {
    width:"100%",
    alignSelf: "center",
    borderRadius:15,
    shadowOpacity:0.5,
    shadowColor:"black",
    shadowOffset:{
      height:5,
      width:5
    },
    elevation:5,
    backgroundColor:"white",
    marginTop:20,
  },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      
    },
    text : {
      color: '#9c27b0'
    },

    inputPair: {
      flexDirection:"row",
      justifyContent:"space-between",
      padding:10
    },
    
     container2: {
    width:"100%",
    alignSelf: "center",
    borderRadius:15,
    shadowOpacity:0.5,
    shadowColor:"black",
    shadowOffset:{
   // height:5,
    //width:5
    },

    elevation:5,
    backgroundColor:"white",
    marginTop:30,
    paddingTop:5,
    paddingLeft:20,
    paddingRight:20,
  },

  headCenter: {
      marginTop:10,
      fontWeight:"bold",
      alignSelf: "center",
      color: darkGreen,
      fontSize:16
    },

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
  selImg :{
    backgroundColor: darkGreen,
    borderRadius: 10,
    alignItems: 'center',
    width: 150,
    paddingVertical: 5,
    marginVertical: 10,
    alignSelf:'center',
    marginTop:5,
  },

  });