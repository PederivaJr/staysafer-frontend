import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View, Alert,Text } from 'react-native';
import {vh, vw, em, vmin, vmax} from 'react-native-expo-viewport-units';
import RoundedButton from '../components/RoundedButton';
import colors from '../config/color';
import Toast from 'react-native-root-toast';
import cache from '../utility/cache';
import NetInfo, {useNetInfo} from "@react-native-community/netinfo";

function OfflineSyncScreen({}) {
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const url = 'https://jsonplaceholder.typicode.com/posts';
  const netinfo = useNetInfo();

  // Create a function to make the POST request
  async function makePostRequest() {
    if (!isSending) setIsSending(true)
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            title: 'foo',
            body: 'bar',
            userId: 1,
          }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      if(response.status === 201) setSendSuccess(true);
      setIsSending(false);
      // Remove the POST request from async storage after it has been executed
      await cache.remove('POST_REQUEST');
    } catch (error) {
      console.log(error);
      setSendSuccess(false);
      setIsSending(false);
    }
  }

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((networkState) => { 
      // If the device is online, check for pending POST requests in async storage
      if (netinfo.isInternetReachable) {
        cache.get('POST_REQUEST').then((request) => {
          // If there is a pending POST request, execute it
          if (request) {
            makePostRequest();
          }
        });
      }
    });
    // Save the POST request to async storage when the component unmounts
    return () => {
      cache.store('POST_REQUEST', url, {
        method: 'POST',
        body: JSON.stringify({
            title: 'foo',
            body: 'bar',
            userId: 1,
          }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        }
      }
    ).then(() => {
        unsubscribe();
      });
    };
  }, []);

  useEffect(() => {
    if (netinfo.isInternetReachable) {
      cache.get('POST_REQUEST').then((request) => {
        // If there is a pending POST request, execute it
        if (request) {
          makePostRequest();
        }
      });
    }
  },[netinfo.isInternetReachable])

  return (
    <>
      <View style={styles.container}>
        <RoundedButton
            title="Send Data"
            disabled={isSending}
            onPress={() => {
            // Check the device's network status
            NetInfo.fetch().then((networkState) => {
                if (networkState.isInternetReachable) {
                // If the device is online, make the POST request
                makePostRequest();
                } 
                else {
                  // If the device is offline, display an error message
                  //Alert.alert('Failed to send data', 'No network connection');
                  setIsSending(true)
                  cache.store('POST_REQUEST', url, {
                    method: 'POST',
                    body: JSON.stringify({
                        title: 'foo',
                        body: 'bar',
                        userId: 1,
                      }),
                    headers: {
                      'Content-type': 'application/json; charset=UTF-8',
                    }
                  }
                )
                }
                })
              }}
        />
        {sendSuccess === true && <Text>Data sent</Text>}
        {isSending && sendSuccess === false && !netinfo.isInternetReachable && <Text>data will be syncronized when internet comes back.</Text>}
        {!netinfo.isInternetReachable && <Text>no connection</Text>}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.lighterGrey,
        minHeight: vh(100),     
    },  
    content: {
        flex: 0,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: colors.lighterGrey,
        padding:16 
      },
})

export default OfflineSyncScreen;

