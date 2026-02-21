import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
}

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Build an array of page numbers to display, with null representing an ellipsis.
 */
function getPageNumbers(currentPage: number, lastPage: number): (number | 'ellipsis')[] {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [];
  const showLeft = currentPage > 3;
  const showRight = currentPage < lastPage - 2;

  pages.push(1);
  if (showLeft) {
    pages.push('ellipsis');
  }
  const start = showLeft ? Math.max(2, currentPage - 1) : 2;
  const end = showRight ? Math.min(lastPage - 1, currentPage + 1) : lastPage - 1;
  for (let p = start; p <= end; p++) {
    if (p !== 1 && p !== lastPage) {
      pages.push(p);
    }
  }
  if (showRight) {
    pages.push('ellipsis');
  }
  if (lastPage > 1) {
    pages.push(lastPage);
  }
  return pages;
}

export function Pagination({ pagination, onPageChange, className }: PaginationProps) {
  const { current_page, last_page } = pagination;
  if (last_page <= 1) return null;

  const pageNumbers = getPageNumbers(current_page, last_page);

  return (
    <div className={cn('flex items-center justify-between gap-4 flex-wrap', className)}>
      <div className="text-sm text-muted-foreground">
        Page {current_page} of {last_page}
      </div>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={current_page === 1}
          onClick={() => onPageChange(current_page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={page}
                variant={current_page === page ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0 min-w-8"
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={current_page === page ? 'page' : undefined}
              >
                {page}
              </Button>
            )
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={current_page === last_page}
          onClick={() => onPageChange(current_page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}
