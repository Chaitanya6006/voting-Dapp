type Props = {
  vote1:number
  vote2:number
}

export default function Winner({vote1,vote2}:Props){

  if(vote1===0 && vote2===0){
    return <p>No votes yet</p>
  }

  if(vote1>vote2){
    return <h3>🏆 Proposal 1 is Leading</h3>
  }

  if(vote2>vote1){
    return <h3>🏆 Proposal 2 is Leading</h3>
  }

  return <h3>🤝 It's a Tie</h3>
}