"use client";
import React, { useState, useEffect } from "react";
import { Order } from "@prisma/client";
import { getCustomers } from "@/lib/customer";
import { getEmployees } from "@/lib/employee";
import { updateOrderById } from "@/lib/order";
import Icon from "@/components/Icon";
import Picker from "@/components/Picker";
import SidebarFieldPicker from "@/components/SidebarFieldPicker";
import SidebarFieldOrderLine from "@/components/SidebarFieldOrderLine";
import SideBarFieldPayment from "@/components/SideBarFieldPayment";
import CancelPopup from "@/components/CancelPopup";
import SidebarField from "@/components/SidebarField";

export default function TransactionEdit({ order, loading, handleEditOrderId }: { order:Order, loading: boolean, handleEditOrderId: any }) {
    const [editOrder, setEditOrder] = useState({});
    const [cancelConfirmation, setCancelConfirmation] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);

    const [pickerColumn, setPickerColumn] = useState("");
    const [pickerLoading, setPickerLoading] = useState(true);
    const [pickerData, setPickerData] = useState();
    const [pickerRequired, setPickerRequired] = useState(false);

    const handlePickerClick = (columnName: string, required: boolean) => {
        setPickerColumn(columnName);
        setPickerRequired(required);
    }

    const handleEditOrder = (columnName: string, value: any) => {
        if (Object.keys(value).length === 0) {
            return setEditOrder((prevState) => ({
                ...prevState,
                [columnName]: null,
                [`${columnName}Id`]: null
            }));
        }

        setEditOrder((prevState) => ({
            ...prevState,
            [`${columnName}Id`]: value.id,
            [columnName]: {
                ...prevState.columnName,
                ["name"]: value.name
            }
        }));
    }

    const handleCancel = () => {
        if (loading || !editOrder || editOrder === order) {
            return handleEditOrderId("");
        }
        setCancelConfirmation(true);
    }

    const handleSave = () => {
        if (updateLoading) {
            return;
        }
        setUpdateLoading(true);
        updateData();
    }

    const updateData = async () => {
        await updateOrderById(editOrder);
        setUpdateLoading(false);
        handleEditOrderId("", true);
    }

    useEffect(() => {
        if (loading) {
            setEditOrder({})
            return;
        }
        setEditOrder(order);
    }, [loading])

    useEffect(() => {
        if (pickerColumn === "") {
            return;
        }

        setPickerLoading(true);
        (async () => {
            let data;
            if (pickerColumn === "customer") {
                data = await getCustomers();
            }
            else if (pickerColumn === "employee") {
                data = await getEmployees();
            }
            setPickerLoading(false);
            setPickerData(data);
        })();
    }, [pickerColumn]);

    return (
        <div className="fixed top-0 right-0 bottom-0 left-0 items-center bg-zinc-200 bg-opacity-60">
            <button type="button" className="fixed top-0 right-0 md:mr-[600px] mt-5 bg-zinc-400 rounded-l-full text-white py-2 px-3 cursor-pointer hover:bg-zinc-600 transition-all duration-100 ease-linear" onClick={() => handleCancel()} disabled={updateLoading}>
                <Icon name="xmark" prop="h-5" />
            </button>
            <div className="fixed top-0 right-0 bottom-0 bg-white w-full md:w-[600px] h-screen anim">
                <div className="flex w-full h-[8%] py-6 bg-zinc-100 px-8 font-normal text-lg text-zinc-900">
                    Edit<span className="font-medium">&nbsp;transaction&nbsp;</span>record
                </div>
                <div className="w-full bg-white px-8 py-8 text-sm h-[84%] overflow-auto">
                    <SidebarField data={editOrder} label="id" iconName="key" iconProp="h-3 rotate-[225deg]" loading={loading} disabled={true} />
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 mt-8 gap-8">
                        <SidebarFieldPicker data={editOrder} label="customer" iconName="user" iconProp="h-3" required={false} loading={loading} handlePickerClick={handlePickerClick} />
                        <SidebarFieldPicker data={editOrder} label="employee" iconName="user" iconProp="h-3" required={true} loading={loading} handlePickerClick={handlePickerClick} />
                    </div>
                    <SidebarFieldOrderLine data={editOrder} label="order line" columnName="orderLine" iconName="list" iconProp="h-3" loading={loading} />
                    <div className="mt-8 w-full rounded-sm bg-zinc-200 text-zinc-500 px-3.5 py-2 h-14 cursor-default">
                        <div className="flex flex-row mb-0.5">
                            <span className="my-auto mr-1.5"><Icon name="calendar" prop="h-3" /></span>
                            <span className="my-auto font-semibold">required</span>
                        </div>
                        <span className="text-zinc-900">{(!loading && Object.keys(editOrder).length !== 0) && editOrder.requiredDate.toString()}</span>
                        {/* <DatePicker locale="id" selected={new Date()} className="bg-transparent outline-none text-zinc-900" /> */}
                    </div>
                    <SideBarFieldPayment data={editOrder} label="payment" iconName="moneybill" iconProp="h-3" iconViewbox="0 0 576 512" loading={loading} />
                </div>

                <div className="flex flex-row h-[8%] px-8 py-4 border-t-2 border-t-zinc-200 justify-end text-sm">
                    <button type="button" className="my-auto mr-5 rounded-sm text-zinc-900 font-medium px-5 py-2.5 hover:bg-zinc-200" onClick={handleCancel} disabled={updateLoading}>Cancel</button>
                    <button type="button" className={"my-auto rounded-sm font-medium px-5 py-2.5 w-1/4 h-full bg-zinc-200 text-zinc-400 hover:!bg-zinc-600 transition-colors duration-200 ease-linear " + (!loading && Object.keys(editOrder).length !== 0 ? (editOrder === order ? "pointer-events-none" : "!bg-zinc-900 !text-white") : "")} onClick={() => {handleSave()}}>
                        <span className="mx-auto my-auto">{updateLoading ? <Icon name="refresh" prop="h-4 animate-spin mx-auto my-auto" /> : "Save changes"}</span>
                    </button>
                </div>

                {pickerColumn !== "" &&
                    <Picker columnName={pickerColumn} data={pickerData} loading={pickerLoading} handlePickerClick={handlePickerClick} handleEditOrder={handleEditOrder} required={pickerRequired} />
                }

                {cancelConfirmation &&
                    <CancelPopup text="You have unsaved changes. Do you really want to close the panel?" noCancel={() => setCancelConfirmation(false)} yesCancel={() => handleEditOrderId("")} />
                }
            </div>
        </div>
    )
}