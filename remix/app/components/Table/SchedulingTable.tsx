/** @format */

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import { MutableRefObject, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColDef, RowClassParams, RowStyle, CellEditingStoppedEvent, CellEditingStartedEvent, GridApi, TabToNextCellParams } from "ag-grid-community";
import { CustomAgGridReactProps, PRecord, SearchHelp, TableType } from "~/type";
import {
  anesthesiaNoteColumn,
  chartNumberColumn,
  createdAtColumn,
  commentCautionColumn,
  consultantColumn,
  coordinatorColumn,
  doctorColumn,
  nursingStaff1Column,
  nursingStaff2Column,
  opReadinessColumn,
  patientNameColumn,
  quantitytreat1Column,
  skincareSpecialist1Column,
  skincareSpecialist2Column,
  treatmentColumn,
  treatmentRoomColumn,
} from "~/utils/Table/columnDef";
import "../../css/Table.css";
import { LOCK_RECORD, UNLOCK_RECORD, SAVE_RECORD, CREATE_RECORD, DELETE_RECORD } from "shared";
import { onLockRecord, onUnlockRecord, onSaveRecord, onDeleteRecord, emitLockRecord, emitSaveRecord, onCreateRecord, emitUnlockRecord } from "~/utils/Table/socket";
import { Socket } from "socket.io-client";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, userState } from "~/recoil_state";
import { TableAction } from "./TableAction";
import { checkIsInvaildRecord, getEditingCell, moveRecord } from "~/utils/utils";
import { getAllVacantRooms, lockOrUnlockRecords, updateRecord } from "~/utils/request.client";
import {
  LOCKING_USER,
  OP_READINESS_C,
  OP_READINESS_Y,
  OP_READINESS,
  TREATMENT1,
  TREATMENT1_H,
  TREATMENT2,
  TREATMENT2_H,
  TREATMENT3,
  TREATMENT3_H,
  TREATMENT4,
  TREATMENT4_H,
  TREATMENT5,
  TREATMENT5_H,
  TEST_TAG,
} from "~/constant";

type SchedulingTableProps = {
  socket: Socket | null;
  gridRef: RefObject<CustomAgGridReactProps<PRecord>>;
  theOtherGridRef?: RefObject<CustomAgGridReactProps<PRecord>>;
  tableType: TableType;
  roomId: string;
  records: PRecord[];
  treatmentSearchHelp: SearchHelp[];
  doctorSearchHelp: SearchHelp[];
};

