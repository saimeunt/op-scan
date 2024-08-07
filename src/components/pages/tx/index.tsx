import { Hash } from "viem";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { l2PublicClient } from "@/lib/chains";
import { parseTokenTransfers } from "@/lib/utils";
import { fetchTokensPrices } from "@/lib/fetch-data";
import TransactionDetails from "@/components/pages/tx/transaction-details";
import { getSignatureBySelector } from "@/lib/4byte-directory";

const Tx = async ({ hash }: { hash: Hash }) => {
  const [transaction, receipt] = await Promise.all([
    l2PublicClient.getTransaction({ hash }),
    l2PublicClient.getTransactionReceipt({ hash }),
  ]);
  if (!transaction || !receipt) {
    notFound();
  }
  const [block, tokenTransfers, signature, tokensPrices] = await Promise.all([
    l2PublicClient.getBlock({ blockNumber: transaction.blockNumber }),
    parseTokenTransfers(receipt.logs),
    getSignatureBySelector(transaction.input.slice(0, 10)),
    fetchTokensPrices(),
  ]);
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-4 md:p-4">
      <h2 className="text-2xl font-bold tracking-tight">Transaction Details</h2>
      <Separator />
      <Card>
        <CardContent className="p-4">
          <TransactionDetails
            transaction={{
              blockNumber: transaction.blockNumber,
              hash: transaction.hash,
              from: transaction.from,
              to: transaction.to,
              value: transaction.value,
              gas: transaction.gas,
              gasPrice: transaction.gasPrice ?? null,
              maxFeePerGas: transaction.maxFeePerGas ?? null,
              maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ?? null,
              transactionIndex: transaction.transactionIndex,
              nonce: transaction.nonce,
              input: transaction.input,
              signature,
              timestamp: block.timestamp,
              transactionReceipt: {
                transactionHash: receipt.transactionHash,
                status: receipt.status,
                from: receipt.from,
                to: receipt.to,
                effectiveGasPrice: receipt.effectiveGasPrice,
                gasUsed: receipt.gasUsed,
                l1Fee: receipt.l1Fee,
                l1GasPrice: receipt.l1GasPrice,
                l1GasUsed: receipt.l1GasUsed,
                l1FeeScalar: receipt.l1FeeScalar,
              },
            }}
            ethPriceToday={tokensPrices.eth.today}
            tokenTransfers={tokenTransfers}
          />
        </CardContent>
      </Card>
    </main>
  );
};

export default Tx;
