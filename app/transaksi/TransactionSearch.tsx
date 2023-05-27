"use client";
import Icon from "../../components/Icon";

export default function TransactionSearch() {

    return (
        <div className="relative text-zinc-400 focus-within:text-zinc-900">
            <span className="absolute left-0 inset-y-0 flex items-center pl-5 pointer-events-none transition-colors duration-300 ease-linear"><Icon name="search" /></span>
            <input type="text" className="w-full rounded-full bg-zinc-200 text-sm font-medium py-3 pl-12 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-300 focus:outline-none transition-colors duration-300 ease-linear" placeholder="Search">
            </input>
        </div>
    )
}