export interface Pub {
  id: string;  // Changed from number to string to match the db.json format
  titre: string;
  type: string;
  lien: string;
  date: Date | string;  // Allow both Date object and string format
  sourcePDF: string;
  memberId?: string;  // Reference to the member who authored this publication
}
