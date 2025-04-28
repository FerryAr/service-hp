import type { OrderMedia } from "./orderMedia";
import type { User } from "./user";

export type Orders = {
    id:                   number;
    no_order:             string;
    nama_pelanggan:       string;
    alamat_pelanggan:     string;
    no_hp_pelanggan:      string;
    keterangan:           string;
    cs_transfer_deadline: null;
    bongkar_deadline:     null;
    perbaikan_deadline:   null;
    qc_kepala_deadline:   null;
    qc_cs_deadline:       null;
    status:               string;
    createdAt:          Date;
    updatedAt:          Date;
    kepala_teknisi:      User | null;
    teknisi:            User | null;
    fotoHp:             FotoHP | null;
}

export interface FotoHP {
    arrival: OrderMedia[];
    bongkar: OrderMedia[];
    before: OrderMedia[];
    after: OrderMedia[];
    video: OrderMedia[];
    qc: OrderMedia[];
}