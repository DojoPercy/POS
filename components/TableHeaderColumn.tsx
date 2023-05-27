import Icon from "./Icon"

export default function TableHeaderColumn({ name, sortBy, handleClick, iconName }: { name: string, sortBy: number, handleClick: any, iconName: string }) {
    return (
        <>
            <th className="!p-0">
                <div className="flex flex-row py-4 font-semibold rounded-t-md cursor-pointer hover:bg-zinc-200 group transition-colors duration-100 ease-linear" onClick={() => handleClick(name)}>
                    <span className={"my-auto ml-5 mr-1.5" + (iconName === "key" ? " rotate-[225deg]" : "")}><Icon name={iconName} /></span>
                    <span className="my-auto">{name}</span>
                    <span className={"ml-auto my-auto mr-5 group-hover:opacity-100 transition-all duration-100 ease-linear text-zinc-400 " + (sortBy === 0 ? "opacity-0" : "opacity-100")}>{sortBy < 2 ? <Icon name="down" /> : <Icon name="up" />}</span>
                </div>
            </th>
        </>
    )
}