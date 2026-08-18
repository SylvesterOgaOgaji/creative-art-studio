import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useStudioStore } from "@/store/useStudioStore";
import ChallengeCard from "./ChallengeCard";

const initialState = useStudioStore.getInitialState();

function resetStudio() {
  useStudioStore.persist.clearStorage();
  useStudioStore.setState(
    {
      ...initialState,
      completedChallengeIds: [],
      challengeIndex: 0,
      soundEnabled: false,
    },
    true
  );
}

describe("ChallengeCard", () => {
  beforeEach(resetStudio);

  it("cycles a creative prompt and celebrates a completed challenge", () => {
    render(<ChallengeCard />);

    expect(
      screen.getByRole("heading", { name: "Build a robot" })
    ).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", { name: "Show another creative challenge" })
    );
    expect(
      screen.getByRole("heading", { name: "Make a rainbow creature" })
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "I made it!" }));
    expect(screen.getByRole("button", { name: "Badge earned" })).toBeDisabled();
    expect(useStudioStore.getState().completedChallengeIds).toEqual([1]);
  });

  it("can be tucked away and reopened without losing the prompt", () => {
    render(<ChallengeCard />);

    fireEvent.click(
      screen.getByRole("button", { name: "Hide this creative challenge" })
    );
    expect(screen.getByRole("button", { name: "Need an idea?" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Need an idea?" }));
    expect(
      screen.getByRole("heading", { name: "Build a robot" })
    ).toBeVisible();
  });
});
