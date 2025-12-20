import { useFetchLiveStats } from "@/hooks/dashboard-hooks";
import { FigureCard } from "../reports/FigureCard";


function LiveStats() {
    const {data} = useFetchLiveStats();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <FigureCard
                title="Active Product Connections"
                description="Active product connections"
                figure={data?.activeProductConnections || 0}
            />
            <FigureCard
                title="Products Watched"
                description="Products watched"
                figure={data?.productsWatched || 0}
            />
            <FigureCard
                title="Active User Connections"
                description="Active user connections"
                figure={data?.activeUserConnections || 0}
            />
            <FigureCard
                title="Users Watching"
                description="Users watching"
                figure={data?.usersWatching || 0}
            />
        </div>
    );
}

export default LiveStats;