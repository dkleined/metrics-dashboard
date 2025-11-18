interface ProgressBarProps {
    label: string;
    value: number | string;
    percentage: number;
    colorFrom: string;
    colorTo: string;
    valueColor?: string;
}

export default function ProgressBar({ 
    label, 
    value, 
    percentage, 
    colorFrom, 
    colorTo,
    valueColor = "text-blue-400"
}: ProgressBarProps) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 font-medium truncate flex-1">{label}</span>
                <span className={`${valueColor} font-bold ml-2`}>{value}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                    className={`bg-gradient-to-r ${colorFrom} ${colorTo} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
