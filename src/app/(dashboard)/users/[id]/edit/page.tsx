import EditUserPage from "@/components/users/EditUserPage";

export default async function EditUserRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditUserPage userId={id} />;
}
