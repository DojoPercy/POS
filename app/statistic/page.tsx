"use client";
import React, { useState, useEffect } from "react";
import { generateEmptyStatisticsByDate, getProductStatisticByDate, getStatisticsByDate } from "@/lib/statistics";

import { RefreshCw, Download } from "lucide-react";

import { addDays } from "date-fns"

import { StatisticHeader } from "./headers";
import { columnsRevenueIncome } from "./columns";
import { RevenueIncomeList, ExpensesList, PaymentsInList } from './columns'

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/datePickerWithRange";
import { DataTable } from "@/components/ui/dataTable";
import { DateRange } from "react-day-picker";
import { ResponsiveLineChart } from "@/components/ui/responsiveLineChart";
import { Skeleton } from "@/components/ui/skeleton";

export default function Transaction() {
    const [refresh, setRefresh] = useState(true)
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
    })

    const [headerData, setHeaderData] = useState<number[]>([])
    const [graphData, setGraphData] = useState([])
    const [tableData, setTabledata] = useState<RevenueIncomeList[] | ExpensesList[] | PaymentsInList[]>([])
    const [detailedData, setDetailedData] = useState([])
    const [value, setValue] = useState("revenue")

    useEffect(() => {
        if (!refresh) {
            return;
        }

        setHeaderData([]);
        setGraphData(generateEmptyStatisticsByDate(date.from, date.to));
        setTabledata([]);
        (async () => {
            const headerContent = []
            for (let header of StatisticHeader) {
                const headerValue = await header.fn(date.from, date.to)
                headerContent.push(headerValue)
            }


            const data = await getStatisticsByDate(date.from, date.to);
            const tmp = await getProductStatisticByDate(date.from, date.to);

            setHeaderData(headerContent)
            setGraphData(data);
            setTabledata(tmp);
            setRefresh(false);
        })()
    }, [refresh]);

    useEffect(() => {
        setRefresh(true)
    }, [date])

    return (
        <div className="py-6 px-10">
            <div className="flex flex-row">
                <div className="mr-auto flex">
                    <h1 className="mr-auto font-bold text-2xl flex items-center">
                        Statistics
                    </h1>
                    <div className="ml-5 my-auto h-4 w-4 items-center flex">
                        <Button variant="ghost" className={"rounded-full p-3 items-center " + (refresh ? "animate-spin": "")} onClick={() => setRefresh(true)}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="ml-auto flex justify-end gap-5">
                    <DatePickerWithRange setParentDate={setDate} />
                    <Button className="my-auto">
                        <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                </div>
            </div>

            <div className="mt-10 pb-2.5 flex flex-row w-full gap-5 overflow-auto">
                {StatisticHeader.map((header, i) => (
                    <Card className="w-48 h-28 hover:bg-accent hover:text-accent-foreground">
                        <CardHeader>
                            <CardTitle className="flex flex-row">
                                <span>{header.name}</span>
                                <span className="ml-auto">{header.icon}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{i < headerData.length ? headerData[i] ?? "0" : <Skeleton className="w-full h-[20px] rounded-full" />}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="mt-5">
                <Card>
                    <CardContent className="py-10">
                        <ResponsiveLineChart data={graphData} value={value} />
                    </CardContent>
                </Card>
            </div>
            <div className="mt-10">
                <DataTable columns={columnsRevenueIncome} data={tableData} />
            </div>
        </div>
    )
}