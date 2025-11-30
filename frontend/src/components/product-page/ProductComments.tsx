import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";

function CreateComment() {
    return (<div className="flex w-full max-w-xl gap-2">
        <Textarea placeholder="Type your message here." className="min-h-0"/>
        <Button>Send</Button>
    </div>)
}



function ProductComments() {
    return <div>
        <CreateComment />
    </div>
}

export default ProductComments;