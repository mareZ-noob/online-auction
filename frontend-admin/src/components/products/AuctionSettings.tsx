import z from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useUpdateAuctionSettings } from "@/hooks/product-hooks";
import { toastError, toastSuccess } from "../custom-ui/toast/toast-ui";

const auctionSettingsSchema = z.object({
    thresholdMinutes: z.number().min(1),
    durationMinutes : z.number().min(1),
})

type AuctionSettingsSchema = z.infer<typeof auctionSettingsSchema>

function AuctionSettingsPage() {
    const {register, handleSubmit} = useForm<AuctionSettingsSchema>({
        resolver: zodResolver(auctionSettingsSchema),
        defaultValues: {
            thresholdMinutes: 5,
            durationMinutes: 10,
        }
    })

    const {mutateAsync: updateAuctionSettings} = useUpdateAuctionSettings();

    const onSubmit = (data: AuctionSettingsSchema) => {
        updateAuctionSettings(data, {
            onSuccess: (result) => {
                toastSuccess(result.message);
            },
            onError: (error) => {
                toastError(error);
            }
        })
    }

    return (
        <Card className="max-w-xl">
            <CardHeader>
                <CardTitle>Automatically Extend for New Bids</CardTitle>
                <CardDescription>
                    Automatically extend the auction time for new bids before ending in N (Threshold) minutes. Then, the time for that bidded product will automatically be extend for M (Duration) minutes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="thresholdMinutes">Threshold Minutes</Label>
                            <Input
                                id="thresholdMinutes"
                                type="number"
                                {...register("thresholdMinutes")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="durationMinutes">Duration Minutes</Label>
                            <Input
                                id="durationMinutes"
                                type="number"
                                {...register("durationMinutes")}
                            />
                        </div>
                    </div>
                    <Button type="submit" className="mt-4">Save Changes</Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default AuctionSettingsPage;