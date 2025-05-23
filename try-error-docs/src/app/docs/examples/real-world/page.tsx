export default function RealWorldExamplesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Real-World Examples
        </h1>
        <p className="text-xl text-slate-600">
          Complex scenarios and production-ready patterns using try-error
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Coming Soon
          </h2>
          <p className="text-slate-600 mb-4">
            This page will showcase real-world applications of try-error in
            production scenarios, including microservices, web applications, CLI
            tools, and more.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              📚 Real-world examples are being prepared. Check back soon for
              production-ready patterns and case studies.
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
                Basic Examples
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Start with fundamental patterns and use cases
              </p>
              <a
                href="/docs/examples/basic"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Basic Examples →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Migration Guide
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn how to adopt try-error in existing projects
              </p>
              <a
                href="/docs/migration"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Migration Guide →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
