import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RejectAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (reason?: string) => void;
  isLoading: boolean;
  appName: string;
}

export function RejectAppDialog({
  open,
  onOpenChange,
  onReject,
  isLoading,
  appName,
}: RejectAppDialogProps) {
  const [reason, setReason] = useState("");

  const handleReject = () => {
    onReject(reason.trim() || undefined);
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Reject Application</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject "{appName}"? You can optionally provide a reason
            that will be visible to the creator.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Rejection Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this app is being rejected..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              The creator can see this reason and make changes before resubmitting.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={isLoading}
          >
            {isLoading ? "Rejecting..." : "Reject App"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
