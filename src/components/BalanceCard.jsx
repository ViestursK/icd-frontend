import "./BalanceCard.css";
import "./skeleton.css"; // Import skeleton styles

export default function BalanceCard({ balance, changePercent, isLoading }) {
  const colors = { red: "#FF1C1C", green: "#3EDD87", white: "#F2F2FA" };

  function getChangeColor() {
    if (changePercent < 0) return colors.red;
    if (changePercent > 0) return colors.green;
    return colors.white;
  }

  function balanceFormatter(balance) {
    return Number(balance).toLocaleString("en-US", {
      minimumFractionDigits: 2,
    });
  }

  return (
    <div className="balance-card">
      <div className="stats">
        <div className="balance">
          {isLoading ? (
            <div className="skeleton skeleton-text large" />
          ) : (
            <>
              <p className="money-sign">$</p>
              <p id="balance">{balanceFormatter(balance)}</p>
            </>
          )}
        </div>

        <div className="historical-change">
          {isLoading ? (
            <div className="skeleton skeleton-text small" />
          ) : (
            <>
              <p className="balance change">Last 24 hours</p>
              <p
                className="balance percentage"
                style={{ color: getChangeColor() }}
              >
                {changePercent}%
              </p>
            </>
          )}
        </div>
      </div>

      <div className="chart">
        {isLoading ? (
          <div className="skeleton skeleton-chart" />
        ) : (
          <img src="./assets/Chart.svg" alt="chart" />
        )}
      </div>
    </div>
  );
}
