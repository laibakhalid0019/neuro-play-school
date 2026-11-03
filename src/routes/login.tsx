import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LoginPanel } from "@/components/login-panel";
import { DEMO_USERS, INSTITUTION, useStore, type User } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Lumen" },
      { name: "description", content: "Staff sign-in for institutions in the Lumen community." },
      { property: "og:title", content: "Sign in — Lumen" },
      { property: "og:description", content: "Staff sign-in for institutions in the Lumen community." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = (asUser: User) => {
    login(asUser);
    nav({ to: asUser.role === "Admin" ? "/admin" : "/dashboard" });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // Prototype sign-in: the demo admin address (or any admin address) opens the
    // admin view; every other address opens the teacher view.
    const value = email.trim().toLowerCase();
    const isAdmin = value === DEMO_USERS.Admin.email || value.includes("admin");
    if (isAdmin) {
      signIn({ ...DEMO_USERS.Admin, email: value || DEMO_USERS.Admin.email });
      return;
    }
    const match = DEMO_USERS.Teacher;
    signIn({ ...match, email: value || match.email });
  };

  const inputCls = "h-10 rounded-md border-border bg-card";
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <LoginPanel />
      <section className="flex items-center justify-center p-6 pb-28 md:p-8">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">{INSTITUTION}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="l-email">Email</Label>
              <Input id="l-email" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@school.edu" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-password">Password</Label>
              <Input id="l-password" type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="h-10 w-full">Sign in</Button>
          </form>
          <div className="mt-6 flex gap-4 text-sm font-medium">
            <button onClick={() => signIn(DEMO_USERS.Admin)} className="rounded-md px-1 py-1 text-teal hover:underline">Demo as admin</button>
            <button onClick={() => signIn(DEMO_USERS.Teacher)} className="rounded-md px-1 py-1 text-teal hover:underline">Demo as teacher</button>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">Demo mode, sample data.</p>
        </Card>
      </section>
    </div>
  );
}
