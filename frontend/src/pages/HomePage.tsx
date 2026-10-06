export default function HomePage() {
  return (
    <section aria-labelledby="page-title" className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-start gap-4">
        <div className="mt-1 h-12 w-1 rounded-full bg-coral" />
        <div>
          <p className="text-xs font-semibold uppercase text-teal">Workspace</p>
          <h1
            className="mt-2 font-serif text-3xl font-medium leading-tight sm:text-4xl"
            id="page-title"
          >
            Faculty Portal
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">University faculty workspace</p>
        </div>
      </div>

      <div className="border-y border-line py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Workspace</h2>
          <span className="inline-flex items-center gap-2 text-xs text-muted">
            <span aria-hidden="true" className="size-2 rounded-full bg-lime-600" />
            Foundation
          </span>
        </div>
        <div className="mt-5 h-px w-full bg-line" />
      </div>
    </section>
  );
}
