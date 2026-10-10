export function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-400">خطا</h1>
        <p className="mt-2 text-zinc-400">{error.message}</p>
      </div>
    </div>
  );
}
