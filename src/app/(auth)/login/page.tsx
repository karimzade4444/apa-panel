import AcademyBranding from "@/components/auth/academy-branding";
import LoginCard from "@/components/auth/login-card";
import LoginForm from "@/components/auth/login-form";
import LoginHeader from "@/components/auth/login-header";
import LoginScene from "@/components/auth/login-scene";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  return (
    <LoginScene left={<AcademyBranding />}>
      <LoginCard>
        <ThemeToggle className="absolute right-4 top-4 z-20" />
        <LoginHeader />
        <LoginForm />
      </LoginCard>
    </LoginScene>
  );
}
