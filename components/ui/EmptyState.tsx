import { cx } from "@/lib/cx";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";

type Props = {
  icon: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({ icon, title, description, actionLabel, onAction, className }: Props) {
  return (
    <div
      className={cx(
        "flex flex-col items-center gap-2 rounded-(--radius-card) bg-surface px-6 py-8 text-center",
        className,
      )}
    >
      <span className="text-ink-secondary">
        <Icon name={icon} size="xlarge" />
      </span>
      <h2 className="t-title-3 text-ink">{title}</h2>
      {description && <p className="t-subheadline max-w-xs text-ink-tertiary">{description}</p>}
      {actionLabel && (
        <>
          <div className="h-2" />
          <Button fullWidth={false} onClick={onAction} className="w-55">
            {actionLabel}
          </Button>
        </>
      )}
    </div>
  );
}
