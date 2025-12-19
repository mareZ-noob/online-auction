import Spinner from "@/components/custom-ui/loading-spinner/LoadingSpinner";

function LoadingPage() {
  return (
    <Spinner className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-100" />
  );
}

export default LoadingPage;
