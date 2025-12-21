import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTrackingShipment } from "@/hooks/transaction-hooks";
import {
  toastError,
  toastSuccess,
} from "@/components/custom-ui/toast/toast-ui";
import { Button } from "@/components/ui/button";

const trackingNumberSchema = z.object({
  trackingNumber: z
    .string()
    .min(5, "Tracking number must be at least 5 characters long"),
});

type TrackingNumberProps = z.infer<typeof trackingNumberSchema>;

function TrackingNumber({ transactionId }: { transactionId: number }) {
  const { mutate } = useTrackingShipment();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackingNumberProps>({
    resolver: zodResolver(trackingNumberSchema),
    defaultValues: {
      trackingNumber: "",
    },
  });

  const onSubmit = (data: TrackingNumberProps) => {
    mutate(
      {
        transactionId: Number(transactionId),
        trackingNumber: data.trackingNumber,
      },
      {
        onSuccess: (result) => {
          toastSuccess(
            result.message || "Tracking number updated successfully"
          );
        },
        onError: (error) => {
          toastError(error || "Failed to update tracking number");
        },
      }
    );
  };

  return (
    <form
      className="flex flex-col gap-2 mt-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Label className="font-medium mb-2">Tracking Number</Label>
      <p className="text-sm text-gray-500 italic">
        Please guarantee the accuracy of your tracking number to ensure proper
        shipment tracking.
      </p>
      <div className="flex items-center gap-8">
        <Input
          placeholder="Enter your tracking number (e.g., VN-Express-999999)"
          {...register("trackingNumber")}
        />
        <Button variant="default" type="submit">
          Update
        </Button>
      </div>
      {errors.trackingNumber && (
        <p className="text-destructive text-xs">
          {errors.trackingNumber.message}
        </p>
      )}
    </form>
  );
}

export default TrackingNumber;
