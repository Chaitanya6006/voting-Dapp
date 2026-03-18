use soroban_sdk::{Env, Symbol};
use hello_world::{VotingContract, VotingContractClient};

#[test]
fn test_create_proposal() {

    let env = Env::default();

    let contract_id = env.register_contract(None, VotingContract);

    let client = VotingContractClient::new(&env, &contract_id);

    let name = Symbol::short("prop1");

    client.create_proposal(&1, &name);
}

#[test]
fn test_vote() {

    let env = Env::default();

    let contract_id = env.register_contract(None, VotingContract);

    let client = VotingContractClient::new(&env, &contract_id);

    client.vote(&1);

    let votes = client.get_votes();

    assert_eq!(votes, 1);
}

#[test]
fn test_multiple_votes() {

    let env = Env::default();

    let contract_id = env.register_contract(None, VotingContract);

    let client = VotingContractClient::new(&env, &contract_id);

    client.vote(&1);
    client.vote(&1);

    let votes = client.get_votes();

    assert_eq!(votes, 2);
}