"use client"

import React, { useState, useEffect } from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { DropdownMenuSeparator } from "./dropdownMenu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover"

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
    })
    const [selectedDate, setSelectedDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
    })

    useEffect(() => {
        if (date === undefined) {
            return
        }

        

    }, [date])

    return (
        <div className={cn("grid gap-2", className)}>
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                    )}
                    onClick={() => setSelectedDate(date)}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                    date.to ? (
                        <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                        </>
                    ) : (
                        format(date.from, "LLL dd, y")
                    )
                    ) : (
                    <span>Pick a date</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    numberOfMonths={2}
                />
                <DropdownMenuSeparator />
                <div className="flex flex-row py-2 px-3 my-auto">
                    <div className="my-auto text-sm">
                        {selectedDate?.from ? (
                        selectedDate.to ? (
                            <>
                            {format(selectedDate.from, "LLL dd, y")} -{" "}
                            {format(selectedDate.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(selectedDate.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </div>
                    <div className="ml-auto flex flex-row justify-end gap-5">
                        <PopoverClose>
                            <Button variant="outline">
                                Cancel
                            </Button>
                        </PopoverClose>
                        <PopoverClose>
                            <Button onClick={() => setDate(selectedDate)}>
                                Apply
                            </Button>
                        </PopoverClose>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
        </div>
    )
}
