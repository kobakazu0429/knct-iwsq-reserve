import React, { useCallback, useMemo } from "react";
import type { NextPage } from "next";
import useSWR from "swr";
import { formatISO9075 } from "date-fns";
import { Dashboard } from "../../../layouts/dashboard";
import { useStyletron } from "baseui";
import {
  StatefulDataTable,
  StringColumn,
  BatchAction,
} from "baseui/data-table";
import { useTrpc } from "../../../trpc";
import { type Role } from "../../../prisma/user";
import { AppRouterOutput } from "../../../server/routers";

type User = AppRouterOutput["users"]["get"][number];

const columns = [
  StringColumn({
    title: "ID",
    mapDataToValue: (data: User) => data.id,
  }),
  StringColumn({
    title: "名前",
    mapDataToValue: (data: User) => data.name,
  }),
  StringColumn({
    title: "Role",
    mapDataToValue: (data: User) => data.role,
  }),
  StringColumn({
    title: "メール",
    mapDataToValue: (data: User) => data.email ?? "",
  }),
  StringColumn({
    title: "更新日時",
    mapDataToValue: (data: User) => formatISO9075(new Date(data.updatedAt)),
  }),
  StringColumn({
    title: "作成日時",
    mapDataToValue: (data: User) => formatISO9075(new Date(data.createdAt)),
  }),
];

const UsersPage: NextPage = () => {
  const [css] = useStyletron();
  const trpc = useTrpc();
  const { data, error, isLoading, mutate } = useSWR("users", () => {
    return trpc.users.get.query();
  });

  if (error) {
    console.log("error", error);
  }

  const tableData = useMemo(() => {
    return data?.map((v) => ({ id: v.id, data: v })) ?? [];
  }, [data]);

  const updateRole = useCallback(
    async (inputs: { id: string; role: Role }[]) => {
      const result = await trpc.users.update.mutate(inputs);
      await mutate(result.data);
    },
    [mutate, trpc]
  );

  const batchActions: BatchAction[] = [
    {
      label: "DENYに変更する",
      onClick: async ({ selection, clearSelection }) => {
        const inputs = selection.map(
          (r) =>
            ({
              id: r.id as string,
              role: "DENY",
            } as const)
        );
        await updateRole(inputs);
        clearSelection();
      },
    },
    {
      label: "ゲストに変更する",
      onClick: async ({ selection, clearSelection }) => {
        const inputs = selection.map(
          (r) =>
            ({
              id: r.id as string,
              role: "GUEST",
            } as const)
        );
        await updateRole(inputs);
        clearSelection();
      },
    },
    {
      label: "TAに変更する",
      onClick: async ({ selection, clearSelection }) => {
        const inputs = selection.map(
          (r) =>
            ({
              id: r.id as string,
              role: "TEACHING_ASSISTANT",
            } as const)
        );
        await updateRole(inputs);
        clearSelection();
      },
    },
    {
      label: "ADMINに変更する",
      onClick: async ({ selection, clearSelection }) => {
        const inputs = selection.map(
          (r) =>
            ({
              id: r.id as string,
              role: "ADMIN",
            } as const)
        );
        await updateRole(inputs);
        clearSelection();
      },
    },
  ];

  return (
    <Dashboard authorizedRoles="ADMIN">
      <div className={css({ height: "800px", width: "100%" })}>
        <StatefulDataTable
          columns={columns}
          rows={tableData}
          batchActions={batchActions}
          loading={isLoading}
          loadingMessage="読み込み中"
        />
      </div>
    </Dashboard>
  );
};

export default UsersPage;
