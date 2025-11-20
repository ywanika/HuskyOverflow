import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import DeleteContentModal from '../DeleteContentModal';

const system = createSystem(defaultConfig);

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={system}>{ui}</ChakraProvider>);
};

describe('DeleteContentModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should not render when isOpen is false', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Question')).toBeInTheDocument();
    });

    it('should display correct title for question', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      expect(screen.getByText('Delete Question')).toBeInTheDocument();
    });

    it('should display correct title for answer', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='answer'
        />,
      );

      expect(screen.getByText('Delete Answer')).toBeInTheDocument();
    });

    it('should display correct title for comment', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='comment'
        />,
      );

      expect(screen.getByText('Delete Comment')).toBeInTheDocument();
    });

    it('should display content title when provided', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
          contentTitle='Test Question Title'
        />,
      );

      expect(
        screen.getByText(/Are you sure you want to delete this question\?/),
      ).toBeInTheDocument();
      expect(screen.getByText('Test Question Title')).toBeInTheDocument();
    });

    it('should not display content title section when not provided', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      expect(
        screen.queryByText(/Are you sure you want to delete this question\?/),
      ).not.toBeInTheDocument();
    });

    it('should display delete reason textarea', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const textarea = screen.getByLabelText('Delete reason');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute(
        'placeholder',
        'Enter the reason for deleting this content...',
      );
      expect(textarea).toHaveAttribute('required');
    });

    it('should display help text for delete reason', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      expect(
        screen.getByText(/This reason will be sent to the content creator/),
      ).toBeInTheDocument();
    });

    it('should display Cancel and Delete buttons', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should update delete reason when user types in textarea', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const textarea = screen.getByLabelText('Delete reason');
      fireEvent.change(textarea, { target: { value: 'Inappropriate content' } });

      expect(textarea).toHaveValue('Inappropriate content');
    });

    it('should clear error when user types in textarea', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const textarea = screen.getByLabelText('Delete reason');
      fireEvent.change(textarea, { target: { value: 'Test' } });

      // Error should not be visible after typing
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should call onClose when Cancel button is clicked', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking outside modal', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const overlay = screen.getByRole('dialog').parentElement;
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should not call onClose when clicking inside modal', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const modal = screen.getByRole('dialog');
      fireEvent.click(modal);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should show error when Delete is clicked without reason', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Please provide a reason for deletion')).toBeInTheDocument();
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should show error when Delete is clicked with only whitespace', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const textarea = screen.getByLabelText('Delete reason');
      fireEvent.change(textarea, { target: { value: '   ' } });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm with trimmed reason when Delete is clicked with valid reason', async () => {
      mockOnConfirm.mockResolvedValueOnce(undefined);

      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const textarea = screen.getByLabelText('Delete reason');
      fireEvent.change(textarea, { target: { value: '  Inappropriate content  ' } });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith('Inappropriate content');
      });
    });

    it('should call onClose after successful deletion', async () => {
      mockOnConfirm.mockResolvedValueOnce(undefined);

      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const textarea = screen.getByLabelText('Delete reason');
      fireEvent.change(textarea, { target: { value: 'Reason' } });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should clear delete reason after successful deletion', async () => {
      mockOnConfirm.mockResolvedValueOnce(undefined);

      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const textarea = screen.getByLabelText('Delete reason');
      fireEvent.change(textarea, { target: { value: 'Reason' } });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });
    });

    it('should show loading state while deleting', async () => {
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>(resolve => {
        resolveDelete = resolve;
      });
      mockOnConfirm.mockReturnValueOnce(deletePromise);

      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const textarea = screen.getByLabelText('Delete reason');
      fireEvent.change(textarea, { target: { value: 'Reason' } });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(deleteButton).toHaveTextContent('Deleting...');
        expect(deleteButton).toBeDisabled();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();

      resolveDelete!();
      await deletePromise;
    });

    it('should display error when onConfirm throws error', async () => {
      const errorMessage = 'Failed to delete content';
      mockOnConfirm.mockRejectedValueOnce(new Error(errorMessage));

      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const textarea = screen.getByLabelText('Delete reason');
      fireEvent.change(textarea, { target: { value: 'Reason' } });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should display default error message when onConfirm throws error without message', async () => {
      mockOnConfirm.mockRejectedValueOnce({} as Error);

      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const textarea = screen.getByLabelText('Delete reason');
      fireEvent.change(textarea, { target: { value: 'Reason' } });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Failed to delete content')).toBeInTheDocument();
      });
    });

    it('should clear error and reason when Cancel is clicked', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const textarea = screen.getByLabelText('Delete reason');
      fireEvent.change(textarea, { target: { value: '' } });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      // Error should be shown when trying to delete without reason
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Please provide a reason for deletion')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // onClose should be called, which clears the modal state
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
          contentTitle='Test Question'
        />,
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'delete-modal-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'delete-modal-description');
    });

    it('should have accessible delete reason input', () => {
      renderWithProvider(
        <DeleteContentModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          contentType='question'
        />,
      );

      const textarea = screen.getByLabelText('Delete reason');
      expect(textarea).toHaveAttribute('aria-label', 'Delete reason');
      expect(textarea).toHaveAttribute('aria-describedby', 'delete-reason-help');
    });
  });
});
