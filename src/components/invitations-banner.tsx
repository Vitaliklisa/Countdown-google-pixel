import { useCallback, useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { acceptInvitation, getInvitations, rejectInvitation } from "@/lib/events.api";
import { Button } from "@/components/ui/button";

type PendingInvite = {
  id: string;
  eventId: string;
  eventTitle: string;
  role: string;
};

/**
 * Pending shared-event invitations for the signed-in user, with accept/decline.
 *
 * This is the receiving half of sharing: `inviteUser` writes an invitation by
 * email (possibly before that account even existed). Once the invitee signs in
 * here — on any device — accepting creates the `event_participants` row, which is
 * what makes `listEvents` start returning the shared event everywhere they log
 * in. Without this, an invited person could never actually join.
 *
 * Renders nothing when signed out or when there is nothing pending, so it costs
 * a browser session no layout.
 */
export function InvitationsBanner({ onAccepted }: { onAccepted?: () => void }) {
  const { user, isPending } = useCurrentUserState();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const rows = (await getInvitations()) as unknown as PendingInvite[];
      setInvites(Array.isArray(rows) ? rows : []);
    } catch {
      // Not signed in yet, or offline — simply show nothing.
      setInvites([]);
    }
  }, []);

  useEffect(() => {
    if (isPending || !user?.id) {
      setInvites([]);
      return;
    }
    void load();
  }, [load, user?.id, isPending]);

  if (!user?.id || invites.length === 0) return null;

  async function respond(invite: PendingInvite, accept: boolean) {
    setBusyId(invite.id);
    try {
      if (accept) {
        await acceptInvitation({ data: { invitationId: invite.id } });
        onAccepted?.();
      } else {
        await rejectInvitation({ data: { invitationId: invite.id } });
      }
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } catch {
      // Leave the invite visible so the user can retry.
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border-border bg-surface p-3">
      <span className="text-xs font-medium tracking-brand text-muted uppercase">
        Shared with you
      </span>
      <ul className="flex flex-col gap-2">
        {invites.map((invite) => (
          <li
            key={invite.id}
            className="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-fg">
                {invite.eventTitle}
              </span>
              <span className="block text-[10px] text-muted capitalize">
                invited as {invite.role}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                disabled={busyId === invite.id}
                onClick={() => void respond(invite, false)}
              >
                Decline
              </Button>
              <Button
                size="sm"
                disabled={busyId === invite.id}
                onClick={() => void respond(invite, true)}
              >
                Join
              </Button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
