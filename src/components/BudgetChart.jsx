
import "./BudgetChart.css";

const pengeluaranAwal = [
  { name: "Biaya kos", amount: 500000, color: "#147D66" },
  { name: "Makan harian", amount: 750000, color: "#F5AD4D" },
  { name: "Transportasi", amount: 100000, color: "#79B4C5" },
  { name: "Lain-lain", amount: 150000, color: "#B9D2C6" },
];

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function BudgetChart({ simulasi = null }) {
  const rincian = simulasi?.rincian;

  const expenses = rincian
    ? [
        {
          name: "Biaya kos",
          amount: Number(rincian.kos) || 0,
          color: "#147D66",
        },
        {
          name: "Makan harian",
          amount: rincian.hitungMakan
            ? (Number(rincian.makanPerHari) || 0) *
              (Number(rincian.periode) || 0)
            : 0,
          color: "#F5AD4D",
        },
        {
          name: "Transportasi",
          amount: Number(rincian.transportasi) || 0,
          color: "#79B4C5",
        },
        {
          name: "Lain-lain",
          amount: Number(rincian.lainnya) || 0,
          color: "#B9D2C6",
        },
      ]
    : pengeluaranAwal;

  const total = expenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const radius = 79;
  const circumference = 2 * Math.PI * radius;
  const gap = 8;

  let currentPosition = 0;

  const segments = expenses.map((item) => {
    const portion = total > 0 ? item.amount / total : 0;
    const arcLength = portion * circumference;

    const segment = {
      ...item,
      length: Math.max(0, arcLength - gap),
      offset: -currentPosition - gap / 2,
    };

    currentPosition += arcLength;

    return segment;
  });

  return (
    <section className="budget-card">
      <h3>Alokasi Anggaran</h3>
      <p>
        Lihat pengeluaran terbesar yang menghabiskan uangmu.
      </p>

      <div className="budget-body">
        <div
          className="budget-chart-graphic"
          role="img"
          aria-label={`Diagram alokasi anggaran dengan total pengeluaran ${formatRupiah(total)}`}
        >
          <svg
            className="budget-chart-svg"
            viewBox="0 0 220 220"
            aria-hidden="true"
          >
            <g transform="rotate(-90 110 110)">
              {segments.map((item) => (
                <circle
                  key={item.name}
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="29"
                  strokeDasharray={`${item.length} ${circumference}`}
                  strokeDashoffset={item.offset}
                />
              ))}
            </g>

            <text
              x="110"
              y="107"
              textAnchor="middle"
              className="budget-chart-percent"
            >
              {total > 0 ? "100%" : "0%"}
            </text>

            <text
              x="110"
              y="130"
              textAnchor="middle"
              className="budget-chart-label"
            >
              alokasi
            </text>
          </svg>
        </div>

        <div className="budget-legend">
          {expenses.map((item) => (
            <div className="budget-item" key={item.name}>
              <span
                className="budget-dot"
                style={{ backgroundColor: item.color }}
              />

              <span className="budget-name">
                {item.name}
              </span>

              <strong>
                {formatRupiah(item.amount)}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
