import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function ChildFigureCard({
    title,
    figure
}: {
    title: string,
    figure: number,
}) {
    return (
        <div className="flex items-center justify-between">
            <p>{title}</p>
            <p className="text-lg font-bold">{figure}</p>
        </div>
    )
}

function FigureCard({
    title,
    description,
    figure,
    children
}: {
    title: string,
    description: string,
    figure: number,
    children?: React.ReactNode,
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{title}</CardTitle>
                    <p className="text-lg font-bold">{figure}</p>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}

export { ChildFigureCard, FigureCard };