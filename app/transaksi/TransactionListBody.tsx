import React from "react";
import { Order } from "@prisma/client";
import Icon from "../../components/Icon";

export default function TransactionListBody({ order, handleEditOrderId }: { order: Order, handleEditOrderId: any }) {
    return (
        <>
            <tr className="border-b-2 border-b-zinc-200 font-normal text-sm text-zinc-900 text-left cursor-pointer hover:bg-zinc-200 transition-colors duration-100 ease-linear" onClick={() => handleEditOrderId(order.id)}>
                <td className="!p-0">
                    <div className="ml-10 text-left py-4 font-semibold">
                        <input type="checkbox" value="" className="" />
                    </div>
                </td>
                <td className="!p-0">
                    <div className="ml-5 py-5">
                        {order.id}
                    </div>
                </td>
                <td className="!p-0">
                    <div className={"ml-5 py-5 " + (!order.customer && "text-zinc-400")}>
                        {order.customer ? order.customer.name : "N/A"}
                    </div>
                </td>
                <td className="!p-0">
                    <div className="ml-5 py-5">
                        {order.employee.name}
                    </div>
                </td>
                <td className="!p-0">
                    <div className="ml-5 py-5">
                        {Intl.NumberFormat('id').format(order.orderTotal - order.discount + order.rounding)}
                    </div>
                </td>
                <td className="!p-0">
                    <div className="ml-5 h-full flex flex-col">
                        <div>
                            {order.orderedDate.toString().split(", ")[0]}
                        </div>
                        <div className="text-zinc-400">
                            {order.orderedDate.toString().split(", ")[1]}
                        </div>
                    </div>
                </td>
                <td className="!p-0">
                    <div className="ml-5 h-full flex flex-col">
                        <div>
                            {order.requiredDate.toString().split(", ")[0]}
                        </div>
                        <div className="text-zinc-400">
                            {order.requiredDate.toString().split(", ")[1]}
                        </div>
                    </div>
                </td>
                <td className="!p-0">
                    <div className="ml-5 py-5">
                        {order.paid}
                    </div>
                </td>
                <td className="!p-0">
                    <div className="mr-10 py-5 justify-end flex">
                        <span><Icon name="arrowRight" prop="h-4" /></span>
                    </div>
                </td>
            </tr>
        </>
    )
}