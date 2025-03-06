import { Link } from 'react-router-dom';

export default function HomeBody() {
  return (
    <div className="relative isolate">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-15 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-blue-800 sm:text-6xl">
            Make a Difference in Your Community
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Join HandsOn, the community-driven platform that connects volunteers with meaningful opportunities to create positive social impact.
          </p>
          <div className="mt-10 ml-40 flex items-center justify-center">
          <Link to="/login" className="btn btn-info mr-2">Login</Link>
          <Link to="/register" className="btn btn-primary mr-40">Register</Link>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative rounded-2xl bg-white p-8 shadow-lg">
              <h3 className="text-lg font-semibold leading-8 text-blue-600">
                Discover Events
              </h3>
              <p className="mt-4 text-base leading-7 text-gray-600">
                Browse through a variety of volunteer opportunities in your area. From environmental cleanups to educational programs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative rounded-2xl bg-white p-8 shadow-lg">
              <h3 className="text-lg font-semibold leading-8 text-blue-600">
                Form Teams
              </h3>
              <p className="mt-4 text-base leading-7 text-gray-600">
                Create or join teams to work on long-term initiatives. Collaborate with like-minded individuals.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative rounded-2xl bg-white p-8 shadow-lg">
              <h3 className="text-lg font-semibold leading-8 text-blue-600">
                Track Impact
              </h3>
              <p className="mt-4 text-base leading-7 text-gray-600">
                Log your volunteer hours, earn certificates, and see your contribution to the community grow.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-blue-800 sm:text-4xl">
                Our Impact
              </h2>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col bg-gray-400/5 p-8">
                <dt className="text-sm leading-6 text-gray-600">Active Volunteers</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">2,000+</dd>
              </div>
              <div className="flex flex-col bg-gray-400/5 p-8">
                <dt className="text-sm leading-6 text-gray-600">Events Created</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">500+</dd>
              </div>
              <div className="flex flex-col bg-gray-400/5 p-8">
                <dt className="text-sm leading-6 text-gray-600">Hours Volunteered</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">10,000+</dd>
              </div>
              <div className="flex flex-col bg-gray-400/5 p-8">
                <dt className="text-sm leading-6 text-gray-600">Communities Impacted</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">50+</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 