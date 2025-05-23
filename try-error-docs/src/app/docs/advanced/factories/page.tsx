export default function FactoriesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Error Factories
        </h1>
        <p className="text-xl text-slate-600">
          Advanced patterns for creating error factory functions
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Coming Soon
          </h2>
          <p className="text-slate-600 mb-4">
            This page will cover advanced patterns for creating error factory
            functions, including domain-specific factories, composable error
            builders, and factory patterns.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              📚 This page is being prepared. Check back soon for comprehensive
              factory patterns.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related Pages
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Error Types</h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn about basic error creation patterns
              </p>
              <a
                href="/docs/concepts/error-types"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Error Types →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Custom Errors
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Advanced custom error patterns
              </p>
              <a
                href="/docs/advanced/custom-errors"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Learn Custom Errors →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
