"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-24 text-center">
      <div>
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-xl font-medium mb-2">Что-то пошло не так</h1>
        <p className="text-muted mb-6">
          Не удалось загрузить данные. Возможно, TMDB временно недоступен — попробуй ещё раз.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent2 transition-colors text-white font-medium px-6 py-3 rounded-lg"
        >
          Обновить
        </button>
      </div>
    </main>
  );
}
