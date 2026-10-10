import { createFileRoute } from "@tanstack/react-router";
import { AvaApp } from "../components/ava-app";

export const Route = createFileRoute("/")({
  component: AvaApp,
});
