import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { LogOut, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AccountList from "./components/AccountList";
import AddAccountModal from "./components/AddAccountModal";
import LoginScreen from "./components/LoginScreen";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useAddAccount,
  useDeleteAccount,
  useGetAccounts,
  useRegister,
} from "./hooks/useQueries";

export default function App() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const hasRegisteredRef = useRef(false);

  const isLoggedIn = loginStatus === "success" && !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const register = useRegister();
  const { data: accounts = [], isLoading, refetch } = useGetAccounts();
  const addAccount = useAddAccount();
  const deleteAccount = useDeleteAccount();

  // Register on login
  useEffect(() => {
    if (isLoggedIn && !hasRegisteredRef.current) {
      hasRegisteredRef.current = true;
      register.mutate(undefined, {
        onError: (err) => {
          if (err.message.includes("another principal")) {
            setAuthError(
              "This canister is already owned by another identity. Access denied.",
            );
            clear();
            hasRegisteredRef.current = false;
          }
        },
      });
    }
    if (!isLoggedIn) {
      hasRegisteredRef.current = false;
    }
  }, [isLoggedIn, register, clear]);

  const handleLogin = async () => {
    setAuthError(null);
    login();
  };

  const handleAddAccount = async (data: {
    accountName: string;
    issuer: string;
    secret: string;
  }) => {
    try {
      await addAccount.mutateAsync(data);
      setShowAdd(false);
      toast.success("Account added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add account");
    }
  };

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteAccount.mutateAsync(id);
      toast.success("Account removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setDeletingId(null);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen
          onLogin={handleLogin}
          isLoggingIn={isLoggingIn}
          error={authError}
        />
        <Toaster theme="dark" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster theme="dark" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={2} />
            <span className="font-bold text-base tracking-tight">
              Authenticator
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => refetch()}
              data-ocid="header.secondary_button"
              aria-label="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => clear()}
              data-ocid="header.logout_button"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full pb-24">
        {isLoading ? (
          <div className="space-y-3" data-ocid="account.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border/50 rounded-xl p-4 h-20 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AccountList
              accounts={accounts}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          </motion.div>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-30">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowAdd(true)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
          data-ocid="account.open_modal_button"
          aria-label="Add account"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Add Account Modal */}
      <AnimatePresence>
        {showAdd && (
          <AddAccountModal
            onClose={() => setShowAdd(false)}
            onAdd={handleAddAccount}
            isAdding={addAccount.isPending}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 pb-1 text-center pointer-events-none">
        <p className="text-xs text-muted-foreground/40">
          © {new Date().getFullYear()} ·{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors pointer-events-auto"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
