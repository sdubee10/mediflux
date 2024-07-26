/** @format */

import { MaterialReactTable, MRT_ColumnDef, MRT_Row, MRT_TableInstance, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_KO } from "material-react-table/locales/ko";
import { CREATE_RECORD, DELETE_RECORD, LOCK_RECORD, ROLE, SAVE_RECORD, SCHEDULING_ROOM_ID, UNLOCK_RECORD } from "shared";
import { DEFAULT_RECORD_COLOR, EDITING_RECORD_COLOR, NEW_READY_RECORD_COLOR, TABLE_CONTAINER_HEIGHT, TABLE_HEIGHT, TABLE_PAPER_HEIGHT } from "~/constant";
import { PRecord } from "~/type";
import { emitLockRecord, onCreateRecord, onDeleteRecord, onLockRecord, onSaveRecord, onUnlockRecord } from "~/utils/Table/socket";
import SchedulingTableTopToolbar from "./SchedulingTableTopToolbar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  checkinTimeColumn,
  chartNumberColumn,
  patientNameColumn,
  opReadinessColumn,
  treatment1Column,
  quantitytreat1Column,
  treatmentRoomColumn,
  doctorColumn,
  anesthesiaNoteColumn,
  skincareSpecialist1Column,
  skincareSpecialist2Column,
  nursingStaff1Column,
  nursingStaff2Column,
  coordinatorColumn,
  consultantColumn,
  commentCautionColumn,
} from "~/utils/Table/columnDef";
import { useCreatePRecord, useGetPRecords, useUpdatePRecord, useDeletePRecord } from "~/utils/Table/crud";
import { useRecoilValue } from "recoil";
import { userState } from "~/recoil_state";
import { getTableType, handleCreatePRecord, handleEditingCancel, handleSavePRecord } from "~/utils/utils";
import { Socket } from "socket.io-client";
import SchedulingTableRow from "~/components/Table/SchedulingTableRowAction";
import dayjs from "dayjs";
import { AssignmentDialog, DeleteRecordDialog } from "./Dialogs";

type props = {
  socket: Socket | null;
};

