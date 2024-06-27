import { Chip, CircularProgress } from "@nextui-org/react";
import { FaCheckCircle } from "react-icons/fa";
import styles from "./styles.module.css";
import clsx from "clsx";
import { useMemo } from "react";

const CheckIcon = () => {
    return (
        <div className={clsx("relative flex items-center justify-center")} style={{ zIndex: 1, marginRight: 1 }}>
            <FaCheckCircle className={styles.checkicon} />
            <div className={styles.checkiconback} />
        </div>
    )
}

const StepIndicator = ({ step, current }: { step: number; current: number }) => {
    if (step > current) {
        return <Chip color="default">{step.toString()}</Chip>
    }
    if (step === current) {
        return <CircularProgress className={styles.progress} />
    }
    if (step < current) {
        return <CheckIcon />;
    }
}

type Props = {
    step: number;
}

export const ProgressInfo = ({ step }: Props) => {
    const step1Text = useMemo(() => {
        if (step < 1) {
            return `Approve ERC20 token transfer`;
        } else if (step === 1) {
            return `Approving ERC20 token transfer`;
        } else {
            return 'Approved ERC20 token transfer';
        };
    }, [step]);

    const step2Text = useMemo(() => {
        if (step < 2) {
            return `Deposit fund to FundManager contract`
        } else if (step === 2) {
            return `Depositing fund to FundManager contract`
        } else {
            return `Deposited fund to FundManager contract`
        }
    }, [step]);

    const step3Text = useMemo(() => {
        if (step < 3) {
            return `Upload GitHub contributions to IPFS by ChainLink Functions`
        } else if (step === 3) {
            return `Uploading GitHub contributions to IPFS by ChainLink Functions`
        } else {
            return `Uploaded GitHub contributions to IPFS by ChainLink Functions`
        }
    }, [step]);

    const step4Text = useMemo(() => {
        if (step < 4) {
            return `Calculate distributions for each contributor in Risc0 ZKVM`
        } else if (step === 4) {
            return `Calculating distributions for each contributor in Risc0 ZKVM`
        } else {
            return `Calculated distributions for each contributor in Risc0 ZKVM`
        }
    }, [step]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <StepIndicator step={1} current={step} />
                <span className="text-sm">{step1Text}</span>
            </div>
            <div className="flex items-center gap-4">
                <StepIndicator step={2} current={step} />
                <span className="text-sm">{step2Text}</span>
            </div>
            <div className="flex items-center gap-4">
                <StepIndicator step={3} current={step} />
                <span className="text-sm">{step3Text}</span>
            </div>
            <div className="flex items-center gap-4">
                <StepIndicator step={4} current={step} />
                <span className="text-sm">{step4Text}</span>
            </div>
        </div>
    )
}