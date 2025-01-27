"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Download, Plus, Link } from "lucide-react";

import { getMenuItems } from "@/lib/menu";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import { columns, MenuItem } from "@/components/menu-columns";
import { jwtDecode } from 'jwt-decode'


interface DecodedToken {
  companyId: string;
}
export default function MenuItems() {
  const [refresh, setRefresh] = useState(true);
  const [data, setData] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (!refresh) return;

    setData([]);
    (async () => {
      try {
         const token = localStorage.getItem("token");
                    if (!token) {
                      console.error("Token not found");
                      return;
                    }
                    const decodedToken: DecodedToken = jwtDecode(token);
        const menuItems = await getMenuItems(decodedToken.companyId);
        setData(menuItems);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      } finally {
        setRefresh(false);
      }
    })();
  }, [refresh]);

  return (
    <div className="py-6 px-10">
      <div className="flex flex-row">
        <div className="mr-auto flex">
          <h1 className="mr-auto font-bold text-2xl flex items-center">
            Menu Items
          </h1>
          <div className="ml-5 my-auto h-4 w-4 items-center flex">
            <Button
              variant="ghost"
              className={
                "rounded-full p-3 items-center " +
                (refresh ? "animate-spin" : "")
              }
              onClick={() => setRefresh(true)}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="ml-auto flex justify-end gap-5">
          
            <Button variant="outline" className="my-auto" onClick={() => window.location.href = "/owner/menu/create"}>
              <Plus className="w-4 h-4 mr-2" /> New Menu Item
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
  );
}
