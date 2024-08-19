/** @format */

import { CustomAgGridReactProps, PRecord, SearchHelp, TableType } from "../../type";
import { FC, RefObject, useState, useCallback } from "react";
import { SCHEDULING_ROOM_ID, TREATMENTS } from "shared";
import { emitCreateRecords, emitDeleteRecords, emitSaveRecord } from "~/utils/Table/socket";
import { hideRecords, insertRecords, lockOrUnlockRecords } from "~/utils/request.client";
import {
  checkForUnReadyTreatments,
  convertServerPRecordtToPRecord,
  findCanBeAssignedTreatmentNumber,
  findCanCompleteTreatmentNumber,
  findCanbeReadyTreatmentNumber,
  refreshTreatmentCells,
} from "~/utils/utils";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, userState } from "~/recoil_state";
import { OPREADINESS_C, OPREADINESS_N, OPREADINESS_P, OPREADINESS_Y } from "~/constant";
import dayjs from "dayjs";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Socket } from "socket.io-client";
import { SetTreatmentReadyModal } from "../Modals";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
type TableActionHeader = {
  gridRef: RefObject<CustomAgGridReactProps<PRecord>>;
  tableType: TableType;
  socket: Socket | null;
};

interface ReadyTreatment extends SearchHelp {
  number: number;
}

