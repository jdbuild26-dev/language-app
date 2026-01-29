import { test, expect } from "@playwright/test";

test.describe("Feedback UI Verification", () => {
  // We assume the user is logged in or that we can bypass auth.
  // If auth is strictly required, you might need to reuse signed-in state or login flow.
  // For now, these tests verify the elements assuming access.

  // 1. Choose Option Game
  test("Choose Option Game - Feedback UI", async ({ page }) => {
    // Navigate to the game
    await page.goto("/vocabulary/practice/choose-options");

    // Wait for game to load
    await page.waitForSelector("text=Choose the correct option");

    // Simulate clicking an option (any option)
    const options = await page.getByRole("button");
    await options.first().click();

    // Check if feedback banner appeared in the footer
    // We look for the main footer button changing text or state
    // The "CHECK" button should be gone or changed.
    // Wait, dynamic label might be "CHECK" -> "CONTINUE"

    // Initially "CHECK" or just clicking option triggers check?
    // In ChooseOption, clicking an option triggers check immediately if no confirmation needed?
    // Or do we need to click "CHECK"?
    // PracticeGameLayout has 'showSubmitButton={true}' and 'submitLabel'.

    // Let's assume we need to click "CHECK" if it's there, or if selecting auto-submits.
    // In ChooseOptionGamePage: "onNext={showFeedback ? handleContinue : handleSubmit}"

    const footerButton = page.locator("footer button");
    await expect(footerButton).toBeVisible();

    // The text might be "Combined" or something? No, verify "CONTINUE" is visible after feedback
    // Feedback text should form part of the footer or be visible.

    // We expect "CONTINUE" or "FINISH"
    await expect(footerButton).toHaveText(/CONTINUE|FINISH/);

    // Click it
    await footerButton.click();

    // Should move to next Question or reset feedback
    // If it's the last question, it might redirect.
  });

  // 2. Is This French Word
  test("Is This French Word - Feedback UI", async ({ page }) => {
    await page.goto("/vocabulary/practice/is-french-word");

    // Select YES or NO
    await page.getByText("Yes").click();

    // Feedback should appear
    const feedbackMessage = page
      .locator("text=Yes, it's French!")
      .or(page.locator("text=No, it's not French"));
    await expect(feedbackMessage).toBeVisible();

    // Button should say CONTINUE
    const footerButton = page
      .locator("footer button")
      .filter({ hasText: "CONTINUE" });
    await expect(footerButton).toBeVisible();
    await footerButton.click();
  });
});
