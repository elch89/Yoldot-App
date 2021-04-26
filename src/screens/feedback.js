import React, { useEffect, useState,useFocusEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback, 
    Animated, 
    Alert,
    TouchableOpacity,
    BackHandler,
    Button,
} from 'react-native';
import myColor from '../styles/colors'
import Survey from '../containers/survey';
import {openDatabase} from 'react-native-sqlite-storage'
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal'
import connection from '../netConfig'
import AsyncStorage from '@react-native-community/async-storage';
import { useNavigation, CommonActions ,StackActions} from '@react-navigation/native';
 // Open data base and get questions table
var db = openDatabase({ name: 'qoest_db.db', createFromLocation : 1});

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width


///////////////////////////////////////
function Feedback(props){
   
    const clearResArr=()=>{
        // Remove all records so far in results array
        global.resultArray = new Array(48);
        for(let i=0;i<resultArray.length;i++){
            resultArray[i] ={id:i+1,answer:[],qtype:null};
        }
    } 
    // on mount component functional hook - clears the array on mount
    useEffect(()=>{clearResArr()},[]);
    // States and react native HOOKS
    const position = new Animated.ValueXY();
    const [surveyQuestions, setSurveyQuestions] = useState([]);
    const [current, setCurrent] = useState(0);// 47
    const [titles, setTitles] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [mail, setEmail] = useState("");
    const [hospitals,setHospitals] = useState([])
    const navigation = useNavigation(); 
    const [formComplete, setFormComplete] = useState(false);

    const loadAsyncData = async () =>{
        // Categories: Ifyun 0-10, Mashov 11-27 , Seker 28-44, SviutRatzon 45-47
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM questions_table', [], (tx, results) => {
                var questions = [];
                for (let i = 0; i < results.rows.length; ++i) {
                    questions.push(results.rows.item(i));
                }
                setSurveyQuestions(questions);
            });
        });
        // fetch user email from stored data - for identification of submitter
        AsyncStorage.getItem('email').then((mail)=>{
            setEmail(mail);
          } );
        const { route } = props;
        let hospitals = route.params?.value ?? 'A problem fetching data'; 
        hospitals[hospitals.length]={id:hospitals.length+1,name:'אחר'};
        setHospitals(hospitals);
    };
    // on mount 'hook' - preform local db actions
    useEffect(()=>{
        loadAsyncData();
    },[]); 
    // Prevent exit on back press, confirmation with user - hook for background action
    useEffect( () => 
    navigation.addListener('beforeRemove', (e) => {
        if(formComplete)
        {
            return;
        }
        e.preventDefault();

        Alert.alert(
          'האם את בטוחה שאת רוצה לצאת?',
          'נתוני הטופס שמילאת לא יישמרו',
          [
            { text: "ביטול", style: 'cancel', onPress: () => {} },
            {
              text: 'אישור',
              style: 'destructive',
              onPress: () => props.navigation.dispatch(e.data.action),
            },
          ]
        );
      }),
    [navigation, formComplete]
    );
    const updateEntries = (dataFromChild) => {
        // updates entry if user decides to change answer
        // no item selected, do not try to update/enter
        if(dataFromChild.selectedItem.length == 0){
            return null
        }
        // enter new values
        let ind = dataFromChild.qid-1
        resultArray[ind] = {
            id:dataFromChild.qid, 
            answer:[...dataFromChild.selectedItem], 
            qtype:dataFromChild.qtype,
        }
    }
    
    const _hideMyModal = () => {// Close modal
        setIsModalVisible(false);
    }
    const toggleModal = () => {
        // modal toggle 
        setIsModalVisible(!isModalVisible);
    };

    const updateTitles=(currTit)=>{// Update the modal text according to entry progress - CHANGE TEXT optional
        if(currTit == 11 ||currTit == 28 ||currTit == 45){
            toggleModal()
        }
        if(11<=currTit&& currTit<28){
            setTitles(1);
        }
        else if(28<=currTit&& currTit<45){
            setTitles(2);
        }
        else if(45<=currTit&& currTit<=47){
            setTitles(3);
        }
    }
    // card movement actions 
    const moveForword=()=>{
        let curr = filterForword(resultArray)
        
        Animated.spring(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: 0 }
          }).start(() => {
            setCurrent(curr);
          })
        //   updateTitles(curr)
    }
    const moveBackwords=()=>{
        let curr = filterBack()
        Animated.spring(position, {
            toValue: { x: -80, y: 0 }
          }).start(() => {
              setCurrent(curr);
          })
        //   updateTitles(curr)
    }
    // filters for ignoring cards 
    const filterBack=()=>{
        let idx = current-1
        const boolDepend = surveyQuestions[idx].depends /// 0/1
        if(boolDepend === 1){ // Skip backwords
            while(surveyQuestions[idx].depends === 1){
                idx-=1
            }
            return idx
        }
        return idx
    }
    const filterForword = (resultArr)=>{
        const editArr = surveyQuestions.slice();
        if(resultArr[current].id === 42){// child seperation use case
            if(resultArr[current].answer[0].aid === 0)//כן
            {
                editArr[current+1].depends = 0
            }
            else{
                editArr[current+1].depends = 1
                editArr[current+2].depends = 1
            }
        }
        if(resultArr[current].id === 43 && editArr[current].depends === 0){ // other reason for seperation
            if(resultArr[current].answer[0].aid === 2)// אחר
            {
                editArr[current+1].depends = 0
            }
            else{
                editArr[current+1].depends = 1
            }
            
        }
        if(resultArr[current].id === 7){
            let skipArr = [true,true];
            // reset if going back to change value
            hideQuestions(editArr,true,0)
            editArr[32].depends = 1

            for(let i = 0; i<resultArr[current].answer.length;i++){
                if(resultArr[current].answer[i].aid === 1){//'ניתוח קיסרי חירום'
                    editArr[current+1].depends = 0
                    editArr[32].depends = 0// הגיעה לשלב שני?
                    skipArr[0] = false;
                }
                if(resultArr[current].answer[i].aid === 5){//'זירוזים (סמני לפירוט)'
                    editArr[current+2].depends = 0
                    skipArr[1] =false;
                }
                // other logical hiding:
                if(resultArr[current].answer[i].aid === 0)//ניתוח קיסרי מתוכנן
                {
                    hideQuestions(editArr, true, 1)
                }
            }
            if(resultArr[current].id === 8 && editArr[current].depends === 0){
                if(resultArr[current].answer[0].aid === 0){//קיסרי חירום ללא חדר לידה
                    hideQuestions(editArr, true, 1)
                }
                if(resultArr[current].answer[0].aid === 1){// קיסרי חירום ללא שני
                    hideQuestions(editArr, false, 1)
                }
            }
            if(resultArr[current].id === 33 && editArr[current].depends === 0){// האם הגעת לשלב השני של הלידה (צירי לחץ)?
                if(resultArr[current].answer[0].aid === 1){// לא
                    hideQuestions(editArr, false, 1)
                }
            }
            if(skipArr[0] && skipArr[1]){
                editArr[current+1].depends = 1
                editArr[current+2].depends = 1
            }
            else if(skipArr[0]){//skip keisari
                editArr[current+1].depends = 1
            }
            else if(skipArr[1]){// skip Zeruzim
                editArr[current+2].depends = 1
            }
            
        }
        setSurveyQuestions(editArr);// update array
        updateLogic(current);
        let idx = current+1;
        if(surveyQuestions[idx].depends === 1){
            while(surveyQuestions[idx].depends ==1){
                setEmptyAnswer(idx);// needed for reseting cases if we go back and change answer for skipping logic
                idx += 1;
            }
            console.log('skip to ' + idx)
            return idx
        }
        return idx;
    }
    /// skiping logics
    const updateLogic=(ind)=>{
        const editArr = surveyQuestions.slice();
        let resultArr = resultArray[ind]
        // skip
        if((resultArr.id === 2 && resultArr.answer[0].val!=='אחר')//  בית חולים אחר
            ||(resultArr.id === 5 && resultArr.answer[0].val!=='כן')// פירוט הריון בסיכון
            ||(resultArr.id === 25 && resultArr.answer[0].val !=='כן')){
                editArr[ind+1].depends = 1
                setSurveyQuestions(editArr)
        }
        // dont skip
        else if((resultArr.id === 2 && resultArr.answer[0].val==='אחר')//  בית חולים אחר
        ||(resultArr.id === 5 && resultArr.answer[0].val==='כן')// פירוט הריון בסיכון
        ||(resultArr.id === 25 && resultArr.answer[0].val ==='כן')){
            editArr[ind+1].depends = 0
            setSurveyQuestions(editArr)
        }
    }
    const setEmptyAnswer=(ind)=>{
        resultArray[ind] ={
            id:ind+1, 
            answer:[],
            qtype:null,
        }
    }
    const hideQuestions=(edit, isLong, hide)=>{//to hide- hide=1
        if(isLong){
            edit[13].depends = hide//האם היתה קיימת אפשרות לסגירת הדלת במהלך הטיפול שקבלת?
            edit[14].depends = hide// באיזו מידה חשת שסביבת הלידה שלך שקטה?
            edit[15].depends = hide//האם אנשי הצוות דפקו בדלת או התריעו לפני הסטת וילון?
            edit[16].depends = hide// האם היו שרותים ומקלחת צמודים זמינים לך בלידה?
            edit[28].depends = hide// האם עודדו אותך לתנועה ולבחירת תנוחות זקופות במהלך הלידה?
            edit[29].depends = hide// האם המליצו לך לשתות ולאכול במהלך השהות בחדר הלידה?
            edit[30].depends = hide// האם תכננת לידה ללא תרופות משככות כאבים?
            edit[31].depends = hide// איזו מהאפשרויות הבאות הוצעה לך לשיכוך כאבים? (ניתן לבחור יותר מאפשרות אחת)
            
        }
        
        edit[33].depends = hide// באיזו תנוחת לידה ילדת?
        edit[34].depends = hide// האם עודדו אותך לבחור תנוחה מועדפת (בין היתר, תנוחה זקופה)? 
        edit[35].depends = hide// האם עודדו אותך ותמכו בך להיענות לתחושת הדחף של גופך?
        edit[36].depends = hide// האם הוצעו לך טכניקות למניעת נזקים לפרינאום: (ניתן לבחור יותר מאפשרות אחת) 
        edit[37].depends = hide// האם הופעל לחץ פיזי חיצוני (קריסטלר) על בטנך לקידום הלידה? 
        return edit;
    }
    const render = () => {
        // the main render of this component - creates animation and logic update
        // ### Animation configuration
        const nextCardOpacity = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1, 0, 1],
            extrapolate: 'clamp'
        });
        const nextCardScale = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1, 0.8, 1],
            extrapolate: 'clamp'
        });
        const rotate = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp'
        });
        const rotateAndTranslate = {
            transform: [{
            rotate: rotate
            },
            ...position.getTranslateTransform()
            ]
        }
        
        // render cards for survey
        return surveyQuestions.map((item, i) => {
            
            if (i < current) {
                return null; 
            }
            else if (i == current){
                return (
                <Animated.View
                key={i}
                style={[
                    rotateAndTranslate ,
                    styles.card
                ]
                }>
                    <View
                    style={styles.cardView}
                    >
                        <Survey // props from survey component: 
                            questid ={item.id} 
                            question={item.question} 
                            type = {item.type}
                            hospitals = {hospitals} // hospital list
                            onPressNext={() => {
                                if(current < surveyQuestions.length-1){
                                    moveForword();
                                }
                                else{// last card -
                                    //send data to server
                                    if(resultArray[47].answer.length === 0){// make sure array is full (mainly for testing)
                                        clearResArr();
                                        setCurrent(0);
                                        return; 
                                    }
                                    // set date as dd/mm/yyyy in result array
                                    if(resultArray[0].answer.length !== 0){
                                        let date = resultArray[0].answer[0].val;
                                        let formattedDate = date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
                                    
                                        resultArray[0].answer[0].val = formattedDate;// date of submission
                                    }
                                    setFormComplete(true);
                                    let successSubmition = submitToServer(resultArray, props, mail);
                                    if(!successSubmition){
                                        // update state... Failed to submit entry
                                        clearResArr();
                                        setCurrent(0);
                                        setTitles(0);
                                    }
                                }
                            }}
                            onPressBack={moveBackwords}
                            callbackFromParent = {updateEntries} 
                            submitted = {resultArray}
                            />
                    </View>
                </Animated.View>
                );
            }
            else {
                
                let idx = i;
                // Show depending next question
                while(surveyQuestions[idx].depends===1){
                    item = surveyQuestions[idx+1];
                    idx+=1
                }
                
                    return (
                        <Animated.View
                        key={i}
                        style={[{
                            opacity: nextCardOpacity,
                            transform: [{ scale: nextCardScale }]},
                            styles.card
                            ]}>
                            <View
                            style={styles.cardView}>
                                <Text style={{
                                    textAlign:"center",
                                    padding:20,
                                    paddingTop:50,
                                    fontWeight:'bold',
                                    fontSize:22,
                                    color:myColor.darkBlue,
                                }}>{item.question}</Text>
                            </View>
                        </Animated.View>
                        );
                
            }
        }).reverse();
    };
    // Final return component for render:
    return(
        <LinearGradient colors={[ myColor.gold,'#fff', myColor.lightBlue, myColor.darkBlue]}
                        locations={[0,0.1,0.7,1]}
                        style={styles.linearGradient}>
        <Modal isVisible={isModalVisible}
            onBackdropPress={_hideMyModal}>
        <TouchableWithoutFeedback 
            onPress={_hideMyModal}
            >
            {/* <View style={styles.modalStyle}>
                <RenderTitles titles = {titles} />
            </View> */}
        </TouchableWithoutFeedback>
        </Modal>
        <View style={{ flex: 16 }}>
        {render()}
        </View>
        <View style={styles.progress}><CircleArray numOfCircles={4} currCircle = {titles}/></View>

    </LinearGradient>
)

}
export default Feedback;

