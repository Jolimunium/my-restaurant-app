"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Label: คอมโพเนนต์ป้ายข้อความ (UI Component)
 * นิยมใช้ควบคู่กับช่องกรอกฟอร์ม (Input) หรือ Checkbox เพื่อบอกว่าฟิลด์นี้คืออะไร
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  Readonly<
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
      VariantProps<typeof labelVariants>
  >
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
