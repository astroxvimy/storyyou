import axios, { AxiosInstance, AxiosResponse } from 'axios';

const frontendUrl = import.meta.env.NEXT_PUBLIC_SITE_URL;

const instance: AxiosInstance = axios.create({
  baseURL: `${frontendUrl}features/account/controllers`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getUserId = async (): Promise<AxiosResponse> => instance.post('/get-user-id');

const accountService = {
  getUserId,
};
export default accountService;
