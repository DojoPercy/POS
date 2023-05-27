import Icon from "./Icon"

export default function SidebarField({ data, label, columnName, iconName, iconProp, iconViewbox="0 0 512 512", loading, handleChange, disabled }: { data: any, label: string, columnName?: string, iconName: string, iconProp: string, iconViewbox?: string, loading: boolean, handleChange?: any, disabled: boolean }) {
    return (
        <div className="w-full rounded-sm bg-zinc-200 text-zinc-500 px-3.5 py-2 h-14 cursor-default">
            <div className="flex flex-row mb-0.5">
                <span className="my-auto mr-1.5"><Icon name={iconName} prop={iconProp} /></span>
                <span className="my-auto font-semibold">{label}</span>
            </div>
            <input type="text" disabled={disabled} value={(!loading && Object.keys(data).length !== 0) ? data[columnName ? columnName : label] : ""} className="bg-zinc-200 outline-none" onChange={handleChange} />
            {/* {(!loading && Object.keys(editOrder).length !== 0) && editOrder.id} */}
        </div>
    )
}