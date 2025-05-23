'use client';

import { toast } from '@/components/ui/use-toast';
import { getURL } from '@/utils/get-url';

const CopyLinkButton = ({ id }: { id: string }) => {
  const copyLink = `${getURL()}/gallery/${id}/view`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(copyLink)
        .then(() => toast({ description: 'Link copied' }))
        .catch((err) => {
          toast({ variant: 'destructive', description: 'Link copied' });
          console.log('error: ', err);
        });
    } else {
      // Fallback for older browsers or insecure context
      const textarea = document.createElement('textarea');
      textarea.value = copyLink;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast({ description: 'Link copied' });
      } catch (err) {
        toast({ variant: 'destructive', description: 'Link copied' });
        console.log('error: ', err);
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <button onClick={handleCopy} className='mr-4 rounded-lg bg-blue-400 px-4 py-2 text-white hover:bg-blue-600'>
      Copy Link
    </button>
  );
};

export default CopyLinkButton;
