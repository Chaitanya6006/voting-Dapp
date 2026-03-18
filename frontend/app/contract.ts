import {
  Contract,
  TransactionBuilder,
  Networks,
  rpc as StellarRpc,
  nativeToScVal,
  scValToNative
} from "@stellar/stellar-sdk"

import { signTransaction } from "@stellar/freighter-api"

const rpc = new StellarRpc.Server(
  "https://soroban-testnet.stellar.org"
)

const contractId = "CB7MCRTWKYBKFW6S763YCBMJHZNGPYZCIBQ3C2OJBKWIMSKBCRU5RJMW"

export async function voteOnChain(wallet: string, proposal: number) {

  const account = await rpc.getAccount(wallet)

  const contract = new Contract(contractId)

  let tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(
      contract.call(
        "vote",
        nativeToScVal(proposal.toString(), { type: "symbol" })
      )
    )
    .setTimeout(30)
    .build()

  const sim = await rpc.simulateTransaction(tx)

  tx = StellarRpc.assembleTransaction(tx, sim).build()

  const signed = await signTransaction(
    tx.toXDR(),
    { networkPassphrase: Networks.TESTNET }
  )

  const txSigned = TransactionBuilder.fromXDR(
    signed.signedTxXdr,
    Networks.TESTNET
  )

  const send = await rpc.sendTransaction(txSigned)

  if (send.status === "ERROR") {
    console.log(send)
    throw new Error("Transaction failed")
  }

  return send.hash
}

export async function getVotes(proposal: number) {

  const contract = new Contract(contractId)

  // valid placeholder Stellar account
  const account = await rpc.getAccount(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
  )

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(
      contract.call("get_votes")
    )
    .setTimeout(30)
    .build()

  const sim = await rpc.simulateTransaction(tx)

  if (StellarRpc.Api.isSimulationError(sim)) {
    console.log(sim.error)
    return 0
  }

  const result = sim.result?.retval

  if (!result) return 0

  const mapData = scValToNative(result)

  return Number(mapData?.[proposal.toString()] ?? 0)
}