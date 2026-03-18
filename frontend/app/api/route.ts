import { NextResponse } from "next/server"
import { rpc as StellarRpc, Contract, TransactionBuilder, Networks } from "@stellar/stellar-sdk"

const rpc = new StellarRpc.Server("https://soroban-testnet.stellar.org")

const contractId =
  "CA53BDBAWAUXMLIMU7SIGLPMETTTA2ZPTV2AJZIVHZ4E4N3IXSIRCWQ6"

export async function GET() {

  try {

    const contract = new Contract(contractId)

    // generic testnet address for simulating reads
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
      return NextResponse.json({ votes: 0 })
    }

    return NextResponse.json({
      votes: sim.result?.retval ? Number(sim.result.retval.value() ?? 0) : 0
    })

  } catch (e) {

    return NextResponse.json({
      votes: 0
    })

  }

}