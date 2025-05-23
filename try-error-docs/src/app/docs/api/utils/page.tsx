export default function UtilsAPIPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Utilities API
        </h1>
        <p className="text-xl text-slate-600">
          API reference for try-error utility functions and helpers
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Coming Soon
          </h2>
          <p className="text-slate-600 mb-4">
            This page will document utility functions for working with try-error
            results, including type guards, result transformers, and helper
            functions.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              📚 This API reference is under development. Check back soon for
              complete documentation.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related Pages
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Synchronous API
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                API reference for trySync and related functions
              </p>
              <a
                href="/docs/api/sync"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Sync API →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Asynchronous API
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                API reference for tryAsync and async patterns
              </p>
              <a
                href="/docs/api/async"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Async API →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
