export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          AI Data Analyzer
        </h1>

        <p className="mt-4 text-lg">
          Analisis data CSV dengan bantuan AI
        </p>

        <button className="mt-8 rounded-lg bg-black px-6 py-3 text-white">
          Pilih File CSV
        </button>
      </div>
    </main>
  );
}