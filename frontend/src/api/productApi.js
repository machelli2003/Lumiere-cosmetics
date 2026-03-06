// Product API calls
import axios from 'axios';
const API_URL = '/api/products';
export const getProducts = () => axios.get(API_URL);
