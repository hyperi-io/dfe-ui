import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

/** A name test opens its form through RBAC and a drawer transition, so it gets a wider backstop than the 20s default. */
export const NAME_RULE_TEST_TIMEOUT_MS = 60_000;

/**
 * Drives one name input through values the engine accepts and values it
 * refuses, and checks the form shows the rule's message for exactly the refused
 * ones. Each value flips the input between showing and not showing the message,
 * so a message that never changes cannot pass.
 */
export const expectNameRule = async ({
  input,
  message,
  accepts,
  refuses,
  badBaseline = ' ',
}: {
  input: HTMLElement;
  message: string;
  accepts: string[];
  refuses: string[];
  /** A value the rule refuses, to start from. */
  badBaseline?: string;
}) => {
  const user = userEvent.setup({ delay: null });
  const firstAccepted = accepts[0] ?? 'a';
  const firstRefused = refuses[0] ?? badBaseline;

  const type = async (value: string) => {
    await user.clear(input);
    if (value !== '') {
      await user.paste(value);
    }
  };
  const expectRefused = async (value: string) => {
    await type(value);
    expect(await screen.findByText(message)).toBeInTheDocument();
  };
  const expectAccepted = async (value: string) => {
    await type(value);
    await waitFor(() =>
      expect(screen.queryByText(message)).not.toBeInTheDocument(),
    );
  };

  await expectRefused(badBaseline);
  let showing = true;
  const accept = async (value: string) => {
    if (!showing) {
      await expectRefused(firstRefused);
    }
    await expectAccepted(value);
    showing = false;
  };
  const refuse = async (value: string) => {
    if (showing) {
      await expectAccepted(firstAccepted);
    }
    await expectRefused(value);
    showing = true;
  };

  for (let i = 0; i < Math.max(accepts.length, refuses.length); i += 1) {
    const accepted = accepts[i];
    const refused = refuses[i];
    if (accepted !== undefined) {
      await accept(accepted);
    }
    if (refused !== undefined) {
      await refuse(refused);
    }
  }
};
