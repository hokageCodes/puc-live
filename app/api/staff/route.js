// apps/website/app/api/staff/route.js
// import { PrismaClient } from "@prisma/client";
// import { NextResponse } from "next/server";

// const prisma = new PrismaClient();

// export async function GET(req   ) {
//   const { searchParams } = new URL(req.url);
//   const department = searchParams.get("department");
//   const team = searchParams.get("team");

//   try {
//     const staff = await prisma.staff.findMany({
//       where: {
//         department: department ? { name: department } : undefined,
//         team: team ? { name: team } : undefined,
//       },
//       include: {
//         department: { select: { name: true } },
//         team: { select: { name: true } },
//         teamLead: {
//           select: {
//             firstName: true,
//             lastName: true,
//           },
//         },
//         lineManager: {
//           select: {
//             firstName: true,
//             lastName: true,
//           },
//         },
//       },
//       orderBy: { lastName: "asc" },
//     });

//     return NextResponse.json({ staff });
//   } catch (error) {
//     console.error("API Error:", error);
//     return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
//   }
// }
