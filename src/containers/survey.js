import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity

} from 'react-native';
import{ Picker} from '@react-native-picker/picker'
import myColor from '../styles/colors'
import DateTimePicker from '@react-native-community/datetimepicker'
import SelectableFlatlist, { STATE } from 'react-native-selectable-flatlist';
import NumericInput from 'rn-numeric-input'
import StarRating from 'react-native-star-rating'

export default class Survey extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            showDate:false,
            date: new Date(),
            starCount:0,
            selected:[],
            initialSelected:[],
            inpTxt:'',
        }
        global.entry = {
            qid: this.props.questid,
            selectedItem: []
        };
        // added for initial rendering - doesnt work in componentDidMount
        if(this.props.submitted !== undefined)
            this.updateMultipleInitial(this.props.submitted);
    }
    async componentDidMount(){// Update card according to previously
        if(this.props.submitted !== undefined)
            this.alreadyAnswerd(this.props.submitted);
        
    }
    renderChild(){
        const showDate = this.state.showDate;
        const date = this.state.date;
        const qType = this.props.type; 
        const question = this.props.question;
        const qid = this.props.questid
        if(qType ==='multiple_yn'){ // yes or no answers
            return(<View style = {{flex:1,}}>
        <Text style={styles.titles}>{question}</Text>
        <View style = {{flex:1,}}>
                <SelectableFlatlist
                    data={ynArray(qid)}
                    state={STATE.EDIT}
                    multiSelect={false}// true for more than 1 options
                    itemsSelected={(selectedItem) => { this.onItemsSelected(selectedItem); }}
                    initialSelectedIndex={this.state.initialSelected}
                    cellItemComponent={(item, otherProps) => this.rowItem(item)}
                    touchStyles = {{
                        flexDirection:'row',
                            }}
                    checkColor={myColor.darkBlue}
              
                    />
                    </View>
            </View>);
        }
        if(qType==='multiple'){ // 1 choice only
            return(<View style = {{flex:1,}}>
        <Text style={styles.titles}>{question}</Text>
        {/* <View style = {styles.contentStyle}> */}
        <View style = {{flex:1,}}>
                <SelectableFlatlist
                    data ={generateAnswers(qid)}
                    state={STATE.EDIT}
                    multiSelect={false}
                    itemsSelected={(selectedItem) => { this.onItemsSelected(selectedItem); }}
                    initialSelectedIndex={this.state.initialSelected}
                    cellItemComponent={(item, otherProps) => this.rowItem(item)}
                    touchStyles = {{flexDirection:'row', }}
                    checkColor={myColor.darkBlue}
                    
                    /></View>
            </View>);
        }
        if(qType==='checkbox'){ // multiple choices
            return(<View style = {{flex:1,}}>
        <Text style={styles.titles}>{question}</Text>
        <View style = {{flex:1,}}>
                <SelectableFlatlist
                    data ={generateAnswers(qid)}
                    state={STATE.EDIT}
                    multiSelect={true}// more than 1 options
                    itemsSelected={(selectedItem) => { this.onItemsSelected(selectedItem); }}
                    initialSelectedIndex={this.state.initialSelected}
                    cellItemComponent={(item, otherProps) => this.rowItem(item)}
                    touchStyles = {{flexDirection:'row'}}
                    checkColor={myColor.darkBlue}                    
                    /></View>
            </View>);
        }
        if(qType === 'dropdown'){// hospital selection
           
            return(
                <View>
                    <Text style={styles.titles}>{question}</Text>
                    <View style = {
                            [
                                styles.contentStyle, 
                                {
                                    backgroundColor:myColor.lightBlue,
                                    borderRadius:10,
                                }
                            ]
                        }>
                    <Picker
                    mode='dropdown'
                    selectedValue={this.state.selected}
                    onValueChange={(value,key)=>{
                        if(value!=null){
                            this.setState({selected: value});
                            this.onItemsSelected([{aid:key,val:value}]);
                        }
                        }}
                    >
                        <Picker.Item 
                        label={'בחרי בית חולים'}  value={null} />
                    {this.props.hospitals.map((item,i) => {
                    return (<Picker.Item label={item.name} value={item.name} key={i} />)
                    })}
                        
                    </Picker></View>
                </View>
                
            );
        }
        if(qType === 'open_short'){
            return(<View>
                <Text style={styles.titles}>{question}</Text>
                <View style = {styles.contentStyle}>
                <TextInput style={styles.txtInp}
                value={this.state.inpTxt}
                onChangeText={text => this.onChangeText(text)}
                onSubmitEditing = {(edit)=>{this.onItemsSelected([{aid:0,val:edit.nativeEvent.text}])}}/></View>
            </View>);
        }
        if(qType === 'open_numeric'){
            let numOfBirth = 0;
            if(this.props.submitted[qid-1].answer.length>0){
                numOfBirth = this.props.submitted[qid-1].answer[0].val;
            }
            return(<View>
                <Text style={styles.titles}>{question}</Text>
                <View style = {[styles.contentStyle, {alignItems:'center'}]}>
                <NumericInput 
                    value = {numOfBirth}
                    onChange={value => this.onItemsSelected([{aid:0,val:value}])} 
                    minValue={1}
                    maxValue={10}
                    borderColor='gray'
                    rounded ={true}
                    totalWidth= {250}
                    />
                </View>
            </View>);
        }
        if(qType === 'open_long'){
            return(<View>
                <Text style={styles.titles}>{question}</Text>
                <View style = {styles.contentStyle}>
                <TextInput style={[styles.txtInp,
                            {textAlignVertical: 'top', 
                            backgroundColor:myColor.lightBlue,
                            padding:10,
                        }]}
                    value={this.state.inpTxt}
                    onChangeText={text => this.onChangeText(text)}
                    onKeyPress = {()=>{this.onItemsSelected([{aid:0,val:this.state.inpTxt}])}}
                    blurOnSubmit={true}
                    multiline={true}
                    numberOfLines={14}
                    maxLength={500}
                /></View>
            </View>);
        }
        if (qType === 'date'){// choose date of birth
            return( 
            <View>
                <View><Text style={styles.titles}>{question}</Text></View>
                <TouchableOpacity style = {styles.dateContainer} 
                            onPress={this.datepicker}
                            >
                <View><Text style={{
                    textAlign:"center",
                    padding:50,
                    fontWeight:'bold',
                    fontSize:28,
                    color:myColor.darkBlue,
                }}>{date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear()}</Text></View>
                </TouchableOpacity>
             {showDate &&
            <DateTimePicker 
                value={date}
                mode = 'date'
                maximumDate={new Date()}// Limit selection
                onChange={this.setDate} />}
                </View>      );
        }
        if(qType === 'rate'){
            return(<View>
                <Text style={styles.titles}>{question}</Text>
                <View style = {styles.contentStyle}>
                    <StarRating
                        disabled={false}
                        maxStars={5}
                        fullStarColor={myColor.gold}
                        rating={this.state.starCount}
                        selectedStar={(rating) => this.onStarRatingPress(rating)}
                    />
                </View>
            </View>);
        }
        return (<View><Text style={styles.titles}>ERROR GETING DATA TYPES</Text></View>)
    }
    render(){
        const submitted = this.props.submitted;
        const qid = this.props.questid;
        let touchableNext =(
            <TouchableOpacity 
                key={0}
                style = {styles.btnContainer}
                onPress={()=>{  
                    this.props.callbackFromParent(entry);// update parent array
                    console.log(submitted[qid-1].answer)
                    // already submitted answer-> answer array not empty
                    if(entry.selectedItem.length>0 || submitted[qid-1].answer.length>0 || qid === 48)
                        this.props.onPressNext();
                }}>
                <View style={{justifyContent:'center'}}>
                    <Text style={styles.btnStyle}>
                        {(qid==48)?'לסיום':'הבא'} 
                    </Text>
                </View>
            </TouchableOpacity>
        );
        let touchableBack =(
            <TouchableOpacity 
                key={1}
                style = {styles.btnContainer}
                onPress={()=>{this.props.onPressBack();}}>
                <View style={{justifyContent:'center'}}>
                    <Text style={styles.btnStyle}>
                        {'הקודם'}
                    </Text>
                </View>
            </TouchableOpacity>);
        let touchable;
        if(qid===1){
            touchable = touchableNext;
        }
        else{
            touchable = [touchableNext,touchableBack]
        }
        return(
        <View style={{flex:1}}>
            <View style={{flex:6, }}>{this.renderChild()}</View>
            <View style={{flexDirection:'row-reverse', flex:1, paddingHorizontal:20}}>
                {touchable}
                </View>
            
        </View>);
    };
    updateMultipleInitial(answers){
        let idx = this.props.questid-1;
        if(answers[idx] === undefined){
            return
        }
        if(answers[idx].qtype==='multiple_yn' ||
            answers[idx].qtype==='multiple'||
            answers[idx].qtype ==='checkbox'){
            answers[idx].answer.map((item,key)=>
                this.state.initialSelected.push(answers[idx].answer[key].aid));
        }
    }
    alreadyAnswerd(answers){ // update states according to categories - already submitted
        let idx=this.props.questid-1;
        if(answers[idx] === undefined){
            return
        }
        else if(answers[idx].qtype === 'dropdown'){
            this.setState({selected: answers[idx].answer[0].val});
        }
        else if(answers[idx].qtype=== 'date'){
            this.setState({date:answers[idx].answer[0].val});
        }
        else if(answers[idx].qtype === 'open_short'||
                answers[idx].qtype === 'open_numeric'||
                answers[idx].qtype === 'open_long'){
            this.setState({inpTxt:answers[idx].answer[0].val})
        }
        else if(answers[idx].qtype === 'rate'){
            this.setState({starCount:answers[idx].answer[0].val})
        }
    }

    onStarRatingPress=(rating) =>{
        this.setState({starCount: rating});
        this.onItemsSelected([{aid:0,val:rating}])
    }
    onChangeText=(text)=>{this.setState({inpTxt:text})};
    datepicker = () => {this.setState({showDate:true});}
    onItemsSelected = (selectedItem) => {
        entry = {
            qid: this.props.questid,
            selectedItem: selectedItem,
            qtype:this.props.type,
        }
      }
    
    rowItem = (item) => (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'flex-start',
                paddingHorizontal: 30,
            }}
            >
            <Text style={{fontWeight:'bold',fontSize:16, }}>{item.val}</Text>
        </View>
        )
    setDate = (event, date) => {
        date = date || this.state.date;

        this.setState({
            showDate: Platform.OS === 'ios' ? true : false,
            date,
        });
        this.onItemsSelected([{aid:0,val:date}])
    }

}
/// sgirat delet - לא יודעת
const generateAnswers = (id)=>{
    let answers = Array();
    if(id===7){//hitarvut
        answers = [{aid:0,val:'ניתוח קיסרי מתוכנן'},{aid:1, val:'ניתוח קיסרי חירום'},
                {aid:2,val:'חתך חיץ'}, {aid:3,val:'ואקום'},
                {aid:4, val:'אפידורל'},{aid:5,val:'זירוזים (סמני לפירוט)'},{aid:6, val:'לא נדרשה התערבות'}]
    }
    if(id===8){//keisari cherum
        answers = [{aid:0,val:'קיסרי חירום ללא חדר לידה'},{aid:1, val:'קיסרי חירום ללא שני'},
                {aid:2,val:'קיסרי חירום שעברה חדר לידה וגם שלב שני'},]
    }
    if(id===9){//sugey zeruz
        answers = [{aid:0,val:'פקיעת מי שפיר מלאכותית'},{aid:1,val:'בלון'},{aid:2,val:'פרופס/ פרוסטגלנדינים'},
        {aid:3,val:'סטריפינג'},{aid:4,val:'ציטוטק'},{aid:5,val:'פיטוצין'},{aid:6,val:'פפברין'}]
    }
    if(id===10){//livuy meyaledet
        answers = [{aid:0,val:'מיילדת חדר לידה'},{aid:1,val:'מיילדת מרכז/ חדר לידה טבעית'},
                {aid:2,val:'מיילדת פרטית'},{aid:3,val:'רופא/ה פרטי/ת'}]
    }
    if(id===11){//livuy nosaph
        answers = [{aid:0,val:'בן/ בת זוג'},{aid:1,val:'בן / בת משפחה אחר/ת'},
                {aid:2,val:'חבר/ה'},{aid:3,val:'דולה'},{aid:4,val:'ללא'}]
    }
    if(id===32){//shicuch keevim (survey)
        answers = [{aid:0,val:'אפידורל'},{aid:1,val:'אופייטים (פטידין)'},
                {aid:2,val:'טכניקות הרפייה (הרפיית שרירים פרוגרסיבית, נשימות, מוזיקה, מיינדפולנס)'}
                ,{aid:3,val:'טכניקות פיזיות לשיכוך כאבים (עיסוי גב, בקבוק מים חמים)'},
                {aid:4,val:'גז צחוק'},{aid:5,val:'לא הוצע'},]
    }
    if(id===34){//תנוחות לידה
        answers = [{aid:0,val:'שכיבה על הגב'},{aid:1,val:'חצי שכיבה'},
                {aid:2,val:'ישיבה זקופה (כיסא לידה או קצה המיטה)'},{aid:3,val:'שכיבה על הצד'},
                {aid:4,val:'כריעה'},{aid:5,val:'עמידת ברכיים'},
                {aid:6,val:'עמידת שש'},{aid:7,val:'עמידה'},{aid:8,val:'לידת מים'},]
    }
    if(id===37){//תמיכה בפרניאום
        answers = [{aid:0,val:'עסוי'},{aid:1,val:'קומפרסים חמים / בריכת מים'},
                {aid:2,val:'שמירה עם תמיכת ידנית'},{aid:3,val:'לא הוצע'}]
    }
    if(id===43){//סיבת הפרדה
        answers = [{aid:0,val:'סיבה רפואית'},{aid:1,val:'סיבה מנהלתית'},{aid:2,val:'אחר'}]
    }
    return answers;
}


const ynArray=(id)=>{
    let arr = Array()
    arr = [{aid:0,val:'כן'},{aid:1,val:'לא'}]
    if(id===14){
        arr.push({aid:2,val:'לא יודעת'})
    }
    return arr;
}
const styles = StyleSheet.create({
    btnContainer:{
        backgroundColor: myColor.red,
        justifyContent:'center',
        marginVertical:20,
        flex:1,
        borderRadius:10,
    },
    dateContainer:{
        
        borderColor:myColor.darkBlue,
        borderWidth:1,
        margin:20,
        borderRadius:10,
    },
    titles:{
        textAlign:"center",
        padding:20,
        paddingTop:50,
        fontWeight:'bold',
        fontSize:22,
        color:myColor.darkBlue,
    },
    txtInp:{
        borderRadius:10,
        marginBottom:30,
        borderWidth:1,
        borderColor:'gray',
    },
    btnStyle:{
        textAlign:'center',
        padding: 10, 
        color: 'white', 
    },
    contentStyle:{
        margin:30,
    },
});