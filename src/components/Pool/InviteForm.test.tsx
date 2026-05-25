import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InviteForm } from './InviteForm';

const { mockMutateAsync } = vi.hoisted(() => ({ mockMutateAsync: vi.fn() }));

vi.mock('@/queries/pools', () => ({
  useCreateInvite: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

afterEach(() => {
  vi.clearAllMocks();
  mockMutateAsync.mockReset();
});

describe('InviteForm', () => {
  it('submits the typed email to createInvite', async () => {
    mockMutateAsync.mockResolvedValueOnce({ status: 'created', invite: { _id: 'i1' } });
    render(<InviteForm poolId="p-1" />);
    const input = screen.getByPlaceholderText(/friend@example/i);
    fireEvent.change(input, { target: { value: 'newbie@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send invite/i }));
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ invitedEmail: 'newbie@example.com' });
    });
    expect(await screen.findByText(/invite sent to newbie@example.com/i)).toBeInTheDocument();
  });

  it('shows an already-member message when the BE returns that status', async () => {
    mockMutateAsync.mockResolvedValueOnce({ status: 'already_member', invite: { _id: 'i1' } });
    render(<InviteForm poolId="p-1" />);
    fireEvent.change(screen.getByPlaceholderText(/friend@example/i), {
      target: { value: 'existing@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send invite/i }));
    expect(await screen.findByText(/already a member/i)).toBeInTheDocument();
  });

  it('surfaces an API error', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Network down'));
    render(<InviteForm poolId="p-1" />);
    fireEvent.change(screen.getByPlaceholderText(/friend@example/i), {
      target: { value: 'someone@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send invite/i }));
    expect(await screen.findByText(/network down/i)).toBeInTheDocument();
  });
});
