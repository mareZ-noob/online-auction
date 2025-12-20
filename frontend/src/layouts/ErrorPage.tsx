import { useNavigate } from "react-router-dom";

function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white text-gray-800 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/pattern-lines.png')] bg-cover bg-center opacity-40" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-6 text-center">
        <h1 className="text-5xl font-semibold">Error 404</h1>

        <h2 className="mt-4 text-2xl font-medium">
          Sorry, We Misplaced That Page
        </h2>

        <p className="mt-4 text-gray-600 leading-relaxed">
          Our Online Auction Platform seems to have misplaced the page you
          requested. Stay with us, and we'll help you rediscover it.
        </p>

        <p className="mt-6 text-gray-500">
          Here, instead, you'll find some useful links:
        </p>

        {/* Optional Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mt-10 text-md text-white px-4 py-2 bg-gray-800 rounded-sm hover:cursor-pointer"
        >
          ← Go back
        </button>
      </div>
    </div>
  );
}

export default ErrorPage;
