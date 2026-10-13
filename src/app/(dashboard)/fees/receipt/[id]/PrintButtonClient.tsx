"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import React from "react";

export function PrintButtonClient() {
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={() => window.print()}
      className="gap-2 font-bold text-xs"
    >
      <Printer className="w-4 h-4" />
      Print / Save as PDF
    </Button>
  );
}
