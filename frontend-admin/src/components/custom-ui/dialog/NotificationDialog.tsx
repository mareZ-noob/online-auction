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
	actionText?: string;
	cancelText: string;
	children?: React.ReactNode;
	className?: string;
	onAction?: () => void;
}

function NotificationDialog({
	triggerElement,
	title,
	description,
	actionText,
	cancelText,
	children,
	className,
	onAction,
}: NotificationDialogProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{triggerElement}</AlertDialogTrigger>
			<AlertDialogContent className={`${className} w-full max-w-none`}>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				{children && <div className="py-4">{children}</div>}
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelText}</AlertDialogCancel>
					{actionText && onAction && (
						<AlertDialogAction onClick={onAction}>
							{actionText}
						</AlertDialogAction>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default NotificationDialog;