export const TableAction: FC<TableActionHeader> = ({ gridRef, socket, tableType }) => {
  const user = useRecoilValue(userState);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);

  const [selectedRows, setSelectedRows] = useState<PRecord[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [assignRecord, setAssignRecord] = useState<PRecord | null>(null);
  const [readyTreatment, setReadyTreatment] = useState<ReadyTreatment | null>(null);
  const [setTreatmentReadyModalOpen, setSetTreatmentReadyModalOpen] = useState(false);

  const showErrorSnackbar = useCallback(
    (message: string, severity: "error" | "info" | "success" | "warning" = "error") => {
      setGlobalSnackBar({ open: true, msg: message, severity });
    },
    [setGlobalSnackBar]
  );

  const onAddRecord = async () => {
    try {
      if (!gridRef.current) return;

      const newRecord = { opReadiness: tableType === "ExceptReady" ? "N" : "Y" } as PRecord;
      const { rows } = await insertRecords([newRecord]);

      if (rows?.length) {
        const addedRecord = convertServerPRecordtToPRecord(rows[0]);
        gridRef.current.api.applyTransaction({ add: [addedRecord], addIndex: 0 });
        emitCreateRecords([addedRecord], tableType, socket, SCHEDULING_ROOM_ID);
      }
    } catch (error) {
      showErrorSnackbar("레코드 추가 중 오류가 발생했습니다.");
    }
  };

  const onDeleteRecord = async () => {
    try {
      if (!gridRef.current || !selectedRows.length) throw new Error("삭제할 레코드가 선택되지 않았습니다.");
      const ids = selectedRows.map((record) => record.id);
      const result = await hideRecords(ids);

      if (result.status === 200) {
        gridRef.current.api.applyTransaction({
          remove: selectedRows,
        });
        emitDeleteRecords(ids, tableType, socket, user, SCHEDULING_ROOM_ID);
      } else {
        throw new Error("서버 오류로 레코드를 삭제할 수 없습니다.");
      }
    } catch (error: any) {
      showErrorSnackbar(error.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      handleCloseDeleteModal();
    }
  };
  const handleOpenDeleteModal = async () => {
    if (!gridRef.current || !user) return;

    try {
      const records = gridRef.current.api.getSelectedRows();

      if (records.length === 0) {
        throw new Error("삭제할 레코드가 선택되지 않았습니다.");
      }

      const ids = records.map((record) => record.id);
      setSelectedRows(records);

      const result = await lockOrUnlockRecords(ids, user.id);
      if (result.status === 200) {
        emitSaveRecord(result.data.map(convertServerPRecordtToPRecord), tableType, socket, SCHEDULING_ROOM_ID);
        setOpenDeleteModal(true);
      }
    } catch (error: any) {
      showErrorSnackbar(error.message || "알 수 없는 오류가 발생했습니다.");
    }
  };
  const handleCloseDeleteModal = useCallback(async () => {
    try {
      if (selectedRows.length && user) {
        const result = await lockOrUnlockRecords(
          selectedRows.map((record) => record.id),
          null
        );
        if (result.status === 200) {
          emitSaveRecord(result.data.map(convertServerPRecordtToPRecord), tableType, socket, SCHEDULING_ROOM_ID);
        }
      }
    } catch (error) {
    } finally {
      setOpenDeleteModal(false);
    }
  }, [selectedRows, user, tableType, socket]);

  const handleOpenAssignModal = async () => {
    if (!gridRef.current || !user) return;

    try {
      const records = gridRef.current.api.getSelectedRows();
      if (records.length !== 1) {
        throw new Error(records.length ? "하나의 시술만 선택해주세요." : "시술을 선택해주세요.");
      }
      const record = records[0];

      const result = await lockOrUnlockRecords([record.id], user.id);
      if (result.status === 200) {
        emitSaveRecord(result.data.map(convertServerPRecordtToPRecord), tableType, socket, SCHEDULING_ROOM_ID);
        setAssignRecord(record);
        const treatmentNumber = findCanBeAssignedTreatmentNumber(record);

        if (treatmentNumber === -1) {
          throw new Error("준비된 시술이 없습니다.");
        }

        const treatment = TREATMENTS.find((t) => t.id === record[`treatment${treatmentNumber}`]);
        if (treatmentNumber > 0 && treatment) {
          console.log(treatmentNumber, treatment);
          setReadyTreatment({ number: treatmentNumber, ...treatment });
          setOpenAssignModal(true);
        }
      }
    } catch (error: any) {
      showErrorSnackbar(error.mesasge || "서버 오류로 시술을 배정할 수 없습니다.");
    }
  };
  const handleCloseAssignModal = async () => {
    if (assignRecord) {
      const result = await lockOrUnlockRecords([assignRecord?.id], null);
      if (result.status === 200) {
        emitSaveRecord(result.data.map(convertServerPRecordtToPRecord), tableType, socket, SCHEDULING_ROOM_ID);
      }
    }
    setOpenAssignModal(false);
  };
  const onAssignRecord = async () => {
    if (!readyTreatment || !assignRecord || !gridRef.current || !user) return;

    try {
      assignRecord.opReadiness = OPREADINESS_P;
      assignRecord[`treatmentStart${readyTreatment.number}`] = dayjs().unix();
      assignRecord.doctor = user.id;

      const rowNode = gridRef.current.api.getRowNode(assignRecord.id);
      if (rowNode && rowNode.rowIndex !== null) {
        rowNode.updateData(assignRecord);
        gridRef.current.api.startEditingCell({ rowIndex: rowNode.rowIndex, colKey: "chartNum" });
        gridRef.current.api.stopEditing();
      }
    } catch {
      showErrorSnackbar("시술 배정 중 오류가 발생했습니다.");
    } finally {
      handleCloseAssignModal();
    }
  };

  const handleCloseSetTreatmentReadyModal = async () => {
    try {
      if (selectedRows.length && user) {
        const result = await lockOrUnlockRecords(
          selectedRows.map((record) => record.id),
          null
        );
        if (result.status === 200) {
          emitSaveRecord(result.data.map(convertServerPRecordtToPRecord), tableType, socket, SCHEDULING_ROOM_ID);
        }
      }
    } catch (error) {
    } finally {
      setSetTreatmentReadyModalOpen(false);
    }
  };
  const handleOpenSetTreatmentReadyModal = async (isSetReadyBtn: boolean) => {
    try {
      const _seletedRows = gridRef.current?.api.getSelectedRows();
      let msg = null;

      if (!_seletedRows || _seletedRows.length === 0) {
        msg = "차트를 선택해주세요.";
      } else if (_seletedRows.length > 1) {
        msg = "하나의 차트만 선택해주세요.";
      } else if (_seletedRows.length === 1 && user) {
        const opReadiness = _seletedRows[0].opReadiness;
        if (isSetReadyBtn) {
          if (opReadiness === OPREADINESS_N && findCanbeReadyTreatmentNumber(_seletedRows[0]) === -1) {
            msg = "준비 완료할 수 있는 시술이 없습니다.";
          } else if (opReadiness === OPREADINESS_P) {
            msg = "해당 차트는 시술이 진행중입니다.";
          } else if (opReadiness === OPREADINESS_C) {
            msg = "모든 시술이 완료되었습니다.";
          }
        } else {
          // Open Set complete modal
          if (opReadiness !== OPREADINESS_P || findCanCompleteTreatmentNumber(_seletedRows[0]) === -1) {
            msg = "진행중인 시술이 없습니다.";
          }
        }
      }

      if (msg) {
        showErrorSnackbar(msg, "warning");
        return;
      }

      if (!user || !_seletedRows) {
        return;
      }

      const result = await lockOrUnlockRecords([_seletedRows[0].id], user.id);
      if (result.status === 200) {
        emitSaveRecord(result.data.map(convertServerPRecordtToPRecord), tableType, socket, SCHEDULING_ROOM_ID);
        setSelectedRows(_seletedRows);
        setSetTreatmentReadyModalOpen(true);
      }
    } catch (error) {
      showErrorSnackbar("서버 오류");
    }
  };

  const handleConfirm = async (record: PRecord | undefined, selectedTreatment: number | undefined) => {
    try {
      if (!record || !selectedTreatment || !gridRef.current) return;
      const time = dayjs().unix();

      if (record.opReadiness !== "P") {
        record[`treatmentReady${selectedTreatment}`] = time;
        record.opReadiness = OPREADINESS_Y;
      } else if (record.opReadiness === "P") {
        record[`treatmentEnd${selectedTreatment}`] = time;
        record["doctor"] = undefined;
        if (checkForUnReadyTreatments(record)) {
          record.opReadiness = OPREADINESS_N;
        } else {
          record.opReadiness = OPREADINESS_C;
        }
      }

      const row = gridRef.current.api.getRowNode(record.id);
      if (row && row.rowIndex !== null) {
        row?.updateData(record);
        refreshTreatmentCells(gridRef.current.api, record.id);
        gridRef.current.api.startEditingCell({ rowIndex: row.rowIndex, colKey: "chartNum" });
        gridRef.current.api.stopEditing();
      }
    } catch (error) {
    } finally {
      handleCloseSetTreatmentReadyModal();
    }
  };
  return (
    <>
      {tableType === "ExceptReady" && (
        <>
          <Box className="flex justify-between items-center w-fit gap-2">
            <IconButton onClick={onAddRecord}>
              <AddCircleIcon />
            </IconButton>
            <IconButton onClick={handleOpenDeleteModal}>
              <DeleteIcon />
            </IconButton>
            <Button onClick={() => handleOpenSetTreatmentReadyModal(true)}>시술 준비 완료</Button>
            <Button onClick={() => handleOpenSetTreatmentReadyModal(false)}>시술 완료</Button>
          </Box>
          <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
            <DialogTitle>{"레코드 삭제"}</DialogTitle>
            <DialogContent>
              <DialogContentText>{selectedRows.length}개의 레코드를 삭제하시겠습니까?</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteModal}>취소</Button>
              <Button onClick={onDeleteRecord} autoFocus>
                확인
              </Button>
            </DialogActions>
          </Dialog>
          {selectedRows.length === 1 && (
            <SetTreatmentReadyModal open={setTreatmentReadyModalOpen} handleClose={handleCloseSetTreatmentReadyModal} gridRef={gridRef} selectedRow={selectedRows[0]} handleConfirm={handleConfirm} />
          )}
        </>
      )}

      {tableType === "Ready" && (
        <div>
          <Button onClick={handleOpenAssignModal}>시술 진행</Button>
          <Dialog open={openAssignModal} onClose={handleCloseAssignModal}>
            <DialogTitle>{"시술 진행"}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {assignRecord?.chartNum} - {assignRecord?.patientName} - {readyTreatment?.title}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAssignModal}>취소</Button>
              <Button onClick={onAssignRecord} autoFocus>
                확인
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </>
  );
};
