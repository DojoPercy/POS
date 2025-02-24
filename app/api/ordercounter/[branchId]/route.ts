import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { branchId } = req.query as { branchId: string };

  if (req.method === "GET") {
    try {
      const orderCounter = await prisma.orderCounter.findUnique({
        where: { branchId },
      });

      if (!orderCounter) {
        return res.status(404).json({ error: "OrderCounter not found" });
      }

      res.status(200).json(orderCounter);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "PUT") {
    try {
      const { date, lastNumber } = req.body;

      const updatedOrderCounter = await prisma.orderCounter.update({
        where: { branchId },
        data: { date: new Date(date), lastNumber },
      });

      res.status(200).json(updatedOrderCounter);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.orderCounter.delete({
        where: { branchId },
      });

      res.status(200).json({ message: "OrderCounter deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
