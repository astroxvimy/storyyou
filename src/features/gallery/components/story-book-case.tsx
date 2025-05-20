import { cn } from '@/utils/cn';

type StoryBookCaseProps = {
  coverImageUrl: string;
  title?: string;
  className?: string;
};

export function StoryBookCase({ coverImageUrl, title, className }: StoryBookCaseProps) {
  return (
    <div className='text-center'>
      <div className='aspect-[3/4] w-full'>
        {coverImageUrl && (
          <img
            src={coverImageUrl}
            alt={title ?? 'Book Cover'}
            className={cn('h-full w-full object-cover', className)}
          />
        )}
      </div>
      {/* {title && <p className='mt-2 text-sm font-semibold capitalize'>{title}</p>} */}
    </div>
  );
}
