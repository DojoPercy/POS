"use client";
import React, { useState, useEffect } from "react";
import { RefreshCw, Download, Plus } from "lucide-react";

import { getOrders } from "@/lib/order";
import { getOrderById } from "@/lib/order";

import { TransactionList, columns } from "@/app/transaction/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import { DatePickerWithRange } from "@/components/ui/datePickerWithRange";

export default function Transaction() {
    const [refresh, setRefresh] = useState(true);
    const [data, setData] = useState<TransactionList[]>([]);
    const [editOrderId, setEditOrderId] = useState("");
    const [editOrder, setEditOrder] = useState();
    const [editLoading, setEditLoading] = useState(true);

    const handleEditOrderId = (orderId: string, refreshList=false) => {
        setEditOrderId(orderId);
        setRefresh(refreshList);
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

    useEffect(() => {
        if (!refresh) {
            return;
        }

        setData([]);
        (async () => {
            const data = await getOrders();
            setData(data);
            setRefresh(false);
        })();
    }, [refresh]);

    return (
        <div className="py-6 px-10">
            <div className="flex flex-row">
                <div className="mr-auto flex">
                    <h1 className="mr-auto font-bold text-2xl flex items-center">
                        Transactions
                    </h1>
                    <div className="ml-5 my-auto h-4 w-4 items-center flex">
                        <Button variant="ghost" className={"rounded-full p-3 items-center " + (refresh ? "animate-spin": "")} onClick={() => setRefresh(true)}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="ml-auto flex justify-end gap-5">
                    <DatePickerWithRange />
                    <Button variant="outline" className="my-auto">
                        <Plus className="w-4 h-4 mr-2" /> New transaction
                    </Button>
                    <Button className="my-auto">
                        <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                </div>
            </div>
            <div className="mx-auto mt-10">
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}

/*

            <div className="mt-8">
                <TransactionList refresh={refresh} handleRefresh={handleRefresh} handleEditOrderId={handleEditOrderId} />
            </div>
            <div className="mt-8 w-full text-right px-10 text-zinc-300">
                TODO: Split into different pages
            </div>

            {
                editOrderId && <TransactionEdit order={editOrder} loading={editLoading} handleEditOrderId={handleEditOrderId} />
            }

            */