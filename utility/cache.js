import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from 'moment';

const prefix = 'CACHE_';
const expiryInMinutes = 14400;

const store = async (key, value) => {
    try {
        const item = {
            value,
            timestamp: Date.now()
        }
        await AsyncStorage.setItem(prefix + key, JSON.stringify(item));
    } catch (error) {
        console.log(error)
    }
}

const get = async (key) => {
    try {
        const value = await AsyncStorage.getItem(prefix + key);
        const item = JSON.parse(value);

        if (!item) return null;

        const now = moment(Date.now());
        const storedTime = moment(item.timestamp);
        const timeDiff = now.diff(storedTime, 'minutes');
        const isExpired = timeDiff > expiryInMinutes;
        if(isExpired) {
            await AsyncStorage.removeItem(prefix + key);
            return null;
        }

        return item.value;
    } catch (error) {
        console.log(error);
    }
}

const remove = async (key) => {
    try {
        await AsyncStorage.removeItem(prefix + key);
    } 
    catch (error) {
        console.log(error);
    }
}

export default {
    store,
    get,
    remove
}