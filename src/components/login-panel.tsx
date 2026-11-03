import { Logo } from "@/components/lumen";
import { LoginIllustration } from "@/components/login-illustration";

/** Branded dark side panel shared by the sign-in page. */
export function LoginPanel() {
  return (
    <section
      aria-label="About Lumen"
      className="flex flex-col bg-navy-deep p-8 text-white lg:min-h-screen lg:p-10"
    >
      <Logo tone="light" />
      <div className="mt-8 max-w-md space-y-4 lg:mt-10">
        <h1 className="text-2xl font-semibold leading-snug lg:text-3xl">Staff portal for your institution</h1>
        <p className="text-base opacity-80 lg:text-lg">Part of the Lumen community. Data stays in your institution.</p>
      </div>
      <div className="mt-auto hidden py-10 lg:block">
        <LoginIllustration />
      </div>
      <p className="mt-6 text-sm opacity-60 lg:mt-0">Screening support, not a diagnosis.</p>
    </section>
  );
}
