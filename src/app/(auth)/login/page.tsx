import LoginScene from "@/components/ui/login-scene";

import AcademyBranding from "@/components/ui/academy-branding";
import LoginForm from "@/components/ui/login-form";
import LoginHeader from "@/components/ui/login-header";
import LoginCard from "@/components/ui/login-card";

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
