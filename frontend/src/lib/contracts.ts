import IdentityRegistryAbi from "./abi/IdentityRegistry.json";
import RoomFactoryAbi from "./abi/RoomFactory.json";
import RoomAbi from "./abi/Room.json";
import CredTokenAbi from "./abi/CredToken.json";

export const MONAD_TESTNET_CHAIN_ID = 10143;

export const CONTRACTS = {
  identityRegistry: "0xf5b44d8F53e8987568EAdA9d5642ea7C97D616af" as const,
  roomFactory: "0x8ab4A7259f31bc8C6670A87Fb9D9055C5Ec8D4e6" as const,
};

/**
 * RoomFactory.getRooms() returns rooms in creation order. Everything created
 * before this cutoff (testing/dev rooms) is hidden from the public list —
 * only rooms created from here on show up. Bump this if you intentionally
 * want to hide more later.
 */
export const ROOMS_VISIBLE_FROM_INDEX = 12;

export const SEED_ROOMS = {
  monadBlitz: {
    name: "Monad Blitz",
    symbol: "BLITZ",
    room: "0x38aA18BDbD23C6e55243F4B2bCE46e6482Cd923b" as const,
    token: "0x86C545dCE58AB887cA447e63A70617944C835B85" as const,
  },
};

export const abis = {
  identityRegistry: IdentityRegistryAbi,
  roomFactory: RoomFactoryAbi,
  room: RoomAbi,
  credToken: CredTokenAbi,
};
