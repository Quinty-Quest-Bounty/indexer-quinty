export const ReputationRegistryAbi = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "agentId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": false, "internalType": "int128", "name": "score", "type": "int128" },
      { "indexed": false, "internalType": "string", "name": "tag1", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "tag2", "type": "string" }
    ],
    "name": "NewFeedback",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "agentId", "type": "uint256" },
      { "internalType": "int128", "name": "score", "type": "int128" },
      { "internalType": "uint8", "name": "valueDecimals", "type": "uint8" },
      { "internalType": "string", "name": "tag1", "type": "string" },
      { "internalType": "string", "name": "tag2", "type": "string" },
      { "internalType": "string", "name": "endpoint", "type": "string" },
      { "internalType": "string", "name": "feedbackURI", "type": "string" },
      { "internalType": "bytes32", "name": "feedbackHash", "type": "bytes32" }
    ],
    "name": "giveFeedback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "agentId", "type": "uint256" }],
    "name": "getAverageScore",
    "outputs": [{ "internalType": "int128", "name": "", "type": "int128" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "agentId", "type": "uint256" }],
    "name": "getFeedbackCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
