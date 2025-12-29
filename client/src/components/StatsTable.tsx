import { useStats } from "@/hooks/use-stats";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsTable() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return <Skeleton className="w-full h-[400px] rounded-2xl" />;
  }

  // Sort by date descending (newest first)
  const sortedStats = [...(stats || [])].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="border-none shadow-lg shadow-black/5 bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Detailed Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[150px]">Date</TableHead>
                <TableHead>Visitors</TableHead>
                <TableHead>Active Users</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStats.map((stat) => (
                <TableRow key={stat.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium font-sans">
                    {format(new Date(stat.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{stat.visitors.toLocaleString()}</TableCell>
                  <TableCell>{stat.activeUsers.toLocaleString()}</TableCell>
                  <TableCell>{stat.sales.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(stat.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={Number(stat.growth) >= 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                      {Number(stat.growth) > 0 ? "+" : ""}{stat.growth}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
