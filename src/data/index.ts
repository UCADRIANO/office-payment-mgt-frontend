import { User } from "../interfaces";

const users: User[] = [
  {
    id: "u_1",
    username: "farouk",
    password: "password123",
    role: "user",
    allowedDBs: ["OPWS", "CHEC"],
  },
  {
    id: "u_2",
    username: "kele",
    password: "password456",
    role: "admin",
    allowedDBs: ["SETRACO", "ZHONG"],
  },
];

export default users;
