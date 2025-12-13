import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface NotificationDialogProps {
	triggerElement: React.ReactNode;
	title: string;
	description: string;
	actionText: string;
	cancelText: string;
	children?: React.ReactNode;
	onAction: () => void;
}

function NotificationDialog({
	triggerElement,
	title,
	description,
	actionText,
	cancelText,
	children,
	onAction,
}: NotificationDialogProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{triggerElement}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				{children && <div className="py-4">{children}</div>}
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelText}</AlertDialogCancel>
					<AlertDialogAction onClick={onAction}>{actionText}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default NotificationDialog;
