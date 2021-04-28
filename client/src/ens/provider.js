import ENS, { getEnsAddress } from "@ensdomains/ensjs";
import { provider } from "../web3/provider";

const ens = new ENS({ provider, ensAddress: getEnsAddress("1") });

export default ens;
