"use client";

import { useState } from "react";
import Papa from "papaparse";
import {
  profileData,
  type DataProfile,
} from "@/lib/dataProfiler";
import {
  calculateNumericStatistics,
  type NumericStatistics,
} from "@/lib/statistics";
import {
  analyzeDataQuality,
  type DataQualityResult,
} from "@/lib/dataQuality";
import {
  generateNumericInsights,
  type DataInsight,
} from "@/lib/insightEngine";
import {
  createAnalysisContext,
  type AnalysisContext,
} from "@/lib/analysisContext";

type CSVData = string[][];

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState<CSVData>([]);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<DataProfile | null>(null);
  const [statistics, setStatistics] = useState<
  Record<string, NumericStatistics | null>
>({});
  const [insights, setInsights] = useState<DataInsight[]>([]);
  const [quality, setQuality] =
  useState<DataQualityResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");
  
  const handleAIAnalysis = async () => {
  if (!profile) {
    setAiError("Data belum dianalisis.");
    return;
  }

  setIsAnalyzing(true);
  setAiError("");
  setAiAnalysis("");

  try {
    const numericOnlyStatistics: Record<
      string,
      NumericStatistics
    > = {};

    Object.entries(statistics).forEach(
      ([columnName, stats]) => {
        if (stats) {
          numericOnlyStatistics[columnName] = stats;
        }
      }
    );

    const context: AnalysisContext =
      createAnalysisContext(
        profile,
        numericOnlyStatistics,
        insights,
        quality!
      );

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || "Gagal melakukan analisis AI."
      );
    }

    setAiAnalysis(result.analysis || "");
  } catch (error) {
    console.error("AI Analysis Error:", error);

    setAiError(
      error instanceof Error
        ? error.message
        : "Gagal melakukan analisis AI."
    );
  } finally {
    setIsAnalyzing(false);
  }
};

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setData([]);
    setFileName("");
    setStatistics({});
    setProfile(null);
    setInsights([]);
    setQuality(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Silakan pilih file CSV.");
      return;
    }

    setFileName(file.name);

    Papa.parse<string[]>(file, {
      skipEmptyLines: true,

      complete: (results) => {
        if (results.errors.length > 0) {
          setError("Terjadi kesalahan saat membaca file CSV.");
          console.error(results.errors);
          return;
        }

        if (results.data.length === 0) {
          setError("File CSV kosong.");
          return;
        }

        setData(results.data);

const newProfile = profileData(results.data);
setProfile(newProfile);

const newQuality = analyzeDataQuality(results.data);
setQuality(newQuality);

const headers = results.data[0];
const rows = results.data.slice(1);

const numericStatistics: Record<
  string,
  NumericStatistics | null
> = {};

const newInsights: DataInsight[] = [];

newProfile.columnProfiles.forEach((column, columnIndex) => {
  if (column.type !== "numeric") {
    return;
  }

  const values = rows
    .map((row) => Number(row[columnIndex]))
    .filter((value) => Number.isFinite(value));

  const stats = calculateNumericStatistics(values);

  numericStatistics[column.name] = stats;

  if (stats) {
    const insight = generateNumericInsights(
      column.name,
      stats
    );

    newInsights.push(insight);
  }
});

setStatistics(numericStatistics);
setInsights(newInsights);
      },

      error: () => {
        setError("File CSV tidak dapat dibaca.");
      },
    });
  };
  
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            Penganalisis Data AI 🚀
          </h1>

          <p className="mt-4 text-lg">
            Analisis data CSV dengan bantuan AI
          </p>

          <label className="mt-8 inline-block cursor-pointer rounded-lg bg-black px-6 py-3 text-white">
            Pilih File CSV

            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {fileName && (
            <p className="mt-4">
              File dipilih: <strong>{fileName}</strong>
            </p>
          )}

          {error && (
            <p className="mt-4 text-red-600">
              {error}
            </p>
          )}
        </div>

        {data.length > 0 && (
          <div className="mt-10">
            <div className="mb-4">
              <p>
                <strong>Jumlah baris:</strong>{" "}
                {data.length - 1}
              </p>

              <p>
                <strong>Jumlah kolom:</strong>{" "}
                {data[0]?.length ?? 0}
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {data[0].map((header, index) => (
                      <th
                        key={index}
                        className="border-b px-4 py-3 text-left font-bold"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border-b px-4 py-3"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {profile && (
  <div className="mt-10 rounded-lg border p-6">
    <h2 className="text-2xl font-bold">
      📊 Ringkasan Data
    </h2>

    <div className="mt-4 grid gap-4 md:grid-cols-3">
      <div>
        <p className="text-sm text-gray-500">
          Jumlah Data
        </p>
        <p className="text-xl font-bold">
          {profile.rows}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Jumlah Kolom
        </p>
        <p className="text-xl font-bold">
          {profile.columns}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Missing Values
        </p>
        <p className="text-xl font-bold">
          {profile.totalMissing}
        </p>
      </div>
    </div>

    <div className="mt-8 space-y-6">
      {profile.columnProfiles.map((column) => (
        <div
          key={column.name}
          className="rounded-lg border p-4"
        >
          <h3 className="text-lg font-bold">
            {column.name}
          </h3>

          <p className="mt-1">
            Tipe: <strong>{column.type}</strong>
          </p>

          <p>
            Unique values: {column.unique}
          </p>

          <p>
            Missing: {column.missing}
          </p>

          {column.type === "numeric" && (
            <div className="mt-3">
              <p>Minimum: {column.min}</p>
              <p>Maximum: {column.max}</p>
              <p>
                Rata-rata:{" "}
                {column.average?.toFixed(2)}
              </p>
            </div>
          )}

          {column.type === "category" &&
            column.categories && (
              <div className="mt-3">
                <p className="font-semibold">
                  Distribusi:
                </p>

                {Object.entries(column.categories).map(
                  ([value, count]) => (
                    <p key={value}>
                      {value}: {count}
                    </p>
                  )
                )}
              </div>
            )}
        </div>
      ))}
    </div>
  {quality && (
  <div className="mt-10 rounded-lg border p-6">
    <h2 className="text-2xl font-bold">
      🛡️ Data Quality
    </h2>

    <div className="mt-6 grid gap-4 md:grid-cols-4">
      <div>
        <p className="text-sm text-gray-500">
          Quality Score
        </p>
        <p className="text-2xl font-bold">
          {quality.overallScore.toFixed(1)} / 100
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Completeness
        </p>
        <p className="text-2xl font-bold">
          {quality.completeness.toFixed(1)}%
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Missing Values
        </p>
        <p className="text-2xl font-bold">
          {quality.missingValues}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Duplicate Rows
        </p>
        <p className="text-2xl font-bold">
          {quality.duplicateRows}
        </p>
      </div>
    </div>

    <div className="mt-8">
      <h3 className="text-lg font-bold">
        Column Quality
      </h3>

      <div className="mt-4 space-y-4">
        {quality.columnQuality.map((column) => (
          <div
            key={column.name}
            className="rounded-lg border p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {column.name}
              </span>

              <span className="font-bold">
                {column.completeness.toFixed(1)}%
              </span>
            </div>

            <div className="mt-2 h-2 w-full rounded bg-gray-200">
              <div
                className="h-2 rounded bg-black"
                style={{
                  width: `${column.completeness}%`,
                }}
              />
            </div>

            <div className="mt-2 text-sm text-gray-500">
              <span>
                Missing: {column.missing}
              </span>
              {" · "}
              <span>
                Unique: {column.unique}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

    {Object.keys(statistics).length > 0 && (
  <div className="mt-10 rounded-lg border p-6">
    <h2 className="text-2xl font-bold">
      📈 Statistical Analysis
    </h2>

    <div className="mt-6 space-y-6">
      {Object.entries(statistics).map(
        ([columnName, stats]) => {
          if (!stats) return null;

          return (
            <div
              key={columnName}
              className="rounded-lg border p-4"
            >
              <h3 className="text-lg font-bold">
                {columnName}
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Count
                  </p>
                  <p className="font-bold">
                    {stats.count}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Mean
                  </p>
                  <p className="font-bold">
                    {stats.mean.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Median
                  </p>
                  <p className="font-bold">
                    {stats.median.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Minimum
                  </p>
                  <p className="font-bold">
                    {stats.min}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Maximum
                  </p>
                  <p className="font-bold">
                    {stats.max}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Range
                  </p>
                  <p className="font-bold">
                    {stats.range.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Standard Deviation
                  </p>
                  <p className="font-bold">
                    {stats.standardDeviation.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Q1
                  </p>
                  <p className="font-bold">
                    {stats.q1.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Q3
                  </p>
                  <p className="font-bold">
                    {stats.q3.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    IQR
                  </p>
                  <p className="font-bold">
                    {stats.iqr.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="font-semibold">
                  Outliers
                </p>

                {stats.outliers.length === 0 ? (
                  <p className="mt-1">
                    Tidak ditemukan
                  </p>
                ) : (
                  <p className="mt-1">
                    {stats.outliers.join(", ")}
                  </p>
                )}
              </div>
            </div>
          );
        }
      )}
    </div>
  </div>
)}
{insights.length > 0 && (
  <div className="mt-10 rounded-lg border p-6">
    <h2 className="text-2xl font-bold">
      💡 Data Insights
    </h2>

    <div className="mt-6 space-y-6">
      {insights.map((insight) => (
        <div
          key={insight.column}
          className="rounded-lg border p-4"
        >
          <h3 className="text-lg font-bold">
            {insight.column}
          </h3>

          <ul className="mt-3 list-disc space-y-2 pl-5">
            {insight.insights.map(
              (text, index) => (
                <li key={index}>
                  {text}
                </li>
              )
            )}
          </ul>
        </div>
      ))}
    </div>
  </div>
)}
{profile && (
  <div className="mt-10 rounded-lg border p-6">
    <h2 className="text-2xl font-bold">
      🤖 AI Data Analyst
    </h2>

    <p className="mt-2 text-gray-600">
      Gunakan AI untuk memberikan interpretasi
      terhadap hasil analisis data.
    </p>

    <button
      onClick={handleAIAnalysis}
      disabled={isAnalyzing}
      className="mt-6 rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isAnalyzing
        ? "🤖 AI sedang menganalisis..."
        : "🤖 Analisis dengan AI"}
    </button>

    {aiError && (
      <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
        <strong>Error:</strong> {aiError}
      </div>
    )}

    {aiAnalysis && (
      <div className="mt-6 rounded-lg border p-5">
        <h3 className="text-xl font-bold">
          Hasil Analisis
        </h3>

        <div className="mt-4 whitespace-pre-wrap leading-7">
          {aiAnalysis}
        </div>
      </div>
    )}
  </div>
)}
  </div>
)}
      </div>
    </main>
  );
}