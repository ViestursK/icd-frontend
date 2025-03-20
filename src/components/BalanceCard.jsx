import "./BalanceCard.css";

export default function BalanceCard({ balance, changePercent }) {
  const colors = { red: "#FF1C1C", green: "#3EDD87", white: "#F2F2FA" };

  function getChangeColor() {
    if (changePercent < 0) {
      return colors.red;
    } else if (changePercent > 0) {
      return colors.green;
    } else {
      return colors.white;
    }
  }

  function balanceFormatter(balance) {
    const balanceString = balance.toString();
    const balanceArray = balanceString.split("");

    // Check if the balance has a decimal part
    const decimalIndex = balanceArray.indexOf(".");

    if (decimalIndex !== -1) {
      // Split the balance into whole and decimal parts
      const wholePart = balanceArray.slice(0, decimalIndex);
      const decimalPart = balanceArray.slice(decimalIndex);

      // Add commas to the whole part
      for (let i = wholePart.length - 3; i > 0; i -= 3) {
        wholePart.splice(i, 0, ",");
      }

      // Combine the whole and decimal parts
      return wholePart.concat(decimalPart).join("");
    } else {
      // Add commas to the balance if it doesn't have a decimal part
      for (let i = balanceArray.length - 3; i > 0; i -= 3) {
        balanceArray.splice(i, 0, ",");
      }
      return Number(balance).toFixed(2);
    }
  }

  return (
    <div className="balance-card">
      <div className="stats">
        <div className="balance">
          <p className="money-sign">$</p>
          <p id="balance">{balanceFormatter(balance)}</p>
        </div>
        <div className="historical-change">
          <p className="balance change">Last 24 hours</p>
          <p className="balance percentage" style={{ color: getChangeColor() }}>
            {changePercent}%
          </p>
        </div>
      </div>

      <div className="chart">
        <img src="./assets/Chart.svg" alt="chart" />
      </div>
    </div>
  );
}
