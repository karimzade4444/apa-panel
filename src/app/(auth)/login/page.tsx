import AcademyBranding from "@/components/auth/academy-branding";
import LoginCard from "@/components/auth/login-card";
import LoginForm from "@/components/auth/login-form";
import LoginHeader from "@/components/auth/login-header";
import LoginScene from "@/components/auth/login-scene";

export default function LoginPage() {
  return (
    <LoginScene left={<AcademyBranding />}>
      <LoginCard>
        <LoginHeader />
        <LoginForm />
      </LoginCard>
    </LoginScene>
  );
}
