"use client";

import { Card, CardHeader } from "@nextui-org/react";

export const UserContributions = () => {
  return (
    <Card style={{ width: "100%", padding: "12px 24px", display: "flex" }}>
      <CardHeader>
        <h2
          style={{
            marginLeft: 16,
            textAlign: "left",
            color: "#ECEDEE",
            fontSize: "18px !important",
            fontWeight: "700",
          }}
        >
          Contributions
        </h2>
      </CardHeader>
    </Card>
  );
};
