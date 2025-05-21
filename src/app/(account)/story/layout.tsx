import { ReactNode } from 'react';
import Link from 'next/link';

import { getStories } from '@/features/story/controllers/get-stories';

export default async function StoriesLayout({ children }: { children: ReactNode }) {
  const stories = await getStories();

  return (
    <div className="flex min-h-[50vh]">
      {/* Left Sidebar */}
      <aside className="w-1/5 max-w-sm p-4">
        <h2 className="text-xl font-bold mt-8 mb-6">Your Stories</h2>
        <ul className="space-y-2">
          {stories.map((story) => (
            <li key={story.id}>
              <Link
                href={`/story/${story.id}/view`}
                className="block p-2 rounded text-white hover:bg-purple-500"
              >
                {(story.story_name || story.story_name !== '' ) ? story.story_name : 'Unnamed story'}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Right Preview Area */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}