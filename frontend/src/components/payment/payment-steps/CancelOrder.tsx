import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function CancelOrder({
  reason,
  setReason,
}: {
  reason: string;
  setReason: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div>
      <Label className="font-medium mb-2">Reason for Cancellation</Label>
      <Textarea
        defaultValue={reason}
        onChange={(e) => setReason(e.target.value)}
      ></Textarea>
    </div>
  );
}

export default CancelOrder;
