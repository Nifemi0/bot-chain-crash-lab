export const PASSPORT_ABI = [
  "function owner() view returns (address)",
  "function publishers(address) view returns (bool)",
  "function exists(bytes32 simulationId) view returns (bool)",
  "function getPassport(bytes32 simulationId) view returns (tuple(address protocol, bytes32 sourceHash, bytes32 reportHash, uint8 status, uint64 timestamp, bytes32 toolVersion, address publisher))",
  "function publish(bytes32 simulationId, address protocol, bytes32 sourceHash, bytes32 reportHash, uint8 status, bytes32 toolVersion)",
  "event PassportPublished(bytes32 indexed simulationId, address indexed protocol, bytes32 indexed reportHash, bytes32 sourceHash, uint8 status, uint64 timestamp, bytes32 toolVersion, address publisher)",
] as const;

export const VAULT_ABI = [
  "function asset() view returns (address)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function deposit(uint256 assets, address receiver) returns (uint256 shares)",
  "function redeem(uint256 shares, address receiver) returns (uint256 assets)",
] as const;

export const MOCK_BOT_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
] as const;