const ReadyTable = () => {
  // const { mutate: createReadyPRecord, mutateAsync: createReadyPRecordWithDB, isPending: isCreatingReadyPRecord } = useCreatePRecord("Ready_PRecord");
  // const { data: fetchedReadyPRecords, isError: isLoadingReadyPRecordsError, isFetching: isFetchingReadyPRecords, isLoading: isLoadingReadyPRecords } = useGetPRecords("Ready_PRecord");
  // const { mutate: updateReadyPRecord, mutateAsync: updateReadyPRecordWithDB, isPending: isUpdatingReadyPRecord, error: updateError } = useUpdatePRecord("Ready_PRecord");
  // const { mutate: deleteReadyPRecord, mutateAsync: _, isPending: isDeletingReadyPRecord } = useDeletePRecord("Ready_PRecord");
  // const { mutate: createExceptReadyPRecord } = useCreatePRecord("ExceptReady_PRecord");
  // const audioRef = useRef<HTMLAudioElement>(null);
  // const [openAssignModal, setOpenAssignModal] = useState(false);
  // const [openDeleteModal, setOpenDeleteModal] = useState(false);
  // const actionPRecord = useRef<PRecord>();
  // const user = useRecoilValue(userState);
  // useEffect(() => {
  //   if (!socket) return;
  //   socket.on(LOCK_RECORD, (arg) => onLockRecord(arg, readyTable, updateReadyPRecord, "Ready"));
  //   socket.on(UNLOCK_RECORD, (arg) => onUnlockRecord(arg, readyTable, updateReadyPRecord, "Ready"));
  //   socket.on(SAVE_RECORD, (arg) => onSaveRecord(arg, readyTable, updateReadyPRecord, "Ready"));
  //   socket.on(CREATE_RECORD, (arg) => onCreateRecord(arg, createReadyPRecord, "Ready", audioRef));
  //   socket.on(DELETE_RECORD, (arg) => onDeleteRecord(arg, deleteReadyPRecord, "Ready"));
  //   return () => {
  //     socket.off(LOCK_RECORD);
  //     socket.off(UNLOCK_RECORD);
  //     socket.off(SAVE_RECORD);
  //     socket.off(CREATE_RECORD);
  //     socket.off(DELETE_RECORD);
  //     socket.disconnect();
  //   };
  // }, [socket]);
  // const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  // const readyColumns = useMemo<MRT_ColumnDef<PRecord>[]>(
  //   () => [
  //     checkinTimeColumn(actionPRecord),
  //     chartNumberColumn,
  //     patientNameColumn,
  //     opReadinessColumn(actionPRecord, "Ready"),
  //     treatment1Column(actionPRecord),
  //     quantitytreat1Column,
  //     treatmentRoomColumn,
  //     doctorColumn(actionPRecord),
  //     anesthesiaNoteColumn,
  //     skincareSpecialist1Column(actionPRecord),
  //     skincareSpecialist2Column(actionPRecord),
  //     nursingStaff1Column(actionPRecord),
  //     nursingStaff2Column(actionPRecord),
  //     coordinatorColumn(actionPRecord),
  //     consultantColumn(actionPRecord),
  //     commentCautionColumn,
  //   ],
  //   []
  // );
  // const readyTable: MRT_TableInstance<PRecord> = useMaterialReactTable({
  //   columns: readyColumns,
  //   // memoMode: "table",
  //   data: fetchedReadyPRecords ? fetchedReadyPRecords : [],
  //   localization: MRT_Localization_KO,
  //   enableBottomToolbar: true,
  //   initialState: {
  //     columnPinning: { left: ["mrt-row-actions"] },
  //     density: "compact",
  //     pagination: {
  //       pageSize: 10,
  //       pageIndex: 0,
  //     },
  //   },
  //   muiPaginationProps: {
  //     rowsPerPageOptions: [5, 10, 15, 20],
  //   },
  //   createDisplayMode: "modal", // ('modal', and 'custom' are also available)
  //   editDisplayMode: "modal", // ('modal', 'cell', 'table', and 'custom' are also available)
  //   enableEditing: true,
  //   enableColumnResizing: true,
  //   enableRowActions: true,
  //   muiTableHeadCellProps: {
  //     sx: {
  //       "& .Mui-TableHeadCell-Content": {
  //         justifyContent: "center",
  //       },
  //     },
  //   },
  //   muiTableContainerProps: () => {
  //     return {
  //       sx: {
  //         height: TABLE_CONTAINER_HEIGHT,
  //       },
  //     };
  //   },
  //   muiTableProps: ({}) => ({
  //     sx: {
  //       width: "full",
  //       height: TABLE_HEIGHT,
  //     },
  //   }),
  //   muiTablePaperProps: ({}) => ({
  //     sx: {
  //       height: TABLE_PAPER_HEIGHT,
  //       maxHeight: "800px",
  //     },
  //   }),
  //   muiToolbarAlertBannerProps: isLoadingReadyPRecordsError
  //     ? {
  //         color: "error",
  //         children: "Error loading data",
  //       }
  //     : undefined,
  //   muiTableBodyRowProps: ({ row, table }) => {
  //     const { density } = table.getState();
  //     let backgroundColor = DEFAULT_RECORD_COLOR;
  //     let add5m = dayjs().add(5, "minute").unix();
  //     if (row.original.LockingUser && row.original.LockingUser.id != user?.id) {
  //       backgroundColor = EDITING_RECORD_COLOR;
  //     } else if (row.original.readyTime && row.original.readyTime <= add5m && row.original.opReadiness === "Y") {
  //       backgroundColor = NEW_READY_RECORD_COLOR;
  //     }
  //     return {
  //       sx: {
  //         // backgroundColor,
  //         pointerEvents: row.original.LockingUser && row.original.LockingUser?.id != user?.id ? "none" : "default",
  //         height: `${density === "compact" ? 45 : density === "comfortable" ? 50 : 57}px`,
  //         cursor: user?.role === ROLE.DOCTOR ? "pointer" : "default",
  //       },
  //       onDoubleClick: () => {
  //         if (user?.role === ROLE.DOCTOR) {
  //           handleOpenAssignModal(row);
  //         } else {
  //           actionPRecord.current = JSON.parse(JSON.stringify(row.original));
  //           table.setEditingRow(row);
  //         }
  //       },
  //     };
  //   },
  //   muiTableBodyCellProps: ({ row }) => ({
  //     onDoubleClick: async () => {
  //       if (row.original.LockingUser) {
  //         return;
  //       }
  //     },
  //   }),
  //   onCreatingRowCancel: () => {
  //     actionPRecord.current = undefined;
  //     setValidationErrors({});
  //   },
  //   onCreatingRowSave: ({ table, values }) => handleCreatePRecord(table, createReadyPRecordWithDB, socket, "Ready", values, actionPRecord),
  //   onEditingRowCancel: ({ row }) => handleEditingCancel(row, "Ready", socket, actionPRecord),
  //   onEditingRowSave: ({ row, table, values }) => handleSavePRecord(row, table, "Ready", values, actionPRecord, updateReadyPRecordWithDB, createExceptReadyPRecord, socket, user),
  //   renderRowActions: ({ row, table }) => (
  //     <SchedulingTableRow
  //       originalPRecord={actionPRecord}
  //       row={row}
  //       table={table}
  //       emitLockRecord={emitLockRecord}
  //       socket={socket}
  //       openDeleteConfirmModal={() => handleOpenDeleteModal(row)}
  //       tableType="Ready"
  //       roomId={SCHEDULING_ROOM_ID}
  //     />
  //   ),
  //   renderTopToolbarCustomActions: ({ table }) => <SchedulingTableTopToolbar originalPRecord={actionPRecord} table={table} tableType="Ready" />,
  //   getRowId: (originalRow) => originalRow.id,
  //   state: {
  //     isLoading: isLoadingReadyPRecords,
  //     isSaving: isCreatingReadyPRecord || isUpdatingReadyPRecord || isDeletingReadyPRecord,
  //     showAlertBanner: isLoadingReadyPRecordsError,
  //     showProgressBars: isFetchingReadyPRecords,
  //   },
  // });
  // const handleOpenAssignModal = (row: MRT_Row<PRecord>) => {
  //   setOpenAssignModal(true);
  //   actionPRecord.current = JSON.parse(JSON.stringify(row.original));
  //   if (actionPRecord.current) {
  //     emitLockRecord(actionPRecord.current.id, getTableType(actionPRecord.current.opReadiness), socket, user, SCHEDULING_ROOM_ID);
  //   }
  // };
  // const handleOpenDeleteModal = (row: MRT_Row<PRecord>) => {
  //   setOpenDeleteModal(true);
  //   actionPRecord.current = JSON.parse(JSON.stringify(row.original));
  //   if (actionPRecord.current) {
  //     emitLockRecord(actionPRecord.current.id, "Ready", socket, user, SCHEDULING_ROOM_ID);
  //   }
  // };
  // return (
  //   user &&
  //   readyTable && (
  //     <>
  //       <audio className="hidden" ref={audioRef} src={"../../assets/sounds/new_record_ready_noti.mp3"} controls />
  //       <AssignmentDialog createExceptReadyFn={createExceptReadyPRecord} modalOpen={openAssignModal} setModalOpen={setOpenAssignModal} actionPRecord={actionPRecord} socket={socket} />
  //       <DeleteRecordDialog modalOpen={openDeleteModal} setModalOpen={setOpenDeleteModal} deleteFn={deleteReadyPRecord} actionPRecord={actionPRecord} socket={socket} />
  //       <MaterialReactTable table={readyTable} />
  //     </>
  //   )
  // );
};

export default ReadyTable;
