import { onRequest } from "firebase-functions/v2/https";

export const helloApi = onRequest((req, res) => {
  res.status(200).json({ message: "It worked!" });
});
