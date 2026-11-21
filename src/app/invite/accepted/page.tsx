import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AcceptedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">You're in</CardTitle>
          <CardDescription>
            Your invitation was accepted. Your projects will appear here once
            the client view is ready.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </main>
  );
}