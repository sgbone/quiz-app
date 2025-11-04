export async function getAllUsers(adminKey: string) {
  const res = await fetch("/api/get-all-users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminKey}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.users as any[];
}
