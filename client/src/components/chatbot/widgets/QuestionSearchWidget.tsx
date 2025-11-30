import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Link, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getQuestionsByFilter } from '../../../services/questionService';
import { PopulatedDatabaseQuestion } from '../../../types/types';

import type { BaseWidgetProps } from '../types';

interface QuestionSearchWidgetProps extends BaseWidgetProps {
  payload?: {
    searchQuery?: string;
    maxResults?: number;
  };
}

const QuestionSearchWidget: React.FC<QuestionSearchWidgetProps> = ({ payload, scrollIntoView }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<PopulatedDatabaseQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchQuery = payload?.searchQuery || '';
  const maxResults = payload?.maxResults || 5;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const results = await getQuestionsByFilter('newest', searchQuery);
        setQuestions(results.slice(0, maxResults));
        setError(null);
      } catch (err) {
        setError('Failed to fetch questions');
        // Error handled by setError
      } finally {
        setLoading(false);
        if (scrollIntoView) {
          setTimeout(() => scrollIntoView(), 100);
        }
      }
    };

    if (searchQuery) {
      fetchQuestions();
    } else {
      setLoading(false);
    }
  }, [searchQuery, maxResults, scrollIntoView]);

  const handleQuestionClick = (questionId: string) => {
    navigate(`/question/${questionId}`);
  };

  if (loading) {
    return (
      <Box p={4} bg='gray.50' borderRadius='md' _dark={{ bg: 'gray.700' }}>
        <Spinner size='sm' mr={2} />
        <Text display='inline'>Searching questions...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} bg='red.50' borderRadius='md' _dark={{ bg: 'red.900' }}>
        <Text color='red.600' _dark={{ color: 'red.300' }}>
          {error}
        </Text>
      </Box>
    );
  }

  if (questions.length === 0) {
    return (
      <Box p={4} bg='gray.50' borderRadius='md' _dark={{ bg: 'gray.700' }}>
        <Text>No questions found matching "{searchQuery}"</Text>
      </Box>
    );
  }

  return (
    <Box p={4} bg='gray.50' borderRadius='md' _dark={{ bg: 'gray.700' }}>
      <Text mb={3} fontWeight='semibold' fontSize='sm'>
        Found {questions.length} question{questions.length !== 1 ? 's' : ''}:
      </Text>
      <VStack spacing={2} align='stretch'>
        {questions.map(question => (
          <Box
            key={question._id.toString()}
            p={3}
            bg='white'
            borderRadius='md'
            border='1px'
            borderColor='gray.200'
            _dark={{ bg: 'gray.600', borderColor: 'gray.500' }}
            cursor='pointer'
            _hover={{ bg: 'blue.50', _dark: { bg: 'blue.900' } }}
            onClick={() => handleQuestionClick(question._id.toString())}>
            <Link
              fontWeight='medium'
              color='blue.600'
              _dark={{ color: 'blue.300' }}
              _hover={{ textDecoration: 'underline' }}>
              {question.title}
            </Link>
            {question.tags && question.tags.length > 0 && (
              <Text fontSize='xs' color='gray.600' _dark={{ color: 'gray.300' }} mt={1}>
                Tags: {question.tags.map(tag => tag.name).join(', ')}
              </Text>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default QuestionSearchWidget;
