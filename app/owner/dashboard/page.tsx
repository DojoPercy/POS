"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Download } from "lucide-react";
import { addDays } from "date-fns";
import { jwtDecode } from "jwt-decode";
import {
  type StatisticHeaderDef,
  StatisticHeaders,
  StatisticFns,
  StatisticFnsP,
  StatisticFnsE,
} from "@/components/stats-header";
import {
  columnsExpenses,
  columnsPayment,
  columnsRevenueIncome,
} from "@/components/columns-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-time-picker";
import { DataTable } from "@/components/ui/data-table";
import type { DateRange } from "react-day-picker";
import { ResponsiveLineChart } from "@/components/responsive-line-chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getOrderSummaryByDateRange,
  getOrderSummaryByDateRangeOwner,
} from "@/lib/order";
import { CompanySwitcher } from "../../../components/company_switcher";
import Image from "next/image";
import { paymentService } from "../../../lib/payment";
import { getExpensesSummaryByDateRangeOwner } from "@/lib/expense";

type graphDataDef = {
  [key: number]: {
    date: string;
    sales: number;
    [key: string]: string | number;
  }[];
};

type Company = {
  id: string;
  name: string;
  logo?: string;
};

interface DecodedToken {
  companyId: string;
  [key: string]: any;
}

export default function Statistics() {
  const [refresh, setRefresh] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const [selectedHeader, setSelectedHeader] = useState<StatisticHeaderDef>(
    StatisticHeaders[0]
  );
  const [headerData, setHeaderData] = useState<number[]>([]);
  const [graphData, setGraphData] = useState<graphDataDef>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [paymentTableData, setPaymentTableData] = useState<any[]>([]);
  const [expensesTableData, setExpensesTableData] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/company");
        const data = await response.json();
        setCompanies(data);

        const token = localStorage.getItem("token");
        if (token) {
          const decodedToken: DecodedToken = jwtDecode(token);
          const initialCompany = data.find(
            (company: Company) => company.id === decodedToken.companyId
          );
          if (initialCompany) {
            setSelectedCompany(initialCompany);
          }
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!refresh) return;

    setHeaderData([]);
    setGraphData({});
    setTableData([]);
    setPaymentTableData([]);
    setExpensesTableData([]);

    const updatePage = async () => {
      if (!date?.from || !date?.to || !selectedCompany) {
        setRefresh(false);
        return;
      }
      const fromDate: Date = date.from!;
      const toDate: Date = date.to!;

      try {
        const headerPromises = StatisticHeaders.map((header) =>
          header.call(fromDate, toDate, undefined, selectedCompany.id)
        );
        const headerContent: number[] = await Promise.all(headerPromises);

        const orderGraphCalls = StatisticFns.map((fn) =>
          fn
            .call(fromDate, toDate, undefined, selectedCompany.id)
            .then((data) => ({
              index: fn.index,
              data,
            }))
        );
        const paymentGraphCalls = StatisticFnsP.map((fn) =>
          fn
            .call(fromDate, toDate, selectedCompany.id, undefined)
            .then((data) => ({
              index: fn.index,
              data,
            }))
        );
        const expensesGraphCalls = StatisticFnsE.map((fn) =>
          fn
            .call(fromDate, toDate, selectedCompany.id, undefined)
            .then((data) => ({
              index: fn.index,
              data,
            }))
        );
        const graphResults = await Promise.all([
          ...orderGraphCalls,
          ...paymentGraphCalls,
          ...expensesGraphCalls,
        ]);
        const graphContent: graphDataDef = {};
        for (const result of graphResults) {
          graphContent[result.index] = result.data;
        }

        const [tableValue, paymentTableValue, expensesTableData] =
          await Promise.all([
            getOrderSummaryByDateRangeOwner(
              fromDate,
              toDate,
              selectedCompany.id
            ),
            paymentService.getPaymentSummaryByDateRangeOwner(
              fromDate,
              toDate,
              selectedCompany.id
            ),
            getExpensesSummaryByDateRangeOwner(
              fromDate,
              toDate,
              selectedCompany.id
            ),
          ]);

        setHeaderData(headerContent);
        setGraphData(graphContent);
        setTableData(tableValue);
        setPaymentTableData(paymentTableValue);
        setExpensesTableData(expensesTableData);
      } catch (error) {
        console.error("Error updating page:", error);
      } finally {
        setRefresh(false);
      }
    };

    updatePage();
  }, [refresh, date, selectedCompany]);

  useEffect(() => {
    setRefresh(true);
  }, [date, selectedCompany]);

  return (
    <div className="py-6 px-10">
      <div className="flex flex-row items-center mb-6">
        <div className="mr-auto flex items-center">
          <h1 className="font-bold text-2xl flex items-center mr-4">
            Restaurant Statistics
          </h1>
          {selectedCompany && (
            <div className="flex items-center">
              {selectedCompany.logo && (
                <Image
                  width={102}
                  height={102}
                  src={
                    selectedCompany.logo.startsWith("data:image")
                      ? selectedCompany.logo
                      : "/placeholder.svg"
                  }
                  alt={selectedCompany.name}
                  className=" w-20 h-8 rounded-full mr-2"
                  unoptimized
                />
              )}
              <span className="text-lg font-semibold">
                {selectedCompany.name}
              </span>
            </div>
          )}
        </div>
        <CompanySwitcher
          companies={companies}
          selectedCompany={selectedCompany}
          onSelectCompany={setSelectedCompany}
        />
        <div className="ml-4">
          <Button
            variant="ghost"
            className={`rounded-full p-3 items-center ${
              refresh ? "animate-spin" : ""
            }`}
            onClick={() => setRefresh(true)}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-row justify-between mb-6">
        <DatePickerWithRange date={date} setDate={setDate} />
        <Button>
          <Download className="w-4 h-4 mr-2" /> Download
        </Button>
      </div>

      <div className="mt-10 pb-2.5 flex flex-row w-full gap-5 overflow-auto">
        {StatisticHeaders.map((header, i) => (
          <Card
            key={i}
            className={`w-48 h-28 ${
              header.name === selectedHeader.name
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
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
              data={
                Array.isArray(graphData[selectedHeader.graphIndex])
                  ? graphData[selectedHeader.graphIndex]
                  : []
              }
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
      <div>
        <DataTable
          columns={columnsPayment}
          data={Array.isArray(paymentTableData) ? paymentTableData : []}
        />
      </div>
      <div>
        <DataTable
          columns={columnsExpenses}
          data={Array.isArray(expensesTableData) ? expensesTableData : []}
        />
      </div>
    </div>
  );
}
