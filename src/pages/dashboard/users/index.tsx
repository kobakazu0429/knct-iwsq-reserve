import React, { useCallback, useMemo } from "react";
import type { NextPage } from "next";
import useSWR from "swr";
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
import { formatDatetime } from "../../../utils/date";

type User = AppRouterOutput["admin"]["users"]["list"][number];

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
    mapDataToValue: (data: User) => formatDatetime(new Date(data.updatedAt)),
  }),
  StringColumn({
    title: "作成日時",
    mapDataToValue: (data: User) => formatDatetime(new Date(data.createdAt)),
  }),
];

const UsersPage: NextPage = () => {
  const [css] = useStyletron();
  const trpc = useTrpc();
  const { data, error, isLoading, mutate } = useSWR("users", () => {
    return trpc.admin.users.list.query();
  });

  if (error) {
    console.log("error", error);
  }

  const tableData = useMemo(() => {
    return data?.map((v) => ({ id: v.id, data: v })) ?? [];
  }, [data]);

  const updateRole = useCallback(
    async (input: { id: string[]; role: Role }) => {
      await trpc.admin.users.update.mutate(input);
      await mutate();
    },
    [mutate, trpc]
  );

  const batchActions: BatchAction[] = [
    {
      label: "DENYに変更する",
      onClick: async ({ selection, clearSelection }) => {
        await updateRole({
          id: selection.map((s) => s.id as string),
          role: "DENY",
        });
        clearSelection();
      },
    },
    {
      label: "ゲストに変更する",
      onClick: async ({ selection, clearSelection }) => {
        await updateRole({
          id: selection.map((s) => s.id as string),
          role: "GUEST",
        });
        clearSelection();
      },
    },
    {
      label: "TAに変更する",
      onClick: async ({ selection, clearSelection }) => {
        await updateRole({
          id: selection.map((s) => s.id as string),
          role: "TEACHING_ASSISTANT",
        });
        clearSelection();
      },
    },
    {
      label: "ADMINに変更する",
      onClick: async ({ selection, clearSelection }) => {
        await updateRole({
          id: selection.map((s) => s.id as string),
          role: "ADMIN",
        });
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
