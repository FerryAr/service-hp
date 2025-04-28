export type User =  {
    id: number;
    username: string;
    role: Role;
    created_at: string;
    updated_at: string;
}

export enum Role {
    CS = "CS",
    KEPALA_TEKNISI = "KEPALA_TEKNISI",
    TEKNISI = "TEKNISI"
  }