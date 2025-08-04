
import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")
    const email = searchParams.get("email")
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    if (!branchId || !email) {
      return NextResponse.json({ error: "Branch ID and email are required" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, fullname: true, email: true, role: true, branchId: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get today's attendance record
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        branchId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            role: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    })

    return NextResponse.json({ user, attendance })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { branchId, email, action, latitude, longitude, notes } = body

    if (!branchId || !email || !action) {
      return NextResponse.json({ error: "Branch ID, email, and action are required" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, fullname: true, email: true, role: true, branchId: true, companyId: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get branch details for location verification
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, name: true, latitude: true, longitude: true, companyId: true },
    })

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    // Verify location if branch has coordinates
    let distance = null
    if (branch.latitude && branch.longitude && latitude && longitude) {
      distance = calculateDistance(branch.latitude, branch.longitude, latitude, longitude)

      // Check if user is within 100 meters of the branch
      const maxDistance = 5000 // meters
      if (distance > maxDistance) {
        return NextResponse.json(
          {
            error: `You must be within ${maxDistance}m of the branch to ${action}. Current distance: ${Math.round(distance)}m`,
            distance: Math.round(distance),
            maxDistance,
          },
          { status: 400 },
        )
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get or create today's attendance record
    let attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        branchId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    if (action === "signin") {
      if (attendance && attendance.signInTime) {
        return NextResponse.json({ error: "Already signed in for today" }, { status: 400 })
      }

      const attendanceData = {
        userId: user.id,
        branchId,
        companyId: user.companyId || branch.companyId,
        email: user.email,
        signInTime: new Date(),
        signInLatitude: latitude,
        signInLongitude: longitude,
        signInDistance: distance,
        status: "SIGNED_IN" as const,
        notes,
        date: today,
      }

      if (attendance) {
        attendance = await prisma.attendance.update({
          where: { id: attendance.id },
          data: attendanceData,
        })
      } else {
        attendance = await prisma.attendance.create({
          data: attendanceData,
        })
      }
    } else if (action === "signout") {
      if (!attendance || !attendance.signInTime) {
        return NextResponse.json({ error: "Must sign in first" }, { status: 400 })
      }

      if (attendance.signOutTime) {
        return NextResponse.json({ error: "Already signed out for today" }, { status: 400 })
      }

      const signOutTime = new Date()
      const totalHours = (signOutTime.getTime() - attendance.signInTime.getTime()) / (1000 * 60 * 60)

      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          signOutTime,
          signOutLatitude: latitude,
          signOutLongitude: longitude,
          signOutDistance: distance,
          totalHours,
          status: "SIGNED_OUT",
          notes: notes || attendance.notes,
        },
      })
    }

    // Fetch updated attendance with relations
    const updatedAttendance = await prisma.attendance.findUnique({
      where: { id: attendance!.id },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            role: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    })

    return NextResponse.json({ attendance: updatedAttendance })
  } catch (error) {
    console.error("Error processing attendance:", error)
    return NextResponse.json({ error: "Failed to process attendance" }, { status: 500 })
  }
}
