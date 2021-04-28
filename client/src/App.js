import { useState } from "react";
import { useContractContext } from "./contract/provider";
import Loader from "react-loader-spinner";

function App() {
  const {
    manager,
    lottery,
    isLoading,
    txPending,
    enterLottery,
    pickWinner,
  } = useContractContext();
  const [entryValue, setEntryValue] = useState("");

  const handleForm = (event) => {
    event.preventDefault();

    console.log(typeof entryValue);

    if (entryValue > 0) {
      enterLottery(entryValue);
    }
  };

  if (isLoading)
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Loader type="Grid" color="#5f7ffa" height={80} width={80} />
      </div>
    );

  if (!isLoading)
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>Lottery Pot: {lottery.pot} ETH</p>
        <p>Player Count: {lottery.people.length}</p>
        <p>
          This contract is managed by{" "}
          {manager.ens !== "" ? manager.ens : manager.addr}
        </p>
        <hr />
        <form onSubmit={handleForm}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              disabled={txPending.status}
              value={entryValue}
              onChange={(event) => setEntryValue(event.target.value)}
            />
          </div>
          <button type="submit" disabled={txPending.status}>
            Enter Lottery
          </button>
        </form>
        <hr />
        <h4>Ready to pick a winner?</h4>
        <button onClick={pickWinner} disabled={txPending.status}>
          Pick a winner
        </button>
      </div>
    );
}

export default App;
