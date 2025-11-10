import './index.css';

/**
 * Interface representing the props for the PageHeader component.
 */
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Standardized page header component that provides consistent styling across all pages.
 * Based on the messaging page header design.
 * 
 * @param title - The main title of the page
 * @param subtitle - Optional subtitle text
 * @param count - Optional count number to display
 * @param countLabel - Label for the count (e.g., "questions", "users", "tags")
 * @param children - Optional additional content (buttons, search bars, etc.)
 * @param className - Optional additional CSS classes
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  count, 
  countLabel, 
  children, 
  className = '' 
}: PageHeaderProps) => {
  return (
    <header className={`page-header ${className}`}>
      <div className='page-header-content'>
        <div className='page-header-title-section'>
          <h1 className='page-title'>{title}</h1>
        </div>
        {children && (
          <div className='page-header-actions'>
            {children}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
