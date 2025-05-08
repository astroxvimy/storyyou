import axios, { AxiosInstance, AxiosResponse } from 'axios';

const frontendUrl = import.meta.env.NEXT_PUBLIC_SITE_URL;

const instance: AxiosInstance = axios.create({
  baseURL: `${frontendUrl}api/story`,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface StoryRequestPayload {
  userId: string;
  storyName: string;
  hobbies: string[];
  userPicture: File | string; // Adjust based on whether it's a File object or a URL
}

const submit = async (payload: StoryRequestPayload): Promise<AxiosResponse> => instance.post('/submit', payload);

const generateImages = async (storyId: string): Promise<AxiosResponse> => instance.post('/generate_images', storyId);

const storyService = {
  submit,
  generateImages,
};
export default storyService;
