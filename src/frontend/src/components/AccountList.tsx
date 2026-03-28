import { ShieldOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import AccountCard from "./AccountCard";

type Account = {
  id: bigint;
  accountName: string;
  issuer: string;
  secret: string;
};

interface AccountListProps {
  accounts: Account[];
  onDelete: (id: bigint) => void;
  deletingId?: bigint | null;
}

export default function AccountList({
  accounts,
  onDelete,
  deletingId,
}: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center"
        data-ocid="account.empty_state"
      >
        <div className="w-16 h-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center">
          <ShieldOff
            className="w-8 h-8 text-muted-foreground"
            strokeWidth={1.5}
          />
        </div>
        <div>
          <p className="font-semibold text-foreground">No accounts yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tap the <span className="text-primary font-medium">+</span> button
            to add your first account.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {accounts.map((account, idx) => (
          <AccountCard
            key={account.id.toString()}
            id={account.id}
            accountName={account.accountName}
            issuer={account.issuer}
            secret={account.secret}
            onDelete={onDelete}
            isDeleting={deletingId === account.id}
            index={idx}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