const SchedulingTable: React.FC<SchedulingTableProps> = ({ socket, gridRef, theOtherGridRef, tableType, roomId, records, treatmentSearchHelp, doctorSearchHelp }) => {
  const user = useRecoilValue(userState);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [rowData, setRowData] = useState<PRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const onLineChangingdEditingStoppedRef = useRef(false);
  const isTabPressed = useRef<boolean>(false);
  const [colDefs, setColDefs] = useState<ColDef<PRecord, any>[]>([]);

  const showErrorSnackbar = useCallback(
    (message: string) => {
      setGlobalSnackBar({ open: true, msg: message, severity: "error" });
    },
    [setGlobalSnackBar]
  );

  // Add custom tracnsaction event listener
  useEffect(() => {
    const handleLineChangingTransactionApplied = (onLineChangingdEditingStoppedRef: MutableRefObject<boolean>) => {
      if (getEditingCell(gridRef)) {
        onLineChangingdEditingStoppedRef.current = true;
      }
    };

    if (gridRef.current && gridRef.current.api) {
      const api = gridRef.current.api;
      api.addEventListener<any>("onLineChangingTransactionApplied", () => handleLineChangingTransactionApplied(onLineChangingdEditingStoppedRef));
    }

    return () => {
      if (gridRef.current && gridRef.current.api) {
        const api = gridRef.current.api;
        api.removeEventListener<any>("onLineChangingTransactionApplied", () => handleLineChangingTransactionApplied(onLineChangingdEditingStoppedRef));
      }
    };
  }, [gridRef.current]);

  // Socket setting
  useEffect(() => {
    if (!socket) return;
    socket.on(LOCK_RECORD, (arg) => onLockRecord(arg, gridRef, tableType));
    socket.on(UNLOCK_RECORD, (arg) => onUnlockRecord(arg, gridRef, tableType));
    socket.on(SAVE_RECORD, (arg) => onSaveRecord(arg, gridRef, tableType, theOtherGridRef));
    socket.on(CREATE_RECORD, (arg) => onCreateRecord(arg, gridRef, tableType, audioRef));
    socket.on(DELETE_RECORD, (arg) => onDeleteRecord(arg, gridRef, tableType));

    return () => {
      socket.off(LOCK_RECORD);
      socket.off(UNLOCK_RECORD);
      socket.off(SAVE_RECORD);
      socket.off(CREATE_RECORD);
      socket.off(DELETE_RECORD);
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    setColDefs([
      { field: "id", headerName: "id", hide: true },
      createdAtColumn,
      chartNumberColumn,
      patientNameColumn,
      opReadinessColumn,
      treatmentColumn(TREATMENT1, TREATMENT1_H, tableType, treatmentSearchHelp),
      treatmentColumn(TREATMENT2, TREATMENT2_H, tableType, treatmentSearchHelp),
      treatmentColumn(TREATMENT3, TREATMENT3_H, tableType, treatmentSearchHelp),
      treatmentColumn(TREATMENT4, TREATMENT4_H, tableType, treatmentSearchHelp),
      treatmentColumn(TREATMENT5, TREATMENT5_H, tableType, treatmentSearchHelp),
      quantitytreat1Column,
      treatmentRoomColumn,
      doctorColumn(doctorSearchHelp, setGlobalSnackBar),
      anesthesiaNoteColumn,
      skincareSpecialist1Column,
      skincareSpecialist2Column,
      nursingStaff1Column,
      nursingStaff2Column,
      coordinatorColumn,
      consultantColumn,
      commentCautionColumn,
      { field: LOCKING_USER, headerName: "lock", hide: true },
    ]);
  }, [doctorSearchHelp, treatmentSearchHelp]);

  // Get records and process unlocked records.
  useEffect(() => {
    if (!socket || !user || !records) return;
    const processData = async () => {
      try {
        setIsLoading(true);
        const mustBeUnlocked = [];

        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          if (record.lockingUser === user?.id) {
            record.lockingUser = null;
            mustBeUnlocked.push(record.id);
            break;
          }
        }

        await lockOrUnlockRecords(mustBeUnlocked, null, TEST_TAG);
        mustBeUnlocked.forEach((id) => emitUnlockRecord(id, tableType, socket, roomId));
        records.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        setRowData(records);
      } catch (error) {
        showErrorSnackbar("Internal server error");
      } finally {
        setIsLoading(false);
      }
    };

    processData();
  }, [user, socket, records]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      editable: true,
    };
  }, []);

  const getRowStyle = (params: RowClassParams<PRecord>): RowStyle | undefined => {
    const transition = "all 0.2s ease, color 0.2s ease";
    if (params.data?.lockingUser && params.data?.lockingUser !== user?.id) {
      return {
        background: "lightgray",
        pointerEvents: "none",
        transition,
      };
    }
    if (params.data?.deleteYN) {
      return {
        display: "none",
      };
    }
    return {
      transition,
    };
  };

  const saveRecord = async (record: PRecord, oldValue: any, newValue: any, field: string, api: GridApi<PRecord>) => {
    record.lockingUser = null;

    // Open modal
    if ((field === OP_READINESS && oldValue !== OP_READINESS_Y && newValue === OP_READINESS_Y) || (oldValue !== OP_READINESS_C && newValue === OP_READINESS_C)) {
      return;
    }

    const copyRecord: PRecord = JSON.parse(JSON.stringify(record));

    try {
      const { etrcondition, rtecondition1, rtecondition2 } = checkIsInvaildRecord(tableType, record);
      const updateResult = await updateRecord(record, TEST_TAG);

      if (updateResult.status === 200) {
        emitSaveRecord([record], tableType, socket, roomId);
        gridRef.current?.api.applyTransaction({
          update: [record],
        });
        if (theOtherGridRef && (etrcondition || rtecondition1 || rtecondition2)) {
          moveRecord(gridRef, theOtherGridRef, record);
        }
      }
    } catch (error) {
      if (field) {
        copyRecord[field] = oldValue;
        copyRecord["lockingUser"] = null;
        await updateRecord(copyRecord, TEST_TAG);
        api.applyTransaction({
          update: [copyRecord],
        });
      }
      showErrorSnackbar("Internal server error");
    }
  };

  const onCellEditingStopped = async (event: CellEditingStoppedEvent<PRecord, any>) => {
    if (isTabPressed.current) {
      isTabPressed.current = false;
      return;
    }

    // Prevents edit mode to be stopped when line changed.
    if (onLineChangingdEditingStoppedRef.current) {
      onLineChangingdEditingStoppedRef.current = false;
      return;
    }

    if (event.data && event.colDef.field && gridRef.current) {
      const data: PRecord = JSON.parse(JSON.stringify(event.data));
      saveRecord(data, event.oldValue, event.newValue, event.colDef.field, gridRef.current.api);
    }
  };

  const onCellEditingStarted = async (event: CellEditingStartedEvent<PRecord, any>) => {
    onLineChangingdEditingStoppedRef.current = false;
    isTabPressed.current = false;

    try {
      const theOtherEditingCell = getEditingCell(theOtherGridRef);
      if (theOtherGridRef && theOtherEditingCell) {
        theOtherGridRef.current?.api.stopEditing();
      }

      if (user && event.data && !event.data.lockingUser) {
        const result = await lockOrUnlockRecords([event.data.id], user.id, TEST_TAG);
        if (result.status === 200) {
          emitLockRecord(event.data?.id, tableType, socket, user, roomId);
          event.data.lockingUser = user.id;
          gridRef.current?.api.applyTransaction({
            update: [event.data],
          });
        }
      }
    } catch (error) {
      showErrorSnackbar("Internal server error");
    }
  };

  const tabToNextCell = (params: TabToNextCellParams<PRecord, any>) => {
    isTabPressed.current = true;

    return params.nextCellPosition;
  };

  const noRowsOverlayComponent = () => {
    return <span>차트가 존재하지 않습니다</span>;
  };

  const rowStyle = {
    fontSize: "0.75rem" /* 12px */,
    lineheight: "1rem" /* 16px */,
  };
  return (
    <div className="ag-theme-quartz" style={{ height: "50%", display: "flex", flexDirection: "column" }}>
      {tableType === "Ready" && <audio className="hidden" ref={audioRef} src={"../../assets/sounds/new_record_ready_noti.mp3"} controls />}
      <TableAction gridRef={gridRef} tableType={tableType} socket={socket} />
      <AgGridReact
        ref={gridRef}
        onCellEditingStopped={onCellEditingStopped}
        onCellEditingStarted={onCellEditingStarted}
        defaultColDef={defaultColDef}
        rowData={rowData}
        columnDefs={colDefs}
        getRowId={(params) => params.data.id}
        pagination={true}
        paginationPageSize={20}
        getRowStyle={getRowStyle}
        rowSelection={"multiple"}
        rowStyle={rowStyle}
        tabToNextCell={tabToNextCell}
        loading={isLoading}
        noRowsOverlayComponent={noRowsOverlayComponent}
      />
    </div>
  );
};

export default SchedulingTable;
