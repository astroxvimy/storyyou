'use client'

import { useEffect, useState } from 'react';

interface Story {
  id: string;
  title: string;
  status: 'pending' | 'text_processing' | 'text_complete' | 'image_processing' | 'image_complete' | 'complete';
}

interface StoryPage {
  id: string;
  page_number: number;
  text: string;
  page_image?: string;
}

interface StoryWithPages extends Story {
  story_pages: StoryPage[];
}

export default function StoryViewPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [currentStory, setCurrentStory] = useState<StoryWithPages | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Load stories on mount
  useEffect(() => {
    const fetchStories = async () => {
      const res = await fetch('/api/stories');
      const data = await res.json();
      setStories(data);
    };
    fetchStories();
  }, []);

  // Load and poll current story
  useEffect(() => {
    if (!currentStoryId) return;

    const fetchStory = async () => {
      const res = await fetch(`/api/story/${currentStoryId}`);
      const data = await res.json();
      setCurrentStory(data);

      if (data.status !== 'text_complete' && data.status !== 'complete') {
        setIsPolling(true);
      } else {
        setIsPolling(false);
      }
    };

    fetchStory();

    let interval: NodeJS.Timeout | null = null;
    if (isPolling) {
      interval = setInterval(fetchStory, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStoryId, isPolling]);

  // Handle selecting the current story (top button)
  const handleSelectCurrent = async () => {
    const res = await fetch('/api/story/current');
    const { id } = await res.json();
    setCurrentStoryId(id);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Stories</h1>

      <button
        onClick={handleSelectCurrent}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        View Current Story
      </button>

      <div className="flex gap-4 mb-6">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setCurrentStoryId(story.id)}
            className={`border px-3 py-1 rounded ${story.id === currentStoryId ? 'bg-blue-100' : ''}`}
          >
            {story.title}
          </button>
        ))}
      </div>

      {currentStory && (
        <div>
          <h2 className="text-xl font-semibold mb-2">{currentStory.title}</h2>
          <p className="italic text-sm text-gray-600 mb-4">Status: {currentStory.status}</p>

          {currentStory.story_pages.map((page) => (
            <div key={page.id} className="mb-6">
              <h3 className="font-semibold">Page {page.page_number}</h3>
              <p>{page.text}</p>
              {page.page_image && (
                <img src={page.page_image} alt={`Page ${page.page_number}`} className="mt-2 w-full max-w-md" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
