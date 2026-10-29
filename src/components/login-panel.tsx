import { Logo } from "@/components/lumen";
import { LoginIllustration } from "@/components/login-illustration";

/** Branded navy side panel shared by the log in / register page and the pending page. */
export function LoginPanel() {
  return (
    <section
      aria-label="About Lumen"
      className="flex flex-col bg-navy p-8 text-navy-foreground lg:min-h-screen lg:p-10"
      style={{ backgroundImage: "linear-gradient(180deg, var(--navy), var(--navy-deep))" }}
    >
      <Logo tone="light" />
      <div className="mt-8 max-w-md space-y-4 lg:mt-10">
        <h1 className="text-3xl font-extrabold leading-tight lg:text-4xl">Staff portal for your institution</h1>
        <p className="text-base opacity-80 lg:text-lg">Part of the Lumen community. Data stays in your institution.</p>
      </div>
      <div className="mt-auto hidden py-10 lg:block">
        <LoginIllustration />
      </div>
      <p className="mt-6 text-sm opacity-60 lg:mt-0">Screening estimate, not a diagnosis.</p>
    </section>
  );
}
