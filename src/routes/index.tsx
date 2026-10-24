import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Building2, GraduationCap, Stethoscope } from "lucide-react";
import { Logo } from "@/components/lumen";
import { DEMO_USERS, INSTITUTION, useStore, type Role } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Staff log in — Lumen" },
      { name: "description", content: "Staff portal for institutions in the Lumen early screening community." },
      { property: "og:title", content: "Staff log in — Lumen" },
      { property: "og:description", content: "Staff portal for institutions in the Lumen early screening community." },
    ],
  }),
  component: LoginPage,
});

const ROLES: { role: Role; label: string; icon: typeof Building2 }[] = [
  { role: "Admin", label: "Institution Admin", icon: Building2 },
  { role: "Teacher", label: "Teacher", icon: GraduationCap },
  { role: "Clinician", label: "Clinician", icon: Stethoscope },
];

function RolePicker({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <div role="radiogroup" aria-label="Role" className="grid grid-cols-3 gap-2">
      {ROLES.map(({ role, label, icon: Icon }) => (
        <button type="button" key={role} role="radio" aria-checked={value === role} onClick={() => onChange(role)}
          className={cn("flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-xs font-bold transition-colors", value === role ? "border-primary bg-accent text-navy" : "border-border text-muted-foreground hover:border-primary/50")}>
          <Icon className="h-5 w-5" />{label}
        </button>
      ))}
    </div>
  );
}

function Field({ id, label, ...p }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><Input id={id} required {...p} /></div>;
}

function LoginForm() {
  const { login, staff } = useStore();
  const nav = useNavigate();
  const [role, setRole] = useState<Role>("Teacher");
  const [email, setEmail] = useState("");
  const [inst, setInst] = useState(INSTITUTION);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (role === "Admin") { login({ ...DEMO_USERS.Admin, email: email || DEMO_USERS.Admin.email }); nav({ to: "/admin" }); return; }
    const match = staff.find((s) => s.email.toLowerCase() === email.toLowerCase() && s.role === role && s.status === "Active");
    login(match ? { name: match.name, email: match.email, role, institution: inst, staffId: match.id } : DEMO_USERS[role]);
    nav({ to: "/dashboard" });
  };
  return (
    <form onSubmit={submit} className="space-y-4 pt-4">
      <RolePicker value={role} onChange={setRole} />
      <Field id="l-e" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@school.edu" />
      <Field id="l-p" label="Password" type="password" defaultValue="demo1234" />
      <Field id="l-i" label="Institution" value={inst} onChange={(e) => setInst(e.target.value)} />
      <Button type="submit" className="h-11 w-full text-base font-bold">Log in</Button>
    </form>
  );
}

function RegisterForm() {
  const { addStaff, setInstitutionStatus } = useStore();
  const nav = useNavigate();
  const [role, setRole] = useState<Role>("Admin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (role === "Admin") { setInstitutionStatus("Pending"); nav({ to: "/pending" }); return; }
    addStaff({ name, email, role, classIds: [], status: "Pending" });
    setDone(true);
  };
  if (done) return (
    <div className="space-y-4 pt-6 text-center">
      <p className="text-lg font-bold text-navy">Request sent</p>
      <p className="text-muted-foreground">Your institution admin will approve your access.</p>
      <Button variant="outline" onClick={() => { setDone(false); setName(""); setEmail(""); }}>Back</Button>
    </div>
  );
  return (
    <form onSubmit={submit} className="space-y-4 pt-4">
      <RolePicker value={role} onChange={setRole} />
      {role === "Admin" ? (
        <>
          <p className="text-sm font-bold text-navy">Register your institution</p>
          <Field id="r-in" label="Institution name" />
          <Field id="r-n" label="Admin name" value={name} onChange={(e) => setName(e.target.value)} />
          <Field id="r-e" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field id="r-p" label="Password" type="password" />
          <Field id="r-c" label="City" />
          <Button type="submit" className="h-11 w-full text-base font-bold">Register institution</Button>
        </>
      ) : (
        <>
          <p className="text-sm font-bold text-navy">Request access as {role}</p>
          <Field id="r-n" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Field id="r-e" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field id="r-p" label="Password" type="password" />
          <Field id="r-i" label="Institution" defaultValue={INSTITUTION} />
          <Button type="submit" className="h-11 w-full text-base font-bold">Request access</Button>
        </>
      )}
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
          <p className="text-lg opacity-80">Part of the Lumen community. Data stays in your institution.</p>
        </div>
        <p className="text-sm opacity-60">Screening estimate, not a diagnosis.</p>
      </section>
      <section className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8 shadow-soft">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="login">Log In</TabsTrigger><TabsTrigger value="register">Register</TabsTrigger></TabsList>
            <TabsContent value="login"><LoginForm /></TabsContent>
            <TabsContent value="register"><RegisterForm /></TabsContent>
          </Tabs>
          <p className="mt-6 text-center text-sm text-muted-foreground">Lab PC? <Link to="/play" className="font-bold text-primary">Open the student screen</Link></p>
        </Card>
      </section>
    </div>
  );
}
