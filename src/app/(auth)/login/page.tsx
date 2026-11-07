import LoginScene from "@/features/auth/components/login-scene";

import AcademyBranding from "@/features/auth/components/academy-branding";
import LoginForm from "@/features/auth/components/login-form";
import LoginHeader from "@/features/auth/components/login-header";
import LoginCard from "@/features/auth/components/login-card";

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
