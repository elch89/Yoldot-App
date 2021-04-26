
import React from 'react';
import {NavigationContainer , CommonActions, StackActions} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {Rating,
    Register,
    Login,
    HomePage,
    Compare,
    Coupons,
    Podcasts,
    Feedback,} from './src/screens/index';
import { setCustomText } from 'react-native-global-props';
import SearchHeader  from './src/containers/searchHeader'
import AsyncStorage from '@react-native-community/async-storage';
import PlayingNow from './src/components/playingNow';
// Define a global text font for all the app
const customTextProps = { 
  style: { 
    fontFamily: 'VarelaRound-Regular'
  }
}
setCustomText(customTextProps)
// Creatw main navigator using 'react-navigation'
const Stack = createStackNavigator();
function MainNavigator(){
  return(
    <Stack.Navigator
    initialRouteName="initScreen"
      screenOptions={{ gestureEnabled: false }}>
        <Stack.Screen
         name='Home'
         component={HomePage}
         options={{header:(props)=>null}}/>
        <Stack.Screen
         name='Login'
         component={Login}
         options={{header:(props)=>null}}/>
        <Stack.Screen
         name='Register'
         component={Register}
         options={{header:(props)=>null}}/>
        <Stack.Screen
         name='Feedback'
         component={Feedback}
         options={{header:(props)=>null}}/>
         <Stack.Screen
         name='Compare'
         component={Compare}
         options={{header:(props)=>null}}/>
         <Stack.Screen
         name='Rating'
         component={Rating}
         options={{header:(props)=>null}}/>
         <Stack.Screen
         name='initScreen'
         component={InitScreen}
         options={{header:(props)=>null}}/>

    </Stack.Navigator>
  )};
  /* Non active screens (for future making), disabled for preformance */
  // Coupons:Coupons,
  // PlayingNow: PlayingNow,
  // Podcasts:{
  //     screen:Podcasts,
  //     navigationOptions:{
  //         header: <SearchHeader />,
  //         headerStyle: {        
  //             backgroundColor: "transparent"      
  //           },
  //         headerLeft:'arrow'

  //     }
  // },
  /* Creates initial screen - choose between login or main screen (logged in) */

function InitScreen (props){
  // search for token - user is logged in
  AsyncStorage.getItem('id_token').then((token)=>{
    // choice of what page to route to
    const mainPage = !!token ? 'Home':'Login';
    // navigate to chosen page - first in stack
    const resetAction = CommonActions.reset({
        index: 0,// first in stack
        routes: [
          {name: mainPage}
        ]
      });
      props.navigation.dispatch(resetAction)
  } );
    
  return (null);

}

const App: () => React$Node = () => {
  return <NavigationContainer><MainNavigator/></NavigationContainer>;
      
};


export default App;
