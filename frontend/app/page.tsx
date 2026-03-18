"use client"

import { useEffect, useState } from "react"
import { voteOnChain, getVotes } from "./contract"
import { requestAccess } from "@stellar/freighter-api"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

export default function Home() {
  const [wallet, setWallet] = useState("")
  const [vote1, setVote1] = useState(0)
  const [vote2, setVote2] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [txHash, setTxHash] = useState("")

  const connectWallet = async () => {
    const res = await requestAccess()
    if (res.error) {
      alert("Freighter wallet not installed")
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

  const vote = async (proposal: number) => {
    if (!wallet) {
      alert("Connect wallet first")
      return
    }

    try {
      setLoading(true)
      setTxHash("")
      setMessage("Submitting vote to blockchain...")

      const hash = await voteOnChain(wallet, proposal)

      setTxHash(hash)
      setMessage("✅ Vote is successful!")

      confetti({
        particleCount: 200,
        spread: 120,
        colors: ['#9333ea', '#ec4899', '#3b82f6'] // purple, pink, blue
      })

      setTimeout(async () => {
        await loadVotes()
        setLoading(false)
        setTimeout(() => {
          setMessage("")
          setTxHash("")
        }, 6000)
      }, 3000)

    } catch (e) {
      setMessage("❌ Transaction failed")
      setLoading(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  useEffect(() => {
    loadVotes()
    const interval = setInterval(() => {
      loadVotes()
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 animate-glow flex items-center justify-center font-bold text-xl">S</div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Stellar Voting
          </h1>
        </div>

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

      {/* VOTING CARD */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-xl relative animate-float"
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-20 rounded-[3rem] -z-10"></div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

          <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 relative z-10">
            Active Proposal
          </h2>

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
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-200"
                      : "bg-green-500/20 border-green-500/40 text-green-200"
                    }`}
                >
                  {message.includes("Submitting") && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span className="font-semibold">{message}</span>
                  {txHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                      target="_blank"
                      className="ml-4 px-4 py-1.5 bg-green-500/20 hover:bg-green-500/40 border border-green-500/50 rounded-lg text-sm flex items-center gap-1 transition-all"
                    >
                      Verify Tx ↗
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10 relative z-10">
            <button
              disabled={loading}
              onClick={() => vote(1)}
              className="flex-1 group relative px-6 py-4 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 hover:from-emerald-400/40 hover:to-emerald-600/40 border border-emerald-500/30 rounded-2xl transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-emerald-400/20 w-0 group-hover:w-full transition-all duration-500 ease-out z-0"></div>
              <span className="relative z-10 font-semibold text-emerald-100 flex items-center justify-center gap-2">
                Vote Option 1
              </span>
            </button>

            <button
              disabled={loading}
              onClick={() => vote(2)}
              className="flex-1 group relative px-6 py-4 bg-gradient-to-br from-amber-400/20 to-orange-600/20 hover:from-amber-400/40 hover:to-orange-600/40 border border-orange-500/30 rounded-2xl transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-orange-400/20 w-0 group-hover:w-full transition-all duration-500 ease-out z-0"></div>
              <span className="relative z-10 font-semibold text-orange-100 flex items-center justify-center gap-2">
                Vote Option 2
              </span>
            </button>
          </div>

          {/* RESULTS */}
          <div className="relative z-10 bg-black/20 rounded-2xl p-6 border border-white/5">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Live Results
            </h3>

            {/* PROPOSAL 1 */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-emerald-200">Option 1</span>
                <span className="text-gray-300">{vote1} votes ({p1.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p1}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>

            {/* PROPOSAL 2 */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-orange-200">Option 2</span>
                <span className="text-gray-300">{vote2} votes ({p2.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p2}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                />
              </div>
            </div>
          </div>

          {/* WINNER */}
          <div className="mt-8 text-center relative z-10">
            <div className="inline-block px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200">
                {vote1 > vote2 && "🏆 Option 1 is Leading"}
                {vote2 > vote1 && "🏆 Option 2 is Leading"}
                {vote1 === vote2 && total > 0 && "🤝 It's currently a Tie"}
                {total === 0 && "Awaiting first vote..."}
              </span>
            </div>
          </div>
        </div>

        {/* HISTORY LINK */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <Link
            href="/history"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all shadow-lg hover:shadow-xl"
          >
            <span>📜 View Voting History</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}