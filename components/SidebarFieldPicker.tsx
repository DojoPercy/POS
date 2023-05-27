import Icon from "./Icon"

export default function SidebarFieldPicker({ data, label, columnName, iconName, iconProp, iconViewbox="0 0 512 512", required, loading, handlePickerClick } : { data: any, label: string, columnName?:string, iconName: string, iconProp: string, iconViewbox?: string, required: boolean, loading: boolean, handlePickerClick: any }) {
    return (
        <div className="rounded-sm bg-zinc-200 text-zinc-500 py-2 h-28 focus-within:!text-zinc-900 pointer-events-none">
            <div className="flex flex-row mb-0.5 w-full border-b-2 border-b-zinc-300 px-3.5 pb-2">
                <span className="my-auto mr-1.5"><Icon name={iconName} prop={iconProp} viewbox={iconViewbox}/></span>
                <span className="my-auto font-semibold">{label}</span>
                {required && <span className="ml-1 mt-0.5 !text-red-500"><Icon name="asterisk" prop="h-1.5" /></span>}
            </div>
            <div className={"flex px-3.5 h-8 overflow-auto pointer-events-auto " + ((!loading && Object.keys(data).length !== 0) && data[columnName ? columnName : label] ? "text-zinc-900" : "!text-zinc-500")}>
                <span className="my-auto py-1.5">{(!loading && Object.keys(data).length !== 0) ? (data[columnName ? columnName : label] ? data[columnName ? columnName : label].name : "N/A") : ""}</span>
            </div>
            <div className="mt-1.5 border-t-2 border-t-zinc-300 flex w-full h-8">
                <button type="button" className="flex my-auto mx-auto w-[95%] h-[90%] rounded-sm pointer-events-auto hover:bg-zinc-300 focus:bg-zinc-200 focus:!text-zinc-500" onClick={() => handlePickerClick(label, required)} disabled={loading || Object.keys(data).length === 0}>
                    <span className="my-auto mx-auto">Open picker</span>
                </button>
            </div>
        </div>
    )
}