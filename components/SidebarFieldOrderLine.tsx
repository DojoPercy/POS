import Icon from "./Icon"

export default function SidebarFieldOrderLine({ data, label, columnName, iconName, iconProp, iconViewbox="0 0 512 512", loading }: { data: any, label: string, columnName?: string, iconName: string, iconProp: string, iconViewbox?: string, loading: boolean }) {
    return (
        <div className="mt-8 w-full rounded-sm bg-zinc-200 text-zinc-500 py-2 pointer-events-none">
            <div className="flex flex-row mb-0.5 w-full border-b-2 border-b-zinc-300 px-3.5 pb-2">
                <span className="my-auto mr-1.5"><Icon name={iconName} prop={iconProp} viewbox={iconViewbox} /></span>
                <span className="my-auto font-semibold">{label}</span>
            </div>
            {
                (!loading && Object.keys(data).length !== 0) && data[columnName ? columnName : label].map((row: any, i: number) => (
                    <div className="flex px-3.5 py-1.5 min-h-[32px] text-zinc-900 border-b-2 border-b-zinc-300 w-full" key={i}>
                        <div className="mr-auto my-auto justify-start flex w-1/2">
                            {row.product.name}
                        </div>
                        <div className="ml-auto my-auto justify-end flex w-1/2">
                            <span className="my-auto text-right pr-2">{row.quantity}</span>
                            <span className="my-auto w-1/3 text-right border-l-2 border-l-zinc-300 pr-2">{Intl.NumberFormat('id').format(row.sellUnitPrice)}</span>
                            <span className="my-auto w-2/5 text-right border-l-2 border-l-zinc-300">{Intl.NumberFormat('id').format(row.sellUnitPrice * row.quantity)}</span>
                        </div>
                    </div>       
                ))
            }
            <div className="flex flex-col w-full h-24 px-3.5">
                <div className="flex w-full h-8">
                    <span className="mr-auto my-auto">
                        Discount:
                    </span>
                    <span className="ml-auto my-auto">
                        {(!loading && Object.keys(data).length !== 0) ? (data.discount ? Intl.NumberFormat('id').format(-1*data.discount) : "0") : "0"}
                    </span>
                </div>
                <div className="flex w-full h-8">
                    <span className="mr-auto my-auto">
                        Rounding:
                    </span>
                    <span className="ml-auto my-auto">
                        {(!loading && Object.keys(data).length !== 0) ? (data.rounding ? Intl.NumberFormat('id').format(data.rounding) : "0") : "0"}
                    </span>
                </div>
                <div className="flex w-full h-8">
                    <span className="mr-auto my-auto">
                        Total:
                    </span>
                    <span className="ml-auto my-auto">
                        {(!loading && Object.keys(data).length !== 0) ? Intl.NumberFormat('id').format(data.orderTotal - (data.discount ? data.discount : 0) + (data.rounding ? data.rounding : 0)) : "0"}
                    </span>
                </div>
            </div>
        </div>
    )
}