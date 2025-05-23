import axios, { AxiosInstance, AxiosResponse } from 'axios';

const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL;

const instance: AxiosInstance = axios.create({
  baseURL: `${frontendUrl}/api/story`,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface StoryRequestPayload {
  storyName: string;
  hobbies: string[];
  userPicture: File | string; // Adjust based on whether it's a File object or a URL
  storyDetail: string;
}

const submit = async (payload: StoryRequestPayload): Promise<AxiosResponse> => instance.post('/submit', payload);
const generateImages = async (storyId: string): Promise<AxiosResponse> =>
  instance.post('/generate-images', { storyId });
const getStories = async (): Promise<AxiosResponse> => instance.post('/get-stories');
const getStory = async (storyId: string): Promise<AxiosResponse> => instance.post('/get-story', { storyId });
const getStoryStatus = async (storyId: string): Promise<AxiosResponse> =>
  instance.post('/get-story-status', { storyId });
const generateBook = async (storyId: string): Promise<AxiosResponse> => instance.post('/generate-book', { storyId });
const setVisible = async ({storyId, visible}: {storyId: string, visible: boolean}): Promise<AxiosResponse> => instance.post('/set-visible', { storyId, visible });

const storyService = {
  submit,
  generateImages,
  getStories,
  getStoryStatus,
  getStory,
  generateBook,
  setVisible,
};
export default storyService;
