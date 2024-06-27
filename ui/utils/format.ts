import { BigNumberish, ethers } from "ethers";

export default function formatUnitsWithFixedDecimalPoints(
    value: BigNumberish,
    decimals: number,
    maxDecimalDigits?: number
) {
    return ethers.FixedNumber.fromString(ethers.formatUnits(value, decimals))
        .round(maxDecimalDigits ?? decimals)
        .toString();
}