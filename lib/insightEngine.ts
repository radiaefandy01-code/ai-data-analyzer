import type { NumericStatistics } from "@/lib/statistics";

export interface DataInsight {
  column: string;
  insights: string[];
}

export function generateNumericInsights(
  columnName: string,
  statistics: NumericStatistics
): DataInsight {
  const insights: string[] = [];

  // Analisis pusat data
  if (statistics.mean > statistics.median) {
    insights.push(
      `Rata-rata (${statistics.mean.toFixed(
        2
      )}) lebih tinggi daripada median (${statistics.median.toFixed(
        2
      )}), yang menunjukkan adanya kecenderungan data ke arah nilai yang lebih tinggi.`
    );
  } else if (statistics.mean < statistics.median) {
    insights.push(
      `Rata-rata (${statistics.mean.toFixed(
        2
      )}) lebih rendah daripada median (${statistics.median.toFixed(
        2
      )}), yang menunjukkan adanya kecenderungan data ke arah nilai yang lebih rendah.`
    );
  } else {
    insights.push(
      `Rata-rata dan median sama-sama berada di ${statistics.mean.toFixed(
        2
      )}, sehingga pusat distribusi data relatif seimbang.`
    );
  }

  // Analisis range
  insights.push(
    `Rentang data adalah ${statistics.range.toFixed(
      2
    )}, dari nilai minimum ${statistics.min} hingga maksimum ${statistics.max}.`
  );

  // Analisis variasi
  if (statistics.mean !== 0) {
    const coefficientOfVariation =
      (statistics.standardDeviation /
        Math.abs(statistics.mean)) *
      100;

    if (coefficientOfVariation < 10) {
      insights.push(
        `Variasi data relatif rendah dengan coefficient of variation sekitar ${coefficientOfVariation.toFixed(
          1
        )}%.`
      );
    } else if (coefficientOfVariation < 25) {
      insights.push(
        `Variasi data berada pada tingkat sedang dengan coefficient of variation sekitar ${coefficientOfVariation.toFixed(
          1
        )}%.`
      );
    } else {
      insights.push(
        `Variasi data relatif tinggi dengan coefficient of variation sekitar ${coefficientOfVariation.toFixed(
          1
        )}%.`
      );
    }
  }

  // Analisis outlier
  if (statistics.outliers.length === 0) {
    insights.push(
      "Tidak ditemukan outlier berdasarkan metode IQR."
    );
  } else {
    insights.push(
      `Ditemukan ${statistics.outliers.length} outlier berdasarkan metode IQR.`
    );
  }

  return {
    column: columnName,
    insights,
  };
}