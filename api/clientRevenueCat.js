    import { create } from 'apisauce';
    import Constants from "expo-constants";
    
    const revenueCatClient = create({
        baseURL: "https://api.revenuecat.com/v2/projects/"+Constants.expoConfig.extra.revenueCat.projectId,
    });

    export default revenueCatClient;

