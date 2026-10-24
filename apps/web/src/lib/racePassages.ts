export interface RacePassage {
  id: string;
  text: string;
  source: string;
}

export const RACE_PASSAGES: RacePassage[] = [
  {
    id: 'passage-1',
    text: 'No dance has ever turned out the way I thought it would, because I trust enough that I can start something with some ideas and then it takes itself somewhere.',
    source: 'Mark Morris',
  },
  {
    id: 'passage-2',
    text: 'The only way to do great work is to love what you do. If you have not found it yet, keep looking. Do not settle. As with all matters of the heart, you will know when you find it.',
    source: 'Steve Jobs',
  },
  {
    id: 'passage-3',
    text: 'It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena.',
    source: 'Theodore Roosevelt',
  },
  {
    id: 'passage-4',
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts. A journey of a thousand miles begins with a single step into the unknown.',
    source: 'Winston Churchill',
  },
  {
    id: 'passage-5',
    text: 'Simplicity is about subtracting the obvious and adding the meaningful. When you type with focus, every single keystroke flows effortlessly like music.',
    source: 'John Maeda',
  },
  {
    id: 'passage-6',
    text: 'Speed without direction is just a blur, but speed combined with pristine accuracy creates pure mastery. Touch typing transforms your thoughts directly into words.',
    source: 'Typing Typhon',
  },
  {
    id: 'passage-7',
    text: 'Do not go where the path may lead, go instead where there is no path and leave a trail. Every champion was once a contender that refused to give up.',
    source: 'Ralph Waldo Emerson',
  },
];

export function getRandomPassage(): RacePassage {
  const idx = Math.floor(Math.random() * RACE_PASSAGES.length);
  return RACE_PASSAGES[idx];
}
