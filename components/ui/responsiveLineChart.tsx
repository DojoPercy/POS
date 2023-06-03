import {
    ResponsiveContainer,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Line
} from "recharts"

export function ResponsiveLineChart({ data, value }: { data: any, value: string }) {
    return (
        <div className="flex w-full font-semibold text-xs">
            <ResponsiveContainer width='100%' height={400}>
                <LineChart data={data}>
                <XAxis dataKey="date" stroke="#888888"
          fontSize={12}
          tickLine={false}/>
                <YAxis fontSize={12}
          tickLine={false}/>
                <Tooltip />
                <Line type="monotone" dataKey={value} key={value} stroke="#18181b" strokeWidth={2} />
                </LineChart>    
            </ResponsiveContainer>
        </div>
    )
}