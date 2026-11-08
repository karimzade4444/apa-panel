import AcademyBranding from "./academy-branding";
import LoginCard from "./login-card";
import LoginForm from "./login-form";
import LoginHeader from "./login-header";
import LoginScene from "./login-scene";

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
