import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, ShieldCheck } from "lucide-react";
import { LoginPanel } from "@/components/login-panel";
import { Pill } from "@/components/lumen";
import { DEMO_USERS, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/pending")({
  head: () => ({
    meta: [
      { title: "Institution registration status — Lumen" },
      { name: "description", content: "Your institution's request to join the Lumen community." },
      { property: "og:title", content: "Institution registration status — Lumen" },
      { property: "og:description", content: "Your institution's request to join the Lumen community." },
    ],
  }),
  component: PendingPage,
});

function PendingPage() {
  const { institutionStatus, setInstitutionStatus, login } = useStore();
  const nav = useNavigate();
  const approved = institutionStatus === "Approved";
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <LoginPanel />
      <section className="flex items-center justify-center p-8 pb-28">
        <Card className="w-full max-w-lg space-y-5 p-8 text-center shadow-soft">
          {approved ? <ShieldCheck className="mx-auto h-12 w-12 text-success" /> : <Clock className="mx-auto h-12 w-12 text-amber" />}
          <h1 className="text-2xl font-extrabold text-navy">{approved ? "Your institution is approved" : "Pending approval by the Lumen coordinator"}</h1>
          <Pill tone={approved ? "success" : "amber"}>{approved ? "Approved" : "Pending"}</Pill>
          <p className="text-muted-foreground">Once approved, your institution's local server joins the Lumen community. Student data always stays in your institution.</p>
          {approved ? (
            <Button className="w-full" onClick={() => { login(DEMO_USERS.Admin); nav({ to: "/admin" }); }}>Continue to admin</Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setInstitutionStatus("Approved")}>Simulate approval (demo)</Button>
          )}
        </Card>
      </section>
    </div>
  );
}
