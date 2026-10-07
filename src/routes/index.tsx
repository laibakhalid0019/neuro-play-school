import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Logo, NativeSelect } from "@/components/lumen";
import { useStore, type Role } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Staff log in — Lumen" },
      { name: "description", content: "Staff portal for school-based early screening with Lumen." },
      { property: "og:title", content: "Staff log in — Lumen" },
      { property: "og:description", content: "Staff portal for school-based early screening with Lumen." },
    ],
  }),
  component: LoginPage,
});

function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { login } = useStore();
  const nav = useNavigate();
  const [role, setRole] = useState<Role>("Teacher");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("okafor@school.edu");
  const [password, setPassword] = useState("demo1234");
  const [inst, setInst] = useState("Riverside Primary School");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    login({ name: name || (role === "Teacher" ? "Ms. Okafor" : "Dr. Lindqvist"), email, role, institution: inst });
    nav({ to: "/dashboard" });
  };
  return (
    <form onSubmit={submit} className="space-y-4 pt-4">
      {mode === "signup" && (
        <div className="space-y-1.5"><Label htmlFor="n">Full name</Label><Input id="n" value={name} onChange={(e) => setName(e.target.value)} required /></div>
      )}
      <div className="space-y-1.5"><Label htmlFor={`r-${mode}`}>Role</Label>
        <NativeSelect id={`r-${mode}`} className="w-full" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option>Teacher</option><option>Clinician</option>
        </NativeSelect>
      </div>
      <div className="space-y-1.5"><Label htmlFor={`e-${mode}`}>Email</Label><Input id={`e-${mode}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      <div className="space-y-1.5"><Label htmlFor={`p-${mode}`}>Password</Label><Input id={`p-${mode}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
      <div className="space-y-1.5"><Label htmlFor={`i-${mode}`}>Institution</Label><Input id={`i-${mode}`} value={inst} onChange={(e) => setInst(e.target.value)} required /></div>
      <Button type="submit" className="h-11 w-full text-base font-bold">{mode === "login" ? "Log in" : "Create account"}</Button>
    </form>
  );
}

function LoginPage() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="flex flex-col justify-between bg-navy p-10 text-navy-foreground">
        <Logo tone="light" />
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight">Staff portal for your institution</h1>
          <p className="text-lg opacity-80">Run game periods in the computer lab, review recorded sessions and add screening labels — all in one calm place.</p>
        </div>
        <p className="text-sm opacity-60">Screening estimate only, not a diagnosis.</p>
      </section>
      <section className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8 shadow-soft">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="login">Log In</TabsTrigger><TabsTrigger value="signup">Sign Up</TabsTrigger></TabsList>
            <TabsContent value="login"><AuthForm mode="login" /></TabsContent>
            <TabsContent value="signup"><AuthForm mode="signup" /></TabsContent>
          </Tabs>
          <p className="mt-6 text-center text-sm text-muted-foreground">Lab PC? <a href="/play" className="font-bold text-primary">Open the student screen</a></p>
        </Card>
      </section>
    </div>
  );
}
