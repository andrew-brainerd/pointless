import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { NotificationDoc } from '@/types/notification';

const { mockUseNotifications, mockMarkAllMutate, mockMarkReadMutate, mockDismissMutate } =
  vi.hoisted(() => ({
    mockUseNotifications: vi.fn(),
    mockMarkAllMutate: vi.fn(),
    mockMarkReadMutate: vi.fn(),
    mockDismissMutate: vi.fn(),
  }));

vi.mock('@/queries/notifications', () => ({
  useNotifications: mockUseNotifications,
  useMarkAllRead: () => ({ mutate: mockMarkAllMutate, isPending: false }),
  useMarkNotificationRead: () => ({ mutate: mockMarkReadMutate, isPending: false }),
  useDismissNotification: () => ({ mutate: mockDismissMutate, isPending: false }),
}));

const { NotificationsDrawer } = await import('./NotificationsDrawer');

const makeNotif = (overrides: Partial<NotificationDoc> = {}): NotificationDoc => ({
  _id: 'n-1',
  userUid: 'u-1',
  type: 'pool_invite',
  title: 'Pool invite',
  body: 'Alice invited you to "Friday Football"',
  link: '/invites/abc',
  payload: {},
  isRead: false,
  isDismissed: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

afterEach(() => vi.clearAllMocks());

describe('NotificationsDrawer', () => {
  it('renders nothing when closed', () => {
    mockUseNotifications.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<NotificationsDrawer isOpen={false} onClose={() => undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the "all caught up" empty state when no notifications', () => {
    mockUseNotifications.mockReturnValue({ data: [], isLoading: false });
    render(<NotificationsDrawer isOpen={true} onClose={() => undefined} />);
    expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
  });

  it('lists notifications and renders a Mark all read button', () => {
    mockUseNotifications.mockReturnValue({
      data: [makeNotif({ _id: 'n-1' }), makeNotif({ _id: 'n-2', title: 'Wager settled' })],
      isLoading: false,
    });
    render(<NotificationsDrawer isOpen={true} onClose={() => undefined} />);
    expect(screen.getByText(/pool invite/i)).toBeInTheDocument();
    expect(screen.getByText(/wager settled/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark all read/i })).toBeInTheDocument();
  });

  it('clicking "Mark all read" fires the mutation', () => {
    mockUseNotifications.mockReturnValue({ data: [makeNotif()], isLoading: false });
    render(<NotificationsDrawer isOpen={true} onClose={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: /mark all read/i }));
    expect(mockMarkAllMutate).toHaveBeenCalledOnce();
  });

  it('clicking the dismiss × on an item fires the dismiss mutation', () => {
    mockUseNotifications.mockReturnValue({ data: [makeNotif({ _id: 'n-99' })], isLoading: false });
    render(<NotificationsDrawer isOpen={true} onClose={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(mockDismissMutate).toHaveBeenCalledWith('n-99');
  });

  it('clicking a notification body marks it read and fires onClose', () => {
    mockUseNotifications.mockReturnValue({
      data: [makeNotif({ _id: 'n-77', title: 'Click me', link: null })],
      isLoading: false,
    });
    const onClose = vi.fn();
    render(<NotificationsDrawer isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(mockMarkReadMutate).toHaveBeenCalledWith('n-77');
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call markRead when the notification is already read (just closes)', () => {
    mockUseNotifications.mockReturnValue({
      data: [makeNotif({ _id: 'n-r', title: 'Already read', isRead: true, link: null })],
      isLoading: false,
    });
    const onClose = vi.fn();
    render(<NotificationsDrawer isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /already read/i }));
    expect(mockMarkReadMutate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
