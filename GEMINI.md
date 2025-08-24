# Gemini CLI Customization Guidelines

These guidelines optimize the CLI's behavior for your workflow.

## General Interaction Preferences

-   **Conciseness:** Prefer concise and direct responses.
-   **Direct Actions:** Proceed directly with clear tasks. For critical commands, a brief explanation of purpose and impact is required before execution.
-   **Error Handling & Correction:** You are comfortable with direct correction and iterative refinement. Prioritize prompt issue resolution.
-   **Iterative Refinement:** Be prepared for multiple small adjustments.
-   **Keyboard Navigation:** Prioritize implementing keyboard navigation where applicable.
-   **No Special Characters in Messages:** Avoid using special characters in messages to prevent the generation of temporary files.

## Git Workflow Preferences

-   **Commit Initiation:** Initiate commits by typing `commit`.
-   **Automatic Staging:** When `commit` is requested, automatically stage all relevant modified files.
-   **Commit Message Format:**
    *   Start with a conventional commit type (e.g., `feat:`, `fix:`).
    *   Concise, imperative subject line (max 50-72 chars).
    *   Optional body for detailed explanation (why, not just what).
    *   **Example:**
        ```
        feat: Add new feature X

        - Implemented functionality for Y.
        - Fixed bug Z related to A.
        - Improved performance by B.
        ```
-   **Commit Behavior:** After making code changes, propose a draft commit message. Do not automatically commit changes; await user confirmation.
-   **Confirmation:** After proposing a commit message, confirm with `yes` or `no` to proceed with the commit.
-   **No Push:** Never push changes to a remote repository without explicit instruction.

## Problem Solving

-   **Detailed Explanation for Issues:** When problems arise, provide a clear analysis and proposed plan.
-   **Robust Solutions:** Prefer robust, cross-platform solutions.