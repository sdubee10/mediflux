/** @format */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { KEYOFSERVERPRECORD } from "./contants.js";
export const getUserByLoginID = (pool, loginId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield pool.query("select * from admin.user where login_id=$1;", [loginId]);
});
export const getSchema = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    return yield pool.query("select * FROM information_schema.tables where table_schema ilike '%SS%' or table_schema ilike '%share%' or table_schema like '%admin%' order by table_schema");
});
export const getChart = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    return yield pool.query("select * from gn_ss_bailor.chart_schedule");
});
export const deleteAllChart = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    return yield pool.query("delete from gn_ss_bailor.chart_schedule");
});
export const convertTime = (time) => {
    return time ? new Date(time * 1000) : undefined;
};
export const deconstructRecord = (record) => {
    const { checkInTime, chartNum, patientName, opReadiness, treatment1, treatment2, treatment3, treatment4, treatment5, quantityTreat1, quantityTreat2, quantityTreat3, quantityTreat4, quantityTreat5, treatmentRoom, doctor, anesthesiaNote, skincareSpecialist1, skincareSpecialist2, nursingStaff1, nursingStaff2, coordinator, consultant, commentCaution, lockingUser, deleteYN, treatmentReady1, treatmentReady2, treatmentReady3, treatmentReady4, treatmentReady5, treatmentEnd1, treatmentEnd2, treatmentEnd3, treatmentEnd4, treatmentEnd5, } = record;
    const retVal = [
        convertTime(checkInTime),
        chartNum,
        patientName,
        opReadiness,
        treatment1,
        treatment2,
        treatment3,
        treatment4,
        treatment5,
        quantityTreat1,
        quantityTreat2,
        quantityTreat3,
        quantityTreat4,
        quantityTreat5,
        treatmentRoom,
        doctor,
        anesthesiaNote,
        skincareSpecialist1,
        skincareSpecialist2,
        nursingStaff1,
        nursingStaff2,
        coordinator,
        consultant,
        commentCaution,
        lockingUser,
        deleteYN,
        convertTime(treatmentReady1),
        convertTime(treatmentReady2),
        convertTime(treatmentReady3),
        convertTime(treatmentReady4),
        convertTime(treatmentReady5),
        convertTime(treatmentEnd1),
        convertTime(treatmentEnd2),
        convertTime(treatmentEnd3),
        convertTime(treatmentEnd4),
        convertTime(treatmentEnd5),
    ];
    const { id } = record;
    if (id) {
        retVal.push(id);
    }
    else {
        retVal.shift();
    }
    return retVal;
};
export const updateQuery = (tableName) => {
    let baseQuery = `UPDATE ${tableName} SET `;
    for (let i = 1; i < KEYOFSERVERPRECORD.length; i++) {
        const field = KEYOFSERVERPRECORD[i];
        baseQuery += `${field}=$${i}`;
        if (i !== KEYOFSERVERPRECORD.length - 1) {
            baseQuery += ", ";
        }
    }
    baseQuery += ` WHERE record_id=$${KEYOFSERVERPRECORD.length}`;
    return baseQuery;
};
