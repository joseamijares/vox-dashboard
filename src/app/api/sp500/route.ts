import { NextResponse } from "next/server";
import {
  getSp500Universe,
  getSp500Grades,
  getSp500SectorLeaders,
  getSp500GradeDistribution,
} from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "summary";

  try {
    switch (type) {
      case "universe": {
        const universe = await getSp500Universe();
        return NextResponse.json({ universe });
      }
      case "grades": {
        const grades = await getSp500Grades();
        return NextResponse.json({ grades });
      }
      case "leaders": {
        const leaders = await getSp500SectorLeaders();
        return NextResponse.json({ leaders });
      }
      case "distribution": {
        const distribution = await getSp500GradeDistribution();
        return NextResponse.json({ distribution });
      }
      case "summary":
      default: {
        const [universe, grades, leaders, distribution] = await Promise.all([
          getSp500Universe(),
          getSp500Grades(),
          getSp500SectorLeaders(),
          getSp500GradeDistribution(),
        ]);
        return NextResponse.json({
          universeCount: universe.length,
          gradesCount: grades.length,
          leadersCount: leaders.length,
          distribution,
          top10: grades.slice(0, 10),
          bottom10: grades.slice(-10).reverse(),
          lastUpdated: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error("Error fetching S&P 500 data:", error);
    return NextResponse.json(
      { error: "Failed to fetch S&P 500 data" },
      { status: 500 }
    );
  }
}
