'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Cross1Icon } from '@radix-ui/react-icons';

const commonHobbies = [
  'Soccer', 'Basketball', 'Drawing', 'Painting', 'Dancing',
  'Singing', 'Reading', 'Swimming', 'Cycling', 'Chess',
  'Piano', 'Guitar', 'Cooking', 'Gardening', 'Photography',
  'Robotics', 'Coding', 'Hiking', 'Yoga', 'Martial Arts'
];

interface HobbySelectorProps {
  selectedHobbies: string[];
  onChange: (hobbies: string[]) => void;
}

export function HobbySelector({ selectedHobbies, onChange }: HobbySelectorProps) {
  const [customHobby, setCustomHobby] = useState('');
  const { toast } = useToast();

  const addHobby = (hobby: string) => {
    if (selectedHobbies.length > 12) {
      toast({
        variant: 'default',
        description: 'You can only select up to 12 hobbies',
      });
      return;
    }
    if (!selectedHobbies.includes(hobby)) {
      onChange([...selectedHobbies, hobby]);
    }
  };

  const removeHobby = (hobby: string) => {
    onChange(selectedHobbies.filter(h => h !== hobby));
  };

  const handleCustomHobbySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customHobby.trim() && !selectedHobbies.includes(customHobby.trim())) {
      addHobby(customHobby.trim());
      setCustomHobby('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Hobbies */}
      <div className="flex flex-wrap gap-2">
        {selectedHobbies.map(hobby => (
          <Badge key={hobby} variant="secondary" className="flex items-center gap-1">
            {hobby}
            <button
              onClick={() => removeHobby(hobby)}
              className="ml-1 hover:text-destructive"
            >
              <Cross1Icon className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Common Hobbies */}
      <div className="flex flex-wrap gap-2">
        {commonHobbies.map(hobby => (
          <Button
            key={hobby}
            size="sm"
            onClick={() => addHobby(hobby)}
            disabled={selectedHobbies.includes(hobby)}
          >
            {hobby}
          </Button>
        ))}
      </div>

      {/* Custom Hobby Input */}
      <form onSubmit={handleCustomHobbySubmit} className="flex gap-2">
        <input
          type="text"
          value={customHobby}
          onChange={(e) => setCustomHobby(e.target.value)}
          placeholder="Add a custom hobby..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-white"
        />
        <Button type="submit" size="sm">
          Add
        </Button>
      </form>
    </div>
  );
} 