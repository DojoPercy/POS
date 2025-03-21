"use client"

import React, { useState, useEffect } from "react"
import { RefreshCw, Download } from 'lucide-react'
import { addDays } from "date-fns"
import { StatisticHeaderDef, StatisticHeaders, StatisticFns } from "@/components/stats-header"
import { columnsRevenueIncome } from "@/components/columns-stats"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-time-picker"
import { DataTable } from "@/components/ui/data-table"
import { DateRange } from "react-day-picker"
import { ResponsiveLineChart } from "@/components/responsive-line-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { getOrderSummaryByDateRange } from "@/lib/order"
import { jwtDecode } from "jwt-decode"
import { useParams } from "next/navigation"
import { getBranchById } from "@/lib/branch"

type graphDataDef = {
    [key: number]: {
        date: string
        sales: number
        [key: string]: string | number
    }[]
}
interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  status: "active" | "inactive";
}
interface DecodedToken {
    role: string; 
    userId?: string; 
    branchId?: string;
    [key: string]: any;
  }

export default function Statistics() {
    const { branchId } = useParams();
    const [refresh, setRefresh] = useState(true)
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
    })

    const [selectedHeader, setSelectedHeader] = useState<StatisticHeaderDef>(StatisticHeaders[0])
    const [headerData, setHeaderData] = useState<number[]>([])
    const [graphData, setGraphData] = useState<graphDataDef>({})
    const [tableData, setTableData] = useState<any[]>([])
    const [branch, setBranch] = useState<Branch | null>(null)
    


    useEffect(() => {
        if (!refresh) {
            return
        }

        setHeaderData([])
        setGraphData({})
        setTableData([])

        const updatePage = async () => {
            const headerContent: number[] = []
            for (let header of StatisticHeaders) {
                if (date?.from && date?.to) {
                    const headerValue = await header.call(date.from, date.to, branchId.toString())
                    headerContent.push(headerValue)
                }
            }

            const graphContent: graphDataDef = {}
            for (let fn of StatisticFns) {
                if (date?.from && date?.to) {
                    graphContent[fn.index] = await fn.call(date.from, date.to, branchId.toString())
                }
            }

            let tableValue: any[] = []
            if (date?.from && date?.to) {
                tableValue = await getOrderSummaryByDateRange(date.from, date.to, branchId.toString() )
            }
            console.log(tableValue)

            setHeaderData(headerContent)
            setGraphData(graphContent)
            setTableData(tableValue)
            setRefresh(false)
        }
        updatePage()

    }, [refresh, date, branchId])

    useEffect(() => {
        setRefresh(true)
    }, [date])

    useEffect(() => {

        (async () => {
          const branch: Branch = await getBranchById(branchId.toString())
          setBranch(branch)
        })();
               
    }, [branchId])

    return (
        <div className="py-6 px-10">
            <div className="flex flex-row">
                <div className="mr-auto flex">
                    <h1 className="mr-auto font-bold text-2xl flex items-center">
                        {branch?.name } Restaurant Statistics
                    </h1>
                    <div className="ml-5 my-auto h-4 w-4 items-center flex">
                        <Button variant="ghost" className={`rounded-full p-3 items-center ${refresh ? "animate-spin" : ""}`} onClick={() => setRefresh(true)}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="ml-auto flex justify-end gap-5">
                    <DatePickerWithRange date={date} setDate={setDate} />
                    <Button className="my-auto">
                        <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                </div>
            </div>

            <div className="mt-10 pb-2.5 flex flex-row w-full gap-5 overflow-auto">
                {StatisticHeaders.map((header, i) => (
                    <Card
                        key={i}
                        className={`w-48 h-28 ${header.name === selectedHeader.name ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}
                        onClick={() => setSelectedHeader(header)}
                    >
                        <CardHeader>
                            <CardTitle className="flex flex-row">
                                <span>{header.name}</span>
                                <span className="ml-auto">{header.icon}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {i < headerData.length ? (
                                <p>{headerData[i]?.toString() || "0"}</p>
                            ) : (
                                <Skeleton className="w-full h-[20px] rounded-full" />
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-5">
                <Card>
                    <CardContent className="py-10">
                        <ResponsiveLineChart
                            data={Array.isArray(graphData[selectedHeader.graphIndex]) ? graphData[selectedHeader.graphIndex] : []}
                            value={selectedHeader.accessorKey}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="mt-10">
                <DataTable
                    columns={columnsRevenueIncome}
                    data={Array.isArray(tableData) ? tableData : []}
                />
            </div>
        </div>
    )
}
