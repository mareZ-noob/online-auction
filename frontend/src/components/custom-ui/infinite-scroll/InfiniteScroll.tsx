import { useEffect, useRef } from "react";

const InfiniteScroll = ({
  children,
  loader,
  fetchMore,
  hasMore,
  endMessage,
  className,
  isLoading,
}: {
  children: React.ReactNode;
  loader: React.ReactNode;
  fetchMore: () => void;
  hasMore: boolean;
  endMessage: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}) => {
  const pageEndRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef<boolean>(false);

  // Mirror external loading state to a ref to avoid races with observer callback
  useEffect(() => {
    loadingRef.current = !!isLoading;
  }, [isLoading]);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // guard with local ref to prevent double-calls due to race conditions
        if (!loadingRef.current) {
          loadingRef.current = true;
          try {
            fetchMore();
          } catch (e) {
            // ensure we don't keep the ref stuck on error
            loadingRef.current = false;
            throw e;
          }
        }
      }
    });

    if (pageEndRef.current) observer.observe(pageEndRef.current);

    return () => {
      if (pageEndRef.current) observer.unobserve(pageEndRef.current);
    };
  }, [hasMore, fetchMore]);
  return (
    <div className={className}>
      {children}

      {hasMore ? <div ref={pageEndRef}>{loader}</div> : endMessage}
    </div>
  );
};

export default InfiniteScroll;
