import { google } from "googleapis";

// O pacote googleapis já sabe procurar sozinho a variável de ambiente 
// GOOGLE_APPLICATION_CREDENTIALS no .env.local que nós configuramos!
const auth = new google.auth.GoogleAuth({
  scopes: [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly",
  ],
});

export const calendar = google.calendar({ version: "v3", auth });
