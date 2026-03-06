import { Signal, computed, signal } from '@angular/core';

export interface PaginationOptions {
  pageSize?: number;
  maxVisiblePages?: number;
}

export function createPagination<T>(items: Signal<T[]>, options: PaginationOptions = {}) {
  const page = signal(1);
  const pageSize = options.pageSize ?? 10;
  const maxVisiblePages = options.maxVisiblePages ?? 5;

  const totalItems = computed(() => items().length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems() / pageSize)));

  const visiblePageNumbers = computed(() => {
    const total = totalPages();
    const current = page();
    const halfWindow = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, current - halfWindow);
    let endPage = Math.min(total, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  });

  const showFirstPage = computed(() => visiblePageNumbers()[0] > 1);
  const showLeftEllipsis = computed(() => visiblePageNumbers()[0] > 2);
  const showLastPage = computed(() => visiblePageNumbers().at(-1)! < totalPages());
  const showRightEllipsis = computed(() => visiblePageNumbers().at(-1)! < totalPages() - 1);

  const paginatedItems = computed(() => {
    const startIndex = (page() - 1) * pageSize;
    return items().slice(startIndex, startIndex + pageSize);
  });

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages()) {
      return;
    }

    page.set(nextPage);
  };

  const syncCurrentPage = () => {
    const maxPage = totalPages();
    if (page() > maxPage) {
      page.set(maxPage);
    }
  };

  return {
    page,
    pageSize,
    maxVisiblePages,
    totalItems,
    totalPages,
    visiblePageNumbers,
    showFirstPage,
    showLeftEllipsis,
    showLastPage,
    showRightEllipsis,
    paginatedItems,
    goToPage,
    syncCurrentPage,
  };
}
