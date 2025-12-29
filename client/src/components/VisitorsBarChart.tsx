import { useStats } from "@/hooks/use-stats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function VisitorsBarChart() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return <Skeleton className="w-full h-[350px] rounded-2xl" />;
  }

  // Last 7 days for this chart
  const chartData = [...(stats || [])]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(stat => ({
      date: new Date(stat.date),
      visitors: stat.visitors
    }));

  return (
    <Card className="col-span-4 lg:col-span-2 border-none shadow-lg shadow-black/5 card-gradient">
      <CardHeader>
        <CardTitle>Daily Visitors</CardTitle>
        <CardDescription>Traffic volume for the past week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(date, "EEE")}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px"
                }}
                labelFormatter={(label) => format(label, "MMMM d, yyyy")}
              />
              <Bar 
                dataKey="visitors" 
                fill="hsl(var(--accent))" 
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
