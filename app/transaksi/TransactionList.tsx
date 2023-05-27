"use client";
import React, { useState, useEffect } from "react";
import TransactionListHeader from "./TransactionListHeader";
import TransactionListBody from "./TransactionListBody";
import { Order } from "@prisma/client";
import { getOrders } from "@/lib/order";
import { sortBy } from "@/lib/utils";

export default function TransactionList({ refresh, handleRefresh, handleEditOrderId }: { refresh: boolean, handleRefresh: any, handleEditOrderId: any }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortDetail, setSortDetail] = useState({column:"", desc:false});

    useEffect(() => {
        if (!refresh) {
            return;
        }

        setLoading(true);
        (async () => {
            const data = await getOrders();
            setLoading(false);
            setOrders(data);
            setSortDetail({
                column: "id",
                desc: false
            });
            handleRefresh(false);
        })();
    }, [refresh]);

    const handleHeaderClick = (column: string) => {
        if (sortDetail.column === column) {
            setSortDetail((prev) => ({
                ...prev,
                desc: !prev.desc
            }));
        }
        else {
            setSortDetail({
                column: column,
                desc: true
            });
        }
    }

    useEffect(() => {
        setOrders(orders.sort((a, b) => sortBy(a, b, sortDetail.column, sortDetail.desc)));
    }, [sortDetail]);

    return (
        <>
            <table className="w-full">
                <tbody>
                    <TransactionListHeader sortColumn={sortDetail.column} sortDesc={sortDetail.desc} handleClick={handleHeaderClick} />
                    {
                        !loading && orders.map(order => (
                            <TransactionListBody order={order} handleEditOrderId={handleEditOrderId} />
                        ))
                    }
                </tbody>
            </table>

        </>
    )
}