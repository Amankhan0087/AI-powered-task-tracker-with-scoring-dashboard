import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TasksPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>Kanban board and list view land here in the tasks module.</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
