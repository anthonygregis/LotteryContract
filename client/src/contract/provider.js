import { createContext, useContext, useEffect, useState } from "react";
import web3, { provider } from "../web3/provider";
import ens from "../ens/provider";
import lotteryContract from "../web3/contract";

const ContractContext = createContext();

export const ContractProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [manager, setManager] = useState({
    addr: "",
    ens: "",
  });
  const [lottery, setLottery] = useState({
    people: [],
    pot: -1,
  });
  const [txPending, setTxPending] = useState({
    status: false,
    action: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const getENSDomain = async () => {
    var { name } = await ens.getName(manager.addr);

    console.log("Manager ENS:", name);

    // Check that ens is actually owned by the address.
    if (manager.addr === (await ens.name(name).getAddress())) {
      setManager({
        ...manager,
        ens: name,
      });
    }

    setIsLoading(false);
  };

  const getManager = async () => {
    const addr = await lotteryContract.methods.manager().call();
    setManager({
      ...manager,
      addr,
    });
  };

  const getLotteryInfo = async () => {
    const people = await lotteryContract.methods.getPlayers().call();
    const pot = await web3.utils.fromWei(
      await web3.eth.getBalance(lotteryContract.options.address),
      "ether"
    );

    setLottery({
      ...lottery,
      pot,
      people,
    });
  };

  const getAccountInfo = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log("Accounts:", accounts);
    setAccount(accounts[0]);
  };

  const enterLottery = async (entryValue) => {
    setTxPending({
      status: true,
      action: "Sending funds to pot",
    });

    await lotteryContract.methods
      .enter()
      .send({
        from: account,
        value: web3.utils.toWei(entryValue, "ether"),
      })
      .catch((err) => {
        setTxPending({
          status: false,
          action: "",
        });
      });

    setTxPending({
      status: false,
      action: "",
    });

    getLotteryInfo();
  };

  const pickWinner = async () => {
    if (manager.addr === account) {
      setTxPending({
        status: true,
        action: "Picking a winner",
      });

      await lotteryContract.methods
        .pickWinner()
        .send({
          from: account,
        })
        .catch((err) => {
          setTxPending({
            status: false,
            action: "",
          });
        });

      setTxPending({
        status: false,
        action: "",
      });
      getLotteryInfo();
    }
  };

  useEffect(() => {
    provider.on("accountsChanged", getAccountInfo);

    provider.on("chainChanged", (chainId) => {
      window.location.reload();
    });
  });

  useEffect(() => {
    if (provider === window.ethereum) {
      getManager();
      getAccountInfo();
      getLotteryInfo();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  useEffect(() => {
    if (manager.addr !== "") {
      getENSDomain();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manager.addr]);

  return (
    <ContractContext.Provider
      value={{
        account,
        manager,
        lottery,
        isLoading,
        txPending,
        enterLottery,
        pickWinner,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error(
      "useContractContext must be used within a ContractProvider"
    );
  }
  return context;
};
