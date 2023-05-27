"use client";
import React, { useState } from "react";
import TableHeaderColumn from "@/components/TableHeaderColumn";

const columns = ["id", "customer", "employee", "total", "ordered", "required", "paid"];
const columnIcons = ["key", "user", "user", "hashtag", "calendar", "calendar", "check"];
const columnIds = ["id", "customer.name", "employee.name", "orderTotal", "orderedDate", "requiredDate", "paid"];

export default function TransactionListHeader({ sortColumn, sortDesc, handleClick }: { sortColumn: string, sortDesc: boolean, handleClick: any }) {
    return (
        <>
            <tr className="border-b-2 border-b-zinc-200 text-zinc-500">
                <th className="!p-0">
                    <div className="ml-10 text-left py-4 font-semibold">
                        <input type="checkbox" value="" className="" />
                    </div>
                </th>
                {
                    columns.map((name, i) => (
                        <TableHeaderColumn
                            name={name}
                            sortBy={sortColumn === columnIds[i] ? (sortDesc ? 1 : 2) : 0}
                            handleClick={() => handleClick(columnIds[i])}
                            iconName={columnIcons[i]}
                        />
                    ))
                }
                <th className="!p-0">
                    <div className="mr-10 text-right py-4 font-semibold">
                        ...
                    </div>
                </th>
            </tr>
        </>
    )
}