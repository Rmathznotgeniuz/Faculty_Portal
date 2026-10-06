import { render, screen } from "@testing-library/react";
import App from "./App";

describe("application shell", () => {
  it("renders the foundation home page", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Faculty Portal" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
  });
});
