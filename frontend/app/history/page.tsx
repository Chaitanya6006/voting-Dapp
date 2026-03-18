"use client"

import { useEffect, useState } from "react"
import { voteOnChain, getVotes } from "../contract"
import { requestAccess } from "@stellar/freighter-api"
import confetti from "canvas-confetti"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function HistoryPage() {

  const [wallet, setWallet] = useState("")
  const [vote1, setVote1] = useState(0)
  const [vote2, setVote2] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [history, setHistory] = useState<any[]>([])

  const connectWallet = async () => {
    const res = await requestAccess()
    if (res.error) {
      alert("Install Freighter Wallet")
      return
    }
    setWallet(res.address)
    sessionStorage.setItem("wallet", res.address)
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("wallet")
    if (saved) setWallet(saved)
  }, [])

  const loadVotes = async () => {
    const v1 = await getVotes(1)
    const v2 = await getVotes(2)
    setVote1(v1)
    setVote2(v2)
  }

  const fetchHistory = async () => {
    try {
      const contractId = "CB7MCRTWKYBKFW6S763YCBMJHZNGPYZCIBQ3C2OJBKWIMSKBCRU5RJMW"
      const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${contractId}/transactions?limit=10&order=desc`)
      const data = await res.json()

      if (data && data._embedded && data._embedded.records) {
        setHistory(data._embedded.records)
      }
    } catch (e) {
      console.log("Error fetching history:", e)
    }
  }

  const vote = async (proposal: number) => {
    if (!wallet) {
      alert("Connect wallet first")
      return
    }
    try {
      setLoading(true)
      setMessage("Submitting vote to blockchain...")

      await voteOnChain(wallet, proposal)

      setMessage("✅ Vote Successful!")

      // confetti blast 🎉
      confetti({
        particleCount: 200,
        spread: 120,
        colors: ['#9333ea', '#ec4899', '#3b82f6']
      })

      // wait for blockchain update
      setTimeout(async () => {
        await loadVotes()
        await fetchHistory()
        setLoading(false)
        setTimeout(() => setMessage(""), 3000)
      }, 3000)
    } catch (e) {
      setMessage("❌ Transaction failed")
      setLoading(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  useEffect(() => {
    loadVotes()
    fetchHistory()
    const interval = setInterval(() => {
      loadVotes()
      fetchHistory()
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const total = vote1 + vote2
  const p1 = total ? (vote1 / total) * 100 : 0
  const p2 = total ? (vote2 / total) * 100 : 0

  return (
    <div className="min-h-screen text-white flex flex-col items-center p-4 sm:p-8 font-sans">

      {/* HEADER */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl flex justify-between items-center py-6 backdrop-blur-md bg-white/5 rounded-2xl px-8 border border-white/10 shadow-lg mb-12"
      >
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(147,51,234,0.3)]">S</div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Voting History
          </h1>
        </Link>
        {!wallet ? (
          <button
            onClick={connectWallet}
            className="bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 px-6 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-200 text-sm font-medium">
            {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </div>
        )}
      </motion.div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-2xl relative"
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 blur-3xl opacity-20 rounded-[3rem] -z-10"></div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden mb-8">

          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="flex justify-between items-center mb-10 relative z-10">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-blue-200">
              Contract Interaction
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Live Sync
            </div>
          </div>

          {/* STATUS MESSAGE WITH ANIMATION */}
          <div className="relative z-10 h-16 w-full mb-4">
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`absolute inset-0 flex items-center justify-center rounded-xl border backdrop-blur-md ${message.includes("failed")
                    ? "bg-red-500/20 border-red-500/40 text-red-200"
                    : message.includes("Submitting")
                      ? "bg-blue-500/20 border-blue-500/40 text-blue-200"
                      : "bg-green-500/20 border-green-500/40 text-green-200"
                    }`}
                >
                  {message.includes("Submitting") && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 relative z-10">
            <button
              disabled={loading}
              onClick={() => vote(1)}
              className="flex-1 group relative px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
              <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">Vote Proposal 1</span>
            </button>

            <button
              disabled={loading}
              onClick={() => vote(2)}
              className="flex-1 group relative px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
              <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">Vote Proposal 2</span>
            </button>
          </div>

          {/* DETAILED RESULTS TABLE/CHART */}
          <div className="relative z-10 bg-black/30 rounded-2xl p-6 border border-white/5 shadow-inner">
            <h3 className="text-xl font-semibold mb-6 text-gray-200">Current Distribution</h3>

            {/* ROW 1 */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-gray-300">Proposal 1</span>
                <span className="text-white bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  {vote1} votes
                </span>
              </div>
              <div className="w-full bg-black/50 h-4 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p1}%` }}
                  transition={{ duration: 1, type: "spring" }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                </motion.div>
              </div>
            </div>

            {/* ROW 2 */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-gray-300">Proposal 2</span>
                <span className="text-white bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  {vote2} votes
                </span>
              </div>
              <div className="w-full bg-black/50 h-4 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p2}%` }}
                  transition={{ duration: 1, type: "spring" }}
                  className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                </motion.div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
              <span>Total Votes Cast:</span>
              <span className="text-lg font-bold text-white">{total}</span>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS LIST */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-xl font-semibold mb-6 text-gray-200 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Recent Network Txs
          </h3>

          <div className="flex flex-col gap-3">
            {history.length > 0 ? history.map((tx: any, i: number) => (
              <a
                key={i}
                href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                target="_blank"
                className="flex items-center justify-between p-4 rounded-xl bg-black/20 hover:bg-black/40 border border-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200 group-hover:text-blue-300 transition-colors">
                      {tx.hash.substring(0, 12)}...{tx.hash.substring(tx.hash.length - 8)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded bg-white/5 text-gray-400">
                  View ↗
                </div>
              </a>
            )) : (
              <div className="text-center py-8 text-gray-500">
                No recent transactions found on the contract...
              </div>
            )}
          </div>
        </div>

        {/* BACK BUTTON */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}