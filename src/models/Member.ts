import { Pub } from './Pub';

export interface Member {
  id: string;
  cin: string;
  nom: string;
  type: string;
  createDate: string;
  publications?: string[]; // Array of publication IDs
}
