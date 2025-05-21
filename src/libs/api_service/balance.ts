import axios, { AxiosInstance, AxiosResponse } from 'axios';

const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL;

const instance: AxiosInstance = axios.create({
  baseURL: `${frontendUrl}/api/balance`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getTotalBalance = async (userId: string): Promise<AxiosResponse> => instance.post('/get-total', { userId });
const getBasicBalance = async (userId: string): Promise<AxiosResponse> => instance.post('/get-basic', { userId });
const getProBalance = async (userId: string): Promise<AxiosResponse> => instance.post('/get-pro', { userId });
const getHobbyBalance = async (userId: string): Promise<AxiosResponse> => instance.post('/get-hobby', { userId });

const balanceService = {
  getTotalBalance,
  getBasicBalance,
  getProBalance,
  getHobbyBalance,
};
export default balanceService;
