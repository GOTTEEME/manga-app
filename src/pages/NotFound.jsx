import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Page not found</h2>
          <p className="mt-2 text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="btn btn-primary"
            >
              Go back home
            </Link>
          </div>
          <div className="mt-8">
            <img
              src="https://via.placeholder.com/400x300?text=Lost+in+the+Comic+Universe"
              alt="Lost in the comic universe"
              className="mx-auto rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}