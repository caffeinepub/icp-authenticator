import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseOtpauthUri } from "@/utils/totp";
import { AlertCircle, Camera, CameraOff, Loader2, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useQRScanner } from "../qr-code/useQRScanner";

interface AddAccountModalProps {
  onClose: () => void;
  onAdd: (data: {
    accountName: string;
    issuer: string;
    secret: string;
  }) => Promise<void>;
  isAdding: boolean;
}

function ManualEntry({
  onAdd,
  isAdding,
}: {
  onAdd: (d: {
    accountName: string;
    issuer: string;
    secret: string;
  }) => Promise<void>;
  isAdding: boolean;
}) {
  const [accountName, setAccountName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [secret, setSecret] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!accountName.trim()) e.accountName = "Account name is required";
    if (!secret.trim()) e.secret = "Secret key is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    await onAdd({
      accountName: accountName.trim(),
      issuer: issuer.trim(),
      secret: secret.trim().toUpperCase(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="issuer" className="text-sm text-muted-foreground">
          Issuer / Service
        </Label>
        <Input
          id="issuer"
          placeholder="Google, GitHub, Binance..."
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          className="bg-input/50"
          data-ocid="add_account.issuer_input"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="accountName" className="text-sm text-muted-foreground">
          Account Name / Email *
        </Label>
        <Input
          id="accountName"
          placeholder="user@example.com"
          value={accountName}
          onChange={(e) => {
            setAccountName(e.target.value);
            setErrors((p) => ({ ...p, accountName: "" }));
          }}
          className="bg-input/50"
          data-ocid="add_account.account_input"
        />
        {errors.accountName && (
          <p
            className="text-xs text-destructive"
            data-ocid="add_account.account_error"
          >
            {errors.accountName}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="secret" className="text-sm text-muted-foreground">
          Secret Key *
        </Label>
        <Input
          id="secret"
          placeholder="JBSWY3DPEHPK3PXP"
          value={secret}
          onChange={(e) => {
            setSecret(e.target.value);
            setErrors((p) => ({ ...p, secret: "" }));
          }}
          className="bg-input/50 font-mono tracking-wider"
          data-ocid="add_account.secret_input"
        />
        {errors.secret && (
          <p
            className="text-xs text-destructive"
            data-ocid="add_account.secret_error"
          >
            {errors.secret}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter the base32 secret from your service's 2FA setup page.
        </p>
      </div>
      <Button
        type="submit"
        disabled={isAdding}
        className="w-full h-11"
        data-ocid="add_account.submit_button"
      >
        {isAdding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
          </>
        ) : (
          "Add Account"
        )}
      </Button>
    </form>
  );
}

function QRScanner({
  onAdd,
  isAdding,
}: {
  onAdd: (d: {
    accountName: string;
    issuer: string;
    secret: string;
  }) => Promise<void>;
  isAdding: boolean;
}) {
  const {
    qrResults,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 100,
    maxResults: 5,
  });
  const [parsed, setParsed] = useState<{
    accountName: string;
    issuer: string;
    secret: string;
  } | null>(null);
  const [parseError, setParseError] = useState("");
  const processedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const result of qrResults) {
      if (processedRef.current.has(result.data)) continue;
      processedRef.current.add(result.data);
      const p = parseOtpauthUri(result.data);
      if (p) {
        setParsed(p);
        stopScanning();
        break;
      }
      setParseError("QR code is not a valid TOTP URI. Try manual entry.");
    }
  }, [qrResults, stopScanning]);

  const handleConfirm = async () => {
    if (parsed) await onAdd(parsed);
  };

  if (isSupported === false) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CameraOff className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Camera not supported on this device.
          <br />
          Please use manual entry.
        </p>
      </div>
    );
  }

  if (parsed) {
    return (
      <div className="space-y-4 pt-2">
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
          <p className="text-xs text-primary font-semibold uppercase tracking-wider">
            QR Code Detected
          </p>
          <p className="text-sm font-medium text-foreground">
            {parsed.issuer || "Unknown"}
          </p>
          <p className="text-sm text-muted-foreground">{parsed.accountName}</p>
          <p className="text-xs font-mono text-muted-foreground truncate">
            {parsed.secret}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => {
              setParsed(null);
              processedRef.current.clear();
            }}
            data-ocid="add_account.cancel_button"
          >
            Rescan
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={isAdding}
            data-ocid="add_account.confirm_button"
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
              </>
            ) : (
              "Add Account"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Camera viewport */}
      <div className="relative overflow-hidden rounded-xl bg-black aspect-square">
        <video
          ref={videoRef}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Scan frame overlay */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-48 h-48 border-2 border-primary rounded-lg"
              style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" }}
            >
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
            </div>
          </div>
        )}

        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
      </div>

      {error && (
        <div
          className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30"
          data-ocid="add_account.error_state"
        >
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive-foreground">{error.message}</p>
        </div>
      )}

      {parseError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive-foreground">{parseError}</p>
        </div>
      )}

      <div className="flex gap-2">
        {!isActive ? (
          <Button
            className="w-full h-11"
            onClick={startScanning}
            disabled={!canStartScanning || isLoading}
            data-ocid="add_account.upload_button"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                Camera...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" /> Start Camera
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full h-11"
            onClick={stopScanning}
            data-ocid="add_account.cancel_button"
          >
            Stop Camera
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Point camera at a TOTP QR code to scan automatically
      </p>
    </div>
  );
}

export default function AddAccountModal({
  onClose,
  onAdd,
  isAdding,
}: AddAccountModalProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-popover rounded-t-2xl border-t border-border max-h-[90vh] overflow-y-auto"
        data-ocid="add_account.modal"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-4 pb-8 pt-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Add Account</h2>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onClose}
              data-ocid="add_account.close_button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger
                value="scan"
                className="flex-1"
                data-ocid="add_account.scan_tab"
              >
                Scan QR
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="flex-1"
                data-ocid="add_account.manual_tab"
              >
                Manual Entry
              </TabsTrigger>
            </TabsList>
            <TabsContent value="scan">
              <QRScanner onAdd={onAdd} isAdding={isAdding} />
            </TabsContent>
            <TabsContent value="manual">
              <ManualEntry onAdd={onAdd} isAdding={isAdding} />
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </>
  );
}
