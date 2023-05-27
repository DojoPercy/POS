"use client";
import React, { useState, useEffect } from "react";
import TransactionSearch from "./TransactionSearch";
import TransactionList from "./TransactionList";
import TransactionEdit from "./TransactionEdit";
import { getOrderById } from "@/lib/order";
import Icon from "../../components/Icon";

export default function Transaction() {
    const [refresh, setRefresh] = useState(true);
    const [editOrderId, setEditOrderId] = useState("");
    const [editOrder, setEditOrder] = useState();
    const [editLoading, setEditLoading] = useState(true);

    const handleRefresh= (val: boolean) => {
        setRefresh(val);
    }

    const handleEditOrderId = (orderId: string, refreshList=false) => {
        setEditOrderId(orderId);
        handleRefresh(refreshList);
    }

    useEffect(() => {
        if (editOrderId === "") {
            return;
        }

        setEditLoading(true);
        (async () => {
            const data = await getOrderById(editOrderId);
            setEditLoading(false);
            setEditOrder(data);
        })();
    }, [editOrderId]);

    return (
        <div className="pt-6">
            <div className="mx-10">
                <div className="flex flex-row">
                    <div className="mr-auto flex">
                        <h1 className="mr-auto font-normal text-2xl flex items-center">
                            Transactions
                        </h1>
                        <div className="ml-5 my-auto h-4 w-4 items-center flex">
                            <button type="button" className={"rounded-full items-center p-2.5 text-zinc-900 hover:bg-zinc-200 " + (refresh ? "animate-spin" : "")} onClick={() => handleRefresh(true)}>
                                <Icon name="refresh" />
                            </button>
                        </div>
                    </div>
                    <div className="ml-auto flex justify-end">
                        <button type="button" className="mr-5 bg-white text-zinc-900 border-zinc-900 border-2 py-3 px-6 font-bold rounded-md flex flex-row text-sm transition-color duration-300 ease-linear hover:bg-zinc-200">
                            <span className="mr-3 my-auto"><Icon name="down" /></span>
                            <span className="my-auto">Download transactions</span>
                        </button>
                        <button type="button" className="bg-zinc-900 text-white border-zinc-900 border-2 py-3 px-6 font-bold rounded-md flex flex-row text-sm transition-color duration-300 ease-linear hover:bg-zinc-600 hover:border-zinc-600">
                            <span className="mr-3 my-auto"><Icon name="add" /></span>
                            <span className="my-auto">New transaction</span>
                        </button>
                    </div>
                </div>
                <div className="mt-6">
                    <TransactionSearch />
                </div>
            </div>
            <div className="mt-8">
                <TransactionList refresh={refresh} handleRefresh={handleRefresh} handleEditOrderId={handleEditOrderId} />
            </div>
            <div className="mt-8 w-full text-right px-10 text-zinc-300">
                TODO: Split into different pages
            </div>

            {
                editOrderId && <TransactionEdit order={editOrder} loading={editLoading} handleEditOrderId={handleEditOrderId} />
            }
        </div>
    )
}