const submitToServer = (data,props, userId) =>{
    let successToken = false;
    let submition = JSON.stringify({
        'data':data,
        'email':userId,
    })
    let formData = new FormData();
    formData.append('data',submition);
    fetch(connection.URL+'submit.php', {
        method: 'POST',
        headers: { 
            'Accept': 'application/json', 
            'Content-Type': 'multipart/form-data' 
          },
        body: formData
      })
      .then((response) =>response.json())
      .then((responseData) => {
        console.log(responseData)
          if(responseData.error){ 
            Alert.alert('שגיאה','ארעה תקלה בקליטת הנתונים, יש להזין את הנתונים שנית');
          }
          else{
            Alert.alert('הנתונים נקלטו במערכת בהצלחה','תודה על מילוי המשוב',
                    [
                {text: 'אישור', onPress: () => console.log('OK Pressed')},
                ]
            );
            const resetAction = CommonActions.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
              props.navigation.dispatch(resetAction)
              successToken = true;
          }
      }).done();
      
      return successToken;
}
const CircleArray =(props)=>{
    let circArr = Array();
    for(let i=0;i<props.numOfCircles;i++){
      if(i == props.currCircle){
        circArr.push(<View key={i} style={[styles.circle,{backgroundColor:myColor.gold}]}/>);
    }
      else{ 
        circArr.push(<View key={i} style={styles.circle}/>);
      }
    }
    circArr.reverse();
    return circArr;
}
const RenderTitles= (props)=>{
    let key = props.titles;
    switch (key) {
        case 1:
            return <Text style={styles.modalTxt}>לפנייך מספר שאלות למשוב על חווית הלידה שלך</Text>
        case 2:
            return <Text style={styles.modalTxt}>לפנייך שאלות סקר, מטרת השאלון לאיסוף נתונים מדויקים לשימוש פנימי</Text>
        case 3:
            return <Text style={styles.modalTxt}>ולסיום חוות דעת כללית של חווית הלידה שלך</Text>
        default:
            return null
    }
}
const styles = StyleSheet.create({
    linearGradient: {
        position: 'absolute',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    progress:{
        flex:1,
        flexDirection:'row-reverse',
        alignSelf:'center',
        padding:15,
    },
    circle:{
        height:15, 
        width:15,
        borderRadius:15/2,
        borderColor:'#000',
        borderWidth:1,
        marginHorizontal:5
    },
    modalStyle:{
        padding:15,
        backgroundColor:'#fff',
        borderRadius:20,
    },
    modalTxt:{
        textAlign:'center',
        padding:35,
    },
    card:{
        height: SCREEN_HEIGHT-60,
        width: SCREEN_WIDTH,
        padding: 10,
        position:'absolute',
    },
    cardView:{
        flex: 1,
        resizeMode: "cover",
        borderRadius: 20,
        backgroundColor: '#fff',
        borderColor:myColor.darkBlue,
        borderWidth:2,
    }
});