import { isConnected, requestAccess, getAddress } from "@stellar/freighter-api"

export async function connectWallet(): Promise<string> {

  const connected = await isConnected()

  if (!connected) {
    throw new Error("Freighter wallet not installed")
  }

  await requestAccess()

  const result = await getAddress()

  // handle both cases
  if (typeof result === "string") {
    return result
  }

  if (result?.address) {
    return result.address
  }

  throw new Error("Unable to get wallet address")
}