"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  PlayCircle,
  MapPin,
  Star,
  Circle,
  Play,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  fullname: string;
  status: string;
  email: string;
  role: string;
  branchId: string | null;
}

interface Branch {
  id: string;
  name: string;
}

interface Shift {
  id: string;
  userId: string;
  branchId: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  status: string;
  shiftState: "INACTIVE" | "ACTIVE" | "ASSIST" | "BREAK" | "COMPLETED";
  role: string;
  color: string;
  notes?: string;
  user: {
    id: string;
    fullname: string;
    email: string;
    role: string;
  };
  branch: {
    id: string;
    name: string;
  };
}

interface ShiftTemplate {
  id: string;
  name: string;
  branchId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  role: string;
  maxStaff: number;
  branch: {
    id: string;
    name: string;
  };
}

interface DecodedToken {
  companyId: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
];

const TIME_SLOTS = [
  { start: "06:00", end: "10:00", label: "Early Morning" },
  { start: "10:00", end: "14:00", label: "Morning" },
  { start: "14:00", end: "18:00", label: "Afternoon" },
  { start: "18:00", end: "22:00", label: "Evening" },
  { start: "22:00", end: "02:00", label: "Night" },
];

const roleColors = {
  manager: "bg-purple-100 text-purple-800 border-purple-200",
  waiter: "bg-blue-100 text-blue-800 border-blue-200",
  chef: "bg-orange-100 text-orange-800 border-orange-200",
  barista: "bg-green-100 text-green-800 border-green-200",
  cashier: "bg-pink-100 text-pink-800 border-pink-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

const shiftStateConfig = {
  INACTIVE: {
    color: "bg-gray-50 border-gray-200 text-gray-700",
    badge: "bg-gray-100 text-gray-600",
    icon: <Circle className="h-3 w-3 text-gray-500" />,
    label: "Inactive",
  },
  ACTIVE: {
    color: "bg-blue-50 border-blue-200 text-blue-800",
    badge: "bg-blue-100 text-blue-700",
    icon: <Play className="h-3 w-3 text-blue-600" />,
    label: "Active",
  },
  ASSIST: {
    color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    badge: "bg-yellow-100 text-yellow-700",
    icon: <Star className="h-3 w-3 text-yellow-600" />,
    label: "Assist",
  },
  BREAK: {
    color: "bg-orange-50 border-orange-200 text-orange-800",
    badge: "bg-orange-100 text-orange-700",
    icon: <Coffee className="h-3 w-3 text-orange-600" />,
    label: "Break",
  },
  COMPLETED: {
    color: "bg-green-50 border-green-200 text-green-800",
    badge: "bg-green-100 text-green-700",
    icon: <CheckCircle className="h-3 w-3 text-green-600" />,
    label: "Completed",
  },
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function ShiftSchedulerGrid() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [companyId, setCompanyId] = useState<string>("");
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    templateId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  } | null>(null);

  // Form state for adding shifts
  const [newShift, setNewShift] = useState({
    userId: "",
    title: "",
    role: "",
    notes: "",
  });

  // Form state for creating templates
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    branchId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    role: "",
    maxStaff: "1",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      setCompanyId(decoded.companyId);
      fetchData(decoded.companyId);
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchData(companyId);
    }
  }, [selectedBranch, companyId]);

  const fetchData = async (companyId: string) => {
    try {
      setLoading(true);
      const [usersResponse, branchesResponse, shiftsResponse, templatesResponse] =
        await Promise.all([
          fetch(`/api/users?companyId=${companyId}`),
          fetch(`/api/branches?companyId=${companyId}`),
          fetch(`/api/shift?companyId=${companyId}&branchId=${selectedBranch}`),
          fetch(
            `/api/shift-templates?companyId=${companyId}&branchId=${selectedBranch}`,
          ),
        ]);

      const responses = [usersResponse, branchesResponse, shiftsResponse, templatesResponse];
      responses.forEach((res, i) => {
        if (!res.ok)
          throw new Error(`Request ${i + 1} failed with status ${res.status}`);
      });

      const [usersData, branchesData, shiftsData, templatesData] =
        await Promise.all([
          usersResponse.json(),
          branchesResponse.json(),
          shiftsResponse.json(),
          templatesResponse.json(),
        ]);

      setUsers(usersData.filter((user: User) => user.status === "active"));
      setBranches(branchesData);
      setShifts(shiftsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (
    templateId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ) => {
    setSelectedCell({ templateId, dayOfWeek, startTime, endTime });
    setIsAddShiftDialogOpen(true);
  };

  const handleAddShift = async () => {
    if (!selectedCell || !newShift.userId) return;

    try {
      const template = templates.find((t) => t.id === selectedCell.templateId);
      if (!template) return;

      const response = await fetch("/api/shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: newShift.userId,
          branchId: selectedBranch === "all" ? template.branchId : selectedBranch,
          companyId,
          title: newShift.title || template.name,
          dayOfWeek: selectedCell.dayOfWeek,
          startTime: selectedCell.startTime,
          endTime: selectedCell.endTime,
          role: newShift.role || template.role,
          shiftState: "INACTIVE",
          color: "#6B7280",
          notes: newShift.notes,
        }),
      });

      if (response.ok) {
        const newShiftData = await response.json();
        setShifts((prev) => [...prev, newShiftData]);
        setIsAddShiftDialogOpen(false);
        setSelectedCell(null);
        setNewShift({
          userId: "",
          title: "",
          role: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Error creating shift:", error);
    }
  };

  const handleShiftStateChange = async (
    shiftId: string,
    newState: Shift["shiftState"],
  ) => {
    try {
      const response = await fetch(`/api/shift/${shiftId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftState: newState }),
      });

      if (response.ok) {
        const updatedShift = await response.json();
        setShifts((prev) =>
          prev.map((shift) => (shift.id === shiftId ? updatedShift : shift)),
        );
      }
    } catch (error) {
      console.error("Error updating shift state:", error);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      const response = await fetch(`/api/shift/${shiftId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShifts((prev) => prev.filter((shift) => shift.id !== shiftId));
      }
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch('/api/shift-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTemplate,
          companyId,
        }),
      });

      if (response.ok) {
        const createdTemplate = await response.json();
        setTemplates((prev) => [...prev, createdTemplate]);
        setIsCreateTemplateDialogOpen(false);
        setNewTemplate({
          name: "",
          branchId: "",
          dayOfWeek: "",
          startTime: "",
          endTime: "",
          role: "",
          maxStaff: "1",
        });
      }
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/shift-templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTemplates((prev) => prev.filter((template) => template.id !== templateId));
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const getShiftsForCell = (
    templateId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ) => {
    return shifts.filter(
      (shift) =>
        shift.dayOfWeek === dayOfWeek &&
        shift.startTime === startTime &&
        shift.endTime === endTime,
    );
  };

  const getTemplateById = (templateId: string) => {
    return templates.find((template) => template.id === templateId);
  };

  const filteredTemplates = templates.filter((template) => {
    if (selectedBranch === "all") return true;
    return template.branchId === selectedBranch;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Scheduler Grid</h1>
          <p className="text-gray-600">
            Click on any cell to add a shift to that time slot
          </p>
        </div>

                 <div className="flex items-center gap-3">
           <Select value={selectedBranch} onValueChange={setSelectedBranch}>
             <SelectTrigger className="w-48">
               <SelectValue placeholder="All Branches" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Branches</SelectItem>
               {branches.map((branch) => (
                 <SelectItem key={branch.id} value={branch.id}>
                   {branch.name}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
           
           <Dialog open={isCreateTemplateDialogOpen} onOpenChange={setIsCreateTemplateDialogOpen}>
             <DialogTrigger asChild>
               <Button className="bg-blue-600 hover:bg-blue-700">
                 <Plus className="h-4 w-4 mr-2" />
                 Create Template
               </Button>
             </DialogTrigger>
             <DialogContent className="max-w-md">
               <DialogHeader>
                 <DialogTitle>Create Shift Template</DialogTitle>
               </DialogHeader>
               <div className="space-y-4">
                 <div>
                   <Label htmlFor="name">Template Name</Label>
                   <Input
                     id="name"
                     value={newTemplate.name}
                     onChange={(e) =>
                       setNewTemplate((prev) => ({
                         ...prev,
                         name: e.target.value,
                       }))
                     }
                     placeholder="e.g., Morning Shift"
                   />
                 </div>

                 <div>
                   <Label htmlFor="branch">Branch</Label>
                   <Select
                     value={newTemplate.branchId}
                     onValueChange={(value) =>
                       setNewTemplate((prev) => ({ ...prev, branchId: value }))
                     }
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select branch" />
                     </SelectTrigger>
                     <SelectContent>
                       {branches.map((branch) => (
                         <SelectItem key={branch.id} value={branch.id}>
                           {branch.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                 <div>
                   <Label htmlFor="dayOfWeek">Day of Week</Label>
                   <Select
                     value={newTemplate.dayOfWeek}
                     onValueChange={(value) =>
                       setNewTemplate((prev) => ({ ...prev, dayOfWeek: value }))
                     }
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select day" />
                     </SelectTrigger>
                     <SelectContent>
                       {DAYS_OF_WEEK.map((day) => (
                         <SelectItem
                           key={day.value}
                           value={day.value.toString()}
                         >
                           {day.label}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label htmlFor="startTime">Start Time</Label>
                     <Input
                       id="startTime"
                       type="time"
                       value={newTemplate.startTime}
                       onChange={(e) =>
                         setNewTemplate((prev) => ({
                           ...prev,
                           startTime: e.target.value,
                         }))
                       }
                     />
                   </div>
                   <div>
                     <Label htmlFor="endTime">End Time</Label>
                     <Input
                       id="endTime"
                       type="time"
                       value={newTemplate.endTime}
                       onChange={(e) =>
                         setNewTemplate((prev) => ({
                           ...prev,
                           endTime: e.target.value,
                         }))
                       }
                     />
                   </div>
                 </div>

                 <div>
                   <Label htmlFor="role">Required Role</Label>
                   <Select
                     value={newTemplate.role}
                     onValueChange={(value) =>
                       setNewTemplate((prev) => ({ ...prev, role: value }))
                     }
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select role" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="manager">Manager</SelectItem>
                       <SelectItem value="waiter">Waiter</SelectItem>
                       <SelectItem value="chef">Chef</SelectItem>
                       <SelectItem value="barista">Barista</SelectItem>
                       <SelectItem value="cashier">Cashier</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 <div>
                   <Label htmlFor="maxStaff">Max Staff</Label>
                   <Input
                     id="maxStaff"
                     type="number"
                     min="1"
                     value={newTemplate.maxStaff}
                     onChange={(e) =>
                       setNewTemplate((prev) => ({
                         ...prev,
                         maxStaff: e.target.value,
                       }))
                     }
                   />
                 </div>

                 <Button onClick={handleCreateTemplate} className="w-full">
                   Create Template
                 </Button>
               </div>
             </DialogContent>
           </Dialog>
         </div>
      </div>

      {/* Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-4 min-w-[800px]">
              {/* Header Row */}
              <div className="font-bold text-sm text-gray-700 p-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl text-center border">
                Shift Templates
              </div>
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day.value}
                  className="font-bold text-sm text-gray-700 p-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl text-center border"
                >
                  <div>{day.short}</div>
                  <div className="text-xs text-gray-500 mt-1 font-normal">
                    {day.label}
                  </div>
                </div>
              ))}

              {/* Template Rows */}
              {filteredTemplates.map((template) => (
                <React.Fragment key={template.id}>
                                     {/* Template Name */}
                   <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border shadow-sm relative">
                     <div className="flex items-start justify-between">
                       <div className="flex-1">
                         <div className="text-sm font-bold text-gray-900 mb-1">
                           {template.name}
                         </div>
                         <div className="text-xs text-gray-600 font-medium">
                           {template.startTime} - {template.endTime}
                         </div>
                         <Badge
                           variant="outline"
                           className={`text-xs mt-2 ${
                             roleColors[
                               template.role.toLowerCase() as keyof typeof roleColors
                             ] || roleColors.default
                           }`}
                         >
                           {template.role}
                         </Badge>
                         <div className="text-xs text-gray-400 mt-2">
                           Max: {template.maxStaff}
                         </div>
                       </div>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-6 w-6 flex-shrink-0 hover:bg-white/50"
                           >
                             <MoreVertical className="h-3 w-3" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent
                           align="end"
                           className="bg-white border shadow-xl rounded-xl"
                         >
                           <DropdownMenuItem
                             className="text-red-600"
                             onClick={() => handleDeleteTemplate(template.id)}
                           >
                             <Trash2 className="h-3 w-3 mr-2" />
                             Delete Template
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </div>
                   </div>

                  {/* Day Cells */}
                  {DAYS_OF_WEEK.map((day) => {
                    const cellShifts = getShiftsForCell(
                      template.id,
                      day.value,
                      template.startTime,
                      template.endTime,
                    );

                    return (
                      <div
                        key={`${template.id}-${day.value}`}
                        className="min-h-[140px] p-3 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
                        onClick={() =>
                          handleCellClick(
                            template.id,
                            day.value,
                            template.startTime,
                            template.endTime,
                          )
                        }
                      >
                        <div className="space-y-2">
                          {cellShifts.map((shift) => {
                            const stateConfig = shiftStateConfig[shift.shiftState];
                            return (
                              <div
                                key={shift.id}
                                className={`p-2 rounded-lg border transition-all duration-200 hover:shadow-md ${stateConfig.color} shadow-sm`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <Avatar className="h-6 w-6 flex-shrink-0">
                                      <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-white text-xs font-bold">
                                        {getInitials(shift.user.fullname)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-gray-900 truncate">
                                        {shift.user.fullname}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs font-medium ${stateConfig.badge} border-0`}
                                      >
                                        <div className="flex items-center gap-1">
                                          {stateConfig.icon}
                                          <span className="hidden sm:inline">
                                            {stateConfig.label}
                                          </span>
                                        </div>
                                      </Badge>
                                    </div>
                                  </div>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 flex-shrink-0 hover:bg-white/50"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="bg-white border shadow-xl rounded-xl"
                                    >
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleShiftStateChange(shift.id, "ACTIVE")
                                        }
                                      >
                                        <Play className="h-3 w-3 mr-2 text-blue-600" />
                                        Set Active
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleShiftStateChange(shift.id, "ASSIST")
                                        }
                                      >
                                        <Star className="h-3 w-3 mr-2 text-yellow-600" />
                                        Set Assist
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleShiftStateChange(shift.id, "BREAK")
                                        }
                                      >
                                        <Coffee className="h-3 w-3 mr-2 text-orange-600" />
                                        Set Break
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleShiftStateChange(shift.id, "COMPLETED")
                                        }
                                      >
                                        <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                                        Mark Complete
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleShiftStateChange(shift.id, "INACTIVE")
                                        }
                                      >
                                        <Circle className="h-3 w-3 mr-2 text-gray-600" />
                                        Set Inactive
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Edit className="h-3 w-3 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => handleDeleteShift(shift.id)}
                                      >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Remove
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {cellShifts.length === 0 && (
                          <div className="flex items-center justify-center h-full text-gray-400 min-h-[100px]">
                            <div className="text-center">
                              <Plus className="h-6 w-6 mx-auto mb-2 opacity-40" />
                              <p className="text-xs font-medium opacity-60">
                                Click to add shift
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Shift Dialog */}
      <Dialog open={isAddShiftDialogOpen} onOpenChange={setIsAddShiftDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Shift</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCell && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Template:</strong> {getTemplateById(selectedCell.templateId)?.name}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Day:</strong> {DAYS_OF_WEEK.find(d => d.value === selectedCell.dayOfWeek)?.label}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Time:</strong> {selectedCell.startTime} - {selectedCell.endTime}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="user">Employee</Label>
              <Select
                value={newShift.userId}
                onValueChange={(value) =>
                  setNewShift((prev) => ({ ...prev, userId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullname} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Shift Title (Optional)</Label>
              <Input
                id="title"
                value={newShift.title}
                onChange={(e) =>
                  setNewShift((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Morning Shift"
              />
            </div>

            <div>
              <Label htmlFor="role">Role (Optional)</Label>
              <Select
                value={newShift.role}
                onValueChange={(value) =>
                  setNewShift((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="waiter">Waiter</SelectItem>
                  <SelectItem value="chef">Chef</SelectItem>
                  <SelectItem value="barista">Barista</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newShift.notes}
                onChange={(e) =>
                  setNewShift((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <Button onClick={handleAddShift} className="w-full">
              Add Shift
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
