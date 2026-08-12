export default function ApiKeyAlert() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full bg-surface border border-[#3e1f21] rounded-xl p-8">
        <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
          <span className="text-4xl">⚠️</span>
          <div>
            <h2 className="font-display text-2xl tracking-wide text-accent">
              Требуется API ключ TMDB (Ошибка 401)
            </h2>
            <p className="text-sm text-muted">
              Для загрузки реальных фильмов из базы данных The Movie Database требуется действующий v3 API ключ.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-accent2 mb-3">🔑 Как получить бесплатный ключ TMDB:</h3>
          <ol className="list-decimal list-inside text-sm text-muted space-y-2">
            <li>
              Зайди на{" "}
              <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" className="text-accent2 underline">
                themoviedb.org
              </a>{" "}
              и зарегистрируй бесплатный аккаунт.
            </li>
            <li>Перейди в настройки профиля: Вход → Настройки → API.</li>
            <li>Нажми «Создать» (тип Developer) и заполни форму.</li>
            <li>Скопируй полученный API Key (v3 auth).</li>
          </ol>
        </div>

        <div className="bg-surface2 border-l-4 border-accent rounded p-4 mb-6">
          <h3 className="text-sm font-semibold mb-1">🚀 Как добавить ключ в проект:</h3>
          <p className="text-sm text-muted leading-relaxed">
            Создай файл <code className="text-text">.env.local</code> в корне проекта и добавь:
            <br />
            <code className="text-accent2">TMDB_API_KEY=твой_ключ</code>
            <br />
            Затем перезапусти сервер разработки.
          </p>
        </div>
      </div>
    </main>
  );
}
