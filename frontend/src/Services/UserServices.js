// src/Services/UserServices.js
import api from "./api"; 

const USER_URL = "/users"; 

/**
 * @description Fetches basic user data by ID. (e.g., for profile views)
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<axios.Response>}
 */
const getUserById = async (userId) => {
    // Uses the interceptor for authorization
    return api.get(`${USER_URL}/${userId}`);
};


/**
 * @description Updates the user's profile with new data, saving it to the database.
 * @param {object} profileData - The data fields to update.
 * @returns {Promise<axios.Response>} - Contains the updated user object from the server.
 */
const updateProfile = async (profileData) => {
    // The token is automatically attached by the api.js interceptor
    return api.put(`${USER_URL}/profile`, profileData);
};


const UserServices = {
    getUserById,
    updateProfile,
};

export default UserServices;