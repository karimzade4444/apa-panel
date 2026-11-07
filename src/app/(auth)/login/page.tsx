import LoginScene from "@/features/auth/ui/login-scene";

import AcademyBranding from "@/features/auth/ui/academy-branding";
import LoginForm from "@/features/auth/ui/login-form";
import LoginHeader from "@/features/auth/ui/login-header";
import LoginCard from "@/features/auth/ui/login-card";

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
