
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SupabaseDebugger = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Firebase Integration Active</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>The app has been migrated from Supabase to Firebase.</p>
          <p>All authentication and data operations now use Firebase Auth and Firestore.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseDebugger;
