"use client"

type Props = {
  vote1:number
  vote2:number
}

export default function VoteChart({vote1,vote2}:Props){

  const total = vote1 + vote2

  const p1 = total ? (vote1/total)*100 : 0
  const p2 = total ? (vote2/total)*100 : 0

  return(

    <div style={{marginTop:20}}>

      <h3>Vote Chart</h3>

      <div>
        Proposal 1
        <div style={{
          height:20,
          width:`${p1}%`,
          background:"green"
        }}/>
      </div>

      <div style={{marginTop:10}}>
        Proposal 2
        <div style={{
          height:20,
          width:`${p2}%`,
          background:"orange"
        }}/>
      </div>

    </div>

  )
}