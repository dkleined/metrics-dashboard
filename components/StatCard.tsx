interface StatCardProps {
    title: string;
    value: number;
    emoji: string;
    colorFrom: string;
    colorTo: string;
    borderColor: string;
}

export default function StatCard({ title, value, emoji, colorFrom, colorTo, borderColor }: StatCardProps) {
    return (
        <div className={`bg-gradient-to-br ${colorFrom} ${colorTo} rounded-2xl p-6 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm font-bold uppercase">{title}</h3>
                <span className="text-3xl">{emoji}</span>
            </div>
            <p className="text-4xl font-black text-white">{value}</p>
            <p className="text-gray-400 text-sm mt-1">Today</p>
        </div>
    );
}
