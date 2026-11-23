"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/client";

/** What users flagged and what they asked to add to the catalogue, to handle one by one. */
export function AdminInbox() {
  const t = useTranslations("admin.inbox");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(trpc.admin.inbox.queryOptions());
  const handle = useMutation(
    trpc.admin.handle.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.inbox.queryKey(),
        });
        toast.success(t("handled"));
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );
  const when = (date: Date | string) =>
    format.dateTime(new Date(date), {
      dateStyle: "medium",
      timeStyle: "short",
    });
  const empty = (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>{t("empty.title")}</EmptyTitle>
        <EmptyDescription>{t("empty.description")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-semibold text-2xl">{t("title")}</h1>
      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">
            {t("reports")}{" "}
            <Badge variant="secondary">{data.reports.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="catalog">
            {t("catalogRequests")}{" "}
            <Badge variant="secondary">{data.catalogRequests.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reports" className="pt-4">
          {data.reports.length === 0 ? (
            empty
          ) : (
            <ItemGroup>
              {data.reports.map((report) => (
                <Item key={report.id} variant="outline" className="flex-wrap">
                  <ItemContent className="min-w-0">
                    <ItemTitle className="flex-wrap">
                      {t(`categories.${report.category}`)}
                      <Badge variant="outline">
                        {t(`targets.${report.targetType}`)}
                      </Badge>
                    </ItemTitle>
                    <ItemDescription className="line-clamp-none">
                      {report.message && (
                        <>
                          {report.message}
                          <br />
                        </>
                      )}
                      {report.reporter.email} · {when(report.createdAt)} ·{" "}
                      {report.targetId}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={handle.isPending}
                      onClick={() =>
                        handle.mutate({ kind: "report", id: report.id })
                      }
                    >
                      {t("markHandled")}
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </TabsContent>
        <TabsContent value="catalog" className="pt-4">
          {data.catalogRequests.length === 0 ? (
            empty
          ) : (
            <ItemGroup>
              {data.catalogRequests.map((request) => (
                <Item key={request.id} variant="outline" className="flex-wrap">
                  <ItemContent className="min-w-0">
                    <ItemTitle>{t(`kinds.${request.kind}`)}</ItemTitle>
                    <ItemDescription className="line-clamp-none">
                      {request.details}
                      <br />
                      {request.officialUrl && (
                        <>
                          <a
                            href={request.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {request.officialUrl}
                          </a>
                          <br />
                        </>
                      )}
                      {request.requester.email} · {when(request.createdAt)}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={handle.isPending}
                      onClick={() =>
                        handle.mutate({
                          kind: "catalogRequest",
                          id: request.id,
                        })
                      }
                    >
                      {t("markHandled")}
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
