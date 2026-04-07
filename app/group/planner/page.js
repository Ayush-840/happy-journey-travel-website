"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import GroupLeaderboard from "@/components/GroupLeaderboard";
import Navbar from "@/components/Navbar";

function PlannerContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("trip_id");
  const [userId, setUserId] = useState(1); // Mock user

  if (!tripId) return (
    <div style={{ textAlign: "center", padding: "100px 0" }}>
       <h1>Invalid Trip ID</h1>
       <p>No trip found in the URL. Please check your invite link.</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />
      <main style={{ padding: "120px 24px 60px" }}>
        <GroupLeaderboard tripId={tripId} userId={userId} />
      </main>
    </div>
  );
}

export default function GroupPlannerPage() {
  return (
    <Suspense fallback={<div>Loading Group Hub...</div>}>
      <PlannerContent />
    </Suspense>
  );
}
