
import { QueueBoard } from "@/components/agents/QueueBoard";
import { OrderForm } from "@/components/orders/OrderForm";
import { OrderHistory } from "@/components/orders/OrderHistory";
import { Stats } from "@/components/dashboard/Stats";
import { Header } from "@/components/layout/Header";

export function DashboardLayout() {
  return (
    <div className="h-full flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="grid gap-6">
          {/* First row: Stats (1/3) and Chart (2/3) */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Stats showActiveAgentsAndCompletedOnly={true} />
            </div>
            <div className="lg:col-span-2">
              <Stats showChartOnly={true} />
            </div>
          </div>
          
          {/* Second row: Agent Queues and Order Form */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <QueueBoard />
            </div>
            <div>
              <OrderForm />
            </div>
          </div>
          
          {/* Third row: Order History (full width) */}
          <div>
            <OrderHistory />
          </div>
        </div>
      </main>
      
      <footer className="border-t py-4">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground">
            Haifa RTO - Real-Time Agent Queue System
          </p>
        </div>
      </footer>
    </div>
  );
}
