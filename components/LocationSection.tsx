import ProgressBar from './ProgressBar';

interface LocationSectionProps {
    title: string;
    emoji: string;
    data: Array<{ country?: string; city?: string; region?: string; visitors: number }>;
    colorFrom: string;
    colorTo: string;
    emptyMessage: string;
}

export default function LocationSection({ 
    title, 
    emoji, 
    data, 
    colorFrom, 
    colorTo, 
    emptyMessage 
}: LocationSectionProps) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-2xl font-black text-white mb-4">{emoji} {title}</h2>
                <p className="text-gray-400 text-center py-8">{emptyMessage}</p>
            </div>
        );
    }

    const maxVisitors = data[0]?.visitors || 1;

    return (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-black text-white mb-4">{emoji} {title}</h2>
            <div className="space-y-3">
                {data.slice(0, 10).map((item: any, index: number) => {
                    const percentage = (item.visitors / maxVisitors) * 100;
                    const label = item.city 
                        ? `${item.city}, ${item.region}, ${item.country}`
                        : item.country;
                    
                    return (
                        <ProgressBar
                            key={index}
                            label={label}
                            value={`${item.visitors} visitors`}
                            percentage={percentage}
                            colorFrom={colorFrom}
                            colorTo={colorTo}
                            valueColor={colorFrom}
                        />
                    );
                })}
            </div>
        </div>
    );
}
