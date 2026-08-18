import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldError } from "./field";

describe("FieldError", () => {
  it("announces a single validation message", () => {
    render(<FieldError errors={[{ message: "Choose a colour." }]} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Choose a colour.");
  });

  it("lists each available validation message", () => {
    render(
      <FieldError
        errors={[{ message: "Add a title." }, { message: "Keep it short." }]}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Add a title.");
    expect(screen.getByRole("alert")).toHaveTextContent("Keep it short.");
  });
});
