import client from "./client";

const endpoint = "/checkin";

const deleteCheckin = (checkin_id, token) => {
    return client.delete(
    endpoint+'/'+checkin_id, 
    {},
    {   
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }
    )
};

export default {
    deleteCheckin,
}