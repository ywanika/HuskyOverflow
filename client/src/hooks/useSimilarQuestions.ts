import { useEffect, useState } from 'react';
import { getQuestionsByFilter } from '../services/questionService';
import { PopulatedDatabaseQuestion } from '../types/types';

/**
 * Custom hook to search for similar questions based on title, text, and tags.
 * The search is debounced to avoid excessive API calls.
 *
 * @param title - The question title to search for
 * @param text - The question text/description to search for
 * @param tagNames - The space-separated tag names to search for
 * @returns similarQuestions - Array of questions that match the search criteria
 * @returns isLoading - Boolean indicating if the search is in progress
 */
const useSimilarQuestions = (title: string, text: string, tagNames: string) => {
  const [similarQuestions, setSimilarQuestions] = useState<PopulatedDatabaseQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Only search if at least one field has content
    if (!title.trim() && !text.trim() && !tagNames.trim()) {
      setSimilarQuestions([]);
      return;
    }

    // Debounce the search to avoid excessive API calls
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Build search query combining title, text, and tags
        let searchQuery = '';

        // Add title and text as keywords
        const keywords = [title.trim(), text.trim()].filter(Boolean).join(' ');

        // Add tags in bracket format [tag1] [tag2]
        const tags = tagNames
          .split(' ')
          .filter(tag => tag.trim() !== '')
          .map(tag => `[${tag.trim()}]`)
          .join(' ');

        searchQuery = [keywords, tags].filter(Boolean).join(' ');

        if (searchQuery) {
          const questions = await getQuestionsByFilter('newest', searchQuery);
          // Limit to top 5 similar questions
          setSimilarQuestions(questions.slice(0, 5));
        } else {
          setSimilarQuestions([]);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching similar questions:', error);
        setSimilarQuestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [title, text, tagNames]);

  return { similarQuestions, isLoading };
};

export default useSimilarQuestions;
