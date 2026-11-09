"use client";

import { forwardRef } from "react";

import {
  GlassInput,
  type GlassInputProps,
} from "@/components/ui/glassyui";

export type InputProps = GlassInputProps;

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <GlassInput ref={ref} {...props} />
));

Input.displayName = "Input";
