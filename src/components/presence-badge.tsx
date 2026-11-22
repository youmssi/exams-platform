import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

/** Online or offline, said in words and not only by colour. */
export function PresenceBadge({ online }: { online: boolean }) {
  const t = useTranslations("presence");
  return (
    <Badge variant={online ? "default" : "outline"}>
      <span
        aria-hidden
        className={
          online
            ? "size-1.5 rounded-full bg-current"
            : "size-1.5 rounded-full border border-current"
        }
      />
      {online ? t("online") : t("offline")}
    </Badge>
  );
}
