#![no_std]

use soroban_sdk::{contract, contractimpl, Env, Symbol, symbol_short, Map};

#[contract]
pub struct VotingContract;

#[contractimpl]
impl VotingContract {

    pub fn vote(env: Env, proposal: Symbol) {

        let key = proposal;

        let mut votes: Map<Symbol, u32> =
            env.storage().instance().get(&symbol_short!("votes"))
            .unwrap_or(Map::new(&env));

        let count = votes.get(key.clone()).unwrap_or(0);

        votes.set(key, count + 1);

        env.storage().instance().set(&symbol_short!("votes"), &votes);
    }

    pub fn get_votes(env: Env) -> Map<Symbol, u32> {

        env.storage().instance()
            .get(&symbol_short!("votes"))
            .unwrap_or(Map::new(&env))
    }

}