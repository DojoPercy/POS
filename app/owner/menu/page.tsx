"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Download, Plus, Link, Loader2 } from "lucide-react";

import { getMenuItems } from "@/lib/menu";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import { columns, MenuItem } from "@/components/menu-columns";
import { jwtDecode } from 'jwt-decode'
import { fetchUserFromToken, selectUser } from "@/redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@reduxjs/toolkit";
import { getMenuItemsPerCompany } from "@/redux/companyMenuSlice";


interface DecodedToken {
  companyId: string;
}
export default function MenuItems() {
  const [refresh, setRefresh] = useState(true);
  const [data, setData] = useState<MenuItem[]>([]);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const {menuItems, isLoading} = useSelector((state: RootState) => state.menu);
  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getMenuItemsPerCompany(user.companyId));
    }
  }, [dispatch, user?.companyId]);

  useEffect(() => {
    if (refresh && user?.companyId) {
      dispatch(getMenuItemsPerCompany(user.companyId));
      setRefresh(false); // Reset refresh after fetching
    }
  }, [dispatch, refresh, user?.companyId]);

  return (
    <div className="py-6 px-10">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
      {isLoading ? (
          <div className="w-full flex flex-col items-center justify-center py-12 border rounded-md bg-muted/10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading menu items...</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-12 border rounded-md">
            <p className="text-muted-foreground mb-4">No menu items found Yet</p>
           
          </div>
        ) : (
          <DataTable columns={columns} data={menuItems} />
        )}
      </div>
    </div>
  );
}
