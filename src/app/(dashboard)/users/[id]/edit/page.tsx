import { Suspense } from "react";
import EditUserPage from "@/components/users/EditUserPage";

// Внутренний асинхронный компонент для получения params
async function EditUserContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditUserPage userId={id} />;
}

export default function EditUserRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <EditUserContent params={params} />
    </Suspense>
  );
}
