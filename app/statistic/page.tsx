"use client"

import React, { useState, useEffect } from "react"

import { RefreshCw, Download } from "lucide-react"

import { addDays } from "date-fns"

import { StatisticHeaderDef, StatisticHeaders, StatisticFns } from "./headers"
import { columnsRevenueIncome } from "./columns"
import { orderProductsSummary } from "@/lib/product"
import { ExpensesList, PaymentsInList } from './columns'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/datePickerWithRange"
import { DataTable } from "@/components/ui/dataTable"
import { DateRange } from "react-day-picker"
import { ResponsiveLineChart } from "@/components/ui/responsiveLineChart"
import { Skeleton } from "@/components/ui/skeleton"
import { getProductOrderSummaryByDateRange } from "@/lib/product"

type graphDataDef = {
    [key: number]: {
        date: string
        [key: string]: string | number
    }[]
}

export default function Transaction() {
    const [refresh, setRefresh] = useState(true)
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
    })

    const [selectedHeader, setSelectedHeader] = useState<StatisticHeaderDef>(StatisticHeaders[0])

    const [headerData, setHeaderData] = useState<number[]>([])
    const [graphData, setGraphData] = useState<graphDataDef>({})
    const [tableData, setTabledata] = useState<orderProductsSummary[] | ExpensesList[] | PaymentsInList[]>([])

    useEffect(() => {
        if (!refresh) {
            return
        }

        setHeaderData([])
        setGraphData({})
        setTabledata([])

        const updatePage = async () => {
            const headerContent: number[] = []
            for (let header of StatisticHeaders) {
                if (date !== undefined && date.from !== undefined && date.to !== undefined) {
                    const headerValue = await header.call(date.from, date.to)
                    headerContent.push(headerValue)
                }
            }

            const graphContent: graphDataDef = {}
            for (let fn of StatisticFns) {
                if (date !== undefined && date.from !== undefined && date.to !== undefined) {
                    graphContent[fn.index] = await fn.call(date.from, date.to)
                }
            }

            // const tmp = await getProductStatisticByDate(date.from, date.to)
            let tableValue: (orderProductsSummary[] | ExpensesList[] | PaymentsInList[]) = []
            if (date !== undefined && date.from !== undefined && date.to !== undefined) {
                tableValue = await getProductOrderSummaryByDateRange(date.from, date.to)
            }

            setHeaderData(headerContent)
            setGraphData(graphContent)
            setTabledata(tableValue)
            setRefresh(false)
        }
        updatePage()

    }, [refresh])

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
                {StatisticHeaders.map((header, i) => (
                    <Card
                    className={"w-48 h-28 " + (header.name === selectedHeader.name ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground")}
                    onClick={() => setSelectedHeader(header)}
                    >
                        <CardHeader>
                            <CardTitle className="flex flex-row">
                                <span>{header.name}</span>
                                <span className="ml-auto">{header.icon}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {i < headerData.length ? <p>{headerData[i] ?? "0"}</p> : <Skeleton className="w-full h-[20px] rounded-full" />}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="mt-5">
                <Card>
                    <CardContent className="py-10">
                        <ResponsiveLineChart data={graphData[selectedHeader.graphIndex]} value={selectedHeader.accessorKey} />
                    </CardContent>
                </Card>
            </div>
            <div className="mt-10">
                <DataTable columns={columnsRevenueIncome} data={tableData} />
            </div>
        </div>
    )
}