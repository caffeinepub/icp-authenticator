import { Button } from "@/components/ui/button";
import { generateTOTP, getCountdown } from "@/utils/totp";
import { Check, Copy, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface AccountCardProps {
  id: bigint;
  accountName: string;
  issuer: string;
  secret: string;
  onDelete: (id: bigint) => void;
  isDeleting?: boolean;
  index: number;
}

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function AccountCard({
  id,
  accountName,
  issuer,
  secret,
  onDelete,
  isDeleting,
  index,
}: AccountCardProps) {
  const [code, setCode] = useState("--- ---");
  const [countdown, setCountdown] = useState(30);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const refreshCode = useCallback(async () => {
    try {
      const newCode = await generateTOTP(secret);
      setCode(newCode);
    } catch {
      setCode("--- ---");
    }
  }, [secret]);

  useEffect(() => {
    refreshCode();
    const interval = setInterval(() => {
      const cd = getCountdown();
      setCountdown(cd);
      if (cd === 30) refreshCode();
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshCode]);

  const handleCopy = async () => {
    const raw = code.replace(" ", "");
    await navigator.clipboard.writeText(raw);
    setCopied(true);
    toast.success("Copied!", { duration: 1500 });
    setTimeout(() => setCopied(false), 2000);
  };

  const dashOffset = CIRCUMFERENCE * (1 - countdown / 30);
  const isWarning = countdown <= 5;

  const displayIssuer = issuer || accountName.split("@")[1] || "Account";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="relative bg-card border border-border/50 rounded-xl p-4 shadow-card"
      data-ocid={`account.item.${index + 1}`}
    >
      <div className="flex items-center gap-4">
        {/* Issuer Icon */}
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary uppercase">
            {displayIssuer.slice(0, 2)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate font-medium uppercase tracking-wider">
            {displayIssuer}
          </p>
          <p className="text-xs text-muted-foreground/60 truncate">
            {accountName}
          </p>

          {/* Code */}
          <button
            type="button"
            onClick={handleCopy}
            className="mt-1 flex items-center gap-2 group"
            aria-label="Copy code"
            data-ocid={`account.copy_button.${index + 1}`}
          >
            <span
              className={`text-2xl font-bold otp-code tracking-widest transition-colors ${
                isWarning ? "text-destructive" : "text-foreground"
              }`}
            >
              {code}
            </span>
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-3.5 h-3.5 text-primary" />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Countdown Ring */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            role="img"
            aria-label={`${countdown} seconds remaining`}
          >
            <title>{countdown} seconds remaining</title>
            {/* Track */}
            <circle
              cx="24"
              cy="24"
              r={RADIUS}
              fill="none"
              stroke="oklch(var(--border))"
              strokeWidth="3"
            />
            {/* Progress */}
            <circle
              cx="24"
              cy="24"
              r={RADIUS}
              fill="none"
              stroke={
                isWarning
                  ? "oklch(var(--destructive))"
                  : "oklch(var(--primary))"
              }
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="countdown-ring"
              style={{
                transition: "stroke-dashoffset 0.9s linear, stroke 0.3s",
              }}
            />
            <text
              x="24"
              y="24"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontWeight="600"
              fill={
                isWarning
                  ? "oklch(var(--destructive))"
                  : "oklch(var(--primary))"
              }
              style={{ fontFamily: "inherit" }}
            >
              {countdown}
            </text>
          </svg>
        </div>

        {/* Delete */}
        <div className="flex-shrink-0">
          <AnimatePresence mode="wait">
            {confirmDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col gap-1"
              >
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs px-2"
                  onClick={() => onDelete(id)}
                  disabled={isDeleting}
                  data-ocid={`account.confirm_button.${index + 1}`}
                >
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-2"
                  onClick={() => setConfirmDelete(false)}
                  data-ocid={`account.cancel_button.${index + 1}`}
                >
                  Cancel
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="trash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmDelete(true)}
                  data-ocid={`account.delete_button.${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
