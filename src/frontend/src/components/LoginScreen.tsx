import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface LoginScreenProps {
  onLogin: () => void;
  isLoggingIn: boolean;
  error?: string | null;
}

export default function LoginScreen({
  onLogin,
  isLoggingIn,
  error,
}: LoginScreenProps) {
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-8 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-primary/5 blur-md -z-10" />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Authenticator
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Decentralized two-factor authentication,
            <br />
            secured by Internet Identity.
          </p>
        </div>

        {/* Features */}
        <div className="w-full space-y-3">
          {[
            {
              label: "End-to-end encrypted",
              sub: "Secrets stored on-chain, only you can access",
            },
            {
              label: "No third parties",
              sub: "Fully decentralized on the Internet Computer",
            },
            {
              label: "RFC 6238 compliant",
              sub: "Works with any TOTP-compatible service",
            },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/50"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Security Disclaimer */}
        <div className="w-full rounded-xl border border-yellow-500/40 bg-yellow-500/5 overflow-hidden">
          <button
            type="button"
            onClick={() => setDisclaimerOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-yellow-500/10 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-yellow-300">
              Security Notice
            </span>
            <span className="ml-auto text-xs text-yellow-400/70">
              {disclaimerOpen ? "Hide" : "Read"}
            </span>
          </button>

          {disclaimerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4 space-y-3"
            >
              <p className="text-xs font-bold text-yellow-300 uppercase tracking-wider">
                Do not use this app to protect important or irreplaceable
                accounts.
              </p>
              <ul className="space-y-2">
                {[
                  {
                    title: "Compromised device",
                    body: "Malware or spyware on your device can read TOTP codes directly from the browser before they are used.",
                  },
                  {
                    title: "Browser extensions",
                    body: "Malicious or over-permissioned browser extensions can access page content, including your secrets and generated codes.",
                  },
                  {
                    title: "Screen recording & shoulder surfing",
                    body: "Codes displayed on screen can be captured by screen-recording software or observed by bystanders.",
                  },
                  {
                    title: "Phishing & clipboard hijacking",
                    body: "A fake site or clipboard-monitoring malware can intercept codes you copy and paste.",
                  },
                  {
                    title: "Frontend delivery risk",
                    body: "Although secrets are stored on-chain, the frontend code is served at load time. A supply-chain attack or tampered canister could expose data in the browser.",
                  },
                  {
                    title: "Single device, no backup",
                    body: "If you lose access to your Internet Identity or this canister, your TOTP secrets cannot be recovered unless you have exported them.",
                  },
                ].map((risk) => (
                  <li key={risk.title} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-yellow-400/60 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-yellow-200/80 leading-relaxed">
                      <span className="font-semibold text-yellow-300">
                        {risk.title}:
                      </span>{" "}
                      {risk.body}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-yellow-400/60 italic">
                Use a dedicated hardware security key or an offline TOTP device
                for your most sensitive accounts.
              </p>
            </motion.div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            className="w-full p-3 rounded-lg bg-destructive/10 border border-destructive/30"
            data-ocid="login.error_state"
          >
            <p className="text-sm text-destructive-foreground text-center">
              {error}
            </p>
          </div>
        )}

        {/* Login Button */}
        <Button
          onClick={onLogin}
          disabled={isLoggingIn}
          size="lg"
          className="w-full h-12 text-base font-semibold"
          data-ocid="login.primary_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
            </>
          ) : (
            "Sign in with Internet Identity"
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Internet Identity is a secure, anonymous authentication system for the
          Internet Computer.
        </p>
      </motion.div>

      {/* Footer */}
      <footer className="text-xs text-muted-foreground text-center mt-8">
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
