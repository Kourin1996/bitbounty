import { useReadContracts } from "wagmi";
import ERC20 from "@constants/ERC20.json";
import { useMemo } from "react";

export const useERC20Metadata = (tokenAddress: string) => {
  const query = useReadContracts({
    contracts: [
      {
        address: tokenAddress as `0x${string}` | undefined,
        abi: ERC20,
        functionName: 'name',
      },
      {
        address: tokenAddress as `0x${string}` | undefined,
        abi: ERC20,
        functionName: 'symbol',
      },
      {
        address: tokenAddress as `0x${string}` | undefined,
        abi: ERC20,
        functionName: 'decimals',
      },
    ],
  });

  return useMemo(() => {
    return {
      ...query,
      data: query.data !== undefined ? {
        name: query.data?.at(0)?.result as string | undefined,
        symbol: query.data?.at(1)?.result as string | undefined,
        decimals: query.data?.at(2)?.result as number | undefined,
      } : undefined
    }
  }, [query.data])
}