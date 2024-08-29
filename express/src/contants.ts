/** @format */

export const JOIN_ROOM = "join-room";
export const CONNECTED_USERS = "connected-users";
export const LOCK_RECORD = "lock-record";
export const SAVE_RECORD = "save-record";
export const DELETE_RECORD = "delete-record";
export const CONNECTION = "connection";
export const USER_JOINED = "user-join";
export const CREATE_RECORD = "create-record";
export const CONNECT = "connect";
export const SCHEDULING_ROOM_ID = "100";
export const CANCEL_EDITING = "cancel-editing";
export const UNLOCK_RECORD = "unlock-record";
export const KEY_OF_SERVER_PRECORD = [
  "record_id",
  "created_at",
  "chart_num",
  "patient_name",
  "op_readiness",
  "treatment_1",
  "treatment_2",
  "treatment_3",
  "treatment_4",
  "treatment_5",
  "quantity_treat_1",
  "quantity_treat_2",
  "quantity_treat_3",
  "quantity_treat_4",
  "quantity_treat_5",
  "treatment_room",
  "doctor_1",
  "doctor_2",
  "doctor_3",
  "doctor_4",
  "doctor_5",
  "anesthesia_note",
  "skincare_specialist_1",
  "skincare_specialist_2",
  "nursing_staff_1",
  "nursing_staff_2",
  "coordinator",
  "consultant",
  "comment_caution",
  "locking_user",
  "delete_yn",
  "patient_care_room",
  "treatment_ready_1",
  "treatment_ready_2",
  "treatment_ready_3",
  "treatment_ready_4",
  "treatment_ready_5",
  "treatment_end_1",
  "treatment_end_2",
  "treatment_end_3",
  "treatment_end_4",
  "treatment_end_5",
  "treatment_start_1",
  "treatment_start_2",
  "treatment_start_3",
  "treatment_start_4",
  "treatment_start_5",
];

export const KEY_OF_CLIENT_PRECORD = ["id"];
for (let i = 1; i < KEY_OF_SERVER_PRECORD.length; i++) {
  let element = KEY_OF_SERVER_PRECORD[i];
  element = element
    .split("_") // '_'을 기준으로 문자열을 나눕니다.
    .map((word, index) => {
      if (index === 0) {
        // 첫 번째 단어는 첫 글자를 소문자로 유지
        return word.toLowerCase();
      }
      // 나머지 단어는 첫 글자를 대문자로 변환
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
  KEY_OF_CLIENT_PRECORD.push(element);
}

export const KEY_OF_SERVER_TREATMENT = ["tr_id", "tr_duration", "tr_point", "tr_title", "tr_group", "tr_price"];
