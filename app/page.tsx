"use client";

import { useState } from "react";
import Papa from "papaparse";

type CSVData = string[][];

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState<CSVData>([]);
  const [error, setError] = useState("");

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setData([]);
    setFileName("");

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
      </div>
    </main>
  );
}