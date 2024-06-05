"use client";

import { Card, CardHeader } from "@nextui-org/react";

export const UserActivities = () => {
  return (
    <Card style={{ width: "100%", padding: "12px 24px", display: "flex" }}>
      <CardHeader>
        <h2
          style={{
            textAlign: "left",
            color: "#ECEDEE",
            fontSize: "18px !important",
            fontWeight: "700",
          }}
        >
          Activities
        </h2>
      </CardHeader>
    </Card>
  );
};
