"use client";
import React, { useState } from "react";
import Icon from "./Icon";

export default function Picker({ columnName, data, loading, handlePickerClick, handleEditOrder, required=false,  }: { columnName: string, data: any, loading: boolean, handlePickerClick: any, handleEditOrder: any, required: boolean }) {
    const [pickedData, setPickedData] = useState<any>({});

    const handleRadio = (dataObject: any) => {
        setPickedData(dataObject);
    }

    return (
        <div className="fixed top-0  bottom-0 left-0 right-0 flex items-center bg-zinc-400 bg-opacity-80">
            <div className="my-auto mx-auto flex flex-col w-full md:w-[600px] lg:w-[800px] h-screen md:h-[600px] bg-white rounded-md">
                <div className="flex flex-row text-lg pt-10 pb-2 px-8 font-normal">
                    <span className="mr-auto my-auto">Select&nbsp;<span className="font-medium">{columnName}</span>&nbsp;records</span>
                    <div className="ml-auto my-auto items-center flex">
                        <button type="button" className="rounded-full items-center py-2.5 px-3 text-zinc-900 hover:bg-zinc-200" onClick={() => handlePickerClick("")}>
                            <Icon name="xmark" viewbox="0 0 384 512" />
                        </button>
                    </div>
                </div>

                <div className="relative text-zinc-400 focus-within:text-zinc-900 py-3 px-8">
                    <span className="absolute left-8 inset-y-0 flex items-center pl-5 pointer-events-none transition-colors duration-300 ease-linear"><Icon name="search" /></span>
                    <input type="text" className="w-full rounded-full bg-zinc-200 text-sm font-medium py-3 pl-12 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-300 focus:outline-none transition-colors duration-300 ease-linear" placeholder="Search">
                    </input>
                </div>

                <div className="flex flex-col text-zinc-900 py-3 px-8">
                    {
                        !loading && data.map((data:any) => (
                            <div className="flex border h-12 border-zinc-200 px-3.5 py-1.5 w-full text-sm">
                                <div className="flex h-full w-[4%] border-r-2 border-r-zinc-200">
                                    <input type="radio" name={columnName} className="my-auto" onClick={() => handleRadio(data)} checked={(Object.keys(pickedData).length === 0 ? false : pickedData.id === data.id)} />
                                </div>
                                <div className="flex h-full w-[6%] border-r-2 border-r-zinc-200 px-1.5">
                                    <span className="my-auto">{data.id}</span>
                                </div>
                                <div className="flex h-full w-[70%] border-r-2 border-r-zinc-200 px-1.5 overflow-x-auto">
                                    <span className="my-auto">{data.name}</span>
                                </div>
                                <div className="flex h-full w-[20%] px-1.5">
                                    <span className="my-auto">{data.phone ? data.phone : "N/A"}</span>
                                </div>
                            </div>
                        ))
                    }
                    {
                        loading && (
                            <div className="flex border h-12 border-zinc-200 px-3.5 py-1.5 w-full">
                                <Icon name="refresh" prop="h-4 animate-spin my-auto mx-auto text-zinc-500" />
                            </div>
                        )
                    }
                </div>

                <div className="flex flex-row mt-auto px-8 py-5 border-t-2 border-t-zinc-200 justify-end">
                    {
                        !required && <button type="button" className="my-auto rounded-sm mr-5 bg-white text-zinc-900 font-medium px-5 py-2.5 hover:bg-zinc-200" onClick={() => {
                            handleRadio({});
                        }}>
                            Clear selection
                        </button>
                    }   
                    <button type="button" className={"my-auto rounded-sm bg-zinc-900 text-white font-medium px-5 py-2.5 hover:bg-zinc-600 " + (required && Object.keys(pickedData).length == 0 && "!bg-zinc-200 !text-zinc-400 pointer-events-none")} onClick={() => {
                        handleEditOrder(columnName, pickedData);
                        handlePickerClick("");
                    }} disabled={required && Object.keys(pickedData).length == 0}>
                        Set selection
                    </button>
                </div>
            </div>
        </div>
    )   
}