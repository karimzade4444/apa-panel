import {
  AcademyBranding,
  LoginCard,
  LoginForm,
  LoginHeader,
  LoginScene,
} from "@/features/auth";

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